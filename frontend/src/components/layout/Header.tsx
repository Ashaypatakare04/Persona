import React from 'react';
import { Bell, Wifi, WifiOff, ShieldCheck, Activity } from 'lucide-react';

interface HeaderProps {
  title: string;
  isWsConnected: boolean;
  pendingApprovalsCount: number;
  onOpenApprovals: () => void;
  onOpenSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  isWsConnected,
  pendingApprovalsCount,
  onOpenApprovals,
  onOpenSimulator,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between z-10">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Realtime WebSocket Status */}
        <div
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-950/40"
          title={isWsConnected ? 'Connected to live event stream' : 'Reconnecting to live stream...'}
        >
          {isWsConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-400">Offline</span>
            </>
          )}
        </div>

        {/* System Rules Enforcement Badge */}
        <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-950/40 border border-purple-800/60 text-purple-300">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Security Bounds Active</span>
        </div>

        {/* Notifications / Approvals Bell */}
        <button
          onClick={onOpenApprovals}
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Pending Approvals"
        >
          <Bell className="w-5 h-5" />
          {pendingApprovalsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        {/* User Identity Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-200">Ashay</p>
            <p className="text-[10px] text-slate-400">Principal User</p>
          </div>
        </div>
      </div>
    </header>
  );
};
