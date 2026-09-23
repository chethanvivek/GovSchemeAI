import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  ClipboardList, 
  ArrowRight, 
  Bot, 
  Lock, 
  Scale, 
  Users, 
  FileCheck2,
  Building2
} from 'lucide-react';
import api from '../services/api';
import SchemeCard from '../components/SchemeCard';
import SchemeDetailModal from '../components/SchemeDetailModal';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchemes() {
      try {
        const res = await api.get('/schemes');
        if (res.data.success && Array.isArray(res.data.data)) {
          setFeaturedSchemes(res.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured schemes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-govnavy-950 via-govnavy-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Verified Government Welfare & Legal Discovery
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none">
              Discover Every Government Scheme You Qualify For.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              An intelligent, privacy-first platform matching citizens with verified Central and State welfare, educational, and legal assistance programs using grounded Google Gemini AI.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-700/25 hover:shadow-emerald-600/35 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                {isAuthenticated ? "Go to My Dashboard" : "Check My Eligibility Free"}
              </Link>
              <Link
                to="/schemes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                Explore Schemes Directory
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-800/80 max-w-2xl mx-auto">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">100%</div>
                <div className="text-xs text-slate-400">Grounded in Database</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">Zero</div>
                <div className="text-xs text-slate-400">AI Hallucinations</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">7+</div>
                <div className="text-xs text-slate-400">Welfare Domains</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-teal-400">Zero-Trust</div>
                <div className="text-xs text-slate-400">Data Isolation & RLS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Citizen Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            Simplified Process
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How GovScheme AI Works for You
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-extrabold text-lg">
                01
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Enter Demographic Profile
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Provide your basic socio-economic details: age, state of residence, occupation, and household income. No names or Aadhaar numbers are required for evaluation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Strict PII Masking Applied
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-lg">
                02
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                AI Eligibility Match & Checklist
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Google Gemini evaluates your profile against structured database rules, generating clear match scores, unmet criteria warnings, and document preparation lists.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-teal-700 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Structured JSON Schema Validated
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-lg">
                03
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Track Application to Completion
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Add qualifying schemes to your personal Tracker board. Progress from Saved, Documents Ready, to Applied via direct links to official government portals.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
              <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
              Interactive Kanban Tracking
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schemes Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              Verified Government Programs
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Citizen Welfare Schemes
            </h3>
          </div>
          <Link
            to="/schemes"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            Browse all schemes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-slate-200 p-6 h-64 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-16 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                onOpenModal={(s) => setSelectedScheme(s)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Core Architectural Guarantees */}
      <section className="bg-slate-100/80 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Built on Zero-Trust & Civic Integrity
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Engineered to strictly prevent misinformation and guarantee user data privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Grounded Knowledge Only</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The AI is constrained to verified database records. It will never invent eligibility rules, quotas, or non-existent government grants.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Row Level Security (RLS)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your application progress and demographic profile are strictly isolated. No user can view or alter another citizen&apos;s data.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/90 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Prompt Injection Shield</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                All citizen chat inputs are contained in XML tags with adversarial system rules preventing role alteration or jailbreaking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-govnavy-900 via-slate-900 to-govnavy-950 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Discover Your Eligible Benefits?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create an account in 30 seconds, save your demographic profile, and let our AI match you to authentic welfare schemes with official application links.
            </p>
            <div className="pt-2">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-all"
              >
                <Sparkles className="w-5 h-5" />
                {isAuthenticated ? "Open My Dashboard" : "Get Started Now"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
}
