import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Scale, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-govnavy-950 text-slate-400 border-t border-slate-800 text-sm mt-auto">
      {/* Persistent Legal & Advisory Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3">
          <Scale className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong className="text-amber-400 font-semibold">Statutory Advisory:</strong> Scheme information and AI recommendations are for informational assistance only. Final eligibility and approvals are determined by the respective government authorities. Never submit original sensitive credentials or payments to unauthorized platforms.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                GovScheme<span className="text-emerald-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering citizens to discover, evaluate, and track verified welfare, educational, and legal schemes with zero hallucinations and grounded AI assistance.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Google Gemini 1.5 & Supabase
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Application Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/schemes" className="hover:text-emerald-400 transition-colors">
                  Schemes Explorer & Filter
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">
                  AI Recommendation Center
                </Link>
              </li>
              <li>
                <Link to="/tracker" className="hover:text-emerald-400 transition-colors">
                  Citizen Application Tracker
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-emerald-400 transition-colors">
                  Document & Eligibility AI Chat
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-emerald-400 transition-colors">
                  Demographic Profile Manager
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Scheme Domains */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Domains Covered
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['Agriculture', 'Healthcare', 'Education', 'Social Welfare', 'Legal Aid', 'Employment', 'Housing'].map(
                cat => (
                  <span
                    key={cat}
                    className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700/60"
                  >
                    {cat}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Col 4: Official Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Verified Government Sources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.india.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  National Portal of India
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  PM-KISAN Portal
                </a>
              </li>
              <li>
                <a
                  href="https://pmjay.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  Ayushman Bharat PM-JAY
                </a>
              </li>
              <li>
                <a
                  href="https://nalsa.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  National Legal Services Authority
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} AI Government Scheme Recommender. Built for Public Welfare & Citizen Governance.</p>
          <p className="flex items-center gap-3">
            <span>Zero-Trust Architecture</span>
            <span>•</span>
            <span>Strict PII Masking</span>
            <span>•</span>
            <span>RLS Enforced</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
