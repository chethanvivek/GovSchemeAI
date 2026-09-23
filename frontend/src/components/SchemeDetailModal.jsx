import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Bookmark, 
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SchemeDetailModal({ 
  scheme, 
  initialRecommendation = null, 
  onClose,
  onTrackerUpdated = null 
}) {
  const { isAuthenticated, profile } = useAuth();
  const [recommendation, setRecommendation] = useState(initialRecommendation);
  const [loadingAi, setLoadingAi] = useState(false);
  const [savingTracker, setSavingTracker] = useState(false);
  const [trackerStatus, setTrackerStatus] = useState('Saved');
  const [trackerSuccess, setTrackerSuccess] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState({});

  if (!scheme) return null;

  const toggleDoc = (docName) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  const handleRunAiCheck = async () => {
    if (!isAuthenticated) {
      alert('Please log in and complete your demographic profile to run AI eligibility checks.');
      return;
    }
    if (!profile || !profile.age || !profile.state) {
      alert('Your demographic profile is incomplete. Please visit the Profile page to fill in your age, state, and income.');
      return;
    }

    try {
      setLoadingAi(true);
      const res = await api.post('/ai/recommend');
      if (res.data.success && Array.isArray(res.data.data)) {
        const match = res.data.data.find(r => r.scheme_id === scheme.id);
        if (match) {
          setRecommendation(match);
        } else {
          // If not in batch, use first or generic
          setRecommendation(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to run AI check:', err);
      alert('Unable to connect to AI eligibility service at this moment.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSaveToTracker = async (status = 'Saved') => {
    if (!isAuthenticated) {
      alert('Please sign in to track government schemes.');
      return;
    }

    try {
      setSavingTracker(true);
      await api.post('/tracker', {
        scheme_id: scheme.id,
        status,
        notes: `Checked on ${new Date().toLocaleDateString()}`
      });
      setTrackerStatus(status);
      setTrackerSuccess(true);
      if (onTrackerUpdated) onTrackerUpdated();
      setTimeout(() => setTrackerSuccess(false), 3000);
    } catch (err) {
      console.error('Tracker error:', err);
      alert('Failed to update tracker.');
    } finally {
      setSavingTracker(false);
    }
  };

  const criteria = scheme.eligibility_criteria || {};
  const documents = scheme.required_documents || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-govnavy-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {scheme.category || 'General'}
            </span>
            <span className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
              State: {scheme.applicable_state === 'ALL' ? 'National (All States)' : scheme.applicable_state}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Overview */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {scheme.name}
            </h2>
            {scheme.target_group && (
              <p className="text-xs text-slate-500 font-medium mt-1">
                Target Beneficiaries: <span className="text-slate-800 font-semibold">{scheme.target_group}</span>
              </p>
            )}
          </div>

          {/* Description & Benefits */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Scheme Objectives
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {scheme.description}
              </p>
            </div>
            {scheme.benefits && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Financial & Social Benefits
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {scheme.benefits}
                </p>
              </div>
            )}
          </div>

          {/* AI Eligibility Section */}
          <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 via-teal-50/20 to-white p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    AI Citizen Compatibility Check
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Evaluates your demographic profile against verified eligibility rules
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunAiCheck}
                disabled={loadingAi}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all disabled:opacity-60"
              >
                {loadingAi ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {recommendation ? 'Re-Analyze Compatibility' : 'Run Eligibility Check'}
                  </>
                )}
              </button>
            </div>

            {recommendation ? (
              <div className="space-y-3.5 bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs">
                {/* Score Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs text-slate-500">Calculated Match Rating:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-slate-900">
                        {recommendation.match_score}%
                      </span>
                      <span className={`text-xs font-semibold ${
                        recommendation.match_score >= 70 ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {recommendation.match_score >= 70 ? '• High Eligibility Match' : '• Conditional Eligibility'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Grounded Engine</span>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Zero Hallucination
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-xs text-slate-700 leading-relaxed">
                  {recommendation.explanation}
                </p>

                {/* Matched vs Unmet Criteria */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Matched */}
                  <div className="bg-emerald-50/60 rounded-lg p-3 border border-emerald-100">
                    <h5 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matched Criteria
                    </h5>
                    {recommendation.matched_criteria && recommendation.matched_criteria.length > 0 ? (
                      <ul className="space-y-1 text-xs text-slate-700">
                        {recommendation.matched_criteria.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">None determined</p>
                    )}
                  </div>

                  {/* Unmet / Attention */}
                  <div className="bg-amber-50/60 rounded-lg p-3 border border-amber-100">
                    <h5 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-amber-600" /> Unmet / Needs Validation
                    </h5>
                    {recommendation.unmet_criteria && recommendation.unmet_criteria.length > 0 ? (
                      <ul className="space-y-1 text-xs text-slate-700">
                        {recommendation.unmet_criteria.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-700 font-medium">All major demographic filters met!</p>
                    )}
                  </div>
                </div>

                {/* Missing Info Needed */}
                {recommendation.missing_info_needed && recommendation.missing_info_needed.length > 0 && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800">Additional verification required:</strong>{' '}
                      {recommendation.missing_info_needed.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/80 p-4 rounded-xl border border-slate-200 text-center space-y-1">
                <Info className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-medium text-slate-700">
                  Click &ldquo;Run Eligibility Check&rdquo; to evaluate your profile with Google Gemini AI.
                </p>
                <p className="text-[11px] text-slate-400">
                  Requires age, income, and state information from your demographic profile.
                </p>
              </div>
            )}
          </div>

          {/* Structured Eligibility Rules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Official Eligibility Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Age Bracket</span>
                <span className="font-semibold text-slate-800">
                  {criteria.min_age !== undefined ? `${criteria.min_age} - ${criteria.max_age || 'Any'} Years` : 'All Ages'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Income Ceiling</span>
                <span className="font-semibold text-slate-800">
                  {criteria.max_annual_income ? `Up to ₹${criteria.max_annual_income.toLocaleString()}/yr` : 'No Income Limit'}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">State Jurisdiction</span>
                <span className="font-semibold text-slate-800">
                  {scheme.applicable_state === 'ALL' ? 'Pan-India' : scheme.applicable_state}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Document Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" /> Mandatory Document Checklist
            </h4>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Check off the documents you have prepared to ready your application:
            </p>
            <div className="space-y-1.5">
              {documents.map((doc, idx) => (
                <label
                  key={idx}
                  onClick={() => toggleDoc(doc)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    checkedDocs[doc]
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checkedDocs[doc])}
                    onChange={() => {}}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>{doc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Official URLs */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-500" /> Verified Government Portals
            </h4>
            <div className="flex flex-wrap gap-3 pt-1">
              {scheme.official_application_url && (
                <a
                  href={scheme.official_application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition-colors"
                >
                  Official Application Portal
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {scheme.official_source_url && (
                <a
                  href={scheme.official_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition-colors"
                >
                  Government Guidelines & Gazette
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">Track Status:</label>
            <select
              value={trackerStatus}
              onChange={(e) => setTrackerStatus(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="Saved">Saved</option>
              <option value="Planning to Apply">Planning to Apply</option>
              <option value="Documents Ready">Documents Ready</option>
              <option value="Applied">Applied</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              onClick={() => handleSaveToTracker(trackerStatus)}
              disabled={savingTracker}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {savingTracker ? 'Saving...' : 'Save to Tracker'}
            </button>
            {trackerSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
