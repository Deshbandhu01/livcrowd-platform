import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Search, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getLocationInsights } from '../services/gemini';
import { useCrowdData } from '../hooks/useCrowdData';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'bot';
  content: string;
  grounding?: any[];
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Hello! I am your Livcrwd assistant. Ask me anything about crowd density or location insights!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { locations } = useCrowdData();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    // Find if user is asking about a specific location we have
    const mentionedLocation = locations.find(loc => 
      userMsg.toLowerCase().includes(loc.name.toLowerCase())
    );

    const result = await getLocationInsights(userMsg, mentionedLocation);

    setMessages(prev => [...prev, { 
      role: 'bot', 
      content: result.text || "I'm sorry, I couldn't process that.",
      grounding: result.groundingChunks
    }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-white border border-[#141414]/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#141414] p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black tracking-tight uppercase text-sm">Livcrwd Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#141414]/[0.02]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-[#141414] text-white' : 'bg-white border border-[#141414]/10 text-[#141414]'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className="space-y-2">
                      <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-[#141414] text-white rounded-tr-none' 
                          : 'bg-white border border-[#141414]/10 text-[#141414] rounded-tl-none shadow-sm'
                      }`}>
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                      
                      {msg.grounding && msg.grounding.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {msg.grounding.map((chunk, idx) => (
                            <React.Fragment key={idx}>
                              {chunk.web && (
                                <a 
                                  href={chunk.web.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-[#141414]/5 rounded-md text-[10px] font-bold text-[#141414]/40 hover:text-[#141414] hover:border-[#141414]/20 transition-all"
                                >
                                  <Search size={10} />
                                  {chunk.web.title || 'Source'}
                                </a>
                              )}
                              {chunk.maps && (
                                <a 
                                  href={chunk.maps.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-[10px] font-bold text-blue-600 hover:bg-blue-100 transition-all"
                                >
                                  <MapPin size={10} />
                                  {chunk.maps.title || 'Maps'}
                                </a>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#141414]/10 text-[#141414] flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div className="p-4 bg-white border border-[#141414]/10 rounded-2xl rounded-tl-none shadow-sm">
                      <Loader2 size={16} className="animate-spin text-[#141414]/20" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-[#141414]/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about a location..."
                  className="w-full pl-6 pr-14 py-4 bg-[#141414]/5 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#141414]/10 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#141414] text-white rounded-xl hover:bg-[#141414]/90 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-rose-500 text-white' : 'bg-[#141414] text-white'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};
