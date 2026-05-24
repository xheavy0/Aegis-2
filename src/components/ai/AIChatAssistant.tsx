import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  ShieldCheck, 
  User as UserIcon,
  Sparkles,
  History,
  Trash2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: "Hello Alex! I'm AEGIS, your dedicated GRC Intelligence Assistant. How can I protect and optimize your operations today?",
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Mock Bot Response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: "I'm currently in 'UI-only' mode as per your request, but soon AEGIS will be able to help you analyze risks and automate compliance tasks with deep precision!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-700 text-white rounded-2xl shadow-2xl shadow-blue-500/20 flex items-center justify-center z-50 group hover:ring-4 hover:ring-blue-500/20 transition-all"
        >
          <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/20">
            <img src="/regenerated_image_1777458964528.png" className="w-full h-full object-cover" alt="AEGIS" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--bg)]" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9, x: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              x: 0,
              height: isMinimized ? '64px' : '600px'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={cn(
              "fixed bottom-8 right-8 w-96 bg-white dark:bg-aegis-surface rounded-3xl shadow-2xl border border-slate-200 dark:border-aegis-border flex flex-col z-50 overflow-hidden transition-all duration-300",
              isMinimized ? "h-16" : "h-[600px]"
            )}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/5 dark:to-indigo-600/5 border-b border-slate-200 dark:border-aegis-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/30 border border-white/10 shrink-0">
                  <img 
                    src="/regenerated_image_1777458964528.png" 
                    alt="AEGIS" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">AEGIS Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn(
                      "flex gap-3",
                      msg.type === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                        msg.type === 'bot' ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-aegis-bg text-slate-600 dark:text-slate-400"
                      )}>
                        {msg.type === 'bot' ? <Sparkles className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                      </div>
                      <div className={cn(
                        "max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed",
                        msg.type === 'bot' 
                          ? "bg-blue-50 dark:bg-blue-600/10 text-slate-800 dark:text-slate-200 rounded-tl-none" 
                          : "bg-slate-100 dark:bg-aegis-bg text-slate-800 dark:text-slate-200 rounded-tr-none font-medium"
                      )}>
                        {msg.text}
                        <div className="mt-1 text-[9px] text-slate-400 font-bold uppercase text-right">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 dark:border-aegis-border bg-white dark:bg-aegis-surface">
                  <div className="flex items-center gap-2 relative">
                    <input 
                      type="text"
                      placeholder="Ask anything about your GRC data..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1 bg-slate-50 dark:bg-aegis-bg border-none rounded-2xl py-3 pl-4 pr-12 text-sm text-[var(--ink)] placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="absolute right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                     <button className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors">
                        <History className="w-3 h-3" />
                        <span>Recent Chat History</span>
                     </button>
                     <button 
                        onClick={() => setMessages([messages[0]])}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="Clear Chat"
                     >
                        <Trash2 className="w-3.5 h-3.5" />
                     </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
