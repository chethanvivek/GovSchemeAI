import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  CornerDownLeft,
  ChevronDown
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STARTER_PROMPTS = [
  'Top scholarships for undergraduate students in Andhra Pradesh',
  'How do I apply for Post-Matric / Fee Reimbursement schemes?',
  'What documents are needed to apply for PM-KISAN as a farmer?',
  'Am I eligible for Reliance Foundation Undergraduate Scholarship?',
  'Am I eligible for Ayushman Bharat PM-JAY with ₹3.5 Lakh annual income?',
  'How can a youth get micro-enterprise loans under PM MUDRA?'
];

export default function AIChatWidget({ selectedSchemeId = null, allSchemes = [] }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your AI Government Scheme Advisor. Ask me anything regarding verified Indian welfare schemes, income thresholds, or required application documents.\n\n*Note: All guidance is informational and grounded in official database rules.*`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [schemeId, setSchemeId] = useState(selectedSchemeId || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedSchemeId) {
      setSchemeId(selectedSchemeId);
    }
  }, [selectedSchemeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: query,
        scheme_id: schemeId || undefined
      });

      if (res.data.success && res.data.data?.reply) {
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.data.data.reply
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const serverErrMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **Gemini API Error (HTTP ${err.response?.status || 500})**: ${serverErrMsg || 'Failed to process AI chat request'}`
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 bg-govnavy-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AI Scheme Advisor</h3>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                Gemini 1.5 Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded in verified government records & eligibility rules
            </p>
          </div>
        </div>

        {/* Scheme Context Selector */}
        {allSchemes.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-300 hidden sm:inline">Focus:</span>
            <select
              value={schemeId}
              onChange={(e) => setSchemeId(e.target.value)}
              className="text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none max-w-[200px] truncate"
            >
              <option value="">All Government Schemes</option>
              {allSchemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Advisory Notice Header */}
      <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
        <span>
          <strong>Disclaimer:</strong> Responses are informational only. Final eligibility is determined by official authorities.
        </span>
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                  isUser
                    ? 'bg-govnavy-900 text-white'
                    : 'bg-emerald-600 text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                  isUser
                    ? 'bg-govnavy-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
              <div className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
              <span>Consulting verified government guidelines...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 flex items-center gap-1 whitespace-nowrap font-medium">
          <Sparkles className="w-3 h-3 text-emerald-600" /> Suggestions:
        </span>
        {STARTER_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-full border border-slate-200 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about scheme qualifications, income limits, or required documents..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white resize-none"
          rows={1}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
