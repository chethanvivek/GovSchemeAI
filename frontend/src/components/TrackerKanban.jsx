import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Edit3, 
  Save, 
  Clock, 
  FileCheck, 
  Send, 
  Award,
  Bookmark
} from 'lucide-react';
import api from '../services/api';

const COLUMNS = [
  { id: 'Saved', title: 'Saved Schemes', icon: Bookmark, color: 'border-slate-300 bg-slate-50/80 text-slate-700' },
  { id: 'Planning to Apply', title: 'Planning to Apply', icon: Clock, color: 'border-blue-300 bg-blue-50/80 text-blue-700' },
  { id: 'Documents Ready', title: 'Documents Ready', icon: FileCheck, color: 'border-amber-300 bg-amber-50/80 text-amber-700' },
  { id: 'Applied', title: 'Applied / In Review', icon: Send, color: 'border-purple-300 bg-purple-50/80 text-purple-700' },
  { id: 'Completed', title: 'Completed / Approved', icon: Award, color: 'border-emerald-300 bg-emerald-50/80 text-emerald-700' }
];

export default function TrackerKanban({ trackedItems = [], onRefresh }) {
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      setUpdatingId(itemId);
      await api.put(`/tracker/${itemId}`, { status: newStatus });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to change status:', err);
      alert('Could not update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (itemId) => {
    try {
      setUpdatingId(itemId);
      const currentItem = trackedItems.find(t => t.id === itemId);
      await api.put(`/tracker/${itemId}`, {
        status: currentItem.status,
        notes: tempNotes
      });
      setEditingNotesId(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update notes:', err);
      alert('Could not save notes');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Remove this scheme from your application tracker?')) return;
    try {
      setUpdatingId(itemId);
      await api.delete(`/tracker/${itemId}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete tracked scheme:', err);
      alert('Could not remove scheme from tracker');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const ColIcon = col.icon;
        const items = trackedItems.filter(item => item.status === col.id);

        return (
          <div 
            key={col.id} 
            className="flex flex-col bg-slate-100/70 rounded-xl border border-slate-200/80 p-3 min-w-[260px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <ColIcon className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-bold text-slate-800 tracking-tight">
                  {col.title}
                </h4>
              </div>
              <span className="text-[11px] font-extrabold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {items.length}
              </span>
            </div>

            {/* Column Card List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[68vh] pr-1">
              {items.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  No schemes in this stage
                </div>
              ) : (
                items.map((item) => {
                  const currentIdx = COLUMNS.findIndex(c => c.id === item.status);
                  const prevStatus = currentIdx > 0 ? COLUMNS[currentIdx - 1].id : null;
                  const nextStatus = currentIdx < COLUMNS.length - 1 ? COLUMNS[currentIdx + 1].id : null;
                  const isEditingNotes = editingNotesId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2 relative"
                    >
                      {/* Category & Actions */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.scheme_category || 'General'}
                        </span>
                        <div className="flex items-center gap-1">
                          {item.official_application_url && (
                            <a
                              href={item.official_application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-emerald-600 p-1 transition-colors"
                              title="Official Application Portal"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Remove from tracker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Scheme Name */}
                      <h5 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                        {item.scheme_name}
                      </h5>

                      {/* Notes Section */}
                      <div className="text-[11px] bg-slate-50 p-2 rounded border border-slate-150">
                        {isEditingNotes ? (
                          <div className="space-y-1.5">
                            <textarea
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              placeholder="Add checklist notes or application reference numbers..."
                              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                              rows={2}
                            />
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-200 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveNotes(item.id)}
                                className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded font-medium flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-slate-600 italic line-clamp-2">
                              {item.notes || 'No custom notes added.'}
                            </p>
                            <button
                              onClick={() => {
                                setEditingNotesId(item.id);
                                setTempNotes(item.notes || '');
                              }}
                              className="text-slate-400 hover:text-slate-700 p-0.5 flex-shrink-0"
                              title="Edit application notes"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Stage Progression Buttons */}
                      <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[10px]">
                        {prevStatus ? (
                          <button
                            onClick={() => handleStatusChange(item.id, prevStatus)}
                            disabled={updatingId === item.id}
                            className="flex items-center gap-0.5 text-slate-500 hover:text-slate-800 font-medium py-1 px-1.5 rounded hover:bg-slate-100"
                            title={`Move back to ${prevStatus}`}
                          >
                            <ChevronLeft className="w-3 h-3" /> Back
                          </button>
                        ) : <span />}

                        {nextStatus ? (
                          <button
                            onClick={() => handleStatusChange(item.id, nextStatus)}
                            disabled={updatingId === item.id}
                            className="flex items-center gap-0.5 text-emerald-700 hover:text-emerald-800 font-semibold py-1 px-2 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                            title={`Advance to ${nextStatus}`}
                          >
                            Next <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Finished
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
