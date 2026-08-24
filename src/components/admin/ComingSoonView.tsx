import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, Construction, ArrowRight, Bell } from 'lucide-react';

interface ComingSoonViewProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  features?: string[];
}

/**
 * Placeholder view for admin menu items that don't have a functional page yet
 * (e.g. IPTV M3U Servers, WooCommerce Bridge, Subscriptions, Support Tickets, etc.)
 *
 * Shows a clear "Coming Soon" state with what the page will eventually offer,
 * so admins always have a sense of what's planned without seeing broken/empty UI.
 */
export const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  title,
  description,
  icon: Icon = Construction,
  features = [],
}) => {
  const { addToast } = useStore();

  const handleNotify = () => {
    addToast('info', 'Subscribed', `We'll notify you when "${title}" ships.`);
  };

  return (
    <div className="space-y-5">
      {/* Header strip */}
      <div className="admin-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white font-display">{title}</h1>
              <span className="admin-pill-amber">Coming Soon</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>

      {/* What's coming */}
      {features.length > 0 && (
        <div className="admin-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">Planned Capabilities</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937] hover:border-[#3a4256] transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                  </div>
                  <span className="text-xs text-gray-300 leading-snug">{feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notify me */}
      <div className="admin-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-white">Want a heads-up when this lands?</div>
            <p className="text-xs text-gray-500 mt-0.5">
              We'll drop a notification in your admin inbox the moment {title} goes live.
            </p>
          </div>
        </div>
        <button
          onClick={handleNotify}
          className="admin-gold-pill shrink-0"
        >
          <span>Notify Me</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
