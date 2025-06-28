import React, { useState } from 'react';
import { Search, Settings, Brain, Sparkles, Globe, FileText, Image, Video, Music, Calculator, Code, BookOpen, TrendingUp, Zap, Star, Download, Copy, Share2, Filter, SortDesc, Mic, Camera, ArrowRight, ExternalLink, Clock, Users } from 'lucide-react';
import Navbar from '../components/Navbar';

const AISearchEnginePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedModel, setSelectedModel] = useState('perplexity-pro');
  const [searchMode, setSearchMode] = useState('smart');
  const [sourceTypes, setSourceTypes] = useState(['web', 'academic', 'news']);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const aiModels = [
    { id: 'perplexity-pro', name: 'Perplexity Pro 2025', type: 'Search Expert', accuracy: 95 },
    { id: 'searchgpt-4', name: 'SearchGPT-4 Turbo', type: 'Conversational', accuracy: 92 },
    { id: 'grok-3', name: 'Grok 3.0 Alpha', type: 'Real-time', accuracy: 89 },
    { id: 'claude-search', name: 'Claude Search 3.5', type: 'Analytical', accuracy: 94 },
    { id: 'gemini-ultra', name: 'Gemini Ultra Search', type: 'Multimodal', accuracy: 91 },
    { id: 'bing-copilot', name: 'Bing Copilot Pro', type: 'Microsoft AI', accuracy: 88 },
    { id: 'you-ai', name: 'You.com AI Plus', type: 'Privacy-First', accuracy: 87 },
    { id: 'brave-leo', name: 'Brave Leo Search', type: 'Private', accuracy: 85 }
  ];

  const searchModes = [
    { id: 'smart', name: 'Smart Search', icon: Brain, description: 'AI-powered contextual search' },
    { id: 'research', name: 'Research Mode', icon: BookOpen, description: 'Academic & scientific sources' },
    { id: 'realtime', name: 'Real-time', icon: TrendingUp, description: 'Latest news & live data' },
    { id: 'creative', name: 'Creative', icon: Sparkles, description: 'Ideas & inspiration' },
    { id: 'technical', name: 'Technical', icon: Code, description: 'Code & documentation' },
    { id: 'visual', name: 'Visual Search', icon: Image, description: 'Image & video results' }
  ];

  const sourceOptions = [
    { id: 'web', name: 'Web', icon: Globe },
    { id: 'academic', name: 'Academic', icon: BookOpen },
    { id: 'news', name: 'News', icon: FileText },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'video', name: 'Video', icon: Video },
    { id: 'images', name: 'Images', icon: Image }
  ];

  const mockResults = [
    {
      id: 1,
      title: "AI-Powered Search: The Future of Information Discovery",
      summary: "Comprehensive analysis of how AI is revolutionizing search engines, featuring comparison of Perplexity, SearchGPT, and Google AI Overviews with real-world performance metrics.",
      url: "https://techresearch.ai/ai-search-revolution",
      domain: "techresearch.ai",
      type: "analysis",
      sources: 15,
      confidence: 94,
      readTime: "8 min",
      lastUpdated: "2 hours ago",
      citations: [
        "Stanford AI Research Lab",
        "MIT Technology Review",
        "Google Research Blog"
      ]
    },
    {
      id: 2,
      title: "Best AI Search Engines of 2025: Performance Comparison",
      summary: "In-depth testing of 8 leading AI search engines including Perplexity Pro, SearchGPT-4, and Grok 3.0, with benchmark results showing accuracy rates and user experience scores.",
      url: "https://searchbenchmark.org/2025-ai-engines",
      domain: "searchbenchmark.org",
      type: "benchmark",
      sources: 23,
      confidence: 97,
      readTime: "12 min",
      lastUpdated: "4 hours ago",
      citations: [
        "AI Research Institute",
        "Search Engine Journal",
        "Tech Performance Labs"
      ]
    },
    {
      id: 3,
      title: "How AI Search Differs from Traditional Search",
      summary: "Key differences between AI-powered search engines and traditional keyword-based search, including contextual understanding, source verification, and conversational interfaces.",
      url: "https://aiexplained.net/search-evolution",
      domain: "aiexplained.net",
      type: "educational",
      sources: 8,
      confidence: 91,
      readTime: "6 min",
      lastUpdated: "1 day ago",
      citations: [
        "OpenAI Research",
        "Anthropic Papers",
        "University of Washington"
      ]
    }
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Add to search history
    if (!searchHistory.includes(query)) {
      setSearchHistory([query, ...searchHistory.slice(0, 9)]);
    }
    
    // Simulate AI search with different delays for realism
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    setResults(mockResults);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleSourceType = (type: string) => {
    setSourceTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const currentModel = aiModels.find(m => m.id === selectedModel);

  return (
    <div 
      className="flex size-full min-h-screen flex-col bg-[#f6f0e4] group/design-root overflow-x-hidden" 
      style={{ 
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
        backgroundImage: 'url("/images/bg_image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Full page overlay for text readability */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5 pt-20">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            {/* Page Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4 mb-4">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/40 shadow-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-[#1a1a1a] tracking-light text-[32px] font-bold leading-tight drop-shadow-lg">
                      AI Search Engine 2025
                    </h1>
                    <p className="text-[#2a2a2a] text-sm drop-shadow-sm">Powered by {currentModel?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[#2a2a2a]">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{currentModel?.accuracy}% Accuracy</span>
                </div>
              </div>
            </div>

            {/* Search Interface */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl overflow-hidden">
                {/* AI Model Selector */}
                <div className="border-b border-white/30 p-4">
                  <div className="flex items-center space-x-4 overflow-x-auto">
                    {aiModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedModel === model.id
                            ? 'bg-purple-100/80 text-purple-700 border border-purple-200/80 backdrop-blur-sm'
                            : 'hover:bg-white/30 text-[#2a2a2a] backdrop-blur-sm'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs opacity-75">{model.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="p-6">
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-4">
                      <Search className="w-5 h-5 text-purple-600" />
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask anything... AI will find the perfect answers with sources"
                        className="flex-1 text-lg border-none outline-none bg-transparent placeholder-gray-500 text-[#1a1a1a]"
                      />
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-white/30 rounded-lg transition-colors">
                          <Mic className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-white/30 rounded-lg transition-colors">
                          <Camera className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Search Modes */}
                    <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
                      {searchModes.map((mode) => {
                        const IconComponent = mode.icon;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setSearchMode(mode.id)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              searchMode === mode.id
                                ? 'bg-purple-100/80 text-purple-700 backdrop-blur-sm'
                                : 'hover:bg-white/30 text-[#2a2a2a] backdrop-blur-sm'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span>{mode.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleSearch}
                      disabled={!query.trim() || isSearching}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                    >
                      {isSearching ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>AI is searching...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          <span>Search with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {results.length > 0 && (
              <div className="space-y-6">
                {/* Results Summary */}
                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[#1a1a1a] drop-shadow-sm">AI Search Results</h2>
                    <div className="flex items-center space-x-4 text-sm text-[#2a2a2a]">
                      <span>{results.length} results found</span>
                      <div className="flex items-center space-x-1">
                        <Brain className="w-4 h-4" />
                        <span>AI Confidence: 94%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 rounded-lg p-4 border border-purple-200/50 backdrop-blur-sm">
                    <div className="flex items-start space-x-3">
                      <Sparkles className="w-6 h-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-medium text-[#1a1a1a] mb-2 drop-shadow-sm">AI Summary</h3>
                        <p className="text-[#2a2a2a] leading-relaxed drop-shadow-sm">
                          Based on your search for "{query}", I've found comprehensive information about AI-powered search engines. 
                          The landscape has evolved significantly in 2025, with tools like Perplexity Pro, SearchGPT-4, and Grok 3.0 
                          leading the revolution. These platforms offer contextual understanding, real-time information, and source 
                          verification that traditional search engines struggle to match. Performance benchmarks show accuracy rates 
                          between 85-97%, with conversational interfaces becoming the new standard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Results */}
                {results.map((result) => (
                  <div key={result.id} className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-purple-100/80 text-purple-700 text-xs font-medium rounded-full backdrop-blur-sm">
                            {result.type}
                          </span>
                          <span className="text-sm text-[#2a2a2a]">{result.domain}</span>
                          <span className="text-sm text-[#2a2a2a]">•</span>
                          <span className="text-sm text-[#2a2a2a]">{result.lastUpdated}</span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2 hover:text-purple-600 cursor-pointer drop-shadow-sm">
                          {result.title}
                        </h3>
                        
                        <p className="text-[#2a2a2a] leading-relaxed mb-4 drop-shadow-sm">
                          {result.summary}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-[#2a2a2a] mb-4">
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{result.sources} sources</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{result.readTime} read</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{result.confidence}% confidence</span>
                          </div>
                        </div>
                        
                        {/* Citations */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-[#1a1a1a] mb-2 drop-shadow-sm">Key Sources:</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.citations.map((citation: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-white/50 text-[#2a2a2a] text-xs rounded-lg backdrop-blur-sm">
                                {citation}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/30">
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-1 px-3 py-2 text-purple-600 hover:bg-purple-50/50 rounded-lg transition-colors backdrop-blur-sm">
                          <ExternalLink className="w-4 h-4" />
                          <span>Visit Source</span>
                        </button>
                        <button className="flex items-center space-x-1 px-3 py-2 text-[#2a2a2a] hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm">
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </button>
                        <button className="flex items-center space-x-1 px-3 py-2 text-[#2a2a2a] hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm">
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                      </div>
                      
                      <button className="flex items-center space-x-1 px-3 py-2 bg-purple-100/80 text-purple-700 hover:bg-purple-200/80 rounded-lg transition-colors backdrop-blur-sm">
                        <ArrowRight className="w-4 h-4" />
                        <span>Ask Follow-up</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Features Section */}
            {!results.length && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-100/80 rounded-lg backdrop-blur-sm">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1a1a1a] drop-shadow-sm">AI-Powered Analysis</h3>
                  </div>
                  <p className="text-[#2a2a2a] drop-shadow-sm">
                    Advanced AI models understand context, intent, and nuance to deliver precise, relevant results.
                  </p>
                </div>

                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100/80 rounded-lg backdrop-blur-sm">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1a1a1a] drop-shadow-sm">Source Verification</h3>
                  </div>
                  <p className="text-[#2a2a2a] drop-shadow-sm">
                    Every result includes verified sources and citations for complete transparency and fact-checking.
                  </p>
                </div>

                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-100/80 rounded-lg backdrop-blur-sm">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1a1a1a] drop-shadow-sm">Real-time Data</h3>
                  </div>
                  <p className="text-[#2a2a2a] drop-shadow-sm">
                    Access the latest information with real-time web crawling and live data integration.
                  </p>
                </div>

                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-yellow-100/80 rounded-lg backdrop-blur-sm">
                      <Sparkles className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1a1a1a] drop-shadow-sm">Conversational Interface</h3>
                  </div>
                  <p className="text-[#2a2a2a] drop-shadow-sm">
                    Ask follow-up questions and refine searches through natural conversation.
                  </p>
                </div>

                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-indigo-100/80 rounded-lg backdrop-blur-sm">
                      <Globe className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1a1a1a] drop-shadow-sm">Multi-Source Search</h3>
                  </div>
                  <p className="text-[#2a2a2a] drop-shadow-sm">
                    Search across web, academic papers, news, social media, and specialized databases.
                  </p>
                </div>

                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-red-100/80 rounded-lg backdrop-blur-sm">
                      <Star className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1a1a1a] drop-shadow-sm">Accuracy Scoring</h3>
                  </div>
                  <p className="text-[#2a2a2a] drop-shadow-sm">
                    AI confidence scores and accuracy ratings help you evaluate result reliability.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AISearchEnginePage; 