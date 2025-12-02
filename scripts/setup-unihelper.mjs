import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Unihelper Embedding System Setup\n');

// Check environment variables
console.log('1. Checking environment variables...');
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY', 
  'VITE_OPENAI_API_KEY',
  'GEMINI_API_KEY'
];

const missingVars = [];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
  }
}

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('\nPlease add these to your .env file and try again.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
}

// Check if knowledge directory exists
console.log('\n2. Checking knowledge directory...');
const knowledgeDir = join(__dirname, '../src/knowledge');
if (!fs.existsSync(knowledgeDir)) {
  console.log('📁 Creating knowledge directory...');
  fs.mkdirSync(knowledgeDir, { recursive: true });
  console.log('✅ Knowledge directory created');
} else {
  console.log('✅ Knowledge directory exists');
}

// Check if knowledge files exist
console.log('\n3. Checking knowledge files...');
const knowledgeFiles = [
  'funding_options.txt',
  'application_process.txt', 
  'course_catalogs.txt'
];

for (const file of knowledgeFiles) {
  const filePath = join(knowledgeDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing - will be created during embedding generation`);
  }
}

// Check if prospectus directory exists
console.log('\n4. Checking prospectus files...');
const prospectusDir = join(__dirname, '../public/prospectuses');
if (fs.existsSync(prospectusDir)) {
  const files = fs.readdirSync(prospectusDir).filter(file => file.endsWith('.pdf'));
  console.log(`✅ Found ${files.length} prospectus files`);
} else {
  console.log('❌ Prospectus directory not found');
}

// Check if scripts directory exists
console.log('\n5. Checking scripts...');
const scriptsDir = join(__dirname);
const scripts = [
  'generate-embeddings.mjs',
  'test-embeddings.mjs'
];

for (const script of scripts) {
  const scriptPath = join(scriptsDir, script);
  if (fs.existsSync(scriptPath)) {
    console.log(`✅ ${script} exists`);
  } else {
    console.log(`❌ ${script} missing`);
  }
}

console.log('\n📋 Next Steps:');
console.log('1. Enable pgvector extension in your Supabase project');
console.log('2. Run the SQL setup script (supabase-setup.sql) in Supabase SQL Editor');
console.log('3. Generate embeddings: npm run generate-embeddings');
console.log('4. Test the system: npm run test-embeddings');
console.log('5. Start your development server: npm run dev');

console.log('\n📚 Documentation:');
console.log('- See UNIHELPER_EMBEDDING_SETUP.md for detailed instructions');
console.log('- Check supabase-setup.sql for database schema');

console.log('\n✅ Setup check completed!'); 