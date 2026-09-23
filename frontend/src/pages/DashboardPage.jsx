import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ClipboardList, 
  Bot, 
  Search, 
  User, 
  RefreshCw,
  Award,
  Clock,
  Send,
  FileCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SchemeCard from '../components/SchemeCard';
import SchemeDetailModal from '../components/SchemeDetailModal';

export default function DashboardPage() {
  const { user, profile, profileCompletion } = useAuth();

  const [recommendations, setRecommendations] = useState([]);
  const [trackedItems, setTrackedItems] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingTracker, setLoadingTracker] = useState(true);
  const [recError, setRecError] = useState('');
  const [recFilter, setRecFilter] = useState('ALL');

  // Fetch recommendations
  const fetchRecommendations = async () => {
    if (profileCompletion < 50) {
      setRecError('Please complete at least your age, state, and occupation on your profile to enable personalized AI matching.');
      return;
    }

    try {
      setLoadingRecs(true);
      setRecError('');
      const res = await api.post('/ai/recommend');
      if (res.data.success && Array.isArray(res.data.data)) {
        setRecommendations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      const msg = err.response?.data?.message || 'Could not generate recommendations at this time.';
      setRecError(msg);
    } finally {
      setLoadingRecs(false);
    }
  };

  // Fetch tracker items
  const fetchTracker = async () => {
    try {
      setLoadingTracker(true);
      const res = await api.get('/tracker');
      if (res.data.success && Array.isArray(res.data.data)) {
        setTrackedItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tracked items:', err);
    } finally {
      setLoadingTracker(false);
    }
  };

  useEffect(() => {
    setRecommendations([]);
    setTrackedItems([]);
    if (user?.id) {
      fetchTracker();
      fetchRecommendations();
    }
  }, [user?.id, profileCompletion]);

  const handleOpenModal = (scheme, rec) => {
    setSelectedScheme(scheme);
    setSelectedRecommendation(rec || recommendations.find(r => r.scheme_id === scheme.id) || null);
  };

  // Tracker stats breakdown
  const stats = {
    saved: trackedItems.filter(i => i.status === 'Saved').length,
    planning: trackedItems.filter(i => i.status === 'Planning to Apply').length,
    documents: trackedItems.filter(i => i.status === 'Documents Ready').length,
    applied: trackedItems.filter(i => i.status === 'Applied').length,
    completed: trackedItems.filter(i => i.status === 'Completed').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Profile Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Citizen Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {profileCompletion === 100
              ? `Welcome back, ${user?.email?.split('@')[0] || 'Citizen'}`
              : `Welcome, ${user?.email?.split('@')[0] || 'Citizen'}`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {profile && profileCompletion === 100
              ? `Profile active: ${profile.occupation || 'Citizen'} in ${profile.state || 'India'}`
              : 'Please complete your demographic onboarding to unlock tailored scheme suggestions.'}
          </p>
        </div>

        {/* Profile Completion Meter */}
        <div className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="space-y-1 flex-1 sm:w-48">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Profile Completion:</span>
              <span className={profileCompletion === 100 ? 'text-emerald-600' : 'text-amber-600'}>
                {profileCompletion}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  profileCompletion === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          <Link
            to="/profile"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-govnavy-900 hover:bg-govnavy-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <User className="w-3.5 h-3.5" />
            {profileCompletion === 100 ? 'Edit Profile' : 'Complete Profile'}
          </Link>
        </div>
      </div>

      {/* Tracker Status Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          to="/tracker"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <span className="text-xs text-slate-500 font-medium">Saved</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{stats.saved}</div>
        </Link>
        <Link
          to="/tracker"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <span className="text-xs text-blue-600 font-medium">Planning</span>
          <div className="text-2xl font-extrabold text-blue-700 mt-2">{stats.planning}</div>
        </Link>
        <Link
          to="/tracker"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <span className="text-xs text-amber-600 font-medium">Docs Ready</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-2">{stats.documents}</div>
        </Link>
        <Link
          to="/tracker"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <span className="text-xs text-purple-600 font-medium">Applied</span>
          <div className="text-2xl font-extrabold text-purple-700 mt-2">{stats.applied}</div>
        </Link>
        <Link
          to="/tracker"
          className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
        >
          <span className="text-xs text-emerald-600 font-medium">Completed</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">{stats.completed}</div>
        </Link>
      </div>

      {/* AI Recommendations Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                AI Personalized Scheme Recommendations
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by Google Gemini according to demographic criteria match scores.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRecommendations}
              disabled={loadingRecs}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRecs ? 'animate-spin' : ''}`} />
              {loadingRecs ? 'Evaluating...' : 'Refresh AI Analysis'}
            </button>
            <Link
              to="/schemes"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-all"
            >
              <Search className="w-3.5 h-3.5" /> All Schemes
            </Link>
          </div>
        </div>

        {/* Persona Indicator Banner */}
        {profile && (profile.occupation === 'Student' || (profile.age && profile.age <= 25) || ['Farmer', 'Agriculture Laborer'].includes(profile.occupation) || ['Self-Employed', 'Self-Employed / Business', 'Unemployed'].includes(profile.occupation)) && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            profile.occupation === 'Student' || (profile.age && profile.age <= 25)
              ? 'bg-indigo-50 border-indigo-200 text-indigo-950' 
              : ['Farmer', 'Agriculture Laborer'].includes(profile.occupation)
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="text-xl flex-shrink-0">
                {profile.occupation === 'Student' || (profile.age && profile.age <= 25) ? '🎓' : ['Farmer', 'Agriculture Laborer'].includes(profile.occupation) ? '🌾' : '💼'}
              </span>
              <div>
                <p className="font-bold">
                  {profile.occupation === 'Student' || (profile.age && profile.age <= 25)
                    ? 'Student Persona Active: Prioritizing Top Scholarships, Fee Reimbursements, and Higher Education Grants' 
                    : ['Farmer', 'Agriculture Laborer'].includes(profile.occupation)
                    ? 'Farmer Persona Active: Prioritizing Crop Support, Agriculture Subsidies, and Land Livelihood Schemes'
                    : 'Enterprise Persona Active: Prioritizing Micro-Loans (MUDRA), Self-Employment Grants & Startup Schemes'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  AI ranking has automatically boosted verified opportunities tailored for your demographic status ({profile.occupation}, {profile.state}).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Filter Tabs for Recommendations */}
        {recommendations.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold mr-1 whitespace-nowrap">Filter:</span>
            {[
              { id: 'ALL', label: `All Recommendations (${recommendations.length})` },
              { id: 'Scholarship', label: `🎓 Scholarships (${recommendations.filter(r => r.category === 'Scholarship').length})` },
              { id: 'Education', label: `📚 Education (${recommendations.filter(r => r.category === 'Education').length})` },
              { id: 'Agriculture', label: `🌾 Agriculture (${recommendations.filter(r => r.category === 'Agriculture').length})` },
              { id: 'Business/Startup', label: `💼 Business/Startup (${recommendations.filter(r => r.category === 'Business/Startup').length})` },
              { id: 'Healthcare', label: `🩺 Healthcare (${recommendations.filter(r => r.category === 'Healthcare').length})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRecFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  recFilter === tab.id
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Warning / Error if profile incomplete */}
        {recError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>{recError}</span>
            </div>
            <Link
              to="/profile"
              className="font-bold text-amber-800 hover:text-amber-950 underline whitespace-nowrap"
            >
              Update Profile Now
            </Link>
          </div>
        )}

        {/* Loading state */}
        {loadingRecs ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-xl border border-slate-200 p-6 h-64 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-16 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          (() => {
            const displayed = recommendations.filter(r => recFilter === 'ALL' || r.category === recFilter);
            if (displayed.length === 0) {
              return (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                  <p className="text-sm font-semibold text-slate-700">No recommendations found in category &ldquo;{recFilter}&rdquo;.</p>
                  <button
                    onClick={() => setRecFilter('ALL')}
                    className="px-4 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100"
                  >
                    View All Recommendations
                  </button>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayed.map(rec => {
                  const pseudoScheme = {
                    id: rec.scheme_id,
                    name: rec.scheme_name,
                    category: rec.category,
                    target_group: rec.target_group,
                    applicable_state: rec.applicable_state,
                    official_application_url: rec.official_application_url,
                    official_source_url: rec.official_source_url,
                    benefits: rec.benefits,
                    required_documents: rec.document_checklist
                  };
                  const isSaved = trackedItems.some(ti => ti.scheme_id === rec.scheme_id);

                  return (
                    <SchemeCard
                      key={rec.scheme_id}
                      scheme={pseudoScheme}
                      recommendation={rec}
                      onOpenModal={handleOpenModal}
                      isSaved={isSaved}
                      onTrackerUpdated={fetchTracker}
                    />
                  );
                })}
              </div>
            );
          })()
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No recommendations generated yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please ensure your profile has your age, occupation, and state filled in, then click &ldquo;Refresh AI Analysis&rdquo;.
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
            >
              Complete Profile
            </Link>
          </div>
        )}
      </div>

      {/* Floating Shortcut to AI Assistant */}
      <div className="bg-gradient-to-r from-govnavy-900 to-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base">Have specific questions on documentation?</h4>
            <p className="text-xs text-slate-300">
              Ask our dedicated Gemini AI Government Scheme Advisor for document checklists and rule breakdowns.
            </p>
          </div>
        </div>
        <Link
          to="/assistant"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-xs transition-colors whitespace-nowrap"
        >
          Open AI Assistant <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          initialRecommendation={selectedRecommendation}
          onClose={() => setSelectedScheme(null)}
          onTrackerUpdated={fetchTracker}
        />
      )}
    </div>
  );
}
