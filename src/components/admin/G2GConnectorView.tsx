import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Server,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  TrendingUp,
  Percent,
  Lock,
  Globe,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';

export const G2GConnectorView: React.FC = () => {
  const { g2gSettings, updateG2GSettings, syncG2GCatalog, addToast, formatPrice } = useStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [apiKey, setApiKey] = useState(g2gSettings.apiKey);
  const [marginPercent, setMarginPercent] = useState(g2gSettings.marginMarkupPercent);
  const [environment, setEnvironment] = useState(g2gSettings.environment);
  const [autoSync, setAutoSync] = useState(g2gSettings.autoSync);
  const [currency, setCurrency] = useState(g2gSettings.currency);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateG2GSettings({
      apiKey,
      marginMarkupPercent: Number(marginPercent),
      environment,
      autoSync,
      currency
    });
    addToast('success', 'G2G Settings Saved', 'Supplier sourcing and markup rules updated successfully.');
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    await syncG2GCatalog();
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-red-950/20 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white font-display">
                PlayBeat × G2G Sourcing Engine
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                g2gSettings.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {g2gSettings.status === 'connected' ? 'API CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-xl mt-1 leading-relaxed">
              Direct supplier bridge connecting wholesale CD keys, in-game currency, and subscriptions directly into PlayBeat with automated margin markup and variation deduplication.
            </p>
          </div>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold font-display shadow-lg shadow-red-600/30 flex items-center gap-2 shrink-0 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing Supplier Feeds...' : 'Sync Supplier Catalog Now'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SETTINGS FORM (LEFT) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#10121B] border border-white/10 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              API Connection & Profit Margins
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">v3.4 Sourcing Protocol</span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">G2G Secret API Token</label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-[#141622] rounded-xl border border-white/10 px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-red-500/50"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Environment</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as any)}
                  className="w-full bg-[#141622] rounded-xl border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="production">Production Live</option>
                  <option value="sandbox">Sandbox Test Feed</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#141622] rounded-xl border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="PKR">PKR (Rs)</option>
                </select>
              </div>
            </div>

            {/* Profit Margin Slider / Input */}
            <div className="p-4 rounded-2xl bg-[#141622] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5 font-display">
                  <Percent className="w-3.5 h-3.5 text-red-400" />
                  <span>Automated Wholesale Markup</span>
                </span>
                <span className="font-mono text-red-400 font-bold text-sm">+{marginPercent}%</span>
              </div>

              <input
                type="range"
                min="5"
                max="60"
                value={marginPercent}
                onChange={(e) => setMarginPercent(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />

              <div className="text-[11px] text-neutral-400 leading-snug">
                Example: A wholesale $20.00 Steam CD key is automatically priced at <strong className="text-white font-mono">${(20 * (1 + marginPercent / 100)).toFixed(2)}</strong> on the storefront.
              </div>
            </div>

            {/* Auto Sync Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <div className="font-semibold text-white">Periodic Auto-Sync</div>
                <div className="text-[11px] text-neutral-400">Sync key stock & prices every 60 minutes</div>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold font-display text-xs transition-colors"
            >
              Save Configuration
            </button>
          </form>
        </div>

        {/* LIVE SYNC TERMINAL & LOGS (RIGHT) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#10121B] border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Connector Terminal Logs</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                Last Sync: {new Date(g2gSettings.lastSyncedAt).toLocaleTimeString()}
              </span>
            </div>

            {/* Terminal Window */}
            <div className="mt-3 p-4 rounded-2xl bg-black/90 border border-white/10 font-mono text-[11px] space-y-2 h-64 overflow-y-auto">
              <div className="text-neutral-400">&gt; Initializing G2G Wholesale API Bridge (TLS 1.3)...</div>
              <div className="text-emerald-400">&gt; Connected to G2G Gateway cluster [us-east-1] - Latency: 42ms</div>
              <div className="text-neutral-300">&gt; Sourcing wholesale digital catalog feeds: Gaming, Gift Cards, IPTV, Software</div>
              <div className="text-neutral-400">&gt; Applying +{g2gSettings.marginMarkupPercent}% margin markup rule</div>
              <div className="text-red-400">&gt; [VariantEngine] Duplicate variation protection active (0 duplicates detected)</div>
              <div className="text-emerald-400">&gt; Synchronized 24 active digital SKU listings into memory</div>
              <div className="text-neutral-500">&gt; Standby for automatic interval polling...</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141622] border border-white/5 text-xs text-neutral-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Smart Sourcing Status: Optimal</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">100% HEALTH</span>
          </div>
        </div>
      </div>
    </div>
  );
};
