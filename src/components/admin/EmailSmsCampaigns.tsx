import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CampaignStatus, CampaignChannel, MarketingCampaign } from '../../types';
import { Send, Mail, MessageSquare, Layers, Users, MousePointerClick, AlertTriangle, Play, Pause, Eye } from 'lucide-react';

const STATUS_META: Record<CampaignStatus, { pill: string; label: string }> = {
  draft: { pill: 'admin-pill-amber', label: 'Draft' },
  scheduled: { pill: 'admin-pill-blue', label: 'Scheduled' },
  sending: { pill: 'admin-pill-purple', label: 'Sending' },
  sent: { pill: 'admin-pill-green', label: 'Sent' },
  paused: { pill: 'admin-pill-red', label: 'Paused' },
};

const CHANNEL_META: Record<CampaignChannel, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  email: { icon: Mail, label: 'Email', color: 'text-blue-400' },
  sms: { icon: MessageSquare, label: 'SMS', color: 'text-emerald-400' },
  both: { icon: Layers, label: 'Email + SMS', color: 'text-purple-400' },
};

const TRIGGER_LABEL: Record<string, string> = {
  manual: 'Manual Blast',
  abandoned_cart: 'Abandoned Cart',
  post_purchase: 'Post-Purchase',
  win_back: 'Win-Back',
  welcome: 'Welcome Sequence',
};

const formatDate = (iso?: string): string => iso ? new Date(iso).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const EmailSmsCampaigns: React.FC = () => {
  const { campaigns, pauseCampaign, resumeCampaign, addToast } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | CampaignStatus>('all');

  const filtered = statusFilter === 'all' ? campaigns : campaigns.filter(c => c.status === statusFilter);

  // Stats
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalAudience = campaigns.reduce((sum, c) => sum + c.audienceSize, 0);
  const avgOpenRate = campaigns.filter(c => c.openRate > 0).length > 0
    ? campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.filter(c => c.openRate > 0).length
    : 0;
  const avgClickRate = campaigns.filter(c => c.clickRate > 0).length > 0
    ? campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.filter(c => c.clickRate > 0).length
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="admin-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <Send className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">Email & SMS Campaigns</h1>
            <p className="text-xs text-gray-500 mt-0.5">Transactional + marketing messages with audience segments and triggers.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono"><Send className="w-2.5 h-2.5" /><span>Messages Sent</span></div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{totalSent.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono"><Users className="w-2.5 h-2.5" /><span>Total Audience</span></div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{totalAudience.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono"><Eye className="w-2.5 h-2.5" /><span>Avg Open Rate</span></div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{avgOpenRate.toFixed(1)}%</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono"><MousePointerClick className="w-2.5 h-2.5" /><span>Avg Click Rate</span></div>
            <div className="text-xl font-bold text-blue-400 mt-1 font-mono">{avgClickRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0f141c] border border-[#1f2937] w-fit overflow-x-auto no-scrollbar">
        {(['all', 'draft', 'scheduled', 'sending', 'sent', 'paused'] as const).map((s) => (
          <button
            key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
              statusFilter === s ? 'bg-purple-600/30 text-purple-300' : 'text-gray-500 hover:text-gray-300'
            }`}
          >{s}</button>
        ))}
      </div>

      {/* Campaigns grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="admin-card p-10 text-center lg:col-span-2">
            <Send className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No campaigns match this filter.</p>
          </div>
        ) : (
          filtered.map((campaign) => {
            const status = STATUS_META[campaign.status];
            const channel = CHANNEL_META[campaign.channel];
            const ChannelIcon = channel.icon;
            const sendProgress = campaign.audienceSize > 0 ? (campaign.sentCount / campaign.audienceSize) * 100 : 0;
            const isSending = campaign.status === 'sending';
            const canPause = ['sending', 'scheduled'].includes(campaign.status);
            const canResume = campaign.status === 'paused';
            return (
              <div key={campaign.id} className="admin-card p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#0f141c] border border-[#1f2937] ${channel.color}`}>
                      <ChannelIcon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{campaign.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {channel.label} · {TRIGGER_LABEL[campaign.trigger]}
                      </div>
                    </div>
                  </div>
                  <span className={`${status.pill} shrink-0`}>{status.label}</span>
                </div>

                {/* Subject line */}
                <div className="p-2.5 rounded-lg bg-[#0f141c] border border-[#1f2937] mb-3">
                  <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono mb-0.5">Subject</div>
                  <div className="text-xs text-white font-medium">{campaign.subject}</div>
                  <div className="text-[10px] text-gray-500 mt-1 italic">{campaign.preview}</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div>
                    <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono">Audience</div>
                    <div className="text-xs font-bold text-white font-mono">{campaign.audienceSize.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono">Sent</div>
                    <div className="text-xs font-bold text-white font-mono">{campaign.sentCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono">Open</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono">{campaign.openRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono">Click</div>
                    <div className="text-xs font-bold text-blue-400 font-mono">{campaign.clickRate.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Send progress */}
                {(isSending || campaign.status === 'sent') && (
                  <div className="mb-3">
                    <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${sendProgress}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">{sendProgress.toFixed(0)}% delivered</div>
                  </div>
                )}

                {/* Bounce warning */}
                {campaign.bounceRate > 3 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-300/80 mb-3">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>Bounce rate {campaign.bounceRate.toFixed(1)}% — above recommended 3% threshold.</span>
                  </div>
                )}

                {/* Timestamp + actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1f2937]">
                  <div className="text-[10px] text-gray-500 font-mono">
                    {campaign.sentAt ? `Sent ${formatDate(campaign.sentAt)}` :
                     campaign.scheduledAt ? `Scheduled ${formatDate(campaign.scheduledAt)}` :
                     'Not scheduled'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {canPause && (
                      <button
                        onClick={() => pauseCampaign(campaign.id)}
                        className="px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30 flex items-center gap-1"
                      >
                        <Pause className="w-3 h-3" /><span className="hidden sm:inline">Pause</span>
                      </button>
                    )}
                    {canResume && (
                      <button
                        onClick={() => resumeCampaign(campaign.id)}
                        className="px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /><span className="hidden sm:inline">Resume</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
