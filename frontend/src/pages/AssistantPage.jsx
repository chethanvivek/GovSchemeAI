import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import AIChatWidget from '../components/AIChatWidget';

export default function AssistantPage() {
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    async function loadSchemes() {
      try {
        const res = await api.get('/schemes');
        if (res.data.success && Array.isArray(res.data.data)) {
          setSchemes(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load schemes for assistant:', err);
      }
    }
    loadSchemes();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Scheme & Documentation Advisor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Grounded Gemini 1.5 assistant to answer eligibility queries and explain document checklists.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Verified Database Grounding
        </div>
      </div>

      {/* Chat Widget Container */}
      <AIChatWidget allSchemes={schemes} />
    </div>
  );
}
