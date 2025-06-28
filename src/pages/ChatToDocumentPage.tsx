import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, MessageCircle, Send, Trash2, Download, Eye, X, Bot, User, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { sendChatMessage } from '../tools/SummarizerTool/chatbotService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DocumentInfo {
  name: string;
  size: number;
  type: string;
  content: string;
  uploadDate: Date;
}

const ChatToDocumentPage: React.FC = () => {
  const [document, setDocument] = useState<DocumentInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    // Check file type - support more file types
    const supportedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
      'application/rtf',
      'text/csv'
    ];

    // Also check by file extension for better compatibility
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const supportedExtensions = ['txt', 'md', 'pdf', 'doc', 'docx', 'rtf', 'csv'];

    if (!supportedTypes.includes(file.type) && !supportedExtensions.includes(fileExtension || '')) {
      setError('Unsupported file type. Please upload TXT, MD, PDF, DOC, DOCX, RTF, or CSV files.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size too large. Please upload files smaller than 10MB.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      let content = '';

      if (file.type === 'text/plain' || file.type === 'text/markdown' || file.type === 'text/csv' || 
          fileExtension === 'txt' || fileExtension === 'md' || fileExtension === 'csv') {
        content = await file.text();
      } else if (file.type === 'application/pdf' || fileExtension === 'pdf') {
        content = await extractPDFText(file);
      } else if (file.type === 'application/msword' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 fileExtension === 'doc' || fileExtension === 'docx') {
        content = await extractDocumentText(file);
      } else if (file.type === 'application/rtf' || fileExtension === 'rtf') {
        content = await extractRTFText(file);
      } else {
        // Fallback: try to read as text
        try {
          content = await file.text();
        } catch {
          setError('Unable to extract text from this file format.');
          setIsProcessing(false);
          return;
        }
      }

      if (!content.trim()) {
        setError('No text content found in the uploaded file.');
        setIsProcessing(false);
        return;
      }

      const docInfo: DocumentInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        content: content,
        uploadDate: new Date()
      };

      setDocument(docInfo);
      setMessages([]);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Great! I've successfully read your document "${file.name}". It contains ${content.length} characters. You can now ask me any questions about the content, and I'll help you understand and analyze it.`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);

    } catch (error) {
      console.error('Error processing file:', error);
      setError('Failed to process the file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // PDF text extraction using PDF.js
  const extractPDFText = async (file: File): Promise<string> => {
    try {
      // Use PDF.js with the correct worker path
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set the worker source to use the public worker file
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .filter((item: any) => item.str && item.str.trim())
            .map((item: any) => item.str)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n\n';
          }
        } catch (pageError) {
          console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
          // Continue with other pages
        }
      }
      
      const result = fullText.trim();
      if (!result) {
        throw new Error('No text content found in PDF. The PDF might contain only images or be password-protected.');
      }
      
      return result;
    } catch (error) {
      console.error('PDF extraction error:', error);
      if (error instanceof Error && error.message.includes('No text content found')) {
        throw error;
      }
      throw new Error('Failed to extract text from PDF. The file might be corrupted, password-protected, or contain only images.');
    }
  };

  // Document text extraction (DOC/DOCX)
  const extractDocumentText = async (file: File): Promise<string> => {
    try {
      // For DOCX files, we can use mammoth.js
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          file.name.toLowerCase().endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } else {
        // For older DOC files, try to read as text (basic fallback)
        // This won't work perfectly but might extract some content
        const text = await file.text();
        // Remove common binary characters and clean up
        return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
      }
    } catch (error) {
      console.error('Document extraction error:', error);
      throw new Error('Failed to extract text from document. The file might be corrupted or in an unsupported format.');
    }
  };

  // RTF text extraction
  const extractRTFText = async (file: File): Promise<string> => {
    try {
      const rtfText = await file.text();
      // Basic RTF parsing - remove RTF control codes
      return rtfText
        .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF control words
        .replace(/[{}]/g, '') // Remove braces
        .replace(/\\\w+;/g, '') // Remove other RTF codes
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    } catch (error) {
      console.error('RTF extraction error:', error);
      throw new Error('Failed to extract text from RTF file.');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !document || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      // Create system prompt with document content
      const systemPrompt = `You are a helpful AI assistant that answers questions about documents. The user has uploaded a document with the following content:

${document.content}

Please answer their questions based on this document content. Be accurate and cite specific parts of the document when relevant.

User question: ${messageToSend}`;

      // Convert previous messages to Gemini format for conversation history
      const conversationHistory = messages.slice(1).map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }]
      }));

      const aiResponse = await sendChatMessage(systemPrompt, conversationHistory);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };



  const clearDocument = () => {
    setDocument(null);
    setMessages([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="px-4 sm:px-6 lg:px-8 py-8 pt-20">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100/80 rounded-xl">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#1a1a1a] drop-shadow-sm">Chat to Document</h1>
                  <p className="text-[#2a2a2a] mt-1">Upload a document and ask AI questions about its content</p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50/80 border border-red-200/50 rounded-xl p-4 mb-6 flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
                <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Document Upload Section */}
              <div className="lg:col-span-1">
                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6">
                  <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document
                  </h2>

                  {!document ? (
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive 
                          ? 'border-blue-400 bg-blue-50/50' 
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {isProcessing ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                          <p className="text-[#2a2a2a]">Processing document...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-[#2a2a2a] mb-2">Drop your document here or</p>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                          >
                            Choose File
                          </button>
                          <p className="text-sm text-gray-500 mt-4">
                            Supports: TXT, MD, PDF, DOC, DOCX, RTF, CSV<br/>
                            Max size: 10MB
                          </p>
                        </>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md,.pdf,.doc,.docx,.rtf,.csv"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="w-6 h-6 text-blue-600 mt-1" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-[#1a1a1a] truncate">{document.name}</h3>
                            <p className="text-sm text-[#2a2a2a]">{formatFileSize(document.size)}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded {document.uploadDate.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={clearDocument}
                            className="p-1 hover:bg-red-100/50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div className="text-sm text-[#2a2a2a]">
                        <strong>Content Preview:</strong>
                        <div className="mt-2 p-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg max-h-32 overflow-y-auto text-xs">
                          {document.content.substring(0, 200)}
                          {document.content.length > 200 && '...'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Section */}
              <div className="lg:col-span-2">
                <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl shadow-xl p-6 h-[600px] flex flex-col">
                  <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Chat with Document
                  </h2>

                  {!document ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-[#2a2a2a] text-lg">Upload a document to start chatting</p>
                        <p className="text-sm text-gray-500 mt-2">Once uploaded, you can ask questions about the content</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {message.type === 'assistant' && (
                              <div className="w-8 h-8 bg-blue-100/80 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                            
                            <div
                              className={`max-w-[80%] p-4 rounded-xl ${
                                message.type === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white/60 backdrop-blur-sm border border-white/30 text-[#1a1a1a]'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              <p className={`text-xs mt-2 ${
                                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>

                            {message.type === 'user' && (
                              <div className="w-8 h-8 bg-green-100/80 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-green-600" />
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {isLoading && (
                          <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 bg-blue-100/80 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-4">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span className="text-[#2a2a2a]">AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Ask a question about the document..."
                          className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-[#1a1a1a] placeholder-gray-500 transition-all duration-200"
                          disabled={isLoading}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!inputMessage.trim() || isLoading}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Send
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatToDocumentPage; 