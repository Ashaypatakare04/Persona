import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { InboxView } from './components/inbox/InboxView';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { CallsView } from './components/calls/CallsView';
import { ContactsView } from './components/contacts/ContactsView';
import { KnowledgeView } from './components/knowledge/KnowledgeView';
import { SettingsView } from './components/settings/SettingsView';
import { AuditView } from './components/audit/AuditView';
import { SimulatorModal } from './components/simulator/SimulatorModal';

import { useWebSocket } from './hooks/useWebSocket';
import { api } from './services/api';
import {
  DashboardStats,
  Conversation,
  Approval,
  Call,
  Contact,
  KnowledgeItem,
  AuditLog,
  AutonomySettings,
  PermissionSettings,
  LLMSettings,
} from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Core Data States
  const [stats, setStats] = useState<DashboardStats>({
    calls_today: 0,
    messages_today: 0,
    pending_approvals: 0,
    escalations_count: 0,
    ai_handled_count: 0,
    high_priority_count: 0,
    contacts_count: 0,
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Settings
  const [autonomy, setAutonomy] = useState<AutonomySettings>({
    global_autonomy_level: 2,
    require_approval_for_scheduling: true,
    require_approval_for_unknown: true,
    level_descriptions: {},
  });
  const [permissions, setPermissions] = useState<PermissionSettings>({
    calendar: 'ALLOW',
    notes: 'DENY',
    tasks: 'ALLOW',
    financial: 'DENY',
  });
  const [llmSettings, setLlmSettings] = useState<LLMSettings>({
    provider: 'mock',
    gemini_api_key_set: false,
    gemini_model: 'gemini-2.0-flash',
    openai_api_key_set: false,
    openai_model: 'gpt-4o-mini',
    openai_base_url: 'https://api.openai.com/v1',
  });

  const [loading, setLoading] = useState(true);

  // Load All System Data
  const refreshAll = useCallback(async () => {
    try {
      const [
        statsData,
        convsData,
        approvalsData,
        callsData,
        contactsData,
        knowledgeData,
        auditData,
        autonomyData,
        permsData,
        llmData,
      ] = await Promise.all([
        api.getStats(),
        api.getConversations(),
        api.getApprovals('ALL'),
        api.getCalls(),
        api.getContacts(),
        api.getKnowledge(),
        api.getAuditLogs(),
        api.getAutonomySettings(),
        api.getPermissions(),
        api.getLLMSettings(),
      ]);

      setStats(statsData);
      setConversations(convsData);
      setApprovals(approvalsData);
      setCalls(callsData);
      setContacts(contactsData);
      setKnowledge(knowledgeData);
      setAuditLogs(auditData);
      setAutonomy(autonomyData);
      setPermissions(permsData);
      setLlmSettings(llmData);

      // Keep selected conversation in sync if open
      if (selectedConversation) {
        const updated = convsData.find((c) => c.id === selectedConversation.id);
        if (updated) setSelectedConversation(updated);
      }
    } catch (e) {
      console.error('Error refreshing data:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    refreshAll();
  }, []);

  // WebSocket Live Events Listener
  const handleWsEvent = useCallback(
    (event: any) => {
      // Whenever an event arrives, refresh dashboard and records
      refreshAll();
    },
    [refreshAll]
  );

  const { isConnected: isWsConnected } = useWebSocket(handleWsEvent);

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;

  const tabTitles: Record<string, string> = {
    overview: 'Overview Dashboard',
    inbox: 'Unified Communication Inbox',
    approvals: 'Approvals & Human Escalation',
    calls: 'Voice Calls & Browser Voice Interface',
    contacts: 'Contact Directory & AI Behavior Policies',
    knowledge: 'Personal Memory & Sensitive Records',
    settings: 'System Autonomy & AI Settings',
    audit: 'Audit & Compliance Log',
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        pendingApprovalsCount={pendingApprovalsCount}
        autonomyLevel={autonomy.global_autonomy_level}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          title={tabTitles[currentTab] || 'Persona AI Representative'}
          isWsConnected={isWsConnected}
          pendingApprovalsCount={pendingApprovalsCount}
          onOpenApprovals={() => setCurrentTab('approvals')}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {currentTab === 'overview' && (
            <DashboardOverview
              stats={stats}
              recentConversations={conversations}
              pendingApprovals={approvals.filter((a) => a.status === 'PENDING')}
              autonomyLevel={autonomy.global_autonomy_level}
              onUpdateAutonomy={async (level) => {
                await api.updateAutonomySettings(level);
                refreshAll();
              }}
              onNavigate={setCurrentTab}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {currentTab === 'inbox' && (
            <InboxView
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
              onRefresh={refreshAll}
            />
          )}

          {currentTab === 'approvals' && (
            <ApprovalsView approvals={approvals} onRefresh={refreshAll} />
          )}

          {currentTab === 'calls' && (
            <CallsView calls={calls} contacts={contacts} onRefresh={refreshAll} />
          )}

          {currentTab === 'contacts' && (
            <ContactsView contacts={contacts} onRefresh={refreshAll} />
          )}

          {currentTab === 'knowledge' && (
            <KnowledgeView items={knowledge} onRefresh={refreshAll} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              autonomy={autonomy}
              permissions={permissions}
              llmSettings={llmSettings}
              onRefresh={refreshAll}
            />
          )}

          {currentTab === 'audit' && <AuditView logs={auditLogs} />}
        </main>
      </div>

      {/* Inbound Simulator Slide-Over / Modal */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        contacts={contacts}
        onSimulationComplete={refreshAll}
      />
    </div>
  );
}

export default App;
