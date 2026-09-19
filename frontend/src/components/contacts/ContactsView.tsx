import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Sliders,
  Shield,
  Calendar,
  MessageSquare,
  Check,
  X,
  Star,
} from 'lucide-react';
import { Contact, ContactRule } from '../../types';
import { api } from '../../services/api';

interface ContactsViewProps {
  contacts: Contact[];
  onRefresh: () => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ contacts, onRefresh }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filterRel, setFilterRel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [ruleForm, setRuleForm] = useState<Partial<ContactRule>>({});
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    relationship_type: 'friend',
    phone: '',
    email: '',
  });

  const filtered = contacts.filter((c) => {
    if (filterRel !== 'all' && c.relationship_type !== filterRel) return false;
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleOpenRules = (contact: Contact) => {
    setSelectedContact(contact);
    setRuleForm(
      contact.rule || {
        auto_reply_allowed: true,
        calendar_access: false,
        notes_access: false,
        message_style: 'neutral',
        max_autonomy_level: 3,
        require_approval_always: false,
      }
    );
    setIsEditingRules(true);
  };

  const handleSaveRules = async () => {
    if (!selectedContact) return;
    try {
      await api.updateContactRules(selectedContact.id, ruleForm);
      setIsEditingRules(false);
      onRefresh();
    } catch (e) {
      console.error('Error saving contact rules:', e);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name?.trim()) return;
    try {
      await api.createContact(newContact);
      setIsAddingContact(false);
      setNewContact({ name: '', relationship_type: 'friend', phone: '', email: '' });
      onRefresh();
    } catch (e) {
      console.error('Error adding contact:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Contacts & AI Behavior Rules</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure contact-specific communication styles, calendar access, and autonomy limits.
          </p>
        </div>
        <button
          onClick={() => setIsAddingContact(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search contacts by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500 w-64"
        />

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {['all', 'friend', 'professor', 'client', 'unknown'].map((rel) => (
            <button
              key={rel}
              onClick={() => setFilterRel(rel)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                filterRel === rel
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rel}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((contact) => {
          const rule = contact.rule;
          return (
            <div
              key={contact.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{contact.name}</h3>
                    {contact.is_vip && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 uppercase font-mono font-medium">
                    {contact.relationship_type}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-0.5 mb-4 font-mono">
                  {contact.phone && <p>{contact.phone}</p>}
                  {contact.email && <p>{contact.email}</p>}
                  {contact.company && <p className="text-slate-500">{contact.company}</p>}
                </div>

                {/* AI Rules Overview */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Message Style:</span>
                    <span className="font-semibold text-slate-200 capitalize">
                      {rule?.message_style || 'neutral'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Calendar Access:</span>
                    <span
                      className={`font-semibold ${
                        rule?.calendar_access ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {rule?.calendar_access ? 'Allowed' : 'Denied'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Max Autonomy:</span>
                    <span className="font-semibold text-slate-200">
                      Level {rule?.max_autonomy_level ?? 3}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenRules(contact)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Configure AI Behavior</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configure AI Behavior Modal */}
      {isEditingRules && selectedContact && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-white">
                  AI Rules for {selectedContact.name}
                </h3>
                <p className="text-xs text-slate-400">Customize how Persona represents Ashay</p>
              </div>
              <button
                onClick={() => setIsEditingRules(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Message Style */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Communication Tone & Style
                </label>
                <select
                  value={ruleForm.message_style || 'neutral'}
                  onChange={(e) => setRuleForm({ ...ruleForm, message_style: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="casual">Casual (Friendly, warm, informal for friends)</option>
                  <option value="formal">Formal (Respectful, deferential for professors)</option>
                  <option value="professional">Professional (Courteous, dependable for clients)</option>
                  <option value="neutral">Neutral (Objective, polite for unknown callers)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
                  <span className="text-slate-300">Allow Automated Replies</span>
                  <input
                    type="checkbox"
                    checked={ruleForm.auto_reply_allowed ?? true}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, auto_reply_allowed: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
                  <span className="text-slate-300">Allow Calendar & Availability Access</span>
                  <input
                    type="checkbox"
                    checked={ruleForm.calendar_access ?? false}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, calendar_access: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
                  <span className="text-slate-300">Always Require Ashay's Approval</span>
                  <input
                    type="checkbox"
                    checked={ruleForm.require_approval_always ?? false}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, require_approval_always: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                </label>
              </div>

              {/* Max Autonomy Level Cap */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Maximum Autonomy Level Cap for this Contact (0 to 4)
                </label>
                <input
                  type="number"
                  min={0}
                  max={4}
                  value={ruleForm.max_autonomy_level ?? 3}
                  onChange={(e) =>
                    setRuleForm({ ...ruleForm, max_autonomy_level: parseInt(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              {/* Custom Prompt Instructions */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Custom Prompt Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Always address as Professor; mention upcoming exam."
                  value={ruleForm.custom_instructions || ''}
                  onChange={(e) =>
                    setRuleForm({ ...ruleForm, custom_instructions: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsEditingRules(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRules}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow"
              >
                Save Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {isAddingContact && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateContact}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add New Contact</h3>
              <button
                type="button"
                onClick={() => setIsAddingContact(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newContact.name || ''}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Relationship</label>
                <select
                  value={newContact.relationship_type || 'friend'}
                  onChange={(e) =>
                    setNewContact({ ...newContact, relationship_type: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white capitalize"
                >
                  <option value="friend">Friend</option>
                  <option value="professor">Professor</option>
                  <option value="client">Client</option>
                  <option value="family">Family</option>
                  <option value="colleague">Colleague</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newContact.phone || ''}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={newContact.email || ''}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingContact(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow"
              >
                Add Contact
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
