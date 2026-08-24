import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { WooCommerceConnection, WooCommerceConnectionStatus, SyncConflict } from '../../types';
import {
  Plus,
  Link2,
  RefreshCw,
  Trash2,
  Globe,
  Package,
  ShoppingCart,
  AlertTriangle,
  Check,
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Settings,
  Power,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_META: Record<WooCommerceConnectionStatus, { pill: string; label: string; dot: string }> = {
  connected: { pill: 'admin-pill-green', label: 'Connected', dot: 'bg-emerald-400' },
  disconnected: { pill: 'admin-pill-red', label: 'Disconnected', dot: 'bg-red-400' },
  syncing: { pill: 'admin-pill-blue', label: 'Syncing', dot: 'bg-blue-400 animate-pulse' },
  error: { pill: 'admin-pill-amber', label: 'Error', dot: 'bg-amber-400' },
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const WooCommerceBridge: React.FC = () => {
  const {
    wooCommerceConnections,
    syncConflicts,
    addWooCommerceConnection,
    toggleWooCommerceConnection,
    deleteWooCommerceConnection,
    syncWooCommerceConnection,
    resolveSyncConflict,
    addToast,
  } = useStore();

  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);

  // Connect-store form state (2-step wizard: store info → credentials)
  const [connectStep, setConnectStep] = useState<1 | 2>(1);
  const [newConn, setNewConn] = useState({
    storeName: '',
    storeUrl: '',
    consumerKey: '',
    consumerSecret: '',
    environment: 'production' as 'production' | 'staging',
    autoSync: true,
    syncIntervalMinutes: 30,
  });

  // ---- Aggregate stats ----
  const totalConnections = wooCommerceConnections.length;
  const connectedCount = wooCommerceConnections.filter(c => c.status === 'connected').length;
  const totalProductsSynced = wooCommerceConnections.reduce((sum, c) => sum + c.productsSynced, 0);
  const totalOrdersSynced = wooCommerceConnections.reduce((sum, c) => sum + c.ordersSynced, 0);
  const pendingConflicts = syncConflicts.filter(c => c.status === 'pending').length;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (connectStep === 1) {
      if (!newConn.storeName || !newConn.storeUrl) {
        addToast('error', 'Missing Fields', 'Store name and URL are required.');
        return;
      }
      setConnectStep(2);
      return;
    }
    // Step 2 — validate credentials
    if (!newConn.consumerKey || !newConn.consumerSecret) {
      addToast('error', 'Missing Credentials', 'WooCommerce consumer key and secret are required.');
      return;
    }
    // Mask the consumer key — never store the full key client-side
    const maskedKey = `ck_${'•'.repeat(16)}${newConn.consumerKey.slice(-4)}`;
    addWooCommerceConnection({
      storeName: newConn.storeName,
      storeUrl: newConn.storeUrl,
      status: 'connected',
      consumerKeyMasked: maskedKey,
      environment: newConn.environment,
      autoSync: newConn.autoSync,
      syncIntervalMinutes: Number(newConn.syncIntervalMinutes) || 30,
    });
    // Reset form + close modal
    setNewConn({
      storeName: '', storeUrl: '', consumerKey: '', consumerSecret: '',
      environment: 'production', autoSync: true, syncIntervalMinutes: 30,
    });
    setConnectStep(1);
    setIsConnectOpen(false);
  };

  const handleSync = (id: string) => {
    syncWooCommerceConnection(id);
  };

  const handleResolve = (conflict: SyncConflict, resolution: 'resolved_local' | 'resolved_remote') => {
    resolveSyncConflict(conflict.id, resolution);
    setExpandedConflict(null);
  };

  const pendingConflictsList = syncConflicts.filter(c => c.status === 'pending');
  const resolvedConflictsList = syncConflicts.filter(c => c.status !== 'pending').slice(0, 5);

  return (
    <div className="space-y-5">
      {/* ============================================
          HEADER + STATS
          ============================================ */}
      <div className="admin-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-display">WooCommerce Bridge</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Two-way sync between PlayBeat and WooCommerce stores.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setConnectStep(1); setIsConnectOpen(true); }}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Store</span>
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Connections</div>
            <div className="text-xl font-bold text-white mt-1">{connectedCount}/{totalConnections}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">active</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Products Synced</div>
            <div className="text-xl font-bold text-white mt-1">{totalProductsSynced.toLocaleString()}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">across all stores</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Orders Synced</div>
            <div className="text-xl font-bold text-white mt-1">{totalOrdersSynced.toLocaleString()}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">last 30 days</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Pending Conflicts</div>
            <div className={`text-xl font-bold mt-1 ${pendingConflicts > 0 ? 'text-amber-400' : 'text-white'}`}>{pendingConflicts}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">awaiting review</div>
          </div>
        </div>
      </div>

      {/* ============================================
          CONNECTION CARDS
          ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <span>Connected Stores ({wooCommerceConnections.length})</span>
          </h2>
        </div>
        {wooCommerceConnections.length === 0 ? (
          <div className="admin-card p-10 text-center">
            <Link2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No WooCommerce stores connected yet.</p>
            <button
              onClick={() => { setConnectStep(1); setIsConnectOpen(true); }}
              className="mt-3 admin-gold-pill"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect First Store</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {wooCommerceConnections.map((conn) => {
              const status = STATUS_META[conn.status];
              const isSyncing = conn.status === 'syncing';
              return (
                <div key={conn.id} className="admin-card p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        conn.status === 'connected' ? 'bg-emerald-500/15 text-emerald-400' :
                        conn.status === 'syncing' ? 'bg-blue-500/15 text-blue-400' :
                        conn.status === 'error' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>
                        <ShoppingBag className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{conn.storeName}</div>
                        <a
                          href={conn.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-mono truncate block"
                        >
                          {conn.storeUrl}
                        </a>
                      </div>
                    </div>
                    <span className={`${status.pill} flex items-center gap-1.5 shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Environment + auto-sync row */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      conn.environment === 'production' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {conn.environment}
                    </span>
                    {conn.autoSync && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-blue-500/15 text-blue-400 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5" />
                        Auto · {conn.syncIntervalMinutes}m
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500 font-mono">
                      Key: {conn.consumerKeyMasked}
                    </span>
                  </div>

                  {/* Sync stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-[#0f141c] border border-[#1f2937]">
                      <div className="flex items-center gap-1 text-[9px] uppercase text-gray-500 tracking-wider font-mono mb-0.5">
                        <Package className="w-2.5 h-2.5" />
                        <span>Products</span>
                      </div>
                      <div className="text-sm font-bold text-white font-mono">{conn.productsSynced}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0f141c] border border-[#1f2937]">
                      <div className="flex items-center gap-1 text-[9px] uppercase text-gray-500 tracking-wider font-mono mb-0.5">
                        <ShoppingCart className="w-2.5 h-2.5" />
                        <span>Orders</span>
                      </div>
                      <div className="text-sm font-bold text-white font-mono">{conn.ordersSynced}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0f141c] border border-[#1f2937]">
                      <div className="flex items-center gap-1 text-[9px] uppercase text-gray-500 tracking-wider font-mono mb-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Conflicts</span>
                      </div>
                      <div className={`text-sm font-bold font-mono ${conn.pendingConflicts > 0 ? 'text-amber-400' : 'text-white'}`}>
                        {conn.pendingConflicts}
                      </div>
                    </div>
                  </div>

                  {/* Last sync */}
                  <div className="text-[10px] text-gray-500 font-mono mb-3">
                    Last sync: {timeAgo(conn.lastSyncAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#1f2937]">
                    <button
                      onClick={() => handleSync(conn.id)}
                      disabled={isSyncing || conn.status === 'disconnected'}
                      className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                    </button>
                    <button
                      onClick={() => toggleWooCommerceConnection(conn.id)}
                      className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                        conn.status === 'disconnected'
                          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{conn.status === 'disconnected' ? 'Reconnect' : 'Disconnect'}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delink ${conn.storeName}? All pending conflicts will be cleared.`)) {
                          deleteWooCommerceConnection(conn.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-[#1f2937] hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors"
                      aria-label="Delete connection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================
          CONFLICT QUEUE
          ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${pendingConflicts > 0 ? 'text-amber-400' : 'text-gray-400'}`} />
            <span>Sync Conflict Queue ({pendingConflictsList.length} pending)</span>
          </h2>
        </div>

        {pendingConflictsList.length === 0 && resolvedConflictsList.length === 0 ? (
          <div className="admin-card p-10 text-center">
            <Check className="w-10 h-10 text-emerald-500/60 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No sync conflicts — everything is in sync.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingConflictsList.map((conflict) => {
              const isExpanded = expandedConflict === conflict.id;
              return (
                <div key={conflict.id} className="admin-card p-4">
                  <button
                    onClick={() => setExpandedConflict(isExpanded ? null : conflict.id)}
                    className="w-full flex items-start justify-between gap-3 text-left"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{conflict.productTitle}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          {conflict.storeName} · SKU {conflict.productSku} · field: <span className="text-amber-400">{conflict.field}</span> · {timeAgo(conflict.detectedAt)}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform shrink-0 mt-1 ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#1f2937]">
                          {/* Local value (PlayBeat) */}
                          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase text-blue-400 font-mono font-bold tracking-wider">Local (PlayBeat)</span>
                              <ArrowRight className="w-3 h-3 text-blue-400" />
                            </div>
                            <div className="text-sm font-mono text-white break-all">{conflict.localValue}</div>
                          </div>
                          {/* Remote value (WooCommerce) */}
                          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase text-purple-400 font-mono font-bold tracking-wider">Remote (WooCommerce)</span>
                              <ArrowLeft className="w-3 h-3 text-purple-400" />
                            </div>
                            <div className="text-sm font-mono text-white break-all">{conflict.remoteValue}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleResolve(conflict, 'resolved_local')}
                            className="flex-1 py-2 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-[11px] font-bold uppercase tracking-wider border border-blue-500/30 flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Keep Local</span>
                          </button>
                          <button
                            onClick={() => handleResolve(conflict, 'resolved_remote')}
                            className="flex-1 py-2 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 text-[11px] font-bold uppercase tracking-wider border border-purple-500/30 flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Keep Remote</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Resolved conflicts (collapsed) */}
            {resolvedConflictsList.length > 0 && (
              <div className="admin-card p-3 mt-4">
                <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono px-2 py-1">
                  Recently Resolved
                </div>
                <div className="space-y-1 mt-1">
                  {resolvedConflictsList.map((conflict) => (
                    <div key={conflict.id} className="flex items-center justify-between p-2 rounded text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-gray-300 truncate">{conflict.productTitle}</span>
                        <span className="text-gray-600 font-mono">· {conflict.field}</span>
                      </div>
                      <span className={`text-[9px] font-mono uppercase shrink-0 ${
                        conflict.status === 'resolved_local' ? 'text-blue-400' : 'text-purple-400'
                      }`}>
                        {conflict.status === 'resolved_local' ? 'kept local' : 'kept remote'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================
          CONNECT STORE MODAL (2-step wizard)
          ============================================ */}
      <AnimatePresence>
        {isConnectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConnectOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl bg-[#151a23] border border-[#252b3b] shadow-2xl p-6 z-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="connect-store-title"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-purple-400" />
                  <h3 id="connect-store-title" className="text-base font-bold text-white font-display">
                    Connect WooCommerce Store
                  </h3>
                </div>
                <button onClick={() => setIsConnectOpen(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-5">
                {[
                  { n: 1, label: 'Store Info' },
                  { n: 2, label: 'API Credentials' },
                ].map((s, idx) => (
                  <React.Fragment key={s.n}>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-mono uppercase tracking-wider ${
                      connectStep === s.n
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                        : connectStep > s.n
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'text-gray-500 border-white/5'
                    }`}>
                      {connectStep > s.n ? <Check className="w-3 h-3" /> : <span>{s.n}</span>}
                      <span>{s.label}</span>
                    </div>
                    {idx < 1 && <span className="text-gray-600 text-xs">→</span>}
                  </React.Fragment>
                ))}
              </div>

              <form onSubmit={handleConnect} className="space-y-3">
                {connectStep === 1 && (
                  <>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Store Name</label>
                      <input
                        type="text"
                        required
                        value={newConn.storeName}
                        onChange={(e) => setNewConn({ ...newConn, storeName: e.target.value })}
                        placeholder="PlayBeat Gear Store"
                        className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Store URL</label>
                      <input
                        type="url"
                        required
                        value={newConn.storeUrl}
                        onChange={(e) => setNewConn({ ...newConn, storeUrl: e.target.value })}
                        placeholder="https://shop.example.com"
                        className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Environment</label>
                        <select
                          value={newConn.environment}
                          onChange={(e) => setNewConn({ ...newConn, environment: e.target.value as 'production' | 'staging' })}
                          className="input-sharp w-full px-3 py-2 text-xs text-white"
                        >
                          <option value="production">Production</option>
                          <option value="staging">Staging</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">Sync Interval (min)</label>
                        <input
                          type="number"
                          min="5"
                          value={newConn.syncIntervalMinutes}
                          onChange={(e) => setNewConn({ ...newConn, syncIntervalMinutes: Number(e.target.value) })}
                          className="input-sharp w-full px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-[11px] text-gray-300 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={newConn.autoSync}
                        onChange={(e) => setNewConn({ ...newConn, autoSync: e.target.checked })}
                        className="accent-purple-500 w-3.5 h-3.5"
                      />
                      <span>Enable auto-sync (recommended)</span>
                    </label>
                  </>
                )}

                {connectStep === 2 && (
                  <>
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-[10px] text-blue-300 leading-relaxed">
                      <Settings className="w-3 h-3 inline mr-1" />
                      Generate REST API keys in your WooCommerce dashboard under <span className="font-mono">WooCommerce → Settings → Advanced → REST API</span>. Grant <span className="font-mono">Read/Write</span> permissions.
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Consumer Key</label>
                      <input
                        type="text"
                        required
                        value={newConn.consumerKey}
                        onChange={(e) => setNewConn({ ...newConn, consumerKey: e.target.value })}
                        placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600 font-mono"
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Consumer Secret</label>
                      <input
                        type="password"
                        required
                        value={newConn.consumerSecret}
                        onChange={(e) => setNewConn({ ...newConn, consumerSecret: e.target.value })}
                        placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600 font-mono"
                        autoComplete="off"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-300/80 leading-relaxed">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Your secret is transmitted once over TLS to establish the connection, then discarded. Only a masked version of the consumer key is persisted.
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {connectStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setConnectStep(1)}
                      className="flex-1 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`flex-1 py-2.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                      connectStep === 2
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-purple-600 hover:bg-purple-500'
                    }`}
                  >
                    {connectStep === 2 ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Connect Store</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
