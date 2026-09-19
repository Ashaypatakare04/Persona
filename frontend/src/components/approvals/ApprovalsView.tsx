import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  UserCheck,
  AlertTriangle,
  Clock,
  Shield,
  Send,
} from 'lucide-react';
import { Approval } from '../../types';
import { api } from '../../services/api';

interface ApprovalsViewProps {
  approvals: Approval[];
  onRefresh: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ approvals, onRefresh }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const filteredApprovals = approvals.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const handleApprove = async (id: number) => {
    try {
      setLoadingId(id);
      await api.resolveApproval(id, 'approve');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleEditAndSend = async (id: number) => {
    try {
      setLoadingId(id);
      await api.resolveApproval(id, 'edit', editText);
      setEditingId(null);
      setEditText('');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setLoadingId(id);
      await api.resolveApproval(id, 'reject');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleTakeover = async (id: number) => {
    try {
      setLoadingId(id);
      await api.resolveApproval(id, 'takeover');
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Human Approval & Escalation Queue</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Decide whether to authorize, edit, reject, or personally take over AI-planned actions.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {['PENDING', 'APPROVED', 'EDITED', 'REJECTED', 'ALL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals Grid */}
      {filteredApprovals.length === 0 ? (
        <div className="p-16 border border-slate-800 bg-slate-900/60 rounded-2xl text-center">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/60 mb-2" />
          <h3 className="text-base font-semibold text-slate-200">No {statusFilter} Approvals</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Persona will queue requests here whenever an action requires Ashay's explicit authorization or when a high-risk request occurs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApprovals.map((appr) => {
            const isEditing = editingId === appr.id;
            const isPending = appr.status === 'PENDING';

            return (
              <div
                key={appr.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isPending
                    ? 'bg-slate-900/90 border-slate-800 shadow-lg'
                    : 'bg-slate-900/50 border-slate-800/60 opacity-80'
                }`}
              >
                {/* Card Top Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Approval #{appr.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                      Action: {appr.action_type}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
                      {appr.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        appr.risk_level === 'HIGH' || appr.risk_level === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {appr.risk_level} RISK
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {appr.priority} PRIORITY
                    </span>
                  </div>
                </div>

                {/* Inbound Context */}
                <div className="mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Context / Inbound Request
                  </span>
                  <p className="text-sm text-slate-200 mt-0.5 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {appr.context_summary}
                  </p>
                </div>

                {/* Proposed AI Response or Action */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
                    Proposed AI Response / Action
                  </span>
                  {isEditing ? (
                    <div className="mt-1">
                      <textarea
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-slate-950 border border-purple-500 rounded-xl p-3 text-sm text-white focus:outline-none"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-xs rounded-lg text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditAndSend(appr.id)}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Save & Dispatch
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-purple-200 mt-1 bg-purple-950/30 border border-purple-900/50 p-3 rounded-xl font-mono leading-relaxed">
                      {appr.edited_content || appr.proposed_content}
                    </div>
                  )}
                </div>

                {/* Action Controls for Pending Approvals */}
                {isPending && !isEditing && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      disabled={loadingId === appr.id}
                      onClick={() => handleApprove(appr.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Send
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(appr.id);
                        setEditText(appr.proposed_content);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-4 h-4 text-purple-400" />
                      Edit Response
                    </button>

                    <button
                      disabled={loadingId === appr.id}
                      onClick={() => handleReject(appr.id)}
                      className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Action
                    </button>

                    <button
                      disabled={loadingId === appr.id}
                      onClick={() => handleTakeover(appr.id)}
                      className="px-4 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800 text-xs font-semibold flex items-center gap-1.5 ml-auto transition"
                    >
                      <UserCheck className="w-4 h-4" />
                      Take Over Conversation
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
