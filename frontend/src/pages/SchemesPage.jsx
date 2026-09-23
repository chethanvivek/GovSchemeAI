import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  Users, 
  Sparkles,
  RefreshCw,
  FolderOpen,
  Globe,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import SchemeCard from '../components/SchemeCard';
import SchemeDetailModal from '../components/SchemeDetailModal';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'ALL',
  'Scholarship',
  'Education',
  'Agriculture',
  'Healthcare',
  'Business/Startup',
  'Social Welfare'
];

const TARGET_GROUPS = [
  'ALL',
  'Students',
  'Farmers',
  'Low-Income Families',
  'Women',
  'Unemployed',
  'Senior Citizens',
  'Minorities'
];

const STATES = [
  'ALL',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Bihar',
  'Punjab',
  'Odisha'
];

export default function SchemesPage() {
  const { isAuthenticated } = useAuth();

  const [schemes, setSchemes] = useState([]);
  const [trackedIds, setTrackedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Live Discovery state
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryMessage, setDiscoveryMessage] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [targetGroup, setTargetGroup] = useState('ALL');
  const [state, setState] = useState('ALL');
  const [sort, setSort] = useState('name_asc');

  // Modal
  const [selectedScheme, setSelectedScheme] = useState(null);

  const triggerLiveDiscovery = async (queryText) => {
    const q = (queryText || search).trim();
    if (!q) return;

    try {
      setIsDiscovering(true);
      setDiscoveryMessage(`Searching official government databases and live portals for '${q}'...`);

      const res = await api.post('/schemes/discover-live', {
        query: q,
        state,
        category
      });

      if (res.data.success && res.data.data) {
        const newScheme = res.data.data;
        setSchemes(prev => {
          const exists = prev.some(s => s.id === newScheme.id || s.name.toLowerCase() === newScheme.name.toLowerCase());
          return exists ? prev : [newScheme, ...prev];
        });
        setDiscoveryMessage(`✓ Successfully verified & synchronized "${newScheme.name}" to database!`);
      } else {
        setDiscoveryMessage(`No verified government portal record found for "${q}".`);
      }
    } catch (err) {
      console.error('Live discovery failed:', err);
      setDiscoveryMessage(`Live discovery for "${q}" could not be completed.`);
    } finally {
      setIsDiscovering(false);
    }
  };

  const fetchSchemes = async (isManualSearch = false) => {
    try {
      setLoading(true);
      const params = {};
      const trimmed = search.trim();
      if (trimmed) params.search = trimmed;
      if (category !== 'ALL') params.category = category;
      if (targetGroup !== 'ALL') params.target_group = targetGroup;
      if (state !== 'ALL') params.state = state;
      if (sort) params.sort = sort;

      const res = await api.get('/schemes', { params });
      if (res.data.success && Array.isArray(res.data.data)) {
        const found = res.data.data;
        setSchemes(found);

        // Auto-fallback: if local database has 0 matches for a searched query, trigger live discovery!
        if (found.length === 0 && trimmed.length >= 3) {
          triggerLiveDiscovery(trimmed);
        }
      }
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracker = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/tracker');
      if (res.data.success && Array.isArray(res.data.data)) {
        const idSet = new Set(res.data.data.map(item => item.scheme_id));
        setTrackedIds(idSet);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [category, targetGroup, state, sort]);

  useEffect(() => {
    fetchTracker();
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verified Government Schemes Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse authentic welfare, financial assistance, and legal aid programs.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start">
          Showing <span className="font-bold text-slate-900">{schemes.length}</span> verified programs
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by scheme name, benefits, keywords (e.g. Kisan, loan, housing)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            Search
          </button>
        </form>

        {/* Scholarships & Student Welfare Quick Filter Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/80 rounded-xl shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
              🎓
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                Scholarships & Higher Education Grants
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.2 rounded-full font-semibold">Central, State & CSR</span>
              </p>
              <p className="text-[11px] text-indigo-700/90">
                Post-Matric, AP Jagananna Vidya Deevena, Reliance Foundation, Tata Trusts, NMMSS & PM-USP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCategory(category === 'Scholarship' ? 'ALL' : 'Scholarship')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs self-start sm:self-center whitespace-nowrap ${
              category === 'Scholarship'
                ? 'bg-indigo-600 text-white shadow-indigo-200'
                : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100/50'
            }`}
          >
            {category === 'Scholarship' ? '✓ Showing Scholarships' : 'Filter Scholarships'}
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" /> Domain:
          </span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All Domains' : cat}
            </button>
          ))}
        </div>

        {/* Advanced Filters: Target Group, State, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Target Group */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <label className="text-slate-500 font-medium whitespace-nowrap">Target:</label>
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {TARGET_GROUPS.map(tg => (
                <option key={tg} value={tg}>
                  {tg === 'ALL' ? 'All Target Groups' : tg}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <label className="text-slate-500 font-medium whitespace-nowrap">State:</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {STATES.map(st => (
                <option key={st} value={st}>
                  {st === 'ALL' ? 'All States (Pan-India)' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <label className="text-slate-500 font-medium whitespace-nowrap">Sort:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="name_asc">Name (A to Z)</option>
              <option value="name_desc">Name (Z to A)</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Discovery Grounding Banner */}
      {isDiscovering && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-lg border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2 flex-wrap">
                <span>Searching official government databases and live portals for &ldquo;{search}&rdquo;...</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                  Google Search Grounding
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Fetching verified notifications, eligibility thresholds, and official application portals (.gov.in / .nic.in).
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-emerald-300 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30 whitespace-nowrap self-start sm:self-auto">
            ⚡ Grounding Active
          </div>
        </div>
      )}

      {/* Discovery Success / Status Notice */}
      {discoveryMessage && !isDiscovering && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-semibold">{discoveryMessage}</span>
          </div>
          <button
            onClick={() => setDiscoveryMessage(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-950 px-2 py-0.5 rounded transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Schemes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-xl border border-slate-200 p-6 h-64 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : schemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schemes.map(scheme => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onOpenModal={(s) => setSelectedScheme(s)}
              isSaved={trackedIds.has(scheme.id)}
              onTrackerUpdated={fetchTracker}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {search.trim() ? `No local database matches for "${search}"` : 'No schemes matched your criteria'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {search.trim()
              ? `You can trigger Google Search Grounding to automatically discover verified notifications for "${search}" and save them to our database.`
              : 'Try adjusting your search terms, changing the domain filter to "All Domains", or resetting your state selection.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {search.trim() && (
              <button
                onClick={() => triggerLiveDiscovery(search)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors"
              >
                <Globe className="w-4 h-4" />
                Search Live Government Portals for &ldquo;{search}&rdquo;
              </button>
            )}
            <button
              onClick={() => {
                setSearch('');
                setCategory('ALL');
                setTargetGroup('ALL');
                setState('ALL');
                setSort('name_asc');
                setDiscoveryMessage(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
          onTrackerUpdated={fetchTracker}
        />
      )}
    </div>
  );
}
