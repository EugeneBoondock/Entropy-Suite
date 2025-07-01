import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { sendUnihelperMessage, Message, ChatHistory } from "../tools/SummarizerTool/unihelperService";
import { GraduationCap, Send, Plus, Trash2, MessageCircle, BookOpen, MapPin, Calendar, DollarSign, Users, Award, X } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatHistory;
  lastUpdated: Date;
}

// Typing indicator with animated floaty dots
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-600">
      <GraduationCap className="w-3 h-3" />
    </div>
    <div className="flex-1 max-w-lg text-left">
      <div className="inline-block p-2 rounded-lg bg-white/60 text-gray-800 rounded-tl-sm border border-white/30">
        <div className="flex items-center space-x-1 h-4">
          <span className="dot dot1 bg-purple-400 inline-block w-1.5 h-1.5 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
          <span className="dot dot2 bg-purple-400 inline-block w-1.5 h-1.5 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
          <span className="dot dot3 bg-purple-400 inline-block w-1.5 h-1.5 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
        </div>
      </div>
    </div>
  </div>
);

const UnihelperPage: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('unihelper-chat-sessions');
    if (saved) {
      const sessions = JSON.parse(saved);
      return sessions.map((session: any) => ({
        ...session,
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        lastUpdated: new Date(session.lastUpdated)
      }));
    }
    return [{
      id: '1',
      title: 'University Guidance',
      messages: [{
        role: 'model' as const,
        content: "👋 Hello! I'm Unihelper, your dedicated AI assistant for South African university applications, NSFAS, and scholarships.\n\nI have comprehensive knowledge of all 24 major South African universities and their 2026 prospectuses. I can help you with:\n\n🎓 **University Applications**\n📋 **NSFAS Guidance** \n🏆 **Scholarship Information**\n📚 **Course Recommendations**\n💰 **Fee Structures & Financial Aid**\n📍 **Campus Information**\n\nWhat would you like to know about your university journey? 🌟"
      }],
      lastUpdated: new Date()
    }];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>('1');
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentSession = chatSessions.find(session => session.id === currentSessionId) || chatSessions[0];

  // Only scroll when a new message is added, not when switching sessions
  const prevSessionId = useRef(currentSessionId);
  useEffect(() => {
    if (
      prevSessionId.current === currentSessionId &&
      currentSession.messages.length > 1
    ) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevSessionId.current = currentSessionId;
  }, [currentSession.messages, currentSessionId]);

  // Save chat sessions to localStorage
  useEffect(() => {
    localStorage.setItem('unihelper-chat-sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Focus input when session changes, after sending, or on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentSessionId, loading]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Lock scroll after initial render, do not scroll the page
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'University Guidance',
      messages: [{
        role: 'model' as const,
        content: "👋 Hello! I'm Unihelper, your dedicated AI assistant for South African university applications, NSFAS, and scholarships.\n\nI have comprehensive knowledge of all 24 major South African universities and their 2026 prospectuses. I can help you with:\n\n🎓 **University Applications**\n📋 **NSFAS Guidance** \n🏆 **Scholarship Information**\n📚 **Course Recommendations**\n💰 **Fee Structures & Financial Aid**\n📍 **Campus Information**\n\nWhat would you like to know about your university journey? 🌟"
      }],
      lastUpdated: new Date()
    };

    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSidebarOpen(false);
  };

  const deleteChat = (sessionId: string) => {
    if (chatSessions.length === 1) return;
    
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
      setCurrentSessionId(remainingSessions[0].id);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const newMessages: ChatHistory = [
      ...currentSession.messages,
      { role: "user", content: input.trim() }
    ];

    // Update current session with user message
    setChatSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { 
            ...session, 
            messages: newMessages,
            lastUpdated: new Date(),
            title: session.title === 'University Guidance' && input.trim().length > 0 ? 
              input.trim().slice(0, 30) + (input.trim().length > 30 ? '...' : '') : 
              session.title
          }
        : session
    ));

    const messageToSend = input.trim();
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await sendUnihelperMessage(newMessages);
      
      const finalMessages: ChatHistory = [
        ...newMessages,
        { role: "model", content: response }
      ];

      // Update current session with AI response
      setChatSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session, 
              messages: finalMessages,
              lastUpdated: new Date()
            }
          : session
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
      console.error('Unihelper error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: GraduationCap, text: "University Requirements", query: "What are the general admission requirements for South African universities?" },
    { icon: DollarSign, text: "NSFAS Application", query: "How do I apply for NSFAS funding? What are the eligibility criteria?" },
    { icon: BookOpen, text: "Course Information", query: "Can you help me find information about different courses and programs?" },
    { icon: Calendar, text: "Application Deadlines", query: "What are the application deadlines for 2026 university admissions?" },
    { icon: Award, text: "Scholarships", query: "What scholarship opportunities are available for South African students?" },
    { icon: MapPin, text: "University Locations", query: "Can you tell me about universities in different provinces?" }
  ];

  return (
    <div 
      className="h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/bg_image.png)' }}
    >
      <div className="min-h-screen bg-black/10">
        <Navbar />
        
        <main className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 justify-center">
              {/* Sidebar: hidden on mobile, overlay when open; always visible on lg+ */}
              <div className={`fixed left-0 top-[4rem] z-50 w-64 bg-white/30 border border-white/30 backdrop-blur-md shadow-xl transition-transform duration-300 transform h-[calc(100vh-4rem)] max-h-[100vh] lg:max-h-[80vh] overflow-y-auto scrollbar-none lg:scrollbar-thin lg:scrollbar-thumb-white/40 lg:scrollbar-track-white/10 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:top-0 lg:translate-x-0 lg:w-64 lg:bg-white/30 lg:border lg:border-white/30 lg:backdrop-blur-md lg:shadow-xl lg:rounded-xl flex flex-col gap-2 p-2 sm:p-4`}>
                {/* Close button for mobile sidebar */}
                <button
                  className="block lg:hidden absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200 transition-colors z-50"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
                {/* Sidebar content: Chat History + University Websites */}
                {/* Chat History Sidebar */}
                <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-xl shadow-xl mb-2 lg:mb-0 p-2 sm:p-4 h-full flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-white/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-blue-500/20 rounded-lg">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h1 className="text-base font-bold text-gray-800">Unihelper</h1>
                        <p className="text-xs text-gray-600">Your University Guide</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={createNewChat}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="text-sm font-medium">New Conversation</span>
                    </button>
                  </div>

                  {/* Chat Sessions */}
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none lg:scrollbar-thin lg:scrollbar-thumb-white/40 lg:scrollbar-track-white/10 px-4 py-2">
                    {chatSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => {
                          setCurrentSessionId(session.id);
                          setSidebarOpen(false);
                        }}
                        className={`flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer transition-colors group ${
                          currentSessionId === session.id 
                            ? 'bg-blue-500/20 border border-blue-500/30' 
                            : 'hover:bg-white/50'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{session.title}</p>
                          <p className="text-xs text-gray-500">{session.lastUpdated.toLocaleDateString()}</p>
                        </div>
                        {chatSessions.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* University Websites Card */}
                <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-xl shadow-xl p-2 sm:p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-gray-800">University Websites</h3>
                  </div>
                  <div className="space-y-2 max-h-[30vh] overflow-y-auto scrollbar-none lg:scrollbar-thin lg:scrollbar-thumb-white/40 lg:scrollbar-track-white/10">
                    {[
                      { name: 'Cape Peninsula University of Technology', url: 'https://www.cput.ac.za' },
                      { name: 'Central University of Technology', url: 'https://www.cut.ac.za' },
                      { name: 'Durban University of Technology', url: 'https://www.dut.ac.za' },
                      { name: 'Mangosuthu University of Technology', url: 'https://www.mut.ac.za' },
                      { name: 'Nelson Mandela University', url: 'https://www.mandela.ac.za' },
                      { name: 'North-West University', url: 'https://www.nwu.ac.za' },
                      { name: 'Rhodes University', url: 'https://www.ru.ac.za' },
                      { name: 'Sefako Makgatho Health Sciences University', url: 'https://www.smu.ac.za' },
                      { name: 'Sol Plaatje University', url: 'https://www.spu.ac.za' },
                      { name: 'Stellenbosch University', url: 'https://www.sun.ac.za' },
                      { name: 'Tshwane University of Technology', url: 'https://www.tut.ac.za' },
                      { name: 'University of Cape Town', url: 'https://www.uct.ac.za' },
                      { name: 'University of Fort Hare', url: 'https://www.ufh.ac.za' },
                      { name: 'University of the Free State', url: 'https://www.ufs.ac.za' },
                      { name: 'University of Johannesburg', url: 'https://www.uj.ac.za' },
                      { name: 'University of KwaZulu-Natal', url: 'https://www.ukzn.ac.za' },
                      { name: 'University of Mpumalanga', url: 'https://www.ump.ac.za' },
                      { name: 'University of South Africa', url: 'https://www.unisa.ac.za' },
                      { name: 'University of Venda', url: 'https://www.univen.ac.za' },
                      { name: 'University of Pretoria', url: 'https://www.up.ac.za' },
                      { name: 'Vaal University of Technology', url: 'https://www.vut.ac.za' },
                      { name: 'University of the Witwatersrand', url: 'https://www.wits.ac.za' },
                      { name: 'Walter Sisulu University', url: 'https://www.wsu.ac.za' },
                      { name: 'University of Zululand', url: 'https://www.uzulu.ac.za' }
                    ].map((uni) => (
                      <a
                        key={uni.name}
                        href={uni.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-white/40 hover:bg-white/60 rounded-lg transition-colors border border-white/20 hover:border-white/40 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-800 leading-tight group-hover:text-purple-700">{uni.name}</p>
                            <p className="text-xs text-gray-600">Official Website</p>
                          </div>
                          <MapPin className="w-3 h-3 text-purple-600 opacity-60 group-hover:opacity-100" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
                {/* University Prospectuses Card (mobile only) */}
                <div className="block lg:hidden bg-white/30 backdrop-blur-md border border-white/30 rounded-xl shadow-xl p-2 sm:p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-bold text-gray-800">University Prospectuses</h3>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-none lg:scrollbar-thin lg:scrollbar-thumb-white/40 lg:scrollbar-track-white/10">
                    {[
                      { code: 'cpu-2026.pdf', name: 'Cape Peninsula University of Technology' },
                      { code: 'cut-2026.pdf', name: 'Central University of Technology' },
                      { code: 'dut-2026.pdf', name: 'Durban University of Technology' },
                      { code: 'mut-2026.pdf', name: 'Mangosuthu University of Technology' },
                      { code: 'nmu-2026.pdf', name: 'Nelson Mandela University' },
                      { code: 'nwu-2026.pdf', name: 'North-West University' },
                      { code: 'ru-2026.pdf', name: 'Rhodes University' },
                      { code: 'SMu-Prospectus-2025_2026.pdf', name: 'Sefako Makgatho Health Sciences University' },
                      { code: 'sol-plaatje-2026.pdf', name: 'Sol Plaatje University' },
                      { code: 'su-2026.pdf', name: 'Stellenbosch University' },
                      { code: 'tut-2026.pdf', name: 'Tshwane University of Technology' },
                      { code: 'uct-2026.pdf', name: 'University of Cape Town' },
                      { code: 'ufh-2025.pdf', name: 'University of Fort Hare' },
                      { code: 'ufs-2026.pdf', name: 'University of the Free State' },
                      { code: 'uj-2026.pdf', name: 'University of Johannesburg' },
                      { code: 'ukzn-2026.pdf', name: 'University of KwaZulu-Natal' },
                      { code: 'ump-2026.pdf', name: 'University of Mpumalanga' },
                      { code: 'unisa-2026.pdf', name: 'University of South Africa' },
                      { code: 'univen-2026.pdf', name: 'University of Venda' },
                      { code: 'up-2026.pdf', name: 'University of Pretoria' },
                      { code: 'vut-2026.pdf', name: 'Vaal University of Technology' },
                      { code: 'wits-2026.pdf', name: 'University of the Witwatersrand' },
                      { code: 'wsu-2026.pdf', name: 'Walter Sisulu University' },
                      { code: 'zululand-2026.pdf', name: 'University of Zululand' }
                    ].map((uni) => (
                      <a
                        key={uni.code}
                        href={`/prospectuses/${uni.code}`}
                        download
                        className="block p-2 bg-white/40 hover:bg-white/60 rounded-lg transition-colors border border-white/20 hover:border-white/40"
                      >
                        <p className="text-xs font-medium text-gray-800 leading-tight">{uni.name}</p>
                        <p className="text-xs text-gray-600">2026 Prospectus</p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              {/* Sidebar overlay for mobile */}
              {sidebarOpen && (
                <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
              )}
              {/* Main Chat Area: always full width on mobile */}
              <div className="flex-1 flex flex-col order-1 lg:order-none">
                {/* Chat Header */}
                <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-t-xl shadow-xl px-2 py-2 sm:px-4 sm:py-3 mb-2 sm:mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex flex-row sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      {/* Sidebar toggle button for mobile */}
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="block lg:hidden p-1.5 mr-1 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Open sidebar"
                      >
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                      </button>
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-1.5 bg-blue-500/20 rounded-lg mb-1 sm:mb-0">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-base sm:text-xl leading-tight text-gray-900">University<br className="hidden sm:block"/> Guidance<br className="hidden sm:block"/> Assistant</span>
                        <span className="text-xs sm:text-sm text-gray-600 mt-1">Comprehensive South African university information</span>
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 mt-2 sm:mt-0">
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">24 Universities</span>
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">2026 Prospectus</span>
                    </div>
                  </div>
                </div>
                {/* Messages Container */}
                <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-b-xl shadow-xl overflow-hidden flex flex-col h-[60vh] sm:h-[75vh]">
                  <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3 scrollbar-none lg:scrollbar-thin lg:scrollbar-thumb-white/40 lg:scrollbar-track-white/10">
                    {currentSession.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${
                          message.role === "user" 
                            ? "bg-blue-500/20 text-blue-600" 
                            : "bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-600"
                        }`}>
                          {message.role === "user" ? (
                            <Users className="w-3 h-3" />
                          ) : (
                            <GraduationCap className="w-3 h-3" />
                          )}
                        </div>
                        <div className={`flex-1 max-w-lg ${message.role === "user" ? "text-right" : "text-left"}`}>
                          <div className={`inline-block p-2 rounded-lg ${
                            message.role === "user"
                              ? "bg-blue-500/20 text-gray-800 rounded-tr-sm"
                              : "bg-white/60 text-gray-800 rounded-tl-sm border border-white/30"
                          }`}>
                            <div className="whitespace-pre-wrap leading-relaxed text-sm">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({node, ...props}) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Typing indicator when loading */}
                    {loading && <TypingIndicator />}
                    {/* Always keep this at the end for auto-scroll */}
                    <div ref={chatEndRef} />
                  </div>
                  {/* Quick Actions */}
                  {currentSession.messages.length === 1 && (
                    <div className="px-2 py-1 sm:px-4 sm:py-2 border-t border-white/20">
                      <p className="text-xs font-medium text-gray-600 mb-1 sm:mb-2">Quick Questions:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => setInput(action.query)}
                            className="flex flex-col items-center gap-0.5 p-1.5 bg-white/40 hover:bg-white/60 rounded-md transition-colors text-center border border-white/20 hover:border-white/40 min-w-0"
                          >
                            <action.icon className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            <span className="text-xs font-medium text-gray-700 leading-tight truncate w-full">{action.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Input Area */}
                  <div className="p-2 sm:p-4 border-t border-white/20">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask about universities, NSFAS, scholarships, or any admission guidance..."
                          className="w-full p-3 bg-white/60 border border-white/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 placeholder-gray-500 text-sm"
                          rows={2}
                          disabled={loading}
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="self-end p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl transition-all disabled:cursor-not-allowed shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* University Prospectuses Card (desktop only, right sidebar) */}
              <div className="hidden lg:block w-64 space-y-4">
                <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-xl shadow-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-bold text-gray-800">University Prospectuses</h3>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-none lg:scrollbar-thin lg:scrollbar-thumb-white/40 lg:scrollbar-track-white/10">
                    {[
                      { code: 'cpu-2026.pdf', name: 'Cape Peninsula University of Technology' },
                      { code: 'cut-2026.pdf', name: 'Central University of Technology' },
                      { code: 'dut-2026.pdf', name: 'Durban University of Technology' },
                      { code: 'mut-2026.pdf', name: 'Mangosuthu University of Technology' },
                      { code: 'nmu-2026.pdf', name: 'Nelson Mandela University' },
                      { code: 'nwu-2026.pdf', name: 'North-West University' },
                      { code: 'ru-2026.pdf', name: 'Rhodes University' },
                      { code: 'SMu-Prospectus-2025_2026.pdf', name: 'Sefako Makgatho Health Sciences University' },
                      { code: 'sol-plaatje-2026.pdf', name: 'Sol Plaatje University' },
                      { code: 'su-2026.pdf', name: 'Stellenbosch University' },
                      { code: 'tut-2026.pdf', name: 'Tshwane University of Technology' },
                      { code: 'uct-2026.pdf', name: 'University of Cape Town' },
                      { code: 'ufh-2025.pdf', name: 'University of Fort Hare' },
                      { code: 'ufs-2026.pdf', name: 'University of the Free State' },
                      { code: 'uj-2026.pdf', name: 'University of Johannesburg' },
                      { code: 'ukzn-2026.pdf', name: 'University of KwaZulu-Natal' },
                      { code: 'ump-2026.pdf', name: 'University of Mpumalanga' },
                      { code: 'unisa-2026.pdf', name: 'University of South Africa' },
                      { code: 'univen-2026.pdf', name: 'University of Venda' },
                      { code: 'up-2026.pdf', name: 'University of Pretoria' },
                      { code: 'vut-2026.pdf', name: 'Vaal University of Technology' },
                      { code: 'wits-2026.pdf', name: 'University of the Witwatersrand' },
                      { code: 'wsu-2026.pdf', name: 'Walter Sisulu University' },
                      { code: 'zululand-2026.pdf', name: 'University of Zululand' }
                    ].map((uni) => (
                      <a
                        key={uni.code}
                        href={`/prospectuses/${uni.code}`}
                        download
                        className="block p-2 bg-white/40 hover:bg-white/60 rounded-lg transition-colors border border-white/20 hover:border-white/40"
                      >
                        <p className="text-xs font-medium text-gray-800 leading-tight">{uni.name}</p>
                        <p className="text-xs text-gray-600">2026 Prospectus</p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UnihelperPage; 