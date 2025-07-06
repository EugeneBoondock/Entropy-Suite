import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Try to load .env.local for local development, but don't fail if it doesn't exist
try {
  dotenv.config({ path: '.env.local' });
} catch (error) {
  // Fallback to default .env loading - this is normal on Vercel
  console.log('Note: .env.local not found, using environment variables from system');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const geminiKey = process.env.VITE_GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);

// Set up PDF.js worker for Node/ESM (Windows compatible)
const workerPath = join(
  __dirname,
  '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
);
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

// Split text into chunks with overlap
function splitIntoChunks(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let i = 0;
  
  while (i < text.length) {
    const chunk = text.substring(i, i + chunkSize);
    chunks.push(chunk);
    i += chunkSize - overlap;
  }
  
  return chunks;
}

// Clean extracted text to remove null bytes and non-printable characters
function cleanText(text) {
  // Remove null bytes and non-printable characters except newlines
  return text.replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, '').trim();
}

// Generate embedding for text using Gemini
async function generateEmbedding(text) {
  try {
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embeddingModel.embedContent({
      content: { role: 'user', parts: [{ text }] },
      taskType: TaskType.SEMANTIC_SIMILARITY
    });
    if (!result.embedding?.values) throw new Error('No embedding returned from Gemini API');
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Extract text from PDF file
async function extractTextFromPDF(filePath) {
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    throw error;
  }
}

// Store chunks and embeddings in Supabase
async function storeKnowledgeChunks(chunks, sourceFilename) {
  try {
    console.log(`Processing ${chunks.length} chunks for ${sourceFilename}...`);
    
    const chunksWithEmbeddings = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];
      console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}...`);
      
      const embedding = await generateEmbedding(content);
      chunksWithEmbeddings.push({
        content,
        embedding,
        source_filename: sourceFilename,
        chunk_index: i
      });
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const { error } = await supabase
      .from('knowledge_chunks')
      .insert(chunksWithEmbeddings);

    if (error) {
      throw error;
    }

    console.log(`✅ Stored ${chunksWithEmbeddings.length} chunks for ${sourceFilename}`);
  } catch (error) {
    console.error('Error storing knowledge chunks:', error);
    throw error;
  }
}

// Process all prospectus files
async function processProspectusFiles() {
  const prospectusDir = join(__dirname, '../public/prospectuses');
  const files = fs.readdirSync(prospectusDir).filter(file => file.endsWith('.pdf'));
  
  console.log(`Found ${files.length} prospectus files to process`);
  
  for (const filename of files) {
    try {
      console.log(`\n📄 Processing ${filename}...`);
      
      const filePath = join(prospectusDir, filename);
      const text = await extractTextFromPDF(filePath);
      
      // Clean and normalize text
      const cleanedText = cleanText(text);
      
      // Split into chunks
      const chunks = splitIntoChunks(cleanedText);
      console.log(`Split into ${chunks.length} chunks`);
      
      // Store in database
      await storeKnowledgeChunks(chunks, filename);
      
    } catch (error) {
      console.error(`❌ Failed to process ${filename}:`, error);
    }
  }
}

// Create additional knowledge files
async function createAdditionalKnowledge() {
  const knowledgeDir = join(__dirname, '../src/knowledge');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(knowledgeDir)) {
    fs.mkdirSync(knowledgeDir, { recursive: true });
  }
  
  // Create funding options file
  const fundingContent = `
NSFAS (National Student Financial Aid Scheme) Funding Information:

Eligibility Requirements:
- South African citizen
- Combined household income below R350,000 per annum
- First-time entering students or continuing students
- Studying at a public university or TVET college

Application Process:
1. Create NSFAS account at www.nsfas.org.za
2. Complete online application form
3. Submit required documents (ID, proof of income, etc.)
4. Wait for application assessment
5. Receive funding confirmation

What NSFAS Covers:
- Tuition fees
- Accommodation (on-campus or off-campus)
- Transport allowance
- Living allowance
- Book allowance

Other Funding Options:
- University bursaries and scholarships
- Private bursaries from companies
- Student loans from banks
- Provincial government bursaries
- Merit-based scholarships

Application Deadlines:
- NSFAS applications typically open in August/September
- University-specific bursaries have varying deadlines
- Check individual university websites for specific dates
  `.trim();
  
  fs.writeFileSync(join(knowledgeDir, 'funding_options.txt'), fundingContent);
  
  // Create application process file
  const applicationContent = `
University Application Process in South Africa:

General Application Steps:
1. Research universities and courses
2. Check admission requirements
3. Apply online through university portals
4. Submit required documents
5. Pay application fees
6. Wait for admission decisions
7. Accept offer and register

Required Documents:
- Certified copy of ID document
- Grade 12 certificate or statement of results
- Academic transcripts (for transfer students)
- Proof of payment of application fee
- Additional documents as required by specific universities

Application Deadlines:
- Most universities: September-October for following year
- Some universities have early application deadlines
- Check individual university websites for specific dates

Admission Requirements:
- National Senior Certificate (NSC) with university exemption
- Minimum APS (Admission Point Score) varies by university and course
- Subject-specific requirements for certain degrees
- Additional tests or interviews for some programs

Application Fees:
- Varies by university (typically R100-R500)
- Non-refundable
- Must be paid before application is processed

Important Tips:
- Apply to multiple universities as backup
- Keep copies of all submitted documents
- Follow up on application status
- Meet all deadlines strictly
- Consider accommodation and transport options early
  `.trim();
  
  fs.writeFileSync(join(knowledgeDir, 'application_process.txt'), applicationContent);
  
  // Create course catalogs file
  const courseContent = `
Common University Degrees and Programs in South Africa:

Undergraduate Degrees:
- Bachelor of Arts (BA) - Humanities, Social Sciences
- Bachelor of Science (BSc) - Natural Sciences, Mathematics
- Bachelor of Commerce (BCom) - Business, Economics, Finance
- Bachelor of Engineering (BEng) - Various Engineering disciplines
- Bachelor of Technology (BTech) - Applied Sciences, Technology
- Bachelor of Education (BEd) - Teaching and Education
- Bachelor of Laws (LLB) - Law and Legal Studies
- Bachelor of Medicine and Bachelor of Surgery (MBChB) - Medicine
- Bachelor of Science in Nursing (BSc Nursing) - Nursing

Popular Fields of Study:
- Computer Science and Information Technology
- Business Administration and Management
- Engineering (Civil, Mechanical, Electrical, Chemical)
- Medicine and Health Sciences
- Law and Legal Studies
- Education and Teaching
- Psychology and Social Work
- Accounting and Finance
- Marketing and Communications
- Environmental Sciences

Duration of Programs:
- Bachelor's degrees: 3-4 years typically
- Engineering degrees: 4 years
- Medicine: 6 years
- Law: 4 years
- Some programs may have additional requirements

Postgraduate Options:
- Honours degrees (1 year)
- Master's degrees (1-2 years)
- Doctoral degrees (3+ years)
- Postgraduate diplomas and certificates

Specialized Programs:
- Distance learning and online programs
- Part-time study options
- Bridging programs for mature students
- Foundation programs for international students
  `.trim();
  
  fs.writeFileSync(join(knowledgeDir, 'course_catalogs.txt'), courseContent);
  
  console.log('✅ Created additional knowledge files');
}

// Process additional knowledge files
async function processAdditionalKnowledge() {
  const knowledgeDir = join(__dirname, '../src/knowledge');
  const files = fs.readdirSync(knowledgeDir).filter(file => file.endsWith('.txt'));
  
  console.log(`\n📚 Processing ${files.length} additional knowledge files...`);
  
  for (const filename of files) {
    try {
      console.log(`Processing ${filename}...`);
      const filePath = join(knowledgeDir, filename);
      let text;
      if (filename.endsWith('.pdf')) {
        text = await extractTextFromPDF(filePath);
      } else if (filename.endsWith('.txt')) {
        text = fs.readFileSync(filePath, 'utf-8');
      } else {
        continue; // skip unknown file types
      }
      const cleanedText = cleanText(text);
      const chunks = splitIntoChunks(cleanedText);
      console.log(`Split into ${chunks.length} chunks`);
      await storeKnowledgeChunks(chunks, filename);
    } catch (error) {
      console.error(`❌ Failed to process ${filename}:`, error);
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting knowledge base generation...');
    
    // Create additional knowledge files first
    await createAdditionalKnowledge();
    
    // Process additional knowledge files
    await processAdditionalKnowledge();
    
    // Process prospectus files
    await processProspectusFiles();
    
    console.log('\n✅ Knowledge base generation completed!');
  } catch (error) {
    console.error('❌ Error during knowledge base generation:', error);
    process.exit(1);
  }
}

main(); 