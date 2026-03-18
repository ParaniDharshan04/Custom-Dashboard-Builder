import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';
import { aiApi } from '../../services/api';

export default function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Ask me anything about your recent customer orders.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const { data } = await aiApi.chatInsights(userMessage);
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error fetching insights.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full flex items-center justify-center transition-all duration-300 group",
          isDarkMode
            ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)]"
            : "bg-emerald-500 text-white shadow-[4px_4px_10px_#bebebe,-4px_-4px_10px_#ffffff]"
        )}
      >
        <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 w-80 sm:w-[400px] h-[500px] flex flex-col rounded-2xl transition-all duration-300 overflow-hidden",
      isDarkMode
        ? "bg-gray-800 shadow-[10px_10px_20px_#1a1a1a,-10px_-10px_20px_#404040]"
        : "bg-gray-100 shadow-[10px_10px_30px_rgba(0,0,0,0.15)]"
    )}>
      {/* Header */}
      <div className={cn(
        "px-4 py-3 flex items-center justify-between",
        isDarkMode ? "bg-gray-750 border-b border-gray-700" : "bg-emerald-500 text-white"
      )}>
        <div className="flex items-center gap-2">
          <Sparkles size={18} className={isDarkMode ? "text-emerald-400" : "text-white"} />
          <h3 className="font-bold text-sm tracking-tight text-white">Data Insights AI</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:opacity-75 transition-opacity text-white">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed",
              msg.role === 'user'
                ? "bg-emerald-500 text-white rounded-tr-sm"
                : isDarkMode
                  ? "bg-gray-700 text-gray-200 rounded-tl-sm"
                  : "bg-white text-gray-800 shadow-sm rounded-tl-sm border border-gray-100"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={cn(
              "px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-700 w-16 flex justify-center",
              isDarkMode ? "bg-gray-700" : "bg-white shadow-sm border border-gray-100"
            )}>
              <Loader2 size={16} className="animate-spin text-emerald-500" />
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className={cn(
        "p-3",
        isDarkMode ? "bg-gray-800 border-t border-gray-700" : "bg-white border-t border-gray-200"
      )}>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your orders..."
            className={cn(
              "w-full pl-4 pr-10 py-2.5 rounded-xl text-sm focus:outline-none transition-all",
              isDarkMode
                ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600"
                : "bg-gray-100 text-gray-800 placeholder-gray-500 "
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-emerald-500 hover:text-emerald-600 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
