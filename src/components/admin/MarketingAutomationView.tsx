import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Megaphone,
  Share2,
  Mail,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Tag,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  Flame,
  Users,
  Copy
} from 'lucide-react';
import { motion } from 'motion/react';

export const MarketingAutomationView: React.FC = () => {
  const { coupons, addCoupon, deleteCoupon, addToast, formatPrice } = useStore();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'tiktok' | 'abandoned' | 'coupons'>('tiktok');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);

  const [tiktokLeads] = useState([
    { id: 'tt-1', username: '@tech_guru_pk', campaign: '4K Laser Projector Showcase', views: '284K', conversions: 42, revenue: 14700, status: 'Viral' },
    { id: 'tt-2', username: '@digital_deals_hub', campaign: 'Windows 11 Pro Flash Drop', views: '112K', conversions: 89, revenue: 1779, status: 'Active' },
    { id: 'tt-3', username: '@stream_central', campaign: 'IPTV 4K Ultra 2026 Test', views: '94K', conversions: 65, revenue: 5850, status: 'Active' }
  ]);

  const [abandonedCarts] = useState([
    { id: 'ac-1', email: 'hamza.dev@gmail.com', items: '4K Cinema Laser Projector (x1)', total: 499.99, abandonedAt: '42 mins ago', recoverySent: true, status: 'Email + SMS Dispatched' },
    { id: 'ac-2', email: 'sara_v@studio.net', items: 'Canva Pro 1Y + Windows 11 Pro', total: 49.98, abandonedAt: '2 hours ago', recoverySent: true, status: 'Coupon PLAYBEAT10 Applied' },
    { id: 'ac-3', email: 'kareem.t@outlook.com', items: 'Steam $100 Card (x2)', total: 199.98, abandonedAt: '5 hours ago', recoverySent: false, status: 'Pending Trigger' }
  ]);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon({
      id: `c-${Date.now()}`,
      code: newCouponCode.toUpperCase().trim(),
      discountType: 'percentage',
      discountValue: Number(newCouponDiscount),
      minOrderAmount: 20,
      usageCount: 0,
      maxUsage: 500,
      isActive: true,
      expiresAt: '2026-12-31'
    });
    setNewCouponCode('');
    addToast('success', 'Coupon Created', `Promo code ${newCouponCode.toUpperCase()} activated.`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#10182A] border border-[#26334A] shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#1769FF] text-xs font-mono font-bold uppercase tracking-widest mb-1">
            <Megaphone className="w-4 h-4 text-[#FF304F]" />
            <span>Growth & Social Automation</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Marketing, TikTok Leads & Retention Engine</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automate TikTok social leads attribution, abandoned cart SMS/email recovery, and promotional discount codes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['tiktok', 'abandoned', 'coupons'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-[#1769FF] text-white shadow-md'
                  : 'btn-secondary text-slate-300'
              }`}
            >
              {tab === 'tiktok' ? 'TikTok Leads' : tab === 'abandoned' ? 'Abandoned Carts' : 'Discount Coupons'}
            </button>
          ))}
        </div>
      </div>

      {/* TIKTOK LEADS TAB */}
      {activeTab === 'tiktok' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#10182A] border border-[#26334A]">
              <div className="text-xs text-slate-400 font-mono uppercase">TikTok Sourced Views</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">490,000+</div>
              <div className="text-[11px] text-[#00D99A] mt-1 font-mono">Top Viral Conversion: 18.2%</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#10182A] border border-[#1769FF]/30">
              <div className="text-xs text-[#287BFF] font-mono uppercase">Attributed Orders</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">196 Orders</div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">UTM Tracking: @playbeat_digital</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#10182A] border border-[#00D99A]/30">
              <div className="text-xs text-[#00D99A] font-mono uppercase">Attributed Revenue</div>
              <div className="text-2xl font-bold text-[#00D99A] font-mono mt-1">{formatPrice(22329)}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">ROI: 840%</div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#10182A] border border-[#26334A] overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#26334A] flex items-center justify-between">
              <div className="font-bold text-white text-sm uppercase tracking-wider font-mono">
                Active TikTok Influencer & Ad Creatives
              </div>
              <span className="text-xs text-[#FF304F] font-mono font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                Live Attribution
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08152F] border-b border-[#26334A] text-slate-400 font-mono uppercase">
                  <tr>
                    <th className="py-3 px-4">Influencer / Handle</th>
                    <th className="py-3 px-4">Campaign Focus</th>
                    <th className="py-3 px-4">Organic Views</th>
                    <th className="py-3 px-4">Conversions</th>
                    <th className="py-3 px-4">Revenue Generated</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26334A]/50 font-mono">
                  {tiktokLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#121C30]">
                      <td className="py-3.5 px-4 font-bold text-white">{lead.username}</td>
                      <td className="py-3.5 px-4 text-slate-300">{lead.campaign}</td>
                      <td className="py-3.5 px-4 text-[#1769FF] font-bold">{lead.views}</td>
                      <td className="py-3.5 px-4 text-slate-200">{lead.conversions} units</td>
                      <td className="py-3.5 px-4 text-[#00D99A] font-bold">{formatPrice(lead.revenue)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#00D99A]/15 text-[#00D99A] border border-[#00D99A]/30">
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABANDONED CARTS TAB */}
      {activeTab === 'abandoned' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#10182A] border border-[#26334A] flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">Automated Recovery Workflow</div>
              <div className="text-xs text-slate-400">Triggers automated WhatsApp concierge + Email with personalized 10% discount after 30 mins of inactivity.</div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00D99A]/15 text-[#00D99A] border border-[#00D99A]/30">
              Workflow Active (3-Step Sequence)
            </span>
          </div>

          <div className="rounded-2xl bg-[#10182A] border border-[#26334A] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08152F] border-b border-[#26334A] text-slate-400 font-mono uppercase">
                  <tr>
                    <th className="py-3 px-4">Target Email</th>
                    <th className="py-3 px-4">Abandoned Products</th>
                    <th className="py-3 px-4">Cart Value</th>
                    <th className="py-3 px-4">Timing</th>
                    <th className="py-3 px-4">Recovery Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26334A]/50">
                  {abandonedCarts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-[#121C30]">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{cart.email}</td>
                      <td className="py-3.5 px-4 text-slate-300 truncate max-w-xs">{cart.items}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1769FF]">{formatPrice(cart.total)}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{cart.abandonedAt}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1769FF]/15 text-[#287BFF] border border-[#1769FF]/30">
                          {cart.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => addToast('success', 'Recovery Triggered', `WhatsApp & Email nudge dispatched to ${cart.email}`)}
                          className="px-2.5 py-1 rounded-lg btn-primary text-xs font-bold"
                        >
                          Send WhatsApp Nudge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#10182A] border border-[#26334A]">
            <form onSubmit={handleCreateCoupon} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  required
                  placeholder="Coupon Code (e.g. PLAYBEAT20, VIPDROP)"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#08152F] border border-[#26334A] rounded-xl px-4 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-[#1769FF]"
                />
              </div>
              <div className="w-full sm:w-44">
                <input
                  type="number"
                  required
                  min="1"
                  max="90"
                  placeholder="Discount %"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                  className="w-full bg-[#08152F] border border-[#26334A] rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#1769FF]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 rounded-xl btn-primary text-xs font-bold uppercase tracking-wider shrink-0"
              >
                Create Promo Code
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="p-4 rounded-2xl bg-[#10182A] border border-[#26334A] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{coupon.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFC928]/15 text-[#FFC928] border border-[#FFC928]/30">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `Rs ${coupon.discountValue.toLocaleString()} OFF`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Used: {coupon.usageCount} / {coupon.maxUsage} times
                  </div>
                </div>
                <button
                  onClick={() => deleteCoupon(coupon.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF304F] hover:bg-red-950/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
