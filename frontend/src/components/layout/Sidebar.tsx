import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  PhoneCall,
  Users,
  Database,
  Sliders,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { PersonaLogo } from './PersonaLogo';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingApprovalsCount: number;
  autonomyLevel: number;
  onOpenSimulator: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  pendingApprovalsCount,
  autonomyLevel,
  onOpenSimulator,
}) => {
  const autonomyLabels: Record<number, { label: string; color: string }> = {
    0: { label: 'L0 • OBSERVE', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
    1: { label: 'L1 • SUGGEST', color: 'bg-amber-950/60 text-amber-300 border-amber-800' },
    2: { label: 'L2 • ASSISTED', color: 'bg-blue-950/60 text-blue-300 border-blue-800' },
    3: { label: 'L3 • AUTONOMOUS', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800' },
    4: { label: 'L4 • RESTRICTED', color: 'bg-rose-950/60 text-rose-300 border-rose-800' },
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inbox', label: 'Unified Inbox', icon: Inbox },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { id: 'calls', label: 'Voice & Calls', icon: PhoneCall },
    { id: 'contacts', label: 'Contacts & Rules', icon: Users },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'settings', label: 'AI Settings', icon: Sliders },
    { id: 'audit', label: 'Audit Log', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <PersonaLogo
          size={42}
          showText={true}
          showBadge={true}
          subtitle="Representative for Ashay"
        />
      </div>

      {/* Autonomy Status Badge */}
      <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Current Autonomy
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${
              autonomyLabels[autonomyLevel]?.color || 'bg-slate-800 text-slate-300'
            }`}
          >
            {autonomyLabels[autonomyLevel]?.label}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Simulation Sandbox Launch Button */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={onOpenSimulator}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulate Incoming</span>
        </button>
      </div>
    </aside>
  );
};
