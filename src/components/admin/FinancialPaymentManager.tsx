import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
  Smartphone,
  Bitcoin,
  RefreshCw,
  Download,
  Filter,
  Check,
  X,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Transaction {
  id: string;
  orderId: string;
  gateway: 'jazzcash' | 'easypaisa' | 'stripe' | 'lemonsqueezy' | 'bank_transfer' | 'crypto_usdt';
  amount: number;
  fee: number;
  net: number;
  currency: string;
  customer: string;
  status: 'settled' | 'pending_verification' | 'disputed' | 'refunded';
  proofUrl?: string;
  createdAt: string;
}

export const FinancialPaymentManager: React.FC = () => {
  const { formatPrice, addToast } = useStore();

  const [activeGatewayTab, setActiveGatewayTab] = useState<'all' | 'pakistan' | 'international' | 'crypto'>('all');
  const [selectedProof, setSelectedProof] = useState<Transaction | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-9941',
      orderId: 'ORD-1095',
      gateway: 'jazzcash',
      amount: 499.99,
      fee: 4.99,
      net: 495.00,
      currency: 'USD (PKR Eqv)',
      customer: 'bilal.khan@cyber.pk',
      status: 'pending_verification',
      proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      createdAt: '2026-08-20T11:45:00Z'
    },
    {
      id: 'tx-9940',
      orderId: 'ORD-1094',
      gateway: 'stripe',
      amount: 89.99,
      fee: 2.91,
      net: 87.08,
      currency: 'USD',
      customer: 'damian.t@outlook.com',
      status: 'settled',
      createdAt: '2026-08-20T08:12:00Z'
    },
    {
      id: 'tx-9939',
      orderId: 'ORD-1093',
      gateway: 'crypto_usdt',
      amount: 140.00,
      fee: 1.00,
      net: 139.00,
      currency: 'USDT (TRC20)',
      customer: '0x9a8f...4e12',
      status: 'settled',
      createdAt: '2026-08-19T21:30:00Z'
    },
    {
      id: 'tx-9938',
      orderId: 'ORD-1092',
      gateway: 'easypaisa',
      amount: 29.99,
      fee: 0.30,
      net: 29.69,
      currency: 'USD (PKR Eqv)',
      customer: 'alex.rivers@gmail.com',
      status: 'settled',
      createdAt: '2026-08-19T14:32:00Z'
    },
    {
      id: 'tx-9937',
      orderId: 'ORD-1091',
      gateway: 'lemonsqueezy',
      amount: 49.99,
      fee: 2.75,
      net: 47.24,
      currency: 'USD',
      customer: 'sophie.m@designstudio.io',
      status: 'settled',
      createdAt: '2026-08-18T16:00:00Z'
    }
  ]);

  const handleApproveTransaction = (txId: string) => {
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'settled' } : t));
    setSelectedProof(null);
    addToast('success', 'Payment Verified & Settled', 'Funds cleared and automated digital delivery dispatched.');
  };

  const handleRejectTransaction = (txId: string) => {
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'disputed' } : t));
    setSelectedProof(null);
    addToast('error', 'Payment Flagged', 'Manual receipt rejected. Customer notified via email/SMS.');
  };

  const totalGross = transactions.filter(t => t.status === 'settled').reduce((sum, t) => sum + t.amount, 0);
  const totalFees = transactions.filter(t => t.status === 'settled').reduce((sum, t) => sum + t.fee, 0);
  const netProfit = totalGross - totalFees;
  const pendingVerification = transactions.filter(t => t.status === 'pending_verification').reduce((sum, t) => sum + t.amount, 0);

  const getGatewayBadge = (gw: Transaction['gateway']) => {
    switch (gw) {
      case 'jazzcash':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF304F]/15 text-[#FF304F] border border-[#FF304F]/30">JazzCash Auto</span>;
      case 'easypaisa':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00D99A]/15 text-[#00D99A] border border-[#00D99A]/30">Easypaisa</span>;
      case 'stripe':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1769FF]/15 text-[#287BFF] border border-[#1769FF]/30">Stripe CC</span>;
      case 'lemonsqueezy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFC928]/15 text-[#FFC928] border border-[#FFC928]/30">Lemon Squeezy</span>;
      case 'crypto_usdt':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">Crypto USDT</span>;
      case 'bank_transfer':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-700/50 text-slate-300 border border-slate-600">Bank Wire (IBAN)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#10182A] border border-[#26334A] shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#1769FF] text-xs font-mono font-bold uppercase tracking-widest mb-1">
            <DollarSign className="w-4 h-4 text-[#00D99A]" />
            <span>Financial Balance & Multi-Gateway Reconciliation</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Payment Gateways & Ledger Center</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live multi-currency reconciliation for JazzCash, Easypaisa, Stripe, Lemon Squeezy, Bank Wire, and TRC20 Crypto.
          </p>
        </div>

        <button
          onClick={() => addToast('info', 'Ledger Exported', 'CSV statement generated for accounting.')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-secondary text-xs text-slate-200 hover:text-white"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#10182A] border border-[#26334A]">
          <div className="text-xs text-slate-400 font-mono uppercase">Settled Gross Volume</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{formatPrice(totalGross)}</div>
          <div className="text-[11px] text-[#00D99A] mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.4% this week</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10182A] border border-[#00D99A]/30">
          <div className="text-xs text-[#00D99A] font-mono uppercase">Net Profit Margin</div>
          <div className="text-2xl font-bold text-[#00D99A] font-mono mt-1">{formatPrice(netProfit)}</div>
          <div className="text-[11px] text-slate-400 mt-1">96.8% Average Efficiency</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10182A] border border-[#FFC928]/30">
          <div className="text-xs text-[#FFC928] font-mono uppercase">Pending Proofs / In Escrow</div>
          <div className="text-2xl font-bold text-[#FFC928] font-mono mt-1">{formatPrice(pendingVerification)}</div>
          <div className="text-[11px] text-[#FFC928] mt-1">1 manual proof awaiting review</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10182A] border border-[#26334A]">
          <div className="text-xs text-slate-400 font-mono uppercase">Gateway Processing Fees</div>
          <div className="text-2xl font-bold text-slate-300 font-mono mt-1">{formatPrice(totalFees)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Automated tax withholding applied</div>
        </div>
      </div>

      {/* GATEWAY CONNECTION STATUS — INTERACTIVE (add / edit / remove / configure) */}
      <GatewayManager />

      {/* TRANSACTIONS RECONCILIATION TABLE */}
      <div className="rounded-2xl bg-[#10182A] border border-[#26334A] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#26334A] flex items-center justify-between">
          <div className="font-bold text-white text-sm uppercase tracking-wider font-mono">
            Recent Multi-Gateway Transactions
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#08152F] border-b border-[#26334A] text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction / Order</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Gross Amount</th>
                <th className="py-3 px-4">Gateway Fee</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26334A]/50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#121C30] transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-white">{tx.orderId}</div>
                    <div className="text-[10px] text-slate-500">{tx.id}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    {getGatewayBadge(tx.gateway)}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {formatPrice(tx.amount)}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    -{formatPrice(tx.fee)}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-[#00D99A]">
                    {formatPrice(tx.net)}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 truncate max-w-xs">
                    {tx.customer}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      tx.status === 'settled'
                        ? 'bg-[#00D99A]/15 text-[#00D99A] border border-[#00D99A]/30'
                        : tx.status === 'pending_verification'
                        ? 'bg-[#FFC928]/15 text-[#FFC928] border border-[#FFC928]/30 animate-pulse'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}>
                      {tx.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {tx.status === 'pending_verification' && tx.proofUrl ? (
                      <button
                        onClick={() => setSelectedProof(tx)}
                        className="px-3 py-1 rounded-lg bg-[#FFC928]/20 text-[#FFC928] hover:bg-[#FFC928]/30 border border-[#FFC928]/40 text-xs font-bold"
                      >
                        Review Receipt
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500">Auto-Reconciled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROOF REVIEW MODAL */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[#10182A] border border-[#26334A] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#26334A] pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Manual Payment Proof Review</h3>
                <div className="text-xs text-slate-400 font-mono">Order {selectedProof.orderId} • {formatPrice(selectedProof.amount)}</div>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-[#26334A] max-h-60 bg-black flex items-center justify-center">
                <img src={selectedProof.proofUrl} alt="Payment Receipt" className="object-contain max-h-60 w-full" />
              </div>
              <div className="text-xs text-slate-300 bg-[#08152F] p-3 rounded-xl border border-[#26334A] space-y-1 font-mono">
                <div>Customer: {selectedProof.customer}</div>
                <div>Gateway: {selectedProof.gateway.toUpperCase()}</div>
                <div>Submitted At: {new Date(selectedProof.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleRejectTransaction(selectedProof.id)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/40 text-[#FF304F] border border-[#FF304F]/40 hover:bg-[#FF304F]/20 text-xs font-bold"
              >
                <X className="w-4 h-4" />
                <span>Reject Proof</span>
              </button>
              <button
                onClick={() => handleApproveTransaction(selectedProof.id)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#00D99A]/20 text-[#00D99A] border border-[#00D99A]/40 hover:bg-[#00D99A]/30 text-xs font-bold"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Deliver</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// GatewayManager — Interactive payment gateway CRUD
// Add / edit / remove / configure / enable / disable payment gateways.
// State is local (component-level) — in production this would persist to the
// `gateways` MongoDB collection via /api/admin/gateways endpoints.
// ============================================================================
interface Gateway {
  id: string;
  name: string;
  type: 'jazzcash' | 'easypaisa' | 'stripe' | 'lemonsqueezy' | 'bank_transfer' | 'crypto_usdt' | 'paypal' | 'custom';
  status: 'active' | 'inactive' | 'sandbox' | 'error';
  fee: string;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  merchantId?: string;
  iban?: string;
  walletAddress?: string;
  notes?: string;
}

const GATEWAY_TYPES: { value: Gateway['type']; label: string; defaultFee: string; icon: React.ReactNode }[] = [
  { value: 'jazzcash',     label: 'JazzCash',         defaultFee: '1.2%',          icon: <Smartphone className="w-3.5 h-3.5 text-[#FF304F]" /> },
  { value: 'easypaisa',    label: 'Easypaisa',       defaultFee: '1.0%',          icon: <Smartphone className="w-3.5 h-3.5 text-[#00D99A]" /> },
  { value: 'stripe',       label: 'Stripe',           defaultFee: '2.9% + $0.30',  icon: <CreditCard className="w-3.5 h-3.5 text-[#1769FF]" /> },
  { value: 'lemonsqueezy', label: 'Lemon Squeezy',   defaultFee: '5.0% + $0.50',  icon: <CreditCard className="w-3.5 h-3.5 text-[#FFC928]" /> },
  { value: 'paypal',       label: 'PayPal',           defaultFee: '3.49% + $0.49',  icon: <CreditCard className="w-3.5 h-3.5 text-blue-400" /> },
  { value: 'bank_transfer',label: 'Bank Wire (IBAN)', defaultFee: '$0.00 (manual)', icon: <Building className="w-3.5 h-3.5 text-slate-300" /> },
  { value: 'crypto_usdt',  label: 'Crypto USDT TRC20', defaultFee: '$1.00 flat',  icon: <Bitcoin className="w-3.5 h-3.5 text-purple-400" /> },
  { value: 'custom',       label: 'Custom Gateway',   defaultFee: '—',              icon: <CreditCard className="w-3.5 h-3.5 text-slate-300" /> },
];

const STATUS_META: Record<Gateway['status'], { label: string; color: string; dot: string }> = {
  active:   { label: 'Active',       color: 'text-[#00D99A] bg-[#00D99A]/10 border-[#00D99A]/30', dot: 'bg-[#00D99A] animate-pulse' },
  inactive: { label: 'Inactive',     color: 'text-slate-400 bg-white/5 border-white/10',           dot: 'bg-slate-500' },
  sandbox:  { label: 'Sandbox',      color: 'text-[#FFC928] bg-[#FFC928]/10 border-[#FFC928]/30',  dot: 'bg-[#FFC928]' },
  error:    { label: 'Error',        color: 'text-[#FF304F] bg-[#FF304F]/10 border-[#FF304F]/30',  dot: 'bg-[#FF304F]' },
};

const GatewayManager: React.FC = () => {
  const { addToast } = useStore();
  const [gateways, setGateways] = useState<Gateway[]>([
    { id: 'gw-jazzcash', name: 'JazzCash Direct', type: 'jazzcash', status: 'active', fee: '1.2%', merchantId: 'MC-PB-9941', apiKey: 'jc_live_****', notes: 'Pakistan local cards + wallets' },
    { id: 'gw-easypaisa', name: 'Easypaisa QR', type: 'easypaisa', status: 'active', fee: '1.0%', merchantId: 'EP-PB-2042', apiKey: 'ep_live_****', notes: 'QR-based instant settlement' },
    { id: 'gw-stripe', name: 'Stripe Global', type: 'stripe', status: 'active', fee: '2.9% + $0.30', apiKey: 'sk_live_****', webhookUrl: 'https://playbeat.digital/api/webhooks/stripe' },
    { id: 'gw-lemonsqueezy', name: 'Lemon Squeezy', type: 'lemonsqueezy', status: 'sandbox', fee: '5.0% + $0.50', apiKey: 'lem_test_****', notes: 'Merchant of Record for EU/US tax' },
    { id: 'gw-usdt', name: 'Crypto USDT TRC20', type: 'crypto_usdt', status: 'active', fee: '$1.00 flat', walletAddress: 'TXYZ1234****5678', notes: 'Hot wallet auto-confirmations' },
  ]);

  const [editing, setEditing] = useState<Gateway | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Gateway | null>(null);

  const openAdd = () => {
    setEditing({
      id: `gw-${Date.now()}`,
      name: '',
      type: 'stripe',
      status: 'inactive',
      fee: '2.9% + $0.30',
    });
    setIsEditorOpen(true);
  };

  const openEdit = (gw: Gateway) => {
    setEditing({ ...gw });
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      addToast('error', 'Validation Error', 'Gateway name is required.');
      return;
    }
    setGateways((prev) => {
      const exists = prev.find((g) => g.id === editing.id);
      if (exists) {
        addToast('success', 'Gateway Updated', `${editing.name} configuration saved.`);
        return prev.map((g) => (g.id === editing.id ? editing : g));
      } else {
        addToast('success', 'Gateway Added', `${editing.name} added to payment gateways.`);
        return [editing, ...prev];
      }
    });
    setIsEditorOpen(false);
    setEditing(null);
  };

  const handleDelete = (gw: Gateway) => {
    setGateways((prev) => prev.filter((g) => g.id !== gw.id));
    addToast('info', 'Gateway Removed', `${gw.name} has been removed from payment gateways.`);
    setConfirmDelete(null);
  };

  const toggleStatus = (gw: Gateway) => {
    const next: Gateway['status'] = gw.status === 'active' ? 'inactive' : 'active';
    setGateways((prev) => prev.map((g) => (g.id === gw.id ? { ...g, status: next } : g)));
    addToast('info', 'Status Updated', `${gw.name} is now ${next.toUpperCase()}.`);
  };

  return (
    <div className="rounded-2xl bg-[#10182A] border border-[#26334A] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-[#26334A] flex items-center justify-between">
        <div className="font-bold text-white text-sm uppercase tracking-wider font-mono flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#1769FF]" />
          Payment Gateways Configuration
        </div>
        <button
          onClick={openAdd}
          className="px-3 py-1.5 rounded-lg bg-[#1769FF]/20 text-[#287BFF] hover:bg-[#1769FF]/30 border border-[#1769FF]/40 text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="w-3 h-3" /> Add Gateway
        </button>
      </div>

      {/* Gateway grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {gateways.map((gw) => {
          const meta = GATEWAY_TYPES.find((t) => t.value === gw.type);
          const status = STATUS_META[gw.status];
          return (
            <div
              key={gw.id}
              className="p-4 rounded-xl bg-[#0E1626] border border-[#26334A] hover:border-[#1769FF]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {meta?.icon || <CreditCard className="w-4 h-4 text-slate-300" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{gw.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">{meta?.label}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${status.color} flex items-center gap-1 shrink-0`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 font-mono space-y-0.5 mb-3">
                <div>Fee: <span className="text-slate-200">{gw.fee}</span></div>
                {gw.merchantId && <div>Merchant: <span className="text-slate-200">{gw.merchantId}</span></div>}
                {gw.apiKey && <div>API Key: <span className="text-slate-200 font-mono">{gw.apiKey}</span></div>}
                {gw.walletAddress && <div>Wallet: <span className="text-slate-200 font-mono">{gw.walletAddress}</span></div>}
                {gw.iban && <div>IBAN: <span className="text-slate-200 font-mono">{gw.iban}</span></div>}
                {gw.webhookUrl && <div>Webhook: <span className="text-slate-200 truncate">{gw.webhookUrl}</span></div>}
                {gw.notes && <div className="italic text-slate-500">{gw.notes}</div>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 pt-2 border-t border-white/5">
                <button
                  onClick={() => toggleStatus(gw)}
                  className="flex-1 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title={gw.status === 'active' ? 'Disable gateway' : 'Enable gateway'}
                >
                  {gw.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => openEdit(gw)}
                  className="flex-1 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#1769FF]/15 hover:bg-[#1769FF]/25 text-[#287BFF] transition-colors"
                  title="Edit / Configure gateway"
                >
                  Configure
                </button>
                <button
                  onClick={() => setConfirmDelete(gw)}
                  className="px-2 py-1.5 rounded-md text-[10px] bg-[#FF304F]/10 hover:bg-[#FF304F]/20 text-[#FF304F] transition-colors"
                  title="Remove gateway"
                  aria-label={`Remove ${gw.name}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl bg-[#151a23] border border-[#26334A] shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#1769FF]" />
                  <h3 className="text-base font-bold text-white font-display">
                    {gateways.find((g) => g.id === editing.id) ? 'Configure' : 'Add'} Gateway
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Gateway Name</label>
                  <input
                    type="text"
                    required
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="e.g. JazzCash Direct"
                    className="input-sharp w-full px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Type</label>
                    <select
                      value={editing.type}
                      onChange={(e) => {
                        const newType = e.target.value as Gateway['type'];
                        const meta = GATEWAY_TYPES.find((t) => t.value === newType);
                        setEditing({ ...editing, type: newType, fee: meta?.defaultFee || editing.fee });
                      }}
                      className="input-sharp w-full px-2 py-2 text-xs text-white"
                    >
                      {GATEWAY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Status</label>
                    <select
                      value={editing.status}
                      onChange={(e) => setEditing({ ...editing, status: e.target.value as Gateway['status'] })}
                      className="input-sharp w-full px-2 py-2 text-xs text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="sandbox">Sandbox</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Fee</label>
                  <input
                    type="text"
                    value={editing.fee}
                    onChange={(e) => setEditing({ ...editing, fee: e.target.value })}
                    placeholder="e.g. 2.9% + $0.30"
                    className="input-sharp w-full px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">API Key</label>
                  <input
                    type="text"
                    value={editing.apiKey || ''}
                    onChange={(e) => setEditing({ ...editing, apiKey: e.target.value })}
                    placeholder="sk_live_... (stored encrypted)"
                    className="input-sharp w-full px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">API Secret</label>
                  <input
                    type="password"
                    value={editing.apiSecret || ''}
                    onChange={(e) => setEditing({ ...editing, apiSecret: e.target.value })}
                    placeholder="•••••••• (stored encrypted)"
                    className="input-sharp w-full px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Webhook URL</label>
                  <input
                    type="text"
                    value={editing.webhookUrl || ''}
                    onChange={(e) => setEditing({ ...editing, webhookUrl: e.target.value })}
                    placeholder="https://playbeat.digital/api/webhooks/..."
                    className="input-sharp w-full px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Merchant ID</label>
                  <input
                    type="text"
                    value={editing.merchantId || ''}
                    onChange={(e) => setEditing({ ...editing, merchantId: e.target.value })}
                    placeholder="MC-XXXX-XXXX"
                    className="input-sharp w-full px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">IBAN / Wallet Address</label>
                  <input
                    type="text"
                    value={editing.iban || editing.walletAddress || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (editing.type === 'bank_transfer') setEditing({ ...editing, iban: v });
                      else if (editing.type === 'crypto_usdt') setEditing({ ...editing, walletAddress: v });
                      else setEditing({ ...editing, iban: v });
                    }}
                    placeholder={editing.type === 'crypto_usdt' ? 'TXYZ...' : editing.type === 'bank_transfer' ? 'PK36SCBL...' : 'Account reference'}
                    className="input-sharp w-full px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Notes</label>
                  <textarea
                    value={editing.notes || ''}
                    onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                    placeholder="Internal notes, settlement schedule, etc."
                    rows={2}
                    className="input-sharp w-full px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-lg bg-[#1769FF] hover:bg-[#287BFF] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Gateway</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl bg-[#151a23] border border-[#FF304F]/30 shadow-2xl p-6 z-10"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#FF304F]/15 border border-[#FF304F]/30 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-[#FF304F]" />
                </div>
                <h3 className="text-base font-bold text-white font-display">Remove Gateway?</h3>
              </div>
              <p className="text-xs text-gray-300 mb-5 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-white">{confirmDelete.name}</span>? This will disable all transactions through this gateway.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 rounded-lg bg-[#FF304F] hover:bg-[#ff4f6f] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
