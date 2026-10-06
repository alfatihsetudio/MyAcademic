'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  MessageSquare,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { sendArsipNoteChat } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NoteChatAssistantProps {
  noteId: number;
  noteTitle: string;
}

export default function NoteChatAssistant({
  noteId,
  noteTitle,
}: NoteChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Halo! Saya asisten tutor belajar pribadi Anda untuk materi "${noteTitle}". Tanyakan apa saja mengenai konsep, rumus, atau detail dari catatan ini.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await sendArsipNoteChat(noteId, text, messages);
      if (res.success && res.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
        if (res.ai_warning) {
          toast(res.ai_warning, { icon: 'ℹ️' });
        }
      } else {
        toast.error('Gagal mendapatkan balasan dari AI.');
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan koneksi AI.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Maaf, terjadi gangguan saat menghubungi asisten AI. Silakan coba sesaat lagi.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    'Jelaskan konsep inti secara sederhana',
    'Apa rumus atau hukum penting di sini?',
    'Berikan analogi kehidupan sehari-hari',
    'Tips mudah menghafal materi ini',
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Tanya Catatan AI (Contextual Grounded Tutor)
            </h4>
            <p className="text-[11px] text-slate-500">
              Jawaban terisolasi dan bersumber langsung dari materi catatan ini.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          Gemini Tutor
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/60'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-100/90 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2 border border-slate-200/60">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Asisten sedang menganalisis materi & mengetik jawaban...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions Chips */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(s)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan hal yang belum kamu pahami dari catatan ini..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs sm:text-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:opacity-95 transition-opacity disabled:opacity-40 cursor-pointer shadow-sm shadow-blue-500/20 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
