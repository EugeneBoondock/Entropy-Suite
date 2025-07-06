import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { sendUnihelperMessage, Message, ChatHistory } from "../tools/SummarizerTool/unihelperService";
import { GraduationCap, Send, Plus, Trash2, MessageCircle, BookOpen, MapPin, Calendar, DollarSign, Users, Award, X, Menu } from "lucide-react";
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

// Utility to detect mobile devices
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

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

  // Auto-scroll to the latest message
  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentSession.messages]);

  // Save chat sessions to localStorage
  useEffect(() => {
    localStorage.setItem('unihelper-chat-sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Focus input when session changes, after sending, or on mount (desktop only)
  useEffect(() => {
    if (!isMobileDevice()) {
      inputRef.current?.focus();
    }
  }, [currentSessionId, loading]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Lock body scroll on mobile for a native-like chat experience
  useEffect(() => {
    if (isMobileDevice()) {
      document.body.style.overflow = 'hidden';
    }
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
        
        {/* --- DESKTOP LAYOUT --- */}
        <main className="hidden lg:block pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-row gap-4 justify-center">
              {/* Left Sidebar */}
              <div className="w-64 sticky top-24 h-fit flex flex-col gap-4">
                <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-xl shadow-xl p-4 flex flex-col h-full">
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
                  <div className="max-h-[112px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/40 scrollbar-track-white/10 px-4 py-2">
                    {chatSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => setCurrentSessionId(session.id)}
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
                            onClick={(e) => { e.stopPropagation(); deleteChat(session.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-xl shadow-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-gray-800">University Websites</h3>
                  </div>
                  <div className="space-y-2 max-h-[30vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/40 scrollbar-track-white/10">
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
              </div>

              {/* Center Chat Area */}
              <div className="flex-1 flex flex-col max-w-4xl" style={{height: 'calc(100vh - 7rem)'}}>
                {/* Chat Header */}
                <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-t-xl shadow-xl px-4 py-3 mb-3">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-500/20 rounded-lg">
                              <GraduationCap className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                              <span className="font-bold text-xl text-gray-900">University Guidance Assistant</span>
                              <span className="text-sm text-gray-600 block">Comprehensive South African university information</span>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">24 Universities</span>
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">2026 Prospectus</span>
                      </div>
                  </div>
                </div>
                {/* Messages Container */}
                <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-b-xl shadow-xl flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-white/40 scrollbar-track-white/10">
                    {currentSession.messages.map((message, index) => (
                      <div key={index} className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${message.role === "user" ? "bg-blue-500/20 text-blue-600" : "bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-600"}`}>
                          {message.role === "user" ? <Users className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                        </div>
                        <div className={`flex-1 max-w-lg ${message.role === "user" ? "text-right" : "text-left"}`}>
                          <div className={`inline-block p-2 rounded-lg ${message.role === "user" ? "bg-blue-500/20 text-gray-800 rounded-tr-sm" : "bg-white/60 text-gray-800 rounded-tl-sm border border-white/30"}`}>
                            <div className="whitespace-pre-wrap leading-relaxed text-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({node, ...props}) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" /> }}>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {loading && <TypingIndicator />}
                    <div ref={chatEndRef} />
                  </div>
                  {currentSession.messages.length === 1 && (
                    <div className="px-4 py-2 border-t border-white/20">
                      <p className="text-xs font-medium text-gray-600 mb-2">Quick Questions:</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {quickActions.map((action, index) => (
                          <button key={index} onClick={() => setInput(action.query)} className="flex items-center gap-2 p-1.5 bg-white/40 hover:bg-white/60 rounded-md transition-colors text-left border border-white/20 hover:border-white/40 min-w-0">
                            <action.icon className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            <span className="text-xs font-medium text-gray-700 leading-tight">{action.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Desktop Input */}
                  <div className="p-4 border-t border-white/20 bg-white/30">
                    <div className="flex gap-3">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about universities, NSFAS, scholarships, or any admission guidance..."
                        className="w-full p-3 bg-white/60 border border-white/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 placeholder-gray-500 text-sm"
                        rows={2}
                        disabled={loading}
                      />
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

              {/* Right Sidebar */}
              <div className="hidden lg:block w-64 space-y-4 sticky top-24 h-fit">
                <div className="bg-white/30 backdrop-blur-md border border-white/30 rounded-xl shadow-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-bold text-gray-800">University Prospectuses</h3>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/40 scrollbar-track-white/10">
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
                      { name: 'zululand-2026.pdf', code: 'zululand-2026.pdf' }
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

        {/* --- MOBILE LAYOUT --- */}
        <main className="block lg:hidden">
          <div className="flex flex-col h-screen w-full">
            {/* Header with always-visible sidebar toggle, below Navbar */}
            <div className="w-full bg-white/90 border-b border-gray-200 flex items-center px-4 py-3 shadow mt-16">
              <button
                onClick={() => setSidebarOpen(true)}
                className="mr-3 w-10 h-10 rounded-full bg-blue-600 text-white border border-blue-700 flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex flex-col">
                <span className="font-bold text-base text-gray-900">University Guidance</span>
                <span className="text-xs text-green-800 font-medium">24 Universities <span className='text-gray-400 font-normal'>/</span> 2026 Prospectus</span>
              </div>
            </div>
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-2 py-3 w-full bg-transparent">
              {/* Quick Actions at top if only intro message */}
              {currentSession.messages.length === 1 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickActions.slice(0, 4).map((action, index) => (
                      <button key={index} onClick={() => setInput(action.query)} className="glass-button flex items-center gap-2 text-xs">
                        <action.icon className="w-4 h-4 text-blue-600" />
                        {action.text}
                  </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Chat Messages */}
              {currentSession.messages.map((message, index) => (
                <div key={index} className={`w-full flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}> 
                  <div className={`chat-bubble ${message.role === 'user' ? 'user' : 'ai'} max-w-[95%]`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({node, ...props}) => <a {...props} className="text-blue-200 underline" target="_blank" rel="noopener noreferrer" /> }}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>
            {/* Input */}
            <div className="w-full px-2 pb-3 bg-transparent">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question..."
                  className="glass-input flex-1 min-h-[44px] max-h-32"
                  rows={1}
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="glass-button px-4 py-2 flex items-center justify-center disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                </button>
                      </div>
                      </div>
            {/* Mobile Sidebar */}
            {sidebarOpen && (
              <>
                <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />
                <div className="fixed top-0 left-0 z-50 h-full w-72 bg-white/95 shadow-xl flex flex-col transition-transform duration-300">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-base text-gray-900">Unihelper</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
                  <button
                    onClick={createNewChat}
                    className="glass-button w-[90%] mx-auto mt-4 mb-2 flex items-center gap-2 justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    New Conversation
                  </button>
                  <div className="flex-1 overflow-y-auto px-4 py-2">
                    {/* Chat History */}
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                        onClick={() => { setCurrentSessionId(session.id); setSidebarOpen(false); }}
                        className={`flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer transition-colors group ${currentSessionId === session.id ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'}`}
                  >
                    <MessageCircle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{session.title}</p>
                      <p className="text-xs text-gray-500">{session.lastUpdated.toLocaleDateString()}</p>
                    </div>
                    {chatSessions.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteChat(session.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
                    {/* University Websites */}
                <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <h3 className="text-sm font-bold text-gray-800">University Websites</h3>
                    </div>
                      <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-2">
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
                    {/* University Prospectuses */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-bold text-gray-800">University Prospectuses</h3>
                  </div>
                      <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-2">
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
                      { name: 'zululand-2026.pdf', code: 'zululand-2026.pdf' }
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
              </>
          )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UnihelperPage; 