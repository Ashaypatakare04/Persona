import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Cpu,
  User,
  Key,
  Check,
  Save,
  Lock,
} from 'lucide-react';
import {
  AutonomySettings,
  PermissionSettings,
  LLMSettings,
  User as UserType,
} from '../../types';
import { api } from '../../services/api';

interface SettingsViewProps {
  autonomy: AutonomySettings;
  permissions: PermissionSettings;
  llmSettings: LLMSettings;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  autonomy,
  permissions,
  llmSettings,
  onRefresh,
}) => {
  const [selectedLevel, setSelectedLevel] = useState(autonomy.global_autonomy_level);
  const [permForm, setPermForm] = useState(permissions);
  const [llmForm, setLlmForm] = useState(llmSettings);
  const [savedMsg, setSavedMsg] = useState('');

  const levels = [
    {
      level: 0,
      title: 'Level 0 — Observe',
      desc: 'AI analyzes and classifies incoming events but cannot send messages or trigger actions.',
      tag: 'Monitoring Only',
    },
    {
      level: 1,
      title: 'Level 1 — Suggest',
      desc: 'AI formulates proposed responses and actions. Requires Ashay’s explicit approval before sending.',
      tag: 'Approval Required',
    },
    {
      level: 2,
      title: 'Level 2 — Assisted (Default)',
      desc: 'Routine low-risk conversations are handled independently. Meetings and medium-risk requests require approval.',
      tag: 'Balanced Assistance',
    },
    {
      level: 3,
      title: 'Level 3 — Autonomous',
      desc: 'AI autonomously handles all permitted communications and tasks within configured permissions. High-risk requests safely take a message.',
      tag: 'Full Autonomy',
    },
    {
      level: 4,
      title: 'Level 4 — Restricted',
      desc: 'AI acts strictly as a polite answering service. Takes messages only and reveals no personal facts.',
      tag: 'Answering Service',
    },
  ];

  const handleSaveAutonomy = async (level: number) => {
    setSelectedLevel(level);
    try {
      await api.updateAutonomySettings(level);
      setSavedMsg('Autonomy level updated!');
      setTimeout(() => setSavedMsg(''), 3000);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePermissions = async () => {
    try {
      await api.updatePermissions(permForm);
      setSavedMsg('Permissions updated!');
      setTimeout(() => setSavedMsg(''), 3000);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveLLM = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateLLMSettings(llmForm);
      setSavedMsg('AI model provider settings updated!');
      setTimeout(() => setSavedMsg(''), 3000);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">AI Representative System Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure autonomy levels, safety thresholds, access matrices, and language model providers.
        </p>
        {savedMsg && (
          <div className="mt-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800 p-2 rounded-xl">
            {savedMsg}
          </div>
        )}
      </div>

      {/* 1. Autonomy Level Selection */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-base text-white">Global Autonomy Level</h3>
        </div>
        <p className="text-xs text-slate-400">
          Determines the degree of independence granted to Persona when communicating across channels.
        </p>

        <div className="space-y-3 pt-2">
          {levels.map((item) => {
            const isSelected = selectedLevel === item.level;
            return (
              <div
                key={item.level}
                onClick={() => handleSaveAutonomy(item.level)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500 shadow-md text-white'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-purple-400 bg-purple-500'
                          : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <h4 className="font-bold text-sm text-slate-200">{item.title}</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300">
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 pl-6 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Granular Permissions Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-base text-white">Global Resource Permission Matrix</h3>
          </div>
          <button
            onClick={handleSavePermissions}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Permissions</span>
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Enforce strict resource boundary controls. Financial commitments are permanently locked to DENY.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Calendar */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200">Calendar & Schedule</span>
              <p className="text-[11px] text-slate-400">Allow AI to inspect calendar events</p>
            </div>
            <select
              value={permForm.calendar}
              onChange={(e) => setPermForm({ ...permForm, calendar: e.target.value })}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1"
            >
              <option value="ALLOW">ALLOW</option>
              <option value="DENY">DENY</option>
            </select>
          </div>

          {/* Notes */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200">Private Notes</span>
              <p className="text-[11px] text-slate-400">Access to personal notes and memories</p>
            </div>
            <select
              value={permForm.notes}
              onChange={(e) => setPermForm({ ...permForm, notes: e.target.value })}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1"
            >
              <option value="DENY">DENY (Recommended)</option>
              <option value="ALLOW">ALLOW</option>
            </select>
          </div>

          {/* Tasks */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200">Tasks & To-Dos</span>
              <p className="text-[11px] text-slate-400">Read to-do items and commitments</p>
            </div>
            <select
              value={permForm.tasks}
              onChange={(e) => setPermForm({ ...permForm, tasks: e.target.value })}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1"
            >
              <option value="ALLOW">ALLOW</option>
              <option value="DENY">DENY</option>
            </select>
          </div>

          {/* Financial (Immutable) */}
          <div className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-center justify-between opacity-85">
            <div>
              <span className="text-xs font-bold text-rose-300">Financial Actions & Transfers</span>
              <p className="text-[11px] text-slate-400">Lending, loans, payments, banking</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950 px-2.5 py-1 rounded border border-rose-800">
              LOCKED: DENY
            </span>
          </div>
        </div>
      </div>

      {/* 3. AI Provider & LLM Engine Settings */}
      <form onSubmit={handleSaveLLM} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-base text-white">AI Language Model Provider</h3>
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Provider</span>
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Select between local rule-based evaluation (zero external dependencies/keys) or connect your live Gemini / OpenAI keys.
        </p>

        <div className="space-y-3 text-xs pt-2">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Active AI Provider</label>
            <select
              value={llmForm.provider}
              onChange={(e) => setLlmForm({ ...llmForm, provider: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            >
              <option value="mock">Local Heuristic Mock Engine (Zero API Keys required, 100% deterministic)</option>
              <option value="gemini">Google Gemini (Gemini 2.0 Flash / Pro)</option>
              <option value="openai">OpenAI / Ollama / Groq (Compatible endpoint)</option>
            </select>
          </div>

          {llmForm.provider === 'gemini' && (
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gemini API Key</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={(llmForm as any).gemini_api_key || ''}
                  onChange={(e) => setLlmForm({ ...llmForm, [ 'gemini_api_key' as any ]: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Model Name</label>
                <input
                  type="text"
                  value={llmForm.gemini_model || 'gemini-2.0-flash'}
                  onChange={(e) => setLlmForm({ ...llmForm, gemini_model: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>
          )}

          {llmForm.provider === 'openai' && (
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">OpenAI / Groq API Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={(llmForm as any).openai_api_key || ''}
                  onChange={(e) => setLlmForm({ ...llmForm, [ 'openai_api_key' as any ]: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Base URL (For Ollama / Groq / OpenAI)</label>
                <input
                  type="text"
                  value={llmForm.openai_base_url || 'https://api.openai.com/v1'}
                  onChange={(e) => setLlmForm({ ...llmForm, openai_base_url: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
