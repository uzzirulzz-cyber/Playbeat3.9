import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { IptvServer, IptvServerStatus } from '../../types';
import {
  Plus,
  Tv,
  Activity,
  Users,
  Globe,
  Zap,
  RefreshCw,
  Trash2,
  Key,
  Power,
  Copy,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Server,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_COLORS: Record<IptvServerStatus, { dot: string; pill: string; label: string }> = {
  online: { dot: 'bg-emerald-400', pill: 'admin-pill-green', label: 'Online' },
  offline: { dot: 'bg-red-400', pill: 'admin-pill-red', label: 'Offline' },
  degraded: { dot: 'bg-amber-400', pill: 'admin-pill-amber', label: 'Degraded' },
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

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const IptvM3uManager: React.FC = () => {
  const {
    iptvServers,
    iptvCredentials,
    addIptvServer,
    toggleIptvServer,
    deleteIptvServer,
    refreshIptvServerHealth,
    provisionIptvCredential,
    revokeIptvCredential,
    addToast,
  } = useStore();

  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [copiedCred, setCopiedCred] = useState<string | null>(null);

  // Add-server form state
  const [newServer, setNewServer] = useState({
    name: '',
    endpointUrl: '',
    location: '',
    provider: '',
    maxConnections: 1000,
  });

  // Provision-credential form state
  const [newCred, setNewCred] = useState({
    assignedTo: '',
    serverId: iptvServers[0]?.id || '',
    expiresAt: '',
  });

  // ---- Aggregate stats ----
  const totalServers = iptvServers.length;
  const onlineServers = iptvServers.filter(s => s.status === 'online').length;
  const totalChannels = iptvServers.reduce((sum, s) => sum + s.channels, 0);
  const totalActiveCreds = iptvCredentials.filter(c => c.status === 'active').length;
  const avgUptime = totalServers > 0
    ? (iptvServers.reduce((sum, s) => sum + s.uptime, 0) / totalServers).toFixed(2)
    : '0';

  const handleAddServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServer.name || !newServer.endpointUrl) {
      addToast('error', 'Missing Fields', 'Server name and endpoint URL are required.');
      return;
    }
    addIptvServer({
      name: newServer.name,
      endpointUrl: newServer.endpointUrl,
      playlistUrl: newServer.endpointUrl,
      status: 'online',
      channels: 0,
      maxConnections: Number(newServer.maxConnections) || 1000,
      uptime: 100,
      bufferRate: 0,
      location: newServer.location || 'Unspecified',
      provider: newServer.provider || 'Unspecified',
      isActive: true,
    });
    setNewServer({ name: '', endpointUrl: '', location: '', provider: '', maxConnections: 1000 });
    setIsAddServerOpen(false);
  };

  const handleProvision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCred.assignedTo || !newCred.serverId || !newCred.expiresAt) {
      addToast('error', 'Missing Fields', 'All fields are required to provision a credential.');
      return;
    }
    provisionIptvCredential(newCred);
    setNewCred({ assignedTo: '', serverId: iptvServers[0]?.id || '', expiresAt: '' });
    setIsProvisionOpen(false);
  };

  const handleRefreshHealth = (id: string) => {
    setRefreshingId(id);
    refreshIptvServerHealth(id);
    setTimeout(() => setRefreshingId(null), 800);
  };

  const handleCopyCred = (username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedCred(username);
    addToast('success', 'Username Copied', `${username} copied to clipboard.`);
    setTimeout(() => setCopiedCred(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* ============================================
          HEADER + STATS
          ============================================ */}
      <div className="admin-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Tv className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-display">IPTV M3U Servers</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage M3U endpoints, monitor health, and dispatch subscriber credentials.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProvisionOpen(true)}
              className="admin-gold-pill"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Provision Credential</span>
            </button>
            <button
              onClick={() => setIsAddServerOpen(true)}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Server</span>
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Total Servers</div>
            <div className="text-xl font-bold text-white mt-1">{totalServers}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">{onlineServers} online</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Total Channels</div>
            <div className="text-xl font-bold text-white mt-1">{totalChannels.toLocaleString()}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">across all nodes</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Active Credentials</div>
            <div className="text-xl font-bold text-white mt-1">{totalActiveCreds}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{iptvCredentials.length - totalActiveCreds} expired/revoked</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Avg Uptime</div>
            <div className="text-xl font-bold text-white mt-1">{avgUptime}%</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">last 30 days</div>
          </div>
        </div>
      </div>

      {/* ============================================
          SERVER GRID
          ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-gray-400" />
            <span>Server Registry ({iptvServers.length})</span>
          </h2>
        </div>
        {iptvServers.length === 0 ? (
          <div className="admin-card p-10 text-center">
            <Tv className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No IPTV servers configured yet.</p>
            <button
              onClick={() => setIsAddServerOpen(true)}
              className="mt-3 admin-gold-pill"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Server</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {iptvServers.map((server) => {
              const status = STATUS_COLORS[server.status];
              const loadPercent = server.maxConnections > 0 ? (server.activeConnections / server.maxConnections) * 100 : 0;
              const isRefreshing = refreshingId === server.id;
              return (
                <div key={server.id} className="admin-card p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        server.status === 'online' ? 'bg-emerald-500/15 text-emerald-400' :
                        server.status === 'degraded' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>
                        <Tv className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{server.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono truncate">{server.location} · {server.provider}</div>
                      </div>
                    </div>
                    <span className={`${status.pill} flex items-center gap-1.5 shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${server.status === 'online' ? 'animate-pulse' : ''}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Endpoint URL */}
                  <div className="p-2.5 rounded-lg bg-[#0f141c] border border-[#1f2937] mb-3">
                    <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono mb-0.5">Endpoint</div>
                    <div className="text-[11px] text-gray-300 font-mono truncate">{server.endpointUrl}</div>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div>
                      <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono">Channels</div>
                      <div className="text-sm font-bold text-white font-mono">{server.channels.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono">Uptime</div>
                      <div className={`text-sm font-bold font-mono ${server.uptime > 99 ? 'text-emerald-400' : server.uptime > 95 ? 'text-amber-400' : 'text-red-400'}`}>{server.uptime}%</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono">Buffer</div>
                      <div className={`text-sm font-bold font-mono ${server.bufferRate < 1 ? 'text-emerald-400' : server.bufferRate < 2 ? 'text-amber-400' : 'text-red-400'}`}>{server.bufferRate}%</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono">Capacity</div>
                      <div className="text-sm font-bold text-white font-mono">{server.activeConnections}/{server.maxConnections}</div>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-3">
                    <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${loadPercent > 80 ? 'bg-red-500' : loadPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, loadPercent)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">
                      {loadPercent.toFixed(1)}% load · last probed {timeAgo(server.lastCheckedAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#1f2937]">
                    <button
                      onClick={() => handleRefreshHealth(server.id)}
                      disabled={isRefreshing || server.status === 'offline'}
                      className="flex-1 py-2 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 hover:text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isRefreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>Re-check</span>
                    </button>
                    <button
                      onClick={() => toggleIptvServer(server.id)}
                      className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                        server.isActive
                          ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{server.isActive ? 'Pause' : 'Activate'}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove ${server.name}? All assigned credentials will be revoked.`)) {
                          deleteIptvServer(server.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-[#1f2937] hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors"
                      aria-label="Delete server"
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
          CREDENTIALS TABLE
          ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-gray-400" />
            <span>Subscriber Credentials ({iptvCredentials.length})</span>
          </h2>
          <button
            onClick={() => setIsProvisionOpen(true)}
            className="text-[11px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Provision New
          </button>
        </div>
        <div className="admin-card overflow-hidden">
          {iptvCredentials.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-500">
              No credentials issued yet. Click "Provision Credential" to issue IPTV access.
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#1f2937] text-gray-500 uppercase text-[10px] tracking-wider font-mono bg-[#0f141c]">
                    <th className="p-3 font-medium">Username</th>
                    <th className="p-3 font-medium">Assigned To</th>
                    <th className="p-3 font-medium">Server</th>
                    <th className="p-3 font-medium">Expires</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]/60">
                  {iptvCredentials.map((cred) => (
                    <tr key={cred.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white text-[11px]">{cred.username}</span>
                          <button
                            onClick={() => handleCopyCred(cred.username)}
                            className="p-1 rounded text-gray-500 hover:text-white transition-colors"
                            aria-label="Copy username"
                          >
                            <Copy className={`w-3 h-3 ${copiedCred === cred.username ? 'text-emerald-400' : ''}`} />
                          </button>
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono mt-0.5">Password: {cred.passwordMasked}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-300">{cred.assignedTo}</div>
                        {cred.lastUsedAt && (
                          <div className="text-[10px] text-gray-600 font-mono">last used {timeAgo(cred.lastUsedAt)}</div>
                        )}
                      </td>
                      <td className="p-3 text-gray-300">{cred.serverName}</td>
                      <td className="p-3">
                        <div className="text-gray-300">{formatDate(cred.expiresAt)}</div>
                        {new Date(cred.expiresAt) < new Date() && cred.status === 'active' && (
                          <div className="text-[10px] text-red-400 mt-0.5">expired</div>
                        )}
                      </td>
                      <td className="p-3">
                        {cred.status === 'active' && <span className="admin-pill-green">Active</span>}
                        {cred.status === 'expired' && <span className="admin-pill-amber">Expired</span>}
                        {cred.status === 'revoked' && <span className="admin-pill-red">Revoked</span>}
                      </td>
                      <td className="p-3 text-right">
                        {cred.status === 'active' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Revoke IPTV access for ${cred.assignedTo}?`)) {
                                revokeIptvCredential(cred.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/30"
                          >
                            Revoke
                          </button>
                        )}
                        {cred.status !== 'active' && (
                          <span className="text-[10px] text-gray-600 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ============================================
          ADD SERVER MODAL
          ============================================ */}
      <AnimatePresence>
        {isAddServerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddServerOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl bg-[#151a23] border border-[#252b3b] shadow-2xl p-6 z-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-server-title"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  <h3 id="add-server-title" className="text-base font-bold text-white font-display">Add IPTV Server</h3>
                </div>
                <button onClick={() => setIsAddServerOpen(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAddServer} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Server Name</label>
                  <input
                    type="text"
                    required
                    value={newServer.name}
                    onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                    placeholder="e.g. EU Primary — Frankfurt"
                    className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">M3U Endpoint URL</label>
                  <input
                    type="url"
                    required
                    value={newServer.endpointUrl}
                    onChange={(e) => setNewServer({ ...newServer, endpointUrl: e.target.value })}
                    placeholder="https://m3u.playbeat.digital/.../playlist.m3u8"
                    className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={newServer.location}
                      onChange={(e) => setNewServer({ ...newServer, location: e.target.value })}
                      placeholder="Frankfurt, DE"
                      className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Provider</label>
                    <input
                      type="text"
                      value={newServer.provider}
                      onChange={(e) => setNewServer({ ...newServer, provider: e.target.value })}
                      placeholder="CrystalPeak CDN"
                      className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Max Connections</label>
                  <input
                    type="number"
                    min="1"
                    value={newServer.maxConnections}
                    onChange={(e) => setNewServer({ ...newServer, maxConnections: Number(e.target.value) })}
                    className="input-sharp w-full px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button type="button" onClick={() => setIsAddServerOpen(false)} className="flex-1 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 text-xs font-bold uppercase tracking-wider">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider">
                    Add Server
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================
          PROVISION CREDENTIAL MODAL
          ============================================ */}
      <AnimatePresence>
        {isProvisionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProvisionOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-[#151a23] border border-[#252b3b] shadow-2xl p-6 z-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="provision-title"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <h3 id="provision-title" className="text-base font-bold text-white font-display">Provision IPTV Credential</h3>
                </div>
                <button onClick={() => setIsProvisionOpen(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleProvision} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Assign To (Customer Email)</label>
                  <input
                    type="email"
                    required
                    value={newCred.assignedTo}
                    onChange={(e) => setNewCred({ ...newCred, assignedTo: e.target.value })}
                    placeholder="customer@example.com"
                    className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Target Server</label>
                  <select
                    required
                    value={newCred.serverId}
                    onChange={(e) => setNewCred({ ...newCred, serverId: e.target.value })}
                    className="input-sharp w-full px-3 py-2 text-xs text-white"
                  >
                    {iptvServers.filter(s => s.isActive).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Expires At</label>
                  <input
                    type="date"
                    required
                    value={newCred.expiresAt}
                    onChange={(e) => setNewCred({ ...newCred, expiresAt: new Date(e.target.value).toISOString() })}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-sharp w-full px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-300/80 leading-relaxed">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  A unique username and password will be generated automatically. The real password is only shown once at provisioning time and never stored client-side.
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button type="button" onClick={() => setIsProvisionOpen(false)} className="flex-1 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 text-xs font-bold uppercase tracking-wider">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider">
                    Provision
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
