import React, { useState, useRef, useEffect } from "react";
import { sendUnihelperMessage, Message, ChatHistory } from "../tools/SummarizerTool/unihelperService";

const translucentBg =
  "bg-white/70 backdrop-blur-md shadow-xl border border-white/30 rounded-2xl";

const UnihelperPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatHistory>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessages: ChatHistory = [
      ...messages,
      { role: "user", content: input.trim() },
    ];
    
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    
    try {
      const response = await sendUnihelperMessage(newMessages);
      setMessages([
        ...newMessages,
        { role: "model", content: response },
      ]);
    } catch (err) {
      console.error("Error in unihelper:", err);
      setMessages([
        ...newMessages,
        { role: "model", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4">
      <div className={`w-full max-w-2xl h-[80vh] flex flex-col ${translucentBg} p-4`}>
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 drop-shadow">Unihelper</h1>
        <p className="text-center text-gray-600 mb-4">Your AI assistant for university applications, NSFAS, and scholarships.</p>
        <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-2">
          {messages.length === 0 && !loading && (
            <div className="text-center text-gray-500 mt-10">Ask me anything about university applications, NSFAS, or scholarships!</div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-base ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none shadow-md"
                    : "bg-white/80 text-gray-800 rounded-bl-none shadow"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-white/80 text-gray-800 rounded-bl-none shadow animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 text-gray-800 shadow"
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            maxLength={500}
            autoFocus
          />
          <button
            className="px-6 py-2 rounded-2xl bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition disabled:opacity-50"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
      <footer className="mt-6 text-gray-400 text-xs text-center">
        &copy; {new Date().getFullYear()} Unihelper. Powered by Gemini AI.
      </footer>
    </div>
  );
};

export default UnihelperPage; 