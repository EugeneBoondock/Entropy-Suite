import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { sendChatMessage } from '../tools/SummarizerTool/chatbotService';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'task' | 'analysis' | 'code';
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
}

interface AgentCapability {
  name: string;
  description: string;
  icon: string;
  examples: string[];
}

const BasicAgentPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI Agent assistant. I can help you with various tasks including analysis, planning, code assistance, research, and more. What would you like me to help you with today?",
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'capabilities'>('chat');
  const [tasks, setTasks] = useState<Task[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const capabilities: AgentCapability[] = [
    {
      name: 'Text Analysis',
      description: 'Analyze text for sentiment, key points, and insights',
      icon: '📝',
      examples: ['Analyze this email for tone', 'Extract key points from this document', 'Summarize this article']
    },
    {
      name: 'Code Assistant',
      description: 'Help with programming tasks and code review',
      icon: '💻',
      examples: ['Debug this code', 'Optimize this function', 'Explain this algorithm']
    },
    {
      name: 'Research & Data',
      description: 'Gather information and provide research assistance',
      icon: '🔍',
      examples: ['Research market trends', 'Find information about X', 'Compare these options']
    },
    {
      name: 'Planning & Strategy',
      description: 'Help with project planning and strategic thinking',
      icon: '📋',
      examples: ['Create a project timeline', 'Plan a marketing strategy', 'Organize my tasks']
    },
    {
      name: 'Creative Writing',
      description: 'Assist with writing, brainstorming, and content creation',
      icon: '✍️',
      examples: ['Write a product description', 'Brainstorm blog topics', 'Create a story outline']
    },
    {
      name: 'Problem Solving',
      description: 'Break down complex problems and find solutions',
      icon: '🧩',
      examples: ['Solve this business problem', 'Find alternatives to X', 'Troubleshoot this issue']
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

  const createTaskFromMessage = (content: string) => {
    const taskId = Date.now().toString();
    const newTask: Task = {
      id: taskId,
      title: content.length > 50 ? content.substring(0, 50) + '...' : content,
      description: content,
      status: 'pending',
      createdAt: new Date(),
      priority: 'medium'
    };
    setTasks(prev => [...prev, newTask]);
    return taskId;
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status, completedAt: status === 'completed' ? new Date() : undefined }
        : task
    ));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    // Check if this is a task-oriented request
    const isTaskRequest = messageToSend.toLowerCase().includes('task') || 
                         messageToSend.toLowerCase().includes('todo') ||
                         messageToSend.toLowerCase().includes('remind') ||
                         messageToSend.toLowerCase().includes('plan');

    let taskId: string | null = null;
    if (isTaskRequest) {
      taskId = createTaskFromMessage(messageToSend);
      updateTaskStatus(taskId, 'in-progress');
    }

    try {
      // Enhanced system prompt for agent behavior
      const systemPrompt = "You are a highly capable AI agent assistant. You can help with analysis, planning, coding, research, and problem-solving. Be proactive, thorough, and provide actionable insights. When responding to requests, be specific and helpful. If the user is asking for a task to be done, acknowledge it and provide a clear response about how you'll approach it.";
      
      const conversationHistory = messages.slice(1).map(msg => ({
        role: msg.isUser ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }]
      }));

      const enhancedMessage = `${systemPrompt}\n\nUser: ${messageToSend}`;
      const aiResponse = await sendChatMessage(enhancedMessage, conversationHistory);

      const messageType = determineMessageType(aiResponse);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        type: messageType
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update task status if this was a task
      if (taskId) {
        updateTaskStatus(taskId, 'completed');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
      console.error('Agent error:', err);
      
      if (taskId) {
        updateTaskStatus(taskId, 'failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const determineMessageType = (content: string): Message['type'] => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('```') || lowerContent.includes('function') || lowerContent.includes('code')) {
      return 'code';
    }
    if (lowerContent.includes('analysis') || lowerContent.includes('insight') || lowerContent.includes('data')) {
      return 'analysis';
    }
    if (lowerContent.includes('task') || lowerContent.includes('step') || lowerContent.includes('plan')) {
      return 'task';
    }
    return 'text';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      content: "Hello! I'm your AI Agent assistant. I can help you with various tasks including analysis, planning, code assistance, research, and more. What would you like me to help you with today?",
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }]);
    setError(null);
  };

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getMessageTypeColor = (type: Message['type']) => {
    switch (type) {
      case 'code': return 'border-l-4 border-purple-400 bg-purple-50';
      case 'analysis': return 'border-l-4 border-blue-400 bg-blue-50';
      case 'task': return 'border-l-4 border-green-400 bg-green-50';
      default: return '';
    }
  };

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#f6f0e4]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-10 md:px-20 lg:px-40 py-5">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-[#382f29] text-3xl font-bold">AI Agent</h1>
              <p className="text-[#b8a99d] text-lg mt-2">Intelligent assistant for complex tasks and analysis</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="px-4 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6 bg-white rounded-lg p-1 border border-[#e0d5c7]">
            {[
              { id: 'chat', label: 'Chat', icon: '💬' },
              { id: 'tasks', label: 'Tasks', icon: '📋' },
              { id: 'capabilities', label: 'Capabilities', icon: '⚡' }
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
                {tab.id === 'tasks' && tasks.length > 0 && (
                  <span className="bg-[#e67722] text-white text-xs rounded-full px-2 py-0.5 ml-1">
                    {tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'chat' && (
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-[#e0d5c7] flex flex-col overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 350px)' }}>
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
                            : `bg-[#f1f1f1] text-[#382f29] border border-[#e0d5c7] ${getMessageTypeColor(message.type)}`
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        {!message.isUser && message.type && message.type !== 'text' && (
                          <div className="mt-2 text-xs text-[#b8a99d] capitalize">
                            {message.type === 'code' ? '💻 Code' : 
                             message.type === 'analysis' ? '📊 Analysis' : 
                             message.type === 'task' ? '📋 Task' : ''}
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
                          <span className="text-sm">🤖</span>
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
                        <span className="text-sm">🤖</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

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
                    placeholder="Ask me anything... I can help with analysis, coding, planning, research, and more!"
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

          {activeTab === 'tasks' && (
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-[#e0d5c7] p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#382f29]">Task Management</h2>
                <div className="text-sm text-[#b8a99d]">
                  {tasks.length} total tasks
                </div>
              </div>
              
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-[#382f29] mb-2">No tasks yet</h3>
                  <p className="text-[#b8a99d]">Ask me to help you with tasks in the chat and they'll appear here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="border border-[#e0d5c7] rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-[#382f29]">{task.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                            {task.status.replace('-', ' ')}
                          </span>
                          <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                            ●
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-[#b8a99d] mb-3">{task.description}</p>
                      <div className="flex justify-between items-center text-xs text-[#b8a99d]">
                        <span>Created: {task.createdAt.toLocaleString()}</span>
                        {task.completedAt && (
                          <span>Completed: {task.completedAt.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'capabilities' && (
            <div className="flex-1 bg-white rounded-xl shadow-lg border border-[#e0d5c7] p-6">
              <h2 className="text-xl font-semibold text-[#382f29] mb-6">Agent Capabilities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {capabilities.map((capability, index) => (
                  <div key={index} className="border border-[#e0d5c7] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{capability.icon}</span>
                      <h3 className="font-semibold text-[#382f29]">{capability.name}</h3>
                    </div>
                    <p className="text-[#b8a99d] text-sm mb-3">{capability.description}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-[#382f29]">Try asking:</p>
                      <ul className="space-y-1">
                        {capability.examples.map((example, exampleIndex) => (
                          <li key={exampleIndex} className="text-xs text-[#b8a99d]">
                            • "{example}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BasicAgentPage; 