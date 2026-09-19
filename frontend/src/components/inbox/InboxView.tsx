import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  UserCheck,
  Shield,
  Bot,
  User,
  Filter,
} from 'lucide-react';
import { Conversation, Message } from '../../types';
import { api } from '../../services/api';

interface InboxViewProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  onRefresh: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onRefresh,
}) => {
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [takingOver, setTakingOver] = useState(false);

  const filteredConversations = conversations.filter((c) => {
    if (channelFilter === 'all') return true;
    return c.channel === channelFilter;
  });

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      await api.sendMessage(selectedConversation.id, replyText);
      setReplyText('');
      onRefresh();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleTakeover = async () => {
    if (!selectedConversation) return;
    try {
      setTakingOver(true);
      await api.takeoverConversation(selectedConversation.id);
      onRefresh();
    } catch (err) {
      console.error('Failed to takeover:', err);
    } finally {
      setTakingOver(false);
    }
  };

  const channelIcons: Record<string, any> = {
    chat: MessageSquare,
    sms: Phone,
    email: Mail,
    call: Phone,
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4 overflow-hidden">
      {/* Left List of Threads */}
      <div className="w-80 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Channel Filter Pills */}
        <div className="p-3 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto text-xs">
          {['all', 'chat', 'sms', 'email', 'call'].map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                channelFilter === ch
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Conversation Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No conversations in this channel.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const Icon = channelIcons[conv.channel] || MessageSquare;
              const isSelected = selectedConversation?.id === conv.id;
              const lastMsg =
                conv.messages && conv.messages.length > 0
                  ? conv.messages[conv.messages.length - 1].content
                  : conv.summary || 'New conversation';

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className={`p-3.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-purple-950/40 border-l-4 border-purple-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-sm text-slate-200 line-clamp-1">
                        {conv.contact?.name || conv.title || `Thread #${conv.id}`}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        conv.priority === 'HIGH'
                          ? 'bg-rose-950 text-rose-300'
                          : conv.priority === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {conv.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{lastMsg}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Thread Message Feed */}
      <div className="flex-1 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">
                    {selectedConversation.contact?.name || selectedConversation.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300 uppercase">
                    {selectedConversation.channel}
                  </span>
                  {selectedConversation.contact?.relationship_type && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 capitalize font-medium">
                      {selectedConversation.contact.relationship_type}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Risk Assessment:{' '}
                  <span className="font-semibold text-slate-300">
                    {selectedConversation.risk_level}
                  </span>{' '}
                  • Priority:{' '}
                  <span className="font-semibold text-slate-300">
                    {selectedConversation.priority}
                  </span>
                </p>
              </div>

              {/* Takeover Control */}
              <div>
                {selectedConversation.human_taken_over ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold">
                    <UserCheck className="w-4 h-4" />
                    <span>Ashay Has Taken Over</span>
                  </div>
                ) : (
                  <button
                    onClick={handleTakeover}
                    disabled={takingOver}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Take Over Conversation</span>
                  </button>
                )}
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/20">
              {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                selectedConversation.messages.map((m) => {
                  const isContact = m.sender_type === 'contact';
                  const isAi = m.sender_type === 'ai_representative';
                  const isAshay = m.sender_type === 'user_human';

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        isContact ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                        {isAi && <Bot className="w-3.5 h-3.5 text-purple-400" />}
                        {isAshay && <User className="w-3.5 h-3.5 text-indigo-400" />}
                        <span className="font-medium">
                          {m.sender_name || (isContact ? 'Contact' : 'AI Representative')}
                        </span>
                      </div>
                      <div
                        className={`max-w-xl p-3.5 rounded-2xl text-sm leading-relaxed ${
                          isContact
                            ? 'bg-slate-800/90 text-slate-100 rounded-tl-sm border border-slate-700/60'
                            : isAi
                            ? 'bg-purple-900/40 text-purple-100 rounded-tr-sm border border-purple-700/50 shadow-sm'
                            : 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No messages recorded in this conversation yet.
                </div>
              )}
            </div>

            {/* Manual Reply Bar */}
            <form onSubmit={handleSendReply} className="p-3 border-t border-slate-800 flex gap-2 bg-slate-900">
              <input
                type="text"
                placeholder="Type a manual response as Ashay (bypasses AI)..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center gap-1.5 transition"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm">
            <MessageSquare className="w-10 h-10 mb-2 text-slate-600" />
            <span>Select a conversation thread on the left to view messages.</span>
          </div>
        )}
      </div>
    </div>
  );
};
