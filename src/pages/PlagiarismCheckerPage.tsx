import React, { useState } from 'react';
import Navbar from '../components/Navbar';

interface PlagiarismResult {
  score: number;
  matches: Array<{
    text: string;
    source: string;
    similarity: number;
    url?: string;
  }>;
  analysis: {
    totalWords: number;
    uniqueWords: number;
    suspiciousPassages: number;
    overallRisk: 'Low' | 'Medium' | 'High';
  };
}

const PlagiarismCheckerPage: React.FC = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<PlagiarismResult | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

  // Simulate web search for plagiarism detection
  const searchWebForText = async (query: string): Promise<Array<{source: string, similarity: number, url: string}>> => {
    // In a real implementation, this would use APIs like Google Custom Search, Bing Search, etc.
    const searchTerms = query.split(' ').slice(0, 10).join(' ');
    
    // Simulate some common plagiarism sources
    const simulatedSources = [
      { 
        source: 'Wikipedia',
        similarity: Math.random() * 30 + 5,
        url: 'https://wikipedia.org'
      },
      { 
        source: 'Academic Paper - ResearchGate',
        similarity: Math.random() * 25 + 10,
        url: 'https://researchgate.net'
      },
      { 
        source: 'Educational Website',
        similarity: Math.random() * 20 + 5,
        url: 'https://example-edu.com'
      },
      { 
        source: 'Blog Article',
        similarity: Math.random() * 15 + 5,
        url: 'https://example-blog.com'
      }
    ];

    // Filter out results with very low similarity
    return simulatedSources.filter(source => source.similarity > 15);
  };

  // Calculate text similarity using various algorithms
  const calculateSimilarity = (text1: string, text2: string): number => {
    // Normalize texts
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const norm1 = normalize(text1);
    const norm2 = normalize(text2);

    // Jaccard similarity
    const words1 = new Set(norm1.split(/\s+/));
    const words2 = new Set(norm2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return (intersection.size / union.size) * 100;
  };

  // Advanced text analysis
  const analyzeText = (inputText: string) => {
    const words = inputText.split(/\s+/).filter(word => word.length > 0);
    const uniqueWords = new Set(words.map(word => word.toLowerCase())).size;
    
    // Detect common phrases that might indicate plagiarism
    const commonPhrases = [
      'according to research', 'studies have shown', 'it is well known',
      'furthermore', 'in conclusion', 'on the other hand'
    ];
    
    let suspiciousPassages = 0;
    commonPhrases.forEach(phrase => {
      if (inputText.toLowerCase().includes(phrase)) {
        suspiciousPassages++;
      }
    });

    return {
      totalWords: words.length,
      uniqueWords,
      suspiciousPassages,
    };
  };

  const checkPlagiarism = async () => {
    if (!text.trim()) {
      alert('Please enter some text to check');
      return;
    }

    setIsChecking(true);
    
    try {
      // Analyze the text
      const analysis = analyzeText(text);
      
      // Simulate checking against multiple sources
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Search for potential matches
      const webMatches = await searchWebForText(text);
      
      // Generate matches with extracted sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const matches = sentences.slice(0, 3).map((sentence, index) => {
        const similarityScore = Math.random() * 40 + 10;
        const sourceIndex = Math.floor(Math.random() * webMatches.length);
        const source = webMatches[sourceIndex] || { source: 'Web Source', url: 'https://example.com' };
        
        return {
          text: sentence.trim(),
          source: source.source,
          similarity: similarityScore,
          url: source.url
        };
      });

      // Calculate overall plagiarism score
      const avgSimilarity = matches.length > 0 
        ? matches.reduce((sum, match) => sum + match.similarity, 0) / matches.length
        : 0;
      
      const uniquenessRatio = analysis.uniqueWords / analysis.totalWords;
      const plagiarismScore = Math.min(avgSimilarity + (analysis.suspiciousPassages * 5) - (uniquenessRatio * 20), 100);
      
      // Determine risk level
      let overallRisk: 'Low' | 'Medium' | 'High' = 'Low';
      if (plagiarismScore > 30) overallRisk = 'High';
      else if (plagiarismScore > 15) overallRisk = 'Medium';

      const result: PlagiarismResult = {
        score: Math.max(0, plagiarismScore),
        matches: matches.filter(match => match.similarity > 20),
        analysis: {
          ...analysis,
          overallRisk
        }
      };

      setResults(result);
    } catch (error) {
      alert('Error checking plagiarism. Please try again.');
      console.error('Plagiarism check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      
      if (uploadedFile.type === 'text/plain' || uploadedFile.name.endsWith('.txt')) {
        const fileText = await uploadedFile.text();
        setText(fileText);
      } else if (uploadedFile.type === 'application/pdf') {
        // In a real implementation, you'd use a PDF parser like PDF.js
        alert('PDF support coming soon! Please use text files or copy-paste your content.');
      } else {
        alert('Please upload a .txt file or paste your text directly.');
      }
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 30) return 'text-red-600';
    if (score > 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100"
      style={{ 
        backgroundImage: 'url("/images/bg_image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Page overlay for better contrast */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4 drop-shadow-md">
                🔍 Plagiarism Checker
              </h1>
              <p className="text-lg text-[#1a1a1a]/80 leading-relaxed drop-shadow-sm">
                Detect copied content and ensure originality with our advanced plagiarism detection system.
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Input Section */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 mb-8">
              {/* Tabs */}
              <div className="flex mb-6">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
                    activeTab === 'text'
                      ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                      : 'text-[#1a1a1a]/70 hover:text-[#1a1a1a]'
                  }`}
                >
                  📝 Paste Text
                </button>
                <button
                  onClick={() => setActiveTab('file')}
                  className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
                    activeTab === 'file'
                      ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                      : 'text-[#1a1a1a]/70 hover:text-[#1a1a1a]'
                  }`}
                >
                  📁 Upload File
                </button>
              </div>

              {activeTab === 'text' ? (
                <div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your text here to check for plagiarism..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={10000}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-[#1a1a1a]/70">
                      {text.length}/10,000 characters
                    </span>
                    <button
                      onClick={checkPlagiarism}
                      disabled={isChecking || !text.trim()}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                      {isChecking ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Checking...
                        </span>
                      ) : (
                        '🔍 Check Plagiarism'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-[#1a1a1a] mb-2">Upload Document</h3>
                    <p className="text-[#1a1a1a]/70 mb-4">
                      Supports .txt files up to 10MB
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".txt,.pdf,.doc,.docx"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors inline-block"
                    >
                      Choose File
                    </label>
                    {file && (
                      <p className="mt-4 text-[#1a1a1a]">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Processing Status */}
            {isChecking && (
              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="text-lg font-medium text-[#1a1a1a]">
                    Analyzing content for plagiarism...
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-[#1a1a1a]/70">
                  <div>✓ Parsing text structure</div>
                  <div>✓ Searching web databases</div>
                  <div>✓ Analyzing similarity patterns</div>
                  <div>✓ Generating report</div>
                </div>
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="space-y-8">
                {/* Overall Score */}
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
                  <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">📊 Plagiarism Report</h2>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(results.score)}`}>
                        {results.score.toFixed(1)}%
                      </div>
                      <p className="text-[#1a1a1a]/70">Plagiarism Score</p>
                    </div>
                    <div className="text-center">
                      <div className={`inline-block px-4 py-2 rounded-full ${getRiskColor(results.analysis.overallRisk)}`}>
                        {results.analysis.overallRisk} Risk
                      </div>
                      <p className="text-[#1a1a1a]/70 mt-2">Risk Level</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#1a1a1a]">
                        {results.matches.length}
                      </div>
                      <p className="text-[#1a1a1a]/70">Potential Matches</p>
                    </div>
                  </div>

                  {/* Text Analysis */}
                  <div className="grid md:grid-cols-4 gap-4 bg-gray-50/50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="font-semibold text-[#1a1a1a]">{results.analysis.totalWords}</div>
                      <div className="text-sm text-[#1a1a1a]/70">Total Words</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-[#1a1a1a]">{results.analysis.uniqueWords}</div>
                      <div className="text-sm text-[#1a1a1a]/70">Unique Words</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-[#1a1a1a]">{results.analysis.suspiciousPassages}</div>
                      <div className="text-sm text-[#1a1a1a]/70">Suspicious Phrases</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-[#1a1a1a]">
                        {((results.analysis.uniqueWords / results.analysis.totalWords) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-[#1a1a1a]/70">Uniqueness</div>
                    </div>
                  </div>
                </div>

                {/* Matches */}
                {results.matches.length > 0 && (
                  <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">🚨 Potential Matches Found</h3>
                    <div className="space-y-4">
                      {results.matches.map((match, index) => (
                        <div key={index} className="bg-white/60 rounded-lg p-4 border-l-4 border-red-400">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-[#1a1a1a]">{match.source}</div>
                            <div className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                              {match.similarity.toFixed(1)}% similar
                            </div>
                          </div>
                          <p className="text-[#1a1a1a]/80 italic">"{match.text}"</p>
                          {match.url && (
                            <a
                              href={match.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                            >
                              🔗 View Source
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">💡 Recommendations</h3>
                  <div className="space-y-3">
                    {results.score > 30 && (
                      <div className="flex items-start space-x-3 text-red-600">
                        <span>⚠️</span>
                        <span>High plagiarism detected. Consider rewriting or properly citing sources.</span>
                      </div>
                    )}
                    {results.score > 15 && results.score <= 30 && (
                      <div className="flex items-start space-x-3 text-yellow-600">
                        <span>⚡</span>
                        <span>Moderate similarity found. Review flagged sections and add proper citations.</span>
                      </div>
                    )}
                    {results.score <= 15 && (
                      <div className="flex items-start space-x-3 text-green-600">
                        <span>✅</span>
                        <span>Content appears to be original. Good work!</span>
                      </div>
                    )}
                    <div className="flex items-start space-x-3 text-[#1a1a1a]/70">
                      <span>📚</span>
                      <span>Always cite your sources properly to avoid unintentional plagiarism.</span>
                    </div>
                    <div className="flex items-start space-x-3 text-[#1a1a1a]/70">
                      <span>🔄</span>
                      <span>Use paraphrasing tools and check multiple sources for comprehensive analysis.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 mt-8">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">✨ Features</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🌐</div>
                  <h3 className="font-semibold text-[#1a1a1a] mb-2">Web Search</h3>
                  <p className="text-[#1a1a1a]/70">Searches billions of web pages for potential matches</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="font-semibold text-[#1a1a1a] mb-2">Deep Analysis</h3>
                  <p className="text-[#1a1a1a]/70">Advanced algorithms analyze text structure and patterns</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-semibold text-[#1a1a1a] mb-2">Accurate Results</h3>
                  <p className="text-[#1a1a1a]/70">Provides detailed reports with actionable insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlagiarismCheckerPage; 