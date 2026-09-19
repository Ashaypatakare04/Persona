import React from 'react';
import {
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Users,
  Clock,
  ArrowRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { DashboardStats, Conversation, Approval } from '../../types';

interface DashboardOverviewProps {
  stats: DashboardStats;
  recentConversations: Conversation[];
  pendingApprovals: Approval[];
  autonomyLevel: number;
  onUpdateAutonomy: (level: number) => void;
  onNavigate: (tab: string) => void;
  onOpenSimulator: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  recentConversations,
  pendingApprovals,
  autonomyLevel,
  onUpdateAutonomy,
  onNavigate,
  onOpenSimulator,
}) => {
  const levels = [
    { level: 0, name: 'Observe', desc: 'Analyzes & logs. Never acts or replies.' },
    { level: 1, name: 'Suggest', desc: 'Drafts responses. Requires approval for all.' },
    { level: 2, name: 'Assisted', desc: 'Auto-replies routine inquiries; asks for meetings.' },
    { level: 3, name: 'Autonomous', desc: 'Full handling within allowed permissions.' },
    { level: 4, name: 'Restricted', desc: 'Takes messages only. Discloses nothing.' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-indigo-950/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Persona v1.0 Active
              </span>
              <span className="text-xs text-slate-400">Monitoring All Channels</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Personal AI Representative Dashboard
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Currently acting on behalf of <span className="font-semibold text-white">Ashay</span>.
              Screening incoming calls, answering routine inquiries, shielding confidential assets, and escalating high-risk matters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSimulator}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-900/30 flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              Simulate Inbound Event
            </button>
            <button
              onClick={() => onNavigate('approvals')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
            >
              View Approvals ({pendingApprovals.length})
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Calls Today</span>
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.calls_today}</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Messages Today</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.messages_today}</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">AI Handled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.ai_handled_count}</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.pending_approvals}</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Escalations</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400">{stats.escalations_count}</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">High Priority</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.high_priority_count}</p>
        </div>
      </div>

      {/* Autonomy Level Control Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Dynamic Autonomy Level Control
            </h3>
            <p className="text-xs text-slate-400">
              Change how autonomously Persona makes decisions in real time without altering source code.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 font-mono text-purple-300 border border-slate-700">
            Current: Level {autonomyLevel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
          {levels.map((item) => {
            const isSelected = autonomyLevel === item.level;
            return (
              <button
                key={item.level}
                onClick={() => onUpdateAutonomy(item.level)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-purple-900/30 border-purple-500 shadow-md shadow-purple-950/40 text-white'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-mono">LEVEL {item.level}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                </div>
                <h4 className="font-semibold text-sm text-slate-200">{item.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Pending Approvals & Recent Communications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals Widget */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Pending Human Escalations ({pendingApprovals.length})
            </h3>
            <button
              onClick={() => onNavigate('approvals')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-500 text-sm">
              <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-500/60" />
              <span>All communications handled. No pending escalations.</span>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {pendingApprovals.slice(0, 3).map((appr) => (
                <div
                  key={appr.id}
                  className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-amber-500/40 transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300">
                      Action: {appr.action_type}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          appr.risk_level === 'HIGH' || appr.risk_level === 'CRITICAL'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {appr.risk_level} RISK
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{appr.context_summary}</p>
                  <div className="mt-2 text-xs text-slate-300 bg-slate-900 p-2 rounded border border-slate-800 font-mono">
                    {appr.proposed_content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Conversations Feed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Recent Conversations
            </h3>
            <button
              onClick={() => onNavigate('inbox')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
            >
              Open Inbox <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentConversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-500 text-sm">
              <MessageSquare className="w-8 h-8 mb-2 text-slate-600" />
              <span>No conversations logged yet. Simulate an incoming message to start.</span>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {recentConversations.slice(0, 4).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onNavigate('inbox')}
                  className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-purple-500/40 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-200">
                        {conv.contact?.name || conv.title || `Conversation #${conv.id}`}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                        {conv.channel}
                      </span>
                      {conv.human_taken_over && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
                          Taken Over
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {conv.summary || 'No summary available'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        conv.priority === 'HIGH'
                          ? 'bg-rose-950 text-rose-400'
                          : conv.priority === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {conv.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
