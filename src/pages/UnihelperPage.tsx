import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { sendUnihelperMessage, Message, ChatHistory } from "../tools/SummarizerTool/unihelperService";
import { GraduationCap, Send, Plus, Trash2, MessageCircle, BookOpen, MapPin, Calendar, DollarSign, Users, Award } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatHistory;
  lastUpdated: Date;
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

  useEffect(() => {
    // Only scroll when there are actual messages, not during loading
    if (currentSession.messages.length > 1) {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSession.messages]);

  // Save chat sessions to localStorage
  useEffect(() => {
    localStorage.setItem('unihelper-chat-sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

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
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/bg_image.png)' }}
    >
      <div className="min-h-screen bg-black/10">
        <Navbar />
        
        <main className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-4 justify-center">
              <div className="flex flex-col gap-4">
                {/* Chat History Sidebar */}
                <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-xl shadow-xl">
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
                  <div className="max-h-[30vh] overflow-y-auto px-4 py-2">
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
                <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-xl shadow-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-gray-800">University Websites</h3>
                  </div>
                  <div className="space-y-2 max-h-[30vh] overflow-y-auto">
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

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-t-xl shadow-xl px-4 py-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSidebarOpen(!sidebarOpen)}
                          className="lg:hidden p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-gray-800">University Guidance Assistant</h2>
                          <p className="text-xs text-gray-600">Comprehensive South African university information</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="px-2 py-0.5 bg-green-500/20 text-green-700 rounded-full text-xs font-medium">
                          24 Universities
                        </div>
                        <div className="px-2 py-0.5 bg-blue-500/20 text-blue-700 rounded-full text-xs font-medium">
                          2026 Prospectus
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-b-xl shadow-xl overflow-hidden flex flex-col h-[75vh]">
                                 <div className="flex-1 overflow-y-auto p-3 space-y-3">
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

          {loading && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="inline-block p-4 bg-white/60 rounded-2xl rounded-tl-md border border-white/30">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-600">Analyzing your query...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex justify-center">
                      <div className="bg-red-500/20 border border-red-500/30 text-red-700 px-4 py-3 rounded-xl max-w-md text-center">
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

                                 {/* Quick Actions */}
                 {currentSession.messages.length === 1 && (
                   <div className="px-4 py-2 border-t border-white/20">
                     <p className="text-xs font-medium text-gray-600 mb-2">Quick Questions:</p>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
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
                <div className="p-4 border-t border-white/20">
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

              {/* Right Sidebar - Prospectus Downloads */}
              <div className="hidden lg:block w-64 space-y-4">
                <div className="bg-white/80 backdrop-blur-md border border-white/30 rounded-xl shadow-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-bold text-gray-800">University Prospectuses</h3>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
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

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default UnihelperPage; 