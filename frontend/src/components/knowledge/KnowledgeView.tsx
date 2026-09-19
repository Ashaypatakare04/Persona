import React, { useState } from 'react';
import {
  Database,
  Calendar,
  Clock,
  FileText,
  CheckSquare,
  Plus,
  Trash2,
  Lock,
  Globe,
  ShieldAlert,
  X,
} from 'lucide-react';
import { KnowledgeItem } from '../../types';
import { api } from '../../services/api';

interface KnowledgeViewProps {
  items: KnowledgeItem[];
  onRefresh: () => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({ items, onRefresh }) => {
  const [catFilter, setCatFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<KnowledgeItem>>({
    category: 'calendar',
    title: '',
    content: '',
    sensitivity: 'AUTHORIZED_CONTACTS',
  });

  const filtered = items.filter((i) => {
    if (catFilter !== 'all' && i.category !== catFilter) return false;
    return true;
  });

  const handleDelete = async (id: number) => {
    try {
      await api.deleteKnowledgeItem(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title?.trim() || !newItem.content?.trim()) return;
    try {
      await api.createKnowledgeItem(newItem);
      setIsAdding(false);
      setNewItem({ category: 'calendar', title: '', content: '', sensitivity: 'AUTHORIZED_CONTACTS' });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const catIcons: Record<string, any> = {
    calendar: Calendar,
    availability: Clock,
    note: FileText,
    task: CheckSquare,
    personal_fact: Database,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Personal Knowledge & Memory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage facts, calendar slots, availability, and confidential records accessible to Persona.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Item</span>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs overflow-x-auto">
        {['all', 'calendar', 'availability', 'note', 'task', 'personal_fact'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
              catFilter === cat
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Knowledge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const Icon = catIcons[item.category] || Database;
          const isPrivate = item.sensitivity === 'STRICT_PRIVATE';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isPrivate
                  ? 'bg-rose-950/20 border-rose-900/40'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isPrivate ? 'text-rose-400' : 'text-purple-400'}`} />
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      item.sensitivity === 'STRICT_PRIVATE'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : item.sensitivity === 'PUBLIC'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.sensitivity === 'STRICT_PRIVATE' && <Lock className="w-2.5 h-2.5" />}
                    {item.sensitivity === 'PUBLIC' && <Globe className="w-2.5 h-2.5" />}
                    {item.sensitivity.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                  {item.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                  title="Delete knowledge item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Knowledge Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add Knowledge Item</h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white capitalize"
                >
                  <option value="calendar">Calendar Event</option>
                  <option value="availability">Availability Schedule</option>
                  <option value="note">Personal Note</option>
                  <option value="task">Task / To-Do</option>
                  <option value="personal_fact">Personal Fact</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Lab Presentation"
                  value={newItem.title || ''}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Content / Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Monday 10:00 AM - 11:30 AM at Seminar Hall 2"
                  value={newItem.content || ''}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sensitivity Policy</label>
                <select
                  value={newItem.sensitivity}
                  onChange={(e) => setNewItem({ ...newItem, sensitivity: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="AUTHORIZED_CONTACTS">Authorized Contacts (Calendar / Tasks)</option>
                  <option value="PUBLIC">Public (General Schedule)</option>
                  <option value="STRICT_PRIVATE">Strict Private (Denied to AI)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
