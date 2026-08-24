import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { JazzCashTxStatus } from '../../types';
import { Smartphone, Search, CheckCircle2, XCircle, Clock, RefreshCcw, Wallet, CreditCard, Building2, QrCode } from 'lucide-react';

const STATUS_META: Record<JazzCashTxStatus, { pill: string; label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  success: { pill: 'admin-pill-green', label: 'Success', icon: CheckCircle2, color: 'text-emerald-400' },
  failed: { pill: 'admin-pill-red', label: 'Failed', icon: XCircle, color: 'text-red-400' },
  pending: { pill: 'admin-pill-amber', label: 'Pending', icon: Clock, color: 'text-amber-400' },
  refunded: { pill: 'admin-pill-purple', label: 'Refunded', icon: RefreshCcw, color: 'text-purple-400' },
};

const METHOD_META: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  wallet: { icon: Wallet, label: 'Wallet' },
  card: { icon: CreditCard, label: 'Card' },
  iban: { icon: Building2, label: 'IBAN' },
  qr: { icon: QrCode, label: 'QR' },
};

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const JazzCashMerchant: React.FC = () => {
  const { jazzcashTransactions, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JazzCashTxStatus>('all');

  const filtered = jazzcashTransactions.filter(tx => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return tx.reference.toLowerCase().includes(q) ||
             tx.customerName.toLowerCase().includes(q) ||
             tx.customerEmail.toLowerCase().includes(q);
    }
    return true;
  });

  // Stats
  const total = jazzcashTransactions.length;
  const successCount = jazzcashTransactions.filter(t => t.status === 'success').length;
  const failedCount = jazzcashTransactions.filter(t => t.status === 'failed').length;
  const pendingCount = jazzcashTransactions.filter(t => t.status === 'pending').length;
  const totalVolume = jazzcashTransactions.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="admin-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">JazzCash & Merchant</h1>
            <p className="text-xs text-gray-500 mt-0.5">Transaction search, settlement reports, and merchant configuration.</p>
          </div>
        </div>

        {/* Merchant info bar */}
        <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937] mt-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] text-gray-300 font-mono">Merchant ID: <span className="text-white font-bold">MC-PlayBeat-001</span></span>
          </div>
          <span className="admin-pill-green">Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Total Transactions</div>
            <div className="text-xl font-bold text-white mt-1">{total}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Successful</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{successCount}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Pending</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{pendingCount}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Volume (Success)</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">Rs {totalVolume.toLocaleString('en-PK')}</div>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0f141c] border border-[#1f2937]">
          {(['all', 'success', 'failed', 'pending', 'refunded'] as const).map((s) => (
            <button
              key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors ${
                statusFilter === s ? 'bg-red-600/30 text-red-300' : 'text-gray-500 hover:text-gray-300'
              }`}
            >{s}</button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text" placeholder="Search by reference, name, email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-sharp pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 w-full sm:w-80"
          />
        </div>
      </div>

      {/* Transactions table */}
      <div className="admin-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-gray-500">
            No transactions match your search.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500 uppercase text-[10px] tracking-wider font-mono bg-[#0f141c]">
                  <th className="p-3 font-medium">Reference</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Method</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/60">
                {filtered.map((tx) => {
                  const status = STATUS_META[tx.status];
                  const StatusIcon = status.icon;
                  const method = METHOD_META[tx.method];
                  const MethodIcon = method.icon;
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 font-mono text-white text-[11px]">{tx.reference}</td>
                      <td className="p-3">
                        <div className="text-white font-medium">{tx.customerName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{tx.customerEmail}</div>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="text-emerald-400 font-bold">Rs {tx.amount.toLocaleString('en-PK')}</span>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-1.5 text-gray-300 text-[11px]">
                          <MethodIcon className="w-3 h-3 text-gray-400" />
                          {method.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`${status.pill} flex items-center gap-1 w-fit`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400 font-mono text-[11px]">{formatDate(tx.timestamp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
