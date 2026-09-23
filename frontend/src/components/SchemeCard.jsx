import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ExternalLink, 
  Bookmark, 
  Sparkles, 
  FileText, 
  ArrowRight,
  MapPin,
  Users,
  Globe
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SchemeCard({ 
  scheme, 
  recommendation = null, 
  onOpenModal = null,
  isSaved = false,
  onTrackerUpdated = null 
}) {
  const { isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState(isSaved ? 'Saved' : null);

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'scholarship':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'education':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'agriculture':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'healthcare':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'business/startup':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'social welfare':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'housing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'legal aid':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'employment':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleSaveToTracker = async (status = 'Saved') => {
    if (!isAuthenticated) {
      alert('Please log in to save schemes to your application tracker.');
      return;
    }
    try {
      setSaving(true);
      await api.post('/tracker', {
        scheme_id: scheme.id,
        status,
        notes: 'Saved from schemes explorer'
      });
      setSavedStatus(status);
      if (onTrackerUpdated) onTrackerUpdated();
    } catch (err) {
      console.error('Failed to save to tracker:', err);
      alert('Failed to save scheme to tracker. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const score = recommendation?.match_score;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 hover:border-emerald-500/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryColor(scheme.category)}`}>
              {scheme.category || 'General'}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
              <MapPin className="w-3 h-3 text-slate-400" />
              {scheme.applicable_state === 'ALL' ? 'All India' : scheme.applicable_state}
            </span>
            {scheme.target_group && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/60">
                <Users className="w-3 h-3 text-slate-400" />
                {scheme.target_group}
              </span>
            )}
            {scheme.is_live_discovered && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-300 shadow-2xs" title="Discovered in real-time from official government portals via Google Search Grounding">
                <Globe className="w-3 h-3 text-teal-600 animate-pulse" />
                Live Verified
              </span>
            )}
          </div>

          {/* AI Match Score Badge */}
          {score !== undefined && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              score >= 70 
                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30' 
                : score >= 50 
                ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30' 
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{score}% Match</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2">
          {scheme.name}
        </h3>

        {/* Description / Benefits */}
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
          {scheme.benefits || scheme.description}
        </p>

        {/* AI Explanation Snippet (if available) */}
        {recommendation?.explanation && (
          <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-lg p-2.5 mb-3 text-xs text-emerald-900">
            <p className="font-semibold flex items-center gap-1 text-emerald-800 text-[11px] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> AI Compatibility Insight
            </p>
            <p className="line-clamp-2 text-slate-700 leading-snug">
              {recommendation.explanation}
            </p>
          </div>
        )}

        {/* Quick Documents Preview */}
        {scheme.required_documents && Array.isArray(scheme.required_documents) && (
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              Docs: {scheme.required_documents.slice(0, 2).join(', ')}
              {scheme.required_documents.length > 2 && ` +${scheme.required_documents.length - 2} more`}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2">
        {onOpenModal ? (
          <button
            onClick={() => onOpenModal(scheme, recommendation)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 group-hover:translate-x-0.5 transition-all"
          >
            Check Details & AI
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            to={`/schemes/${scheme.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 group-hover:translate-x-0.5 transition-all"
          >
            Details & Eligibility
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}

        <div className="flex items-center gap-2">
          {scheme.official_application_url && (
            <a
              href={scheme.official_application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              title="Official Portal"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={() => handleSaveToTracker('Saved')}
            disabled={saving || Boolean(savedStatus)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              savedStatus
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs'
            }`}
            title="Save to Citizen Tracker"
          >
            {savedStatus ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Tracked
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                Track
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
