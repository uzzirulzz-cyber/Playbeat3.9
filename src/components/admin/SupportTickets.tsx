import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { TicketPriority, TicketStatus, TicketChannel, SupportTicket } from '../../types';
import { Ticket, Mail, MessageCircle, Smartphone, AtSign, AlertTriangle, Clock, CheckCircle2, User, Inbox, Send } from 'lucide-react';

const PRIORITY_META: Record<TicketPriority, { pill: string; label: string; color: string }> = {
  low: { pill: 'admin-pill-blue', label: 'Low', color: 'text-blue-400' },
  normal: { pill: 'admin-pill-green', label: 'Normal', color: 'text-emerald-400' },
  high: { pill: 'admin-pill-amber', label: 'High', color: 'text-amber-400' },
  urgent: { pill: 'admin-pill-red', label: 'Urgent', color: 'text-red-400' },
};

const STATUS_META: Record<TicketStatus, { pill: string; label: string }> = {
  open: { pill: 'admin-pill-blue', label: 'Open' },
  in_progress: { pill: 'admin-pill-amber', label: 'In Progress' },
  waiting_on_customer: { pill: 'admin-pill-purple', label: 'Waiting on Customer' },
  resolved: { pill: 'admin-pill-green', label: 'Resolved' },
  closed: { pill: 'admin-pill-red', label: 'Closed' },
};

const CHANNEL_META: Record<TicketChannel, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  email: { icon: Mail, label: 'Email' },
  whatsapp: { icon: MessageCircle, label: 'WhatsApp' },
  in_app: { icon: Smartphone, label: 'In-App' },
  social: { icon: AtSign, label: 'Social' },
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const formatSla = (minutes: number): string => {
  if (minutes < 0) return `Breached ${Math.abs(minutes)}m`;
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m left`;
};

export const SupportTickets: React.FC = () => {
  const { supportTickets, replyToSupportTicket, updateTicketStatus, assignTicket } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const filtered = statusFilter === 'all' ? supportTickets : supportTickets.filter(t => t.status === statusFilter);

  const stats = {
    total: supportTickets.length,
    open: supportTickets.filter(t => t.status === 'open').length,
    inProgress: supportTickets.filter(t => t.status === 'in_progress').length,
    breached: supportTickets.filter(t => t.slaMinutesRemaining < 0 && t.status !== 'resolved' && t.status !== 'closed').length,
  };

  const handleAssign = (ticket: SupportTicket) => {
    const assignee = ticket.assignedTo === 'Unassigned' ? 'Sarah K.' : 'Unassigned';
    assignTicket(ticket.id, assignee);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="admin-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">Support Tickets</h1>
            <p className="text-xs text-gray-500 mt-0.5">Unified inbox across email, WhatsApp, in-app, and social.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Total</div>
            <div className="text-xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Open</div>
            <div className="text-xl font-bold text-blue-400 mt-1">{stats.open}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">In Progress</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{stats.inProgress}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">SLA Breached</div>
            <div className={`text-xl font-bold mt-1 ${stats.breached > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{stats.breached}</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0f141c] border border-[#1f2937] w-fit">
        {(['all', 'open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors ${
              statusFilter === s ? 'bg-purple-600/30 text-purple-300' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Tickets list */}
      {filtered.length === 0 ? (
        <div className="admin-card p-10 text-center">
          <Inbox className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No tickets match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const priority = PRIORITY_META[ticket.priority];
            const status = STATUS_META[ticket.status];
            const channel = CHANNEL_META[ticket.channel];
            const ChannelIcon = channel.icon;
            const isBreached = ticket.slaMinutesRemaining < 0 && ticket.status !== 'resolved' && ticket.status !== 'closed';
            return (
              <div key={ticket.id} className={`admin-card p-4 ${isBreached ? 'border-red-500/40' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    ticket.priority === 'urgent' ? 'bg-red-500/15 text-red-400' :
                    ticket.priority === 'high' ? 'bg-amber-500/15 text-amber-400' :
                    ticket.priority === 'normal' ? 'bg-blue-500/15 text-blue-400' :
                    'bg-gray-500/15 text-gray-400'
                  }`}>
                    <Ticket className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">{ticket.id}</span>
                          <span className={`${priority.pill} !py-0.5 !px-1.5 !text-[9px]`}>{priority.label}</span>
                          <span className={`${status.pill} !py-0.5 !px-1.5 !text-[9px]`}>{status.label}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{ticket.subject}</h3>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {ticket.customerName} · <span className="font-mono">{ticket.customerEmail}</span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-gray-500 font-mono shrink-0">
                        <ChannelIcon className="w-3 h-3" />
                        {channel.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{ticket.assignedTo}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{ticket.messageCount} msgs</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>updated {timeAgo(ticket.lastReplyAt)}</span>
                      </span>
                      {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                        <span className={`flex items-center gap-1 font-mono ${isBreached ? 'text-red-400' : 'text-gray-400'}`}>
                          {isBreached ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>SLA: {formatSla(ticket.slaMinutesRemaining)}</span>
                        </span>
                      )}
                    </div>
                    {ticket.latestMessage && (
                      <div className="mt-3 rounded-lg bg-[#0f141c] border border-[#1f2937] px-3 py-2 text-xs text-gray-300">
                        {ticket.latestMessage}
                      </div>
                    )}

                    {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                      <div className="flex items-center gap-2 mt-3">
                        <input
                          value={replyDrafts[ticket.id] || ''}
                          onChange={(event) => setReplyDrafts(prev => ({ ...prev, [ticket.id]: event.target.value }))}
                          placeholder="Reply to this customer..."
                          className="input-sharp flex-1 px-3 py-2 text-xs text-white"
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                              event.preventDefault();
                              replyToSupportTicket(ticket.id, replyDrafts[ticket.id] || '');
                              setReplyDrafts(prev => ({ ...prev, [ticket.id]: '' }));
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            replyToSupportTicket(ticket.id, replyDrafts[ticket.id] || '');
                            setReplyDrafts(prev => ({ ...prev, [ticket.id]: '' }));
                          }}
                          disabled={!replyDrafts[ticket.id]?.trim()}
                          className="px-3 py-2 rounded-md bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Reply
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1f2937]">
                      {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                          className="px-2.5 py-1.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /><span>Resolve</span>
                        </button>
                      )}
                      {ticket.status === 'resolved' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'closed')}
                          className="px-2.5 py-1.5 rounded-md bg-gray-500/15 hover:bg-gray-500/25 text-gray-300 text-[10px] font-bold uppercase tracking-wider border border-gray-500/30"
                        >
                          Close Ticket
                        </button>
                      )}
                      {ticket.status === 'open' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                          className="px-2.5 py-1.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30"
                        >
                          Take It
                        </button>
                      )}
                      <button
                        onClick={() => handleAssign(ticket)}
                        className="px-2.5 py-1.5 rounded-md bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30"
                      >
                        {ticket.assignedTo === 'Unassigned' ? 'Assign to Me' : 'Unassign'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
