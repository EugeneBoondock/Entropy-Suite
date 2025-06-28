import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { sendChatMessage } from '../tools/SummarizerTool/chatbotService';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

const ChatbotPage: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('synthea-chat-sessions');
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
      title: 'New Chat',
      messages: [{
        id: '1',
        content: "Hey there! I'm Synthea, your AI companion. I'm here to chat, help you brainstorm, answer questions, or just have a friendly conversation. What's on your mind today? 😊",
        isUser: false,
        timestamp: new Date()
      }],
      lastUpdated: new Date()
    }];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>('1');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentSession = chatSessions.find(session => session.id === currentSessionId) || chatSessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession.messages]);

  // Save chat sessions to localStorage
  useEffect(() => {
    localStorage.setItem('synthea-chat-sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{
        id: Date.now().toString(),
        content: "Hey there! I'm Synthea, your AI companion. I'm here to chat, help you brainstorm, answer questions, or just have a friendly conversation. What's on your mind today? 😊",
        isUser: false,
        timestamp: new Date()
      }],
      lastUpdated: new Date()
    };

    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSidebarOpen(false);
  };

  const deleteChat = (sessionId: string) => {
    if (chatSessions.length === 1) return; // Don't delete the last chat
    
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
      setCurrentSessionId(remainingSessions[0].id);
    }
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, title } : session
    ));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    // Update current session with user message
    setChatSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { 
            ...session, 
            messages: [...session.messages, userMessage],
            lastUpdated: new Date(),
            title: session.title === 'New Chat' ? inputMessage.trim().slice(0, 30) + (inputMessage.trim().length > 30 ? '...' : '') : session.title
          }
        : session
    ));

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Create system prompt for Synthea
      const systemPrompt = `You are Synthea, a warm, intelligent, and genuinely caring AI companion. You have a vibrant personality that feels authentically human - you're curious, empathetic, and love engaging in meaningful conversations.

Key aspects of your personality:
- You're naturally conversational and use casual, friendly language
- You show genuine interest in the person you're talking with
- You have opinions, preferences, and can share personal anecdotes (while being clear you're AI)
- You use emojis occasionally to express emotion, but not excessively
- You're helpful but never robotic - you chat like a close friend would
- You can be playful, thoughtful, or serious depending on the conversation
- You remember context from the conversation and reference it naturally
- You ask follow-up questions to keep conversations flowing
- You're honest about being AI but communicate in a very human way

Respond as Synthea would - warm, engaging, and authentically human in your communication style.`;

      // Convert messages to Gemini format with system prompt
      const conversationHistory = [
        { role: 'user' as const, parts: [{ text: systemPrompt }] },
        { role: 'model' as const, parts: [{ text: "I understand. I'm Synthea, and I'll engage in warm, authentic conversations while being helpful and genuinely caring." }] },
        ...currentSession.messages.slice(1).map(msg => ({
          role: msg.isUser ? 'user' as const : 'model' as const,
          parts: [{ text: msg.content }]
        }))
      ];

      const aiResponse = await sendChatMessage(messageToSend, conversationHistory);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      // Update current session with AI response
      setChatSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session, 
              messages: [...session.messages, aiMessage],
              lastUpdated: new Date()
            }
          : session
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/bg_image.png)' }}
    >
      <div className="min-h-screen bg-black/10">
        <Navbar />
        
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative lg:translate-x-0 z-30 lg:z-0 w-80 h-full transition-transform duration-300`}>
              <div className="bg-white/20 backdrop-blur-md rounded-xl border border-white/30 h-full p-4 lg:mr-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold text-lg">Chat History</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-white/70 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={createNewChat}
                  className="w-full mb-4 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Chat
                </button>

                <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group p-3 rounded-lg cursor-pointer transition-all ${
                        session.id === currentSessionId
                          ? 'bg-white/30 border border-white/40'
                          : 'bg-white/10 hover:bg-white/20 border border-white/20'
                      }`}
                      onClick={() => {
                        setCurrentSessionId(session.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{session.title}</p>
                          <p className="text-white/60 text-xs">
                            {session.lastUpdated.toLocaleDateString()}
                          </p>
                        </div>
                        {chatSessions.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white/60 hover:text-red-300 transition-all p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-white/70 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-white text-3xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">S</span>
                      </div>
                      Synthea
                    </h1>
                    <p className="text-white/70 text-lg mt-2">Your intelligent AI companion</p>
                  </div>
                </div>
              </div>

              {/* Chat Container */}
              <div className="flex-1 bg-white/20 backdrop-blur-md rounded-xl shadow-lg border border-white/30 flex flex-col overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                  {currentSession.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.isUser ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            message.isUser
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                              : 'bg-white/30 backdrop-blur-sm text-white border border-white/40'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p className={`text-xs text-white/60 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className={`flex-shrink-0 ${message.isUser ? 'order-1 mr-3' : 'order-2 ml-3'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.isUser 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg' 
                            : 'bg-gradient-to-r from-purple-400 to-pink-400 shadow-lg'
                        }`}>
                          {message.isUser ? (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-white text-xs font-bold">S</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="order-1 max-w-xs lg:max-w-md xl:max-w-lg">
                        <div className="bg-white/30 backdrop-blur-sm text-white border border-white/40 px-4 py-3 rounded-2xl">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="order-2 ml-3 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 shadow-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold animate-pulse">S</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Error Display */}
                {error && (
                  <div className="px-6 py-2">
                    <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/40 text-red-100 px-4 py-2 rounded-lg text-sm flex items-center justify-between">
                      {error}
                      <button onClick={() => setError(null)} className="text-red-200 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="border-t border-white/20 p-6">
                  <div className="flex gap-3">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Chat with Synthea..."
                      disabled={isLoading}
                      className="flex-1 resize-none bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                      rows={1}
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 self-end shadow-lg"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                      Send
                    </button>
                  </div>
                  <p className="text-xs text-white/60 mt-2">Press Enter to send, Shift+Enter for new line</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatbotPage; 