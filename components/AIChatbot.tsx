import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content: 'Hi! I\'m the IIT Ropar Campus Assistant. Ask me anything about campus facilities, academics, mess menu, events, or navigation!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.chat(userMessage.content);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.reply || 'I\'m sorry, I couldn\'t process that request.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-orange))',
          border: '2px solid var(--color-primary-light)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} color="#0f0d0a" /> : <MessageCircle size={24} color="#0f0d0a" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] flex flex-col rounded-lg overflow-hidden shadow-2xl"
            style={{
              background: 'var(--color-bg)',
              border: '2px solid var(--color-primary)',
              boxShadow: '0 0 30px rgba(245, 166, 35, 0.3)'
            }}
          >
            {/* Header */}
            <div 
              className="p-4 flex items-center gap-3"
              style={{ 
                background: 'linear-gradient(135deg, rgba(245,166,35,0.2), rgba(244,162,97,0.1))',
                borderBottom: '1px solid var(--color-primary)'
              }}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
              >
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-['Orbitron'] text-sm" style={{ color: 'var(--color-primary)' }}>
                  IIT ROPAR
                </h3>
                <p className="text-[10px] text-stone-400 font-mono">Campus Assistant</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-auto p-1 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-primary)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: msg.role === 'assistant' ? 'var(--color-primary)' : 'var(--color-pink)',
                      color: 'var(--color-bg)'
                    }}
                  >
                    {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div
                    className={`max-w-[75%] p-3 rounded-lg text-sm ${
                      msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'
                    }`}
                    style={{
                      background: msg.role === 'assistant' 
                        ? 'rgba(245,166,35,0.1)' 
                        : 'rgba(224,122,95,0.2)',
                      border: `1px solid ${msg.role === 'assistant' ? 'var(--color-primary)' : 'var(--color-pink)'}`,
                      color: 'var(--color-text)'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
                  >
                    <Bot size={16} />
                  </div>
                  <div
                    className="p-3 rounded-lg rounded-tl-none"
                    style={{
                      background: 'rgba(245,166,35,0.1)',
                      border: '1px solid var(--color-primary)'
                    }}
                  >
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary)', animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary)', animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-primary)', animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div 
              className="p-3 flex gap-2"
              style={{ 
                borderTop: '1px solid var(--color-primary)',
                background: 'rgba(0,0,0,0.5)'
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 text-sm font-mono rounded outline-none"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)'
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 rounded flex items-center justify-center transition-opacity disabled:opacity-50"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-bg)'
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
