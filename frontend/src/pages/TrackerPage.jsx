import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Search, 
  RefreshCw, 
  Sparkles,
  Info
} from 'lucide-react';
import api from '../services/api';
import TrackerKanban from '../components/TrackerKanban';

export default function TrackerPage() {
  const [trackedItems, setTrackedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTracker = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tracker');
      if (res.data.success && Array.isArray(res.data.data)) {
        setTrackedItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tracked schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracker();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Citizen Application Status Board
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize, track preparation stages, and monitor official submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTracker}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Board
          </button>
          <Link
            to="/schemes"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5" /> Browse More Schemes
          </Link>
        </div>
      </div>

      {/* Advisory hint banner */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Workflow Guide:</strong> Move schemes forward through the 5 stages as you gather required certificates and submit forms on official government portals. You can edit notes to store your application reference numbers or document IDs.
        </p>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading your tracked applications...</p>
        </div>
      ) : (
        <TrackerKanban trackedItems={trackedItems} onRefresh={fetchTracker} />
      )}
    </div>
  );
}
