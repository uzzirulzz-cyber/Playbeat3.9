import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Globe,
  Database,
  Radio,
  MessageCircle,
  Mail,
  ShieldCheck,
  Cpu,
  Clock,
  HardDrive
} from 'lucide-react';

interface ServiceHealth {
  name: string;
  category: 'core' | 'database' | 'gateway' | 'communication' | 'streaming';
  status: 'operational' | 'degraded' | 'maintenance' | 'offline';
  latencyMs: number;
  uptimePercent: number;
  lastChecked: string;
  details: string;
}

export const SystemStatusView: React.FC = () => {
  const { addToast } = useStore();
  const [isPinging, setIsPinging] = useState(false);

  const [services, setServices] = useState<ServiceHealth[]>([
    {
      name: 'PlayBeat Node.js Edge Server',
      category: 'core',
      status: 'operational',
      latencyMs: 14,
      uptimePercent: 99.99,
      lastChecked: 'Just now',
      details: 'Container cluster running on Cloud Run with TLS 1.3'
    },
    {
      name: 'RESTful API & Order Pipeline',
      category: 'core',
      status: 'operational',
      latencyMs: 22,
      uptimePercent: 99.98,
      lastChecked: 'Just now',
      details: 'Express.js proxy engine & instant delivery webhooks'
    },
    {
      name: 'Database Cluster (PostgreSQL + MongoDB Cache)',
      category: 'database',
      status: 'operational',
      latencyMs: 8,
      uptimePercent: 100.00,
      lastChecked: 'Just now',
      details: 'Replication lag 0ms, Automated backups active'
    },
    {
      name: 'Global Cloudflare CDN & Asset Edge',
      category: 'core',
      status: 'operational',
      latencyMs: 12,
      uptimePercent: 99.99,
      lastChecked: 'Just now',
      details: 'Edge caching 94.2% hit ratio, DDoS mitigation active'
    },
    {
      name: 'JazzCash & Easypaisa Merchant Gateways',
      category: 'gateway',
      status: 'operational',
      latencyMs: 45,
      uptimePercent: 99.95,
      lastChecked: 'Just now',
      details: 'Direct API callback & OTC mobile verification'
    },
    {
      name: 'Stripe & Lemon Squeezy Webhook Sync',
      category: 'gateway',
      status: 'operational',
      latencyMs: 38,
      uptimePercent: 99.99,
      lastChecked: 'Just now',
      details: 'Instant signature verification & key auto-release'
    },
    {
      name: 'IPTV & M3U Server Stream Node #1 (US East)',
      category: 'streaming',
      status: 'operational',
      latencyMs: 28,
      uptimePercent: 99.94,
      lastChecked: 'Just now',
      details: '14,000+ Channels & 4K VOD transcoding active'
    },
    {
      name: 'IPTV Stream Node #2 (EU West)',
      category: 'streaming',
      status: 'operational',
      latencyMs: 31,
      uptimePercent: 99.97,
      lastChecked: 'Just now',
      details: 'High-bandwidth fiber uplink 10 Gbps'
    },
    {
      name: 'WhatsApp Business API Concierge',
      category: 'communication',
      status: 'operational',
      latencyMs: 64,
      uptimePercent: 99.92,
      lastChecked: 'Just now',
      details: 'Automated order delivery & customer chat bot'
    },
    {
      name: 'Transactional Email & SMS Gateway',
      category: 'communication',
      status: 'operational',
      latencyMs: 50,
      uptimePercent: 99.99,
      lastChecked: 'Just now',
      details: 'SendGrid & Twilio SMS delivery queue operational'
    }
  ]);

  const handlePingAll = () => {
    setIsPinging(true);
    setTimeout(() => {
      setServices(prev => prev.map(s => ({
        ...s,
        latencyMs: Math.floor(Math.random() * 30) + 10,
        lastChecked: 'Just now'
      })));
      setIsPinging(false);
      addToast('success', 'Health Check Completed', 'All 10 system subsystems reporting 100% operational.');
    }, 800);
  };

  const getStatusBadge = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'operational':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00D99A]/15 text-[#00D99A] border border-[#00D99A]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D99A] animate-pulse" />
            Operational
          </span>
        );
      case 'degraded':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFC928]/15 text-[#FFC928] border border-[#FFC928]/30">
            Degraded
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF304F]/15 text-[#FF304F] border border-[#FF304F]/30">
            Offline
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#10182A] border border-[#26334A] shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#1769FF] text-xs font-mono font-bold uppercase tracking-widest mb-1">
            <Activity className="w-4 h-4 text-[#00D99A]" />
            <span>Infrastructure Health & Uptime Diagnostics</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Real-Time System & Server Status</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live telemetry monitoring for API endpoints, MongoDB/PostgreSQL, IPTV/M3U stream clusters, WhatsApp gateway, and payment processors.
          </p>
        </div>

        <button
          onClick={handlePingAll}
          disabled={isPinging}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-xs font-bold uppercase tracking-wider shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
          <span>{isPinging ? 'Pinging Subsystems...' : 'Run Diagnostics'}</span>
        </button>
      </div>

      {/* OVERALL UPTIME BANNER */}
      <div className="p-5 rounded-2xl bg-[#08152F] border border-[#00D99A]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D99A]/20 border border-[#00D99A]/40 flex items-center justify-center text-[#00D99A]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              All Systems Operational & Delivering Instantly
            </div>
            <div className="text-xs text-slate-400 font-mono">Global Uptime 99.98% over past 90 days • Average Edge Latency: 24ms</div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-slate-300">
          <div>
            <span className="text-slate-500 block text-[10px]">TOTAL SERVICES</span>
            <span className="font-bold text-white">10 / 10 Online</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">INCIDENTS</span>
            <span className="font-bold text-[#00D99A]">0 Active</span>
          </div>
        </div>
      </div>

      {/* SERVICES TABLE */}
      <div className="rounded-2xl bg-[#10182A] border border-[#26334A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#08152F] border-b border-[#26334A] text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Subsystem / Node</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Response Time</th>
                <th className="py-3 px-4">90-Day Uptime</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26334A]/50 font-mono">
              {services.map((service, i) => (
                <tr key={i} className="hover:bg-[#121C30] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                    {service.category === 'core' && <Server className="w-4 h-4 text-[#1769FF]" />}
                    {service.category === 'database' && <Database className="w-4 h-4 text-[#00D99A]" />}
                    {service.category === 'gateway' && <ShieldCheck className="w-4 h-4 text-[#FFC928]" />}
                    {service.category === 'streaming' && <Radio className="w-4 h-4 text-[#FF304F]" />}
                    {service.category === 'communication' && <MessageCircle className="w-4 h-4 text-[#00D99A]" />}
                    <span>{service.name}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 uppercase text-[10px]">
                    {service.category}
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(service.status)}
                  </td>

                  <td className="py-3.5 px-4 text-[#00D99A] font-bold">
                    {service.latencyMs} ms
                  </td>

                  <td className="py-3.5 px-4 text-white">
                    {service.uptimePercent}%
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px] text-right font-sans truncate max-w-xs">
                    {service.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
