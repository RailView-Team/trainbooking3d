import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Train, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '../service/api';
import { useNavigate } from 'react-router-dom';

const QUICK_PROMPTS = [
  "Find trains from Howrah to New Delhi",
  "Check Vande Bharat features",
  "How to cancel my train ticket?",
  "Difference between 2A and 3A"
];

function formatMessageText(text) {
  if (!text) return null;

  // Split by bold patterns (**bold**)
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const formattedLine = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={partIdx} className="font-extrabold text-stone-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    return (
      <div key={lineIdx} className={line.trim() === '' ? 'h-2' : 'min-h-[1.25rem]'}>
        {formattedLine}
      </div>
    );
  });
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Namaste! I am **RailBot**, your RailView Travel Assistant 🚆.\n\nAsk me about train schedules, PNR status, 3D coach views, or railway booking guidelines!'
    }
  ]);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage({ message: query });
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: response.reply,
          actions: response.actions
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "I'm having a brief connection issue with the railway servers. Please try asking again in a moment!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (url) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      navigate(url);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white rounded-full p-4 shadow-[0_8px_25px_rgba(225,29,72,0.35)] flex items-center justify-center relative group border border-rose-500/30"
          aria-label="Open RailBot AI Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[590px] bg-white rounded-3xl border border-stone-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-5 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">RailBot</h3>
                    <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                      AI Railway Guide
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    Connected to IRCTC Database
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts Carousel */}
            <div className="bg-stone-50 border-b border-stone-100 p-2.5 overflow-x-auto flex gap-2 no-scrollbar">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap text-[11px] font-semibold bg-white border border-stone-200 hover:border-rose-300 hover:text-rose-700 text-stone-600 px-3 py-1.5 rounded-full shadow-sm transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-[#faf9f6]">
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[88%] rounded-2xl p-4 text-xs font-medium shadow-sm leading-relaxed ${
                        isUser
                          ? 'bg-rose-700 text-white rounded-br-none'
                          : 'bg-white text-stone-800 border border-stone-200/70 rounded-bl-none'
                      }`}
                    >
                      {isUser ? msg.text : formatMessageText(msg.text)}
                    </div>

                    {/* Action buttons if bot returned them */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.actions.map((act, actIdx) => (
                          <button
                            key={actIdx}
                            onClick={() => handleActionClick(act.url)}
                            className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all"
                          >
                            {act.label} <ArrowRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 bg-white border border-stone-200 text-stone-500 rounded-2xl rounded-bl-none px-4 py-3 text-xs w-fit shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-700" />
                  <span>RailBot is checking railway data...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-stone-200/80 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about trains, PNR, 3D seats, rules..."
                className="flex-1 bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 outline-none focus:bg-white focus:border-rose-500 transition-all placeholder:text-stone-400 font-medium"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-rose-700 hover:bg-rose-800 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl p-2.5 transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
