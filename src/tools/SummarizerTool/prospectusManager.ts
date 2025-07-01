// University detection and context generation for prospectus information
// This module provides intelligent university detection without file uploads

import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// University mapping with comprehensive aliases and keywords
export interface UniversityInfo {
  code: string;
  name: string;
  filename: string;
  aliases: string[];
  keywords: string[];
  location: string;
}

export const SOUTH_AFRICAN_UNIVERSITIES: UniversityInfo[] = [
  {
    code: "wits",
    name: "University of the Witwatersrand",
    filename: "wits-2026.pdf",
    aliases: ["wits", "witwatersrand", "university of the witwatersrand", "wits university"],
    keywords: ["johannesburg", "gauteng", "mining", "engineering", "business school"],
    location: "Johannesburg"
  },
  {
    code: "uct",
    name: "University of Cape Town",
    filename: "uct-2026.pdf",
    aliases: ["uct", "cape town", "university of cape town"],
    keywords: ["cape town", "western cape", "medicine", "law", "business"],
    location: "Cape Town"
  },
  {
    code: "uj",
    name: "University of Johannesburg",
    filename: "uj-2026.pdf",
    aliases: ["uj", "university of johannesburg", "johannesburg university"],
    keywords: ["johannesburg", "gauteng", "uj"],
    location: "Johannesburg"
  },
  {
    code: "up",
    name: "University of Pretoria",
    filename: "up-2026.pdf",
    aliases: ["up", "university of pretoria", "pretoria", "tuks"],
    keywords: ["pretoria", "gauteng", "tuks", "veterinary"],
    location: "Pretoria"
  },
  {
    code: "ukzn",
    name: "University of KwaZulu-Natal",
    filename: "ukzn-2026.pdf",
    aliases: ["ukzn", "university of kwazulu-natal", "kwazulu natal", "kzn university"],
    keywords: ["durban", "pietermaritzburg", "kwazulu-natal", "kzn"],
    location: "Durban/Pietermaritzburg"
  },
  {
    code: "su",
    name: "Stellenbosch University",
    filename: "su-2026.pdf",
    aliases: ["stellenbosch", "su", "stellenbosch university", "maties"],
    keywords: ["stellenbosch", "western cape", "maties", "wine"],
    location: "Stellenbosch"
  },
  {
    code: "unisa",
    name: "University of South Africa",
    filename: "unisa-2026.pdf",
    aliases: ["unisa", "university of south africa", "correspondence university"],
    keywords: ["distance learning", "correspondence", "online", "remote"],
    location: "Pretoria"
  },
  {
    code: "nwu",
    name: "North-West University",
    filename: "nwu-2026.pdf",
    aliases: ["nwu", "north-west university", "northwest university", "potchefstroom"],
    keywords: ["potchefstroom", "mafikeng", "vanderbijlpark", "north west"],
    location: "Potchefstroom"
  },
  {
    code: "ufs",
    name: "University of the Free State",
    filename: "ufs-2026.pdf",
    aliases: ["ufs", "university of the free state", "free state university", "bloemfontein"],
    keywords: ["bloemfontein", "free state", "qwaqwa"],
    location: "Bloemfontein"
  },
  {
    code: "ru",
    name: "Rhodes University",
    filename: "ru-2026.pdf",
    aliases: ["rhodes", "ru", "rhodes university"],
    keywords: ["grahamstown", "makhanda", "eastern cape", "journalism"],
    location: "Makhanda"
  },
  {
    code: "tut",
    name: "Tshwane University of Technology",
    filename: "tut-2026.pdf",
    aliases: ["tut", "tshwane university of technology", "tshwane tech"],
    keywords: ["pretoria", "tshwane", "technology", "engineering"],
    location: "Pretoria"
  },
  {
    code: "vut",
    name: "Vaal University of Technology",
    filename: "vut-2026.pdf",
    aliases: ["vut", "vaal university of technology", "vaal tech"],
    keywords: ["vanderbijlpark", "vaal", "technology"],
    location: "Vanderbijlpark"
  },
  {
    code: "cut",
    name: "Central University of Technology",
    filename: "cut-2026.pdf",
    aliases: ["cut", "central university of technology", "bloemfontein tech"],
    keywords: ["bloemfontein", "free state", "technology"],
    location: "Bloemfontein"
  },
  {
    code: "dut",
    name: "Durban University of Technology",
    filename: "dut-2026.pdf",
    aliases: ["dut", "durban university of technology", "durban tech"],
    keywords: ["durban", "kwazulu-natal", "technology"],
    location: "Durban"
  },
  {
    code: "mut",
    name: "Mangosuthu University of Technology",
    filename: "mut-2026.pdf",
    aliases: ["mut", "mangosuthu university of technology", "mangosuthu"],
    keywords: ["durban", "umlazi", "kwazulu-natal"],
    location: "Durban"
  },
  {
    code: "wsu",
    name: "Walter Sisulu University",
    filename: "wsu-2026.pdf",
    aliases: ["wsu", "walter sisulu university", "walter sisulu"],
    keywords: ["mthatha", "east london", "eastern cape"],
    location: "Mthatha"
  },
  {
    code: "ufh",
    name: "University of Fort Hare",
    filename: "ufh-2025.pdf",
    aliases: ["ufh", "university of fort hare", "fort hare"],
    keywords: ["alice", "east london", "eastern cape", "mandela"],
    location: "Alice"
  },
  {
    code: "nmu",
    name: "Nelson Mandela University",
    filename: "nmu-2026.pdf",
    aliases: ["nmu", "nelson mandela university", "mandela university", "nmmu"],
    keywords: ["port elizabeth", "gqeberha", "eastern cape", "mandela"],
    location: "Gqeberha"
  },
  {
    code: "univen",
    name: "University of Venda",
    filename: "univen-2026.pdf",
    aliases: ["univen", "university of venda", "venda"],
    keywords: ["thohoyandou", "limpopo", "venda"],
    location: "Thohoyandou"
  },
  {
    code: "cpu",
    name: "University of Limpopo",
    filename: "cpu-2026.pdf",
    aliases: ["ul", "university of limpopo", "limpopo", "turfloop"],
    keywords: ["polokwane", "limpopo", "turfloop"],
    location: "Polokwane"
  },
  {
    code: "ump",
    name: "University of Mpumalanga",
    filename: "ump-2026.pdf",
    aliases: ["ump", "university of mpumalanga", "mpumalanga"],
    keywords: ["nelspruit", "mbombela", "mpumalanga"],
    location: "Mbombela"
  },
  {
    code: "sol-plaatje",
    name: "Sol Plaatje University",
    filename: "sol-plaatje-2026.pdf",
    aliases: ["spu", "sol plaatje university", "sol plaatje", "kimberley university"],
    keywords: ["kimberley", "northern cape", "diamonds"],
    location: "Kimberley"
  },
  {
    code: "smu",
    name: "Sefako Makgatho Health Sciences University",
    filename: "SMu-Prospectus-2025_2026.pdf",
    aliases: ["smu", "sefako makgatho", "medunsa", "health sciences"],
    keywords: ["ga-rankuwa", "gauteng", "medical", "health", "nursing"],
    location: "Ga-Rankuwa"
  },
  {
    code: "zululand",
    name: "University of Zululand",
    filename: "zululand-2026.pdf",
    aliases: ["unizulu", "university of zululand", "zululand"],
    keywords: ["kwadlangezwa", "kwazulu-natal", "zulu"],
    location: "KwaDlangezwa"
  }
];

// Advanced university detection with fuzzy matching
export function detectRelevantUniversities(text: string): UniversityInfo[] {
  const lowercaseText = text.toLowerCase();
  const words = lowercaseText.split(/\s+/);
  const detected: UniversityInfo[] = [];
  const scores: Map<string, number> = new Map();

  for (const uni of SOUTH_AFRICAN_UNIVERSITIES) {
    let score = 0;

    // Direct alias matches (highest priority)
    for (const alias of uni.aliases) {
      if (lowercaseText.includes(alias.toLowerCase())) {
        score += 10;
      }
    }

    // Keyword matches (medium priority)
    for (const keyword of uni.keywords) {
      if (lowercaseText.includes(keyword.toLowerCase())) {
        score += 5;
      }
    }

    // Word boundary matches (lower priority)
    for (const word of words) {
      if (uni.code.toLowerCase() === word || 
          uni.aliases.some(alias => alias.toLowerCase().includes(word))) {
        score += 3;
      }
    }

    // Location mentions
    if (lowercaseText.includes(uni.location.toLowerCase())) {
      score += 2;
    }

    scores.set(uni.code, score);
    if (score > 0) {
      detected.push(uni);
    }
  }

  // Sort by relevance score and return top matches
  return detected.sort((a, b) => (scores.get(b.code) || 0) - (scores.get(a.code) || 0))
                 .slice(0, 3); // Limit to top 3 matches
}

// Smart query analysis to determine if prospectus info is needed
export function shouldUseProspectusFiles(text: string): boolean {
  const fileRelevantKeywords = [
    'application', 'requirements', 'admission', 'entry', 'courses', 'programs', 
    'faculty', 'fees', 'tuition', 'bursary', 'scholarship', 'nsfas',
    'deadline', 'dates', 'contact', 'address', 'location', 'campus',
    'degree', 'diploma', 'certificate', 'undergraduate', 'postgraduate',
    'medicine', 'engineering', 'business', 'law', 'science', 'arts',
    'apply', 'register', 'enroll', 'study', 'minimum requirements'
  ];

  const lowercaseText = text.toLowerCase();
  
  // Check if query contains university-specific keywords
  const hasUniversityMention = SOUTH_AFRICAN_UNIVERSITIES.some(uni => 
    uni.aliases.some(alias => lowercaseText.includes(alias.toLowerCase()))
  );

  // Check if query contains file-relevant keywords
  const hasRelevantKeywords = fileRelevantKeywords.some(keyword => 
    lowercaseText.includes(keyword)
  );

  return hasUniversityMention || hasRelevantKeywords;
}

// Generate enhanced context for university queries
export function generateUniversityContext(text: string): string {
  if (!shouldUseProspectusFiles(text)) {
    return "";
  }

  const relevantUniversities = detectRelevantUniversities(text);
  
  if (relevantUniversities.length === 0) {
    return `

📚 AVAILABLE UNIVERSITY INFORMATION:
I have access to detailed prospectus information for all 24 major South African universities including:
- University of Cape Town (UCT)
- University of the Witwatersrand (Wits)
- University of Pretoria (UP)
- Stellenbosch University (SU)
- University of KwaZulu-Natal (UKZN)
- University of Johannesburg (UJ)
- And 18 other universities...

I can help with admission requirements, application deadlines, course information, fees, contact details, and NSFAS guidance.`;
  }

  const universitiesInfo = relevantUniversities.map(uni => 
    `🎓 ${uni.name} (${uni.code.toUpperCase()}) - Located in ${uni.location}`
  ).join('\n');

  return `

🎯 RELEVANT UNIVERSITIES DETECTED:
${universitiesInfo}

📋 AVAILABLE INFORMATION:
I have detailed prospectus information for these universities including:
- Admission requirements and application procedures
- Course offerings and program details
- Application deadlines and important dates
- Fee structures and payment options
- NSFAS and financial aid information
- Contact details and campus information
- Faculty information and academic calendars

Please ask specific questions about any of these areas and I'll provide accurate, up-to-date information from their 2026 prospectuses.`;
}

// Extract all text from a PDF file in public/prospectuses
export async function extractTextFromProspectus(filename: string): Promise<string> {
  const url = `/prospectuses/${filename}`;
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText.trim();
}

// Extract all admission/APS-related sections from a PDF's text
export function extractAdmissionSections(text: string): string {
  // Look for sections containing these keywords
  const keywords = [
    'admission requirements',
    'minimum requirements',
    'aps',
    'admission point score',
    'entry requirements',
    'requirements for admission',
    'eligibility',
    'selection criteria',
    'programme requirements',
    'qualification requirements',
    'subject requirements',
    'matric requirements',
    'bachelor requirements',
    'diploma requirements',
    'degree requirements',
    'points required',
    'aps score',
    'aps minimum',
    'aps needed',
    'aps for',
    'aps of',
    'aps is',
    'aps must',
    'aps requirement',
    'aps value',
    'aps calculation',
    'aps table',
    'aps breakdown',
    'aps for admission',
    'aps for registration',
    'aps for selection',
    'aps for programme',
    'aps for course',
    'aps for degree',
    'aps for diploma',
    'aps for certificate',
    'aps for law',
    'aps for engineering',
    'aps for medicine',
    'aps for science',
    'aps for commerce',
    'aps for education',
    'aps for arts',
    'aps for management',
    'aps for accounting',
    'aps for nursing',
    'aps for psychology',
    'aps for social work',
    'aps for computer science',
    'aps for information technology',
    'aps for business',
    'aps for economics',
    'aps for finance',
    'aps for marketing',
    'aps for public administration',
    'aps for political science',
    'aps for international relations',
    'aps for journalism',
    'aps for communication',
    'aps for law degree',
    'aps for llb',
    'aps for bcom law',
    'aps for ba law',
    'aps for bsc',
    'aps for bcom',
    'aps for ba',
    'aps for bed',
    'aps for bacc',
    'aps for bsc it',
    'aps for bsc computer science',
    'aps for bsc engineering',
    'aps for bsc medicine',
    'aps for bsc nursing',
    'aps for bsc psychology',
    'aps for bsc social work',
    'aps for bsc education',
    'aps for bsc accounting',
    'aps for bsc management',
    'aps for bsc economics',
    'aps for bsc finance',
    'aps for bsc marketing',
    'aps for bsc public administration',
    'aps for bsc political science',
    'aps for bsc international relations',
    'aps for bsc journalism',
    'aps for bsc communication',
  ];
  const lower = text.toLowerCase();
  let result = '';
  for (const keyword of keywords) {
    let idx = lower.indexOf(keyword);
    while (idx !== -1) {
      // Extract a chunk around the keyword (e.g., 1000 chars before and after)
      const start = Math.max(0, idx - 1000);
      const end = Math.min(text.length, idx + 2000);
      result += text.slice(start, end) + '\n\n';
      idx = lower.indexOf(keyword, idx + 1);
    }
  }
  // If nothing found, return the first 3000 chars as fallback
  if (!result.trim()) return text.slice(0, 3000);
  return result.trim();
} 