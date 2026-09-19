import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Bot,
} from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditViewProps {
  logs: AuditLog[];
}

export const AuditView: React.FC<AuditViewProps> = ({ logs }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = logs.filter((log) => {
    if (catFilter !== 'all' && log.category !== catFilter) return false;
    if (
      searchTerm &&
      !log.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(log.contact_name && log.contact_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Chronological Audit Log</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tamper-evident audit trail of every AI classification, policy evaluation, risk check, and human takeover.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search audit descriptions or contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500 w-72"
        />

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {['all', 'DECISION', 'SECURITY', 'HUMAN_OVERRIDE'].map((cat) => (
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
      </div>

      {/* Logs Table / List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No audit records matching criteria.
          </div>
        ) : (
          filtered.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div key={log.id} className="p-4 hover:bg-slate-800/30 transition">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-500">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {log.event_type}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-mono">
                          {log.category}
                        </span>
                        {log.contact_name && (
                          <span className="text-xs text-slate-400">
                            • {log.contact_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{log.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Expanded Details JSON */}
                {isExpanded && log.details && (
                  <div className="mt-3 ml-7 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
