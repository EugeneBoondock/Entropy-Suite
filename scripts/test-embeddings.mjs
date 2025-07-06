import { createClient } from '@supabase/supabase-js';
import { retrieveRelevantKnowledge, shouldRetrieveKnowledge, buildSearchQuery } from '../src/tools/SummarizerTool/embeddingService.js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmbeddingSystem() {
  console.log('🧪 Testing Unihelper Embedding System...\n');

  // Test 1: Check if knowledge base has data
  console.log('1. Checking knowledge base statistics...');
  try {
    const { data: stats, error } = await supabase.rpc('get_knowledge_stats');
    if (error) {
      console.error('❌ Error getting stats:', error);
    } else {
      console.log('✅ Knowledge base stats:', stats[0]);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Test 2: Test knowledge retrieval
  console.log('\n2. Testing knowledge retrieval...');
  const testQueries = [
    'What are the admission requirements for UCT?',
    'How do I apply for NSFAS?',
    'What engineering courses are available?',
    'What is the application deadline for Wits?',
    'How much are tuition fees?'
  ];

  for (const query of testQueries) {
    console.log(`\n   Testing query: "${query}"`);
    
    // Test if query should trigger retrieval
    const shouldRetrieve = shouldRetrieveKnowledge(query);
    console.log(`   Should retrieve knowledge: ${shouldRetrieve}`);
    
    if (shouldRetrieve) {
      try {
        const matches = await retrieveRelevantKnowledge(query, 0.3, 5);
        console.log(`   Found ${matches.length} matches`);
        
        if (matches.length > 0) {
          console.log(`   Top match similarity: ${matches[0].similarity.toFixed(3)}`);
          console.log(`   Top match source: ${matches[0].source_filename}`);
        }
      } catch (error) {
        console.error(`   ❌ Error retrieving knowledge:`, error.message);
      }
    }
  }

  // Test 3: Test conversation context building
  console.log('\n3. Testing conversation context building...');
  const mockMessages = [
    { role: 'user', content: 'I want to study engineering' },
    { role: 'model', content: 'Great choice! What type of engineering interests you?' },
    { role: 'user', content: 'I\'m interested in mechanical engineering at UCT' }
  ];
  
  const searchQuery = buildSearchQuery(mockMessages);
  console.log(`   Built search query: "${searchQuery}"`);
  
  try {
    const matches = await retrieveRelevantKnowledge(searchQuery, 0.3, 3);
    console.log(`   Found ${matches.length} relevant matches for conversation context`);
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
  }

  console.log('\n✅ Embedding system test completed!');
}

// Run the test
testEmbeddingSystem().catch(console.error); 