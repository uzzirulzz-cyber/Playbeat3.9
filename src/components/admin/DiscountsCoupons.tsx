import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Coupon } from '../../types';
import { Plus, Tag, Trash2, X, AlertCircle, Copy, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

export const DiscountsCoupons: React.FC = () => {
  const { coupons, addCoupon, deleteCoupon, addToast, formatPrice } = useStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '', discountType: 'percentage' as 'percentage' | 'fixed', discountValue: 15, minOrderAmount: 0, maxUsage: 100, expiryDate: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) { addToast('error', 'Missing Code', 'Promo code is required.'); return; }
    const coupon: Coupon = {
      id: `coupon-${Date.now()}`,
      code: newCoupon.code.toUpperCase(),
      discountType: newCoupon.discountType,
      discountValue: Number(newCoupon.discountValue),
      minOrderAmount: Number(newCoupon.minOrderAmount) || undefined,
      maxUsage: Number(newCoupon.maxUsage) || undefined,
      usageCount: 0,
      isActive: true,
      status: 'active',
      expiresAt: newCoupon.expiryDate ? new Date(newCoupon.expiryDate).toISOString() : undefined,
    };
    addCoupon(coupon);
    setNewCoupon({ code: '', discountType: 'percentage', discountValue: 15, minOrderAmount: 0, maxUsage: 100, expiryDate: '' });
    setIsCreateOpen(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    addToast('success', 'Code Copied', `${code} copied to clipboard.`);
  };

  // Stats
  const activeCount = coupons.filter(c => c.status === 'active' || c.isActive).length;
  const expiredCount = coupons.filter(c => c.status === 'expired').length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const totalDiscountGiven = coupons.reduce((sum, c) => {
    // Approximate — assume avg order of $50, apply discount
    const avg = 50;
    return sum + (c.discountType === 'percentage' ? (avg * c.discountValue / 100) : c.discountValue) * (c.usageCount || 0);
  }, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="admin-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Tag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-display">Discounts & Coupons</h1>
              <p className="text-xs text-gray-500 mt-0.5">Promo codes, BOGO offers, and tiered discounts.</p>
            </div>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /><span>Create Code</span>
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Active Codes</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{activeCount}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Expired</div>
            <div className="text-xl font-bold text-red-400 mt-1">{expiredCount}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Total Redemptions</div>
            <div className="text-xl font-bold text-white mt-1">{totalRedemptions.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Discount Given</div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono">${totalDiscountGiven.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Coupons grid */}
      <div>
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-gray-400" />
          <span>All Coupons ({coupons.length})</span>
        </h2>
        {coupons.length === 0 ? (
          <div className="admin-card p-10 text-center">
            <Tag className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No coupons yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => {
              const usagePercent = coupon.maxUsage ? Math.min(100, ((coupon.usageCount || 0) / coupon.maxUsage) * 100) : 0;
              const isExpired = coupon.status === 'expired' || (coupon.expiresAt && new Date(coupon.expiresAt) < new Date());
              return (
                <div key={coupon.id} className={`admin-card p-5 ${isExpired ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="px-3 py-2 rounded-lg bg-[#0f141c] border border-dashed border-amber-500/40 text-amber-400 font-mono font-bold text-sm hover:bg-amber-500/10 transition-colors flex items-center gap-2"
                    >
                      {coupon.code}<Copy className="w-3 h-3" />
                    </button>
                    {isExpired ? <span className="admin-pill-red">Expired</span> : <span className="admin-pill-green">Active</span>}
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-white font-mono">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono uppercase">{coupon.discountType}</span>
                  </div>

                  <div className="space-y-1.5 text-[11px] mb-3">
                    {coupon.minOrderAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Min Order:</span>
                        <span className="text-gray-300 font-mono">{formatPrice(coupon.minOrderAmount)}</span>
                      </div>
                    )}
                    {coupon.maxUsage && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Usage Limit:</span>
                        <span className="text-gray-300 font-mono">{coupon.usageCount || 0} / {coupon.maxUsage}</span>
                      </div>
                    )}
                    {coupon.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expires:</span>
                        <span className="text-gray-300 font-mono">{new Date(coupon.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {coupon.maxUsage && (
                    <div className="mb-3">
                      <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${usagePercent}%` }} />
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 font-mono">{usagePercent.toFixed(0)}% used</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-[#1f2937]">
                    <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {coupon.usageCount || 0} redemptions
                    </div>
                    <button
                      onClick={() => { if (window.confirm(`Delete coupon ${coupon.code}?`)) deleteCoupon(coupon.id); }}
                      className="p-1.5 rounded-md bg-[#1f2937] hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors"
                      aria-label="Delete coupon"
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

      {/* Create modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md rounded-2xl bg-[#151a23] border border-[#252b3b] shadow-2xl p-6 z-10" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2"><Tag className="w-5 h-5 text-amber-400" /><h3 className="text-base font-bold text-white font-display">Create Promo Code</h3></div>
                <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Code</label>
                  <input type="text" required value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="PLAYBEAT15" className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600 font-mono uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Type</label>
                    <select value={newCoupon.discountType} onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as 'percentage' | 'fixed' })} className="input-sharp w-full px-2 py-2 text-xs text-white">
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Value</label>
                    <input type="number" step="0.01" min="0" required value={newCoupon.discountValue} onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })} className="input-sharp w-full px-3 py-2 text-xs text-white font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Min Order (USD)</label>
                    <input type="number" step="0.01" min="0" value={newCoupon.minOrderAmount} onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })} className="input-sharp w-full px-3 py-2 text-xs text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Usage Limit</label>
                    <input type="number" min="1" value={newCoupon.maxUsage} onChange={(e) => setNewCoupon({ ...newCoupon, maxUsage: Number(e.target.value) })} className="input-sharp w-full px-3 py-2 text-xs text-white font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Expiry Date</label>
                  <input type="date" value={newCoupon.expiryDate} onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })} className="input-sharp w-full px-3 py-2 text-xs text-white" />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 text-xs font-bold uppercase tracking-wider">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider">Create Code</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
