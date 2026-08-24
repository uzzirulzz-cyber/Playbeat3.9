import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Lock,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VaultKeyRecord {
  id: string;
  productId: string;
  productTitle: string;
  type: 'license_key' | 'account_credentials' | 'activation_token';
  secretPayload: string;
  status: 'available' | 'reserved' | 'dispatched' | 'expired';
  customerEmail?: string;
  orderNumber?: string;
  assignedAt?: string;
  expiresAt?: string;
  batchTag: string;
}

export const LicenseVaultManager: React.FC = () => {
  const { products, addToast } = useStore();
  const [unmaskedId, setUnmaskedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved' | 'dispatched' | 'expired'>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');

  const [vaultKeys, setVaultKeys] = useState<VaultKeyRecord[]>([
    {
      id: 'vk-101',
      productId: 'win-11-pro',
      productTitle: 'Windows 11 Professional (OEM Instant Key)',
      type: 'license_key',
      secretPayload: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
      status: 'available',
      batchTag: 'OEM-MICROSOFT-BATCH-994',
      expiresAt: 'Lifetime'
    },
    {
      id: 'vk-102',
      productId: 'win-11-pro',
      productTitle: 'Windows 11 Professional (OEM Instant Key)',
      type: 'license_key',
      secretPayload: 'MH37W-N47XK-V7XM9-C7227-GCQG9',
      status: 'available',
      batchTag: 'OEM-MICROSOFT-BATCH-994',
      expiresAt: 'Lifetime'
    },
    {
      id: 'vk-103',
      productId: 'canva-pro-1y',
      productTitle: 'Canva Pro EDU & Team Invite (1 Year Access)',
      type: 'account_credentials',
      secretPayload: 'team-invite:canva-edu-992@playbeat.pro | pass: Canvas#2026!Global',
      status: 'dispatched',
      customerEmail: 'alex.rivers@gmail.com',
      orderNumber: 'ORD-1092',
      assignedAt: '2026-08-19T14:32:00Z',
      batchTag: 'CANVA-EDU-BATCH-14',
      expiresAt: '2027-08-19'
    },
    {
      id: 'vk-104',
      productId: 'iptv-4k-1y',
      productTitle: 'PlayBeat IPTV 4K Ultra Server (1 Year Access)',
      type: 'account_credentials',
      secretPayload: 'm3u:http://stream.playbeat.pro:8080/get.php?username=pb_user_4491&password=pb_pass_9921&type=m3u_plus',
      status: 'dispatched',
      customerEmail: 'damian.t@outlook.com',
      orderNumber: 'ORD-1094',
      assignedAt: '2026-08-20T08:00:00Z',
      batchTag: 'IPTV-ULTRA-BATCH-02',
      expiresAt: '2027-08-20'
    },
    {
      id: 'vk-105',
      productId: 'steam-gift-100',
      productTitle: 'Steam Wallet $100 Global Digital Card',
      type: 'license_key',
      secretPayload: 'STM-USD-100-9948-2819-0012',
      status: 'available',
      batchTag: 'VALVE-STEAM-GIFT-882',
      expiresAt: 'No Expiry'
    },
    {
      id: 'vk-106',
      productId: 'netflix-4k-uhd',
      productTitle: 'Netflix Premium 4K UHD Profile (Private PIN)',
      type: 'account_credentials',
      secretPayload: 'netflix_acc:vip.watch99@stream.io | pass: Netf#994!Global | PIN: 8492',
      status: 'reserved',
      customerEmail: 'pending.checkout@example.com',
      orderNumber: 'ORD-PENDING-44',
      batchTag: 'NETFLIX-UHD-BATCH-09'
    }
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('success', 'Copied to Clipboard', 'License credentials copied securely.');
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = importText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const targetProduct = products.find(p => p.id === selectedProductId) || products[0];
    const newRecords: VaultKeyRecord[] = lines.map((line, idx) => ({
      id: `vk-${Date.now()}-${idx}`,
      productId: targetProduct.id,
      productTitle: targetProduct.title,
      type: 'license_key',
      secretPayload: line,
      status: 'available',
      batchTag: `IMPORT-${new Date().toISOString().slice(0, 10)}`,
      expiresAt: 'Lifetime'
    }));

    setVaultKeys(prev => [...newRecords, ...prev]);
    setIsImportModalOpen(false);
    setImportText('');
    addToast('success', 'Vault Stock Updated', `Successfully imported ${lines.length} license keys into vault.`);
  };

  const filteredKeys = vaultKeys.filter(k => {
    const matchesSearch = k.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.batchTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (k.customerEmail && k.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (k.orderNumber && k.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || k.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = vaultKeys.filter(k => k.status === 'available').length;
  const dispatchedCount = vaultKeys.filter(k => k.status === 'dispatched').length;
  const reservedCount = vaultKeys.filter(k => k.status === 'reserved').length;

  return (
    <div className="space-y-6">
      {/* HEADER & SUMMARY KPIS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#10182A] border border-[#26334A] shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#1769FF] text-xs font-mono font-bold uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4 text-[#00D99A]" />
            <span>Digital Assets & Activation Vault</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Encrypted License & Credentials Vault</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automated instant dispatch engine with credential masking, batch key ingestion, and real-time inventory locking.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Import Batch Keys</span>
          </button>
        </div>
      </div>

      {/* VAULT KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#10182A] border border-[#26334A]">
          <div className="text-xs text-slate-400 font-mono uppercase">Total Vault Stock</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{vaultKeys.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#1769FF]" />
            <span>Encrypted at Rest</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10182A] border border-[#00D99A]/30">
          <div className="text-xs text-[#00D99A] font-mono uppercase">Available for Dispatch</div>
          <div className="text-2xl font-bold text-[#00D99A] font-mono mt-1">{availableCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for automated fulfillment</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10182A] border border-[#1769FF]/30">
          <div className="text-xs text-[#287BFF] font-mono uppercase">Dispatched to Customers</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{dispatchedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Claimed via Customer Portal</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10182A] border border-[#FFC928]/30">
          <div className="text-xs text-[#FFC928] font-mono uppercase">Reserved / In Cart</div>
          <div className="text-2xl font-bold text-[#FFC928] font-mono mt-1">{reservedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">15-minute checkout reservation</div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#10182A] border border-[#26334A]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keys, products, orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#08152F] border border-[#26334A] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#1769FF]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {(['all', 'available', 'reserved', 'dispatched'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#1769FF] text-white font-bold'
                  : 'btn-secondary text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* VAULT TABLE */}
      <div className="rounded-2xl bg-[#10182A] border border-[#26334A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#08152F] border-b border-[#26334A] text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product / Item</th>
                <th className="py-3 px-4">Secret Credentials (Masked)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Assigned Order</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26334A]/50">
              {filteredKeys.map((keyItem) => {
                const isUnmasked = unmaskedId === keyItem.id;
                return (
                  <tr key={keyItem.id} className="hover:bg-[#121C30] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white truncate max-w-xs">{keyItem.productTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{keyItem.id}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded bg-[#070B14] border border-[#26334A] text-xs ${
                          isUnmasked ? 'text-[#00D99A] font-bold' : 'text-slate-400'
                        }`}>
                          {isUnmasked ? keyItem.secretPayload : '●●●●-●●●●-●●●●-●●●●'}
                        </span>
                        <button
                          onClick={() => setUnmaskedId(isUnmasked ? null : keyItem.id)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title={isUnmasked ? 'Mask Key' : 'Reveal Secret'}
                        >
                          {isUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#1769FF]" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(keyItem.secretPayload)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Copy Secret"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        keyItem.status === 'available'
                          ? 'bg-[#00D99A]/15 text-[#00D99A] border border-[#00D99A]/30'
                          : keyItem.status === 'dispatched'
                          ? 'bg-[#1769FF]/15 text-[#287BFF] border border-[#1769FF]/30'
                          : 'bg-[#FFC928]/15 text-[#FFC928] border border-[#FFC928]/30'
                      }`}>
                        {keyItem.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {keyItem.batchTag}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {keyItem.orderNumber ? (
                        <div>
                          <div className="text-white font-bold">{keyItem.orderNumber}</div>
                          <div className="text-[10px] text-slate-400">{keyItem.customerEmail}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard(keyItem.secretPayload)}
                        className="px-2.5 py-1 rounded-lg btn-secondary text-xs text-slate-300 hover:text-white"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BATCH IMPORT MODAL */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#10182A] border border-[#26334A] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#26334A] pb-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#1769FF]" />
                  <h3 className="font-bold text-white text-base">Batch Ingest Digital Licenses</h3>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBulkImport} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Assign To Product Catalog Item
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-[#08152F] border border-[#26334A] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#1769FF]"
                  >
                    {products.filter(p => p.productType === 'digital').map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.sku})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    License Keys (One per line)
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={`W269N-WFGWX-YVC9B-4J6C9-T83GX\nMH37W-N47XK-V7XM9-C7227-GCQG9\nDPH2V-TTNVB-4X9Q3-TJR4H-KHJW4`}
                    className="w-full bg-[#08152F] border border-[#26334A] rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-[#1769FF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 rounded-xl btn-secondary text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl btn-primary text-xs font-bold uppercase tracking-wider"
                  >
                    Ingest Keys to Vault
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
