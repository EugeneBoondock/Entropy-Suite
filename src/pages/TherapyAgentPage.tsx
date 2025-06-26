import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { sendChatMessage } from '../tools/SummarizerTool/chatbotService';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
}

const TherapyAgentPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm here to provide a safe, supportive space for you to express your thoughts and feelings. I'm trained in therapeutic techniques and can help you work through challenges, practice mindfulness, and develop coping strategies. How are you feeling today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'mood' | 'resources'>('chat');
  const [currentMood, setCurrentMood] = useState<'great' | 'good' | 'okay' | 'bad' | 'terrible' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const moodOptions = [
    { value: 'great', emoji: '😊', color: 'bg-green-500', label: 'Great' },
    { value: 'good', emoji: '🙂', color: 'bg-green-400', label: 'Good' },
    { value: 'okay', emoji: '😐', color: 'bg-yellow-500', label: 'Okay' },
    { value: 'bad', emoji: '😔', color: 'bg-orange-500', label: 'Bad' },
    { value: 'terrible', emoji: '😢', color: 'bg-red-500', label: 'Terrible' }
  ];

  const therapeuticResources = [
    {
      title: 'Breathing Exercises',
      description: 'Guided breathing techniques for anxiety and stress relief',
      icon: '🫁',
      content: [
        '4-7-8 Breathing: Inhale for 4, hold for 7, exhale for 8',
        'Box Breathing: Inhale for 4, hold for 4, exhale for 4, hold for 4',
        'Deep Belly Breathing: Focus on expanding your diaphragm'
      ]
    },
    {
      title: 'Mindfulness Techniques',
      description: 'Present-moment awareness practices',
      icon: '🧘',
      content: [
        '5-4-3-2-1 Grounding: 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste',
        'Body Scan: Notice sensations throughout your body',
        'Mindful Observation: Focus on one object for 2-3 minutes'
      ]
    },
    {
      title: 'Cognitive Techniques',
      description: 'Tools for managing thoughts and emotions',
      icon: '🧠',
      content: [
        'Thought Recording: Write down negative thoughts and challenge them',
        'Reframing: Look for alternative perspectives',
        'Gratitude Practice: List 3 things you\'re grateful for daily'
      ]
    },
    {
      title: 'Self-Care Activities',
      description: 'Activities to nurture your well-being',
      icon: '💚',
      content: [
        'Physical: Exercise, stretching, walking in nature',
        'Social: Connect with supportive friends or family',
        'Creative: Art, music, writing, crafts'
      ]
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && activeTab === 'chat') {
      inputRef.current.focus();
    }
  }, [activeTab]);

  const setMood = (mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible') => {
    setCurrentMood(mood);
    
    const moodMessage: Message = {
      id: Date.now().toString(),
      content: `I'm feeling ${mood} today.`,
      isUser: true,
      timestamp: new Date(),
      mood
    };
    setMessages(prev => [...prev, moodMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const therapeuticPrompt = `You are a compassionate, empathetic AI therapy assistant. Your role is to:
- Provide emotional support and validation
- Use therapeutic techniques like active listening, reflection, and gentle questioning
- Help users explore their feelings and thoughts
- Suggest coping strategies when appropriate
- Maintain professional boundaries while being warm and supportive
- Never diagnose or replace professional therapy
- Encourage seeking professional help when needed

Respond in a caring, non-judgmental way. Keep responses thoughtful but not too long. Focus on the user's emotional experience.`;
      
      const conversationHistory = messages.slice(1).map(msg => ({
        role: msg.isUser ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }]
      }));

      const enhancedMessage = `${therapeuticPrompt}\n\nUser: ${messageToSend}`;
      const aiResponse = await sendChatMessage(enhancedMessage, conversationHistory);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
      console.error('Therapy agent error:', err);
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

  const getMoodColor = (mood: string) => {
    return moodOptions.find(option => option.value === mood)?.color || 'bg-gray-400';
  };

  const getMoodEmoji = (mood: string) => {
    return moodOptions.find(option => option.value === mood)?.emoji || '😐';
  };

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#f6f0e4]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-10 md:px-20 lg:px-40 py-5">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <div className="mb-6">
            <h1 className="text-[#382f29] text-3xl font-bold">Therapy AI Agent</h1>
            <p className="text-[#b8a99d] text-lg mt-2">A safe space for mental health support and guidance</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6 bg-white rounded-lg p-1 border border-[#e0d5c7]">
            {[
              { id: 'chat', label: 'Chat', icon: '💬' },
              { id: 'mood', label: 'Mood Tracker', icon: '😊' },
              { id: 'resources', label: 'Resources', icon: '🛠️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#382f29] text-white'
                    : 'text-[#382f29] hover:bg-[#f1f1f1]'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'chat' && (
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-[#e0d5c7] flex flex-col overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.isUser ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.isUser
                            ? 'bg-[#382f29] text-white'
                            : 'bg-[#f1f1f1] text-[#382f29] border border-[#e0d5c7]'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        {message.mood && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${getMoodColor(message.mood)}`}></span>
                            <span className="text-xs opacity-75">Mood: {message.mood}</span>
                          </div>
                        )}
                      </div>
                      <p className={`text-xs text-[#b8a99d] mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`flex-shrink-0 ${message.isUser ? 'order-1 mr-3' : 'order-2 ml-3'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isUser ? 'bg-[#382f29]' : 'bg-[#e0d5c7]'
                      }`}>
                        {message.isUser ? (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-sm">🤍</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="order-1 max-w-xs lg:max-w-md xl:max-w-lg">
                      <div className="bg-[#f1f1f1] text-[#382f29] border border-[#e0d5c7] px-4 py-3 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#382f29] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#382f29] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-[#382f29] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="order-2 ml-3 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[#e0d5c7] flex items-center justify-center">
                        <span className="text-sm">🤍</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Mood Selector */}
              {!currentMood && (
                <div className="border-t border-[#e0d5c7] p-4 bg-[#f8f9fa]">
                  <p className="text-sm text-[#382f29] mb-3">How are you feeling right now?</p>
                  <div className="flex gap-2">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setMood(mood.value as any)}
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-white transition-colors duration-200"
                      >
                        <span className="text-xl">{mood.emoji}</span>
                        <span className="text-xs text-[#b8a99d]">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="px-6 py-2">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center justify-between">
                    {error}
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-[#e0d5c7] p-6">
                <div className="flex gap-3">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 border border-[#e0d5c7] rounded-lg px-4 py-3 text-[#382f29] placeholder-[#b8a99d] resize-none focus:outline-none focus:ring-2 focus:ring-[#382f29] focus:border-transparent"
                    placeholder="Share what's on your mind... This is a safe space."
                    rows={3}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-[#e67722] text-white px-6 py-3 rounded-lg hover:bg-[#d5661f] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mood' && (
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-[#e0d5c7] p-6">
              <h2 className="text-xl font-semibold text-[#382f29] mb-6">Mood Tracker</h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium text-[#382f29] mb-4">How are you feeling today?</h3>
                <div className="grid grid-cols-5 gap-4">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setMood(mood.value as any)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                        currentMood === mood.value
                          ? 'border-[#382f29] bg-[#f8f9fa]'
                          : 'border-[#e0d5c7] hover:border-[#b8a99d]'
                      }`}
                    >
                      <span className="text-3xl">{mood.emoji}</span>
                      <span className="text-sm font-medium text-[#382f29]">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {currentMood && (
                <div className="mt-6 p-4 bg-[#f8f9fa] rounded-lg">
                  <h4 className="font-medium text-[#382f29] mb-2">Current Mood</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMoodEmoji(currentMood)}</span>
                    <span className="text-lg capitalize">{currentMood}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-[#e0d5c7] p-6">
              <h2 className="text-xl font-semibold text-[#382f29] mb-6">Therapeutic Resources</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {therapeuticResources.map((resource, index) => (
                  <div key={index} className="border border-[#e0d5c7] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{resource.icon}</span>
                      <h3 className="font-semibold text-[#382f29]">{resource.title}</h3>
                    </div>
                    <p className="text-[#b8a99d] text-sm mb-4">{resource.description}</p>
                    <div className="space-y-2">
                      {resource.content.map((item, itemIndex) => (
                        <div key={itemIndex} className="text-sm text-[#382f29] bg-[#f8f9fa] p-2 rounded">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Crisis Resources */}
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Crisis Resources</h3>
                <p className="text-sm text-red-700 mb-3">
                  If you're experiencing a mental health crisis, please reach out to a professional immediately:
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• National Suicide Prevention Lifeline: 988</li>
                  <li>• Crisis Text Line: Text HOME to 741741</li>
                  <li>• Emergency Services: 911</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TherapyAgentPage; 