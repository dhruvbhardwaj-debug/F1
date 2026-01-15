/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Terminal, Loader2, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const CarDesignChatbot = () => {
  const [sessionId] = useState(() => `F1-SESSION-${Math.random().toString(36).substring(7).toUpperCase()}`);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "SYSTEM ONLINE. Engineering Core ready for chassis analysis." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: currentInput }]);
    setIsLoading(true);

    try {
      const response = await fetch( `${process.env.NEXT_PUBLIC_CHATBOT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: currentInput,
          model: "google/gemini-2.0-flash-exp:free"
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "UPLINK ERROR");

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `ERROR: ${error.message || "Connection to R&D core timed out."}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden font-mono">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-red-500" />
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">AI Terminal</span>
        </div>
        <button 
          onClick={() => setMessages([{ role: 'assistant', content: "Buffer cleared." }])}
          className="text-zinc-600 hover:text-white transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Messages Window */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-md text-[11px] leading-relaxed border ${
              m.role === 'user' 
                ? 'bg-red-600/10 border-red-500/30 text-red-100' 
                : 'bg-black/50 border-white/10 text-slate-300'
            }`}>
              <div className="text-[8px] font-black opacity-30 uppercase mb-1">
                {m.role === 'user' ? '// USER_INPUT' : '// R&D_ANALYSIS'}
              </div>
              {/* This is where we safely render the content */}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-red-500/50 text-[10px] italic">
            <Loader2 size={12} className="animate-spin" /> RUNNING CFD SIMULATIONS...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 bg-black/80 border-t border-white/10">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ENTER QUERY..."
            className="w-full bg-zinc-800/50 border border-white/10 rounded-md py-2.5 pl-3 pr-10 text-[10px] text-white focus:outline-none focus:border-red-600/50 uppercase placeholder:text-zinc-700"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-400 disabled:opacity-20"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};