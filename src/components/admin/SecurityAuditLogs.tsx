import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldAlert, Activity, Lock, Key, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Shield, Eye } from 'lucide-react';

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const daysSince = (iso: string): number => {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
};

const daysUntil = (lastRotated: string, intervalDays: number): number => {
  const nextDue = new Date(lastRotated).getTime() + intervalDays * 24 * 60 * 60 * 1000;
  return Math.ceil((nextDue - Date.now()) / (1000 * 60 * 60 * 24));
};

export const SecurityAuditLogs: React.FC = () => {
  const { adminLogs, loginAttempts, secretRotations, rotateSecret, addToast } = useStore();
  const [logTab, setLogTab] = useState<'audit' | 'logins' | 'secrets'>('audit');

  // Stats
  const failedLogins = loginAttempts.filter(l => !l.success).length;
  const successLogins = loginAttempts.filter(l => l.success).length;
  const overdueSecrets = secretRotations.filter(s => s.isOverdue).length;

  // Group audit logs by action type for a quick overview
  const auditByType = adminLogs.reduce((acc, log) => {
    const type = log.targetType;
    if (!acc[type]) acc[type] = 0;
    acc[type]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="admin-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">Security & Audit Logs</h1>
            <p className="text-xs text-gray-500 mt-0.5">Audit trail, login attempts, and secrets rotation status.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono"><Activity className="w-2.5 h-2.5" /><span>Audit Entries</span></div>
            <div className="text-xl font-bold text-white mt-1">{adminLogs.length}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono"><CheckCircle2 className="w-2.5 h-2.5" /><span>Successful Logins</span></div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{successLogins}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono"><XCircle className="w-2.5 h-2.5" /><span>Failed Logins</span></div>
            <div className={`text-xl font-bold mt-1 ${failedLogins > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{failedLogins}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono"><AlertTriangle className="w-2.5 h-2.5" /><span>Secrets Overdue</span></div>
            <div className={`text-xl font-bold mt-1 ${overdueSecrets > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{overdueSecrets}</div>
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0f141c] border border-[#1f2937] w-fit">
        {([
          { id: 'audit', label: 'Audit Log', icon: Activity },
          { id: 'logins', label: 'Login Attempts', icon: Lock },
          { id: 'secrets', label: 'Secrets Rotation', icon: Key },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id} onClick={() => setLogTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                logTab === tab.id ? 'bg-red-600/30 text-red-300' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* AUDIT LOG */}
      {logTab === 'audit' && (
        <div className="admin-card overflow-hidden">
          {/* By-type summary */}
          <div className="p-4 border-b border-[#1f2937] flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase text-gray-500 tracking-wider font-mono mr-2">By Type:</span>
            {Object.entries(auditByType).map(([type, count]) => (
              <span key={type} className="admin-pill-blue !text-[9px]">
                {type}: {count}
              </span>
            ))}
          </div>
          <div className="overflow-x-auto scrollbar-thin max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0">
                <tr className="border-b border-[#1f2937] text-gray-500 uppercase text-[10px] tracking-wider font-mono bg-[#0f141c]">
                  <th className="p-3 font-medium">Timestamp</th>
                  <th className="p-3 font-medium">Admin</th>
                  <th className="p-3 font-medium">Action</th>
                  <th className="p-3 font-medium">Target</th>
                  <th className="p-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/60">
                {adminLogs.slice(0, 30).map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-gray-400 font-mono text-[10px] whitespace-nowrap">{formatDate(log.timestamp)}</td>
                    <td className="p-3">
                      <div className="text-white font-medium">{log.adminName}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{log.adminEmail}</div>
                    </td>
                    <td className="p-3">
                      <span className="text-white">{log.action}</span>
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                        log.targetType === 'product' ? 'bg-blue-500/15 text-blue-400' :
                        log.targetType === 'order' ? 'bg-emerald-500/15 text-emerald-400' :
                        log.targetType === 'inventory' ? 'bg-amber-500/15 text-amber-400' :
                        log.targetType === 'import' ? 'bg-purple-500/15 text-purple-400' :
                        'bg-gray-500/15 text-gray-400'
                      }`}>{log.targetType}</span>
                    </td>
                    <td className="p-3 text-gray-300 font-mono text-[11px]">{log.targetId || '—'}</td>
                    <td className="p-3 text-gray-400 text-[11px] max-w-md">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOGIN ATTEMPTS */}
      {logTab === 'logins' && (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500 uppercase text-[10px] tracking-wider font-mono bg-[#0f141c]">
                  <th className="p-3 font-medium">Timestamp</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">IP Address</th>
                  <th className="p-3 font-medium">Geo</th>
                  <th className="p-3 font-medium">User Agent</th>
                  <th className="p-3 font-medium text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/60">
                {loginAttempts.map((attempt) => (
                  <tr key={attempt.id} className={`hover:bg-white/[0.02] transition-colors ${!attempt.success ? 'bg-red-500/[0.02]' : ''}`}>
                    <td className="p-3 text-gray-400 font-mono text-[10px] whitespace-nowrap">{formatDate(attempt.timestamp)}</td>
                    <td className="p-3 font-mono text-gray-300 text-[11px]">{attempt.email}</td>
                    <td className="p-3 font-mono text-gray-300 text-[11px]">{attempt.ipAddress}</td>
                    <td className="p-3 text-gray-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        {attempt.geo.includes('Unknown') ? <AlertTriangle className="w-3 h-3 text-amber-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {attempt.geo}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 font-mono text-[10px] truncate max-w-[180px]">{attempt.userAgent}</td>
                    <td className="p-3 text-right">
                      {attempt.success ? (
                        <span className="admin-pill-green">Success</span>
                      ) : (
                        <span className="admin-pill-red">Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {failedLogins > 0 && (
            <div className="p-4 border-t border-[#1f2937] flex items-start gap-2 bg-red-500/[0.03]">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-red-300 leading-relaxed">
                <span className="font-bold">{failedLogins} failed login attempts</span> detected — review the IP addresses and consider enabling rate limiting or 2FA enforcement if these are not from your team.
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECRETS ROTATION */}
      {logTab === 'secrets' && (
        <div>
          <div className="admin-card p-4 mb-3 flex items-start gap-3 bg-amber-500/[0.03]">
            <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-gray-300 leading-relaxed">
              <span className="font-bold">Rotation policy:</span> Secrets should be rotated on a regular cadence. Overdue secrets are highlighted in red. After rotating, update your environment variables and restart the affected service. Secrets are never displayed here — only their rotation status.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {secretRotations.map((secret) => {
              const daysSinceRotation = daysSince(secret.lastRotatedAt);
              const daysToNext = daysUntil(secret.lastRotatedAt, secret.rotationIntervalDays);
              const progressPercent = Math.min(100, Math.max(0, ((secret.rotationIntervalDays - daysToNext) / secret.rotationIntervalDays) * 100));
              return (
                <div key={secret.id} className={`admin-card p-4 ${secret.isOverdue ? 'border-red-500/40' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        secret.isOverdue ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        <Key className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{secret.secretName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">Rotate every {secret.rotationIntervalDays}d</div>
                      </div>
                    </div>
                    {secret.isOverdue ? (
                      <span className="admin-pill-red">Overdue</span>
                    ) : (
                      <span className="admin-pill-green">Healthy</span>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-gray-500">Last rotated {daysSinceRotation}d ago</span>
                      <span className={`font-mono ${secret.isOverdue ? 'text-red-400' : daysToNext <= 7 ? 'text-amber-400' : 'text-gray-400'}`}>
                        {secret.isOverdue ? `${Math.abs(daysToNext)}d overdue` : `${daysToNext}d left`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          secret.isOverdue ? 'bg-red-500' : daysToNext <= 7 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 font-mono mb-3">
                    Last: {formatDate(secret.lastRotatedAt)}
                  </div>

                  <button
                    onClick={() => rotateSecret(secret.id)}
                    className="w-full py-2 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-[11px] font-bold uppercase tracking-wider border border-blue-500/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Rotate Now</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
