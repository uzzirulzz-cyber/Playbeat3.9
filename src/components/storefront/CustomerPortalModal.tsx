import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import {
  X, User, Key, Truck, Copy, CheckCircle2, Clock, Package,
  ShieldCheck, Download, ExternalLink, MessageCircle, Zap,
  ShoppingBag, Wallet, Gift, Users, Settings, Lock, BadgeCheck,
  Calendar, Mail, Phone, Globe, MapPin, Edit2, Save, Star,
  TrendingUp, Award, AlertCircle, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ProfileTab = 'overview' | 'orders' | 'keys' | 'tracking' | 'personal' | 'social' | 'security' | 'verification';

export const CustomerPortalModal: React.FC = () => {
  const {
    isCustomerPortalOpen,
    setIsCustomerPortalOpen,
    currentUser,
    orders,
    formatPrice,
    addToast,
    setIsWhatsAppModalOpen,
  } = useStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  // Personal info form state (persisted to localStorage)
  const [personalInfo, setPersonalInfo] = useState(() => {
    try {
      const saved = localStorage.getItem(`playbeat-profile-${currentUser.id}`);
      return saved ? JSON.parse(saved) : {
        firstName: '',
        lastName: '',
        nationalId: '',
        gender: '' as '' | 'male' | 'female' | 'rather_not_say',
        dobDay: '',
        dobMonth: '',
        dobYear: '',
        phone: currentUser.phone || '',
        country: currentUser.country || '',
      };
    } catch {
      return {
        firstName: '', lastName: '', nationalId: '',
        gender: '' as '' | 'male' | 'female' | 'rather_not_say',
        dobDay: '', dobMonth: '', dobYear: '',
        phone: currentUser.phone || '', country: currentUser.country || '',
      };
    }
  });

  const savePersonalInfo = () => {
    try {
      localStorage.setItem(`playbeat-profile-${currentUser.id}`, JSON.stringify(personalInfo));
    } catch { /* ignore */ }
    setIsEditingPersonal(false);
    addToast('success', 'Profile Updated', 'Your personal information has been saved.');
  };

  const customerOrders = orders.filter(o => o.userId === currentUser.id || o.customerEmail === currentUser.email);
  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    addToast('success', 'Key Copied', 'Digital license key copied to clipboard.');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const allDigitalKeys = customerOrders.flatMap(o =>
    o.items.filter(item => item.licenseKeys && item.licenseKeys.length > 0).flatMap(item =>
      item.licenseKeys!.map(k => ({ key: k, productTitle: item.productTitle, orderId: o.id, date: o.createdAt, variation: item.variation?.value }))
    )
  );
  const allPhysicalShipments = customerOrders.flatMap(o =>
    o.items.filter(item => item.productType === 'physical_projector').map(item => ({
      productTitle: item.productTitle, orderId: o.id, date: o.createdAt,
      trackingNumber: item.trackingNumber || 'DHL-8492049182', status: o.orderStatus, address: o.shippingAddress
    }))
  );

  // Derived metrics for the profile
  const totalSpent = customerOrders.reduce((s, o) => s + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const playbeatPoints = Math.floor(totalSpent * 10); // 10 points per $1 spent
  const storeCredit = 0; // No store credit system yet
  const availableBalance = 0;
  const memberLevel = totalSpent > 500 ? 'Platinum' : totalSpent > 100 ? 'Gold' : totalSpent > 0 ? 'Silver' : 'Bronze';
  const accountId = currentUser.id.replace('usr-', '').substring(0, 10);

  const NAV_SECTIONS: { id: ProfileTab; label: string; icon: React.ComponentType<{ className?: string }>; group: string }[] = [
    { id: 'overview', label: 'Overview', icon: User, group: 'Account' },
    { id: 'orders', label: 'Purchase Orders', icon: ShoppingBag, group: 'Account' },
    { id: 'keys', label: 'Digital Key Locker', icon: Key, group: 'Account' },
    { id: 'tracking', label: 'Hardware Shipments', icon: Truck, group: 'Account' },
    { id: 'personal', label: 'Personal', icon: Settings, group: 'Settings' },
    { id: 'social', label: 'Social Connect', icon: Users, group: 'Settings' },
    { id: 'security', label: 'Privacy & Security', icon: Lock, group: 'Settings' },
    { id: 'verification', label: 'Verification', icon: BadgeCheck, group: 'Settings' },
  ];

  return (
    <AnimatePresence>
      {isCustomerPortalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsCustomerPortalOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-5xl rounded-3xl bg-[#0F111A] border border-white/15 shadow-2xl z-10 my-6 max-h-[92vh] overflow-hidden flex flex-col"
          >
            {/* ===== HEADER: Avatar + Name + Account ID + Member Level ===== */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#151a23] to-[#0F111A]">
              <div className="flex items-center gap-4">
                {/* Avatar with online status dot */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--pb-red)] to-[var(--pb-red-bright)] flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[var(--pb-emerald)] border-2 border-[#0F111A]" />
                </div>
                {/* Name + Account ID + Level */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white font-display">{currentUser.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--pb-gold)]/15 text-[var(--pb-gold)] text-[10px] font-mono font-bold border border-[var(--pb-gold)]/30 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {memberLevel}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--pb-silver-3)] font-mono mt-0.5 flex items-center gap-3 flex-wrap">
                    <span>ID: {accountId}</span>
                    <span className="text-[var(--pb-silver-4)]">·</span>
                    <span>{currentUser.email}</span>
                    {currentUser.country && (
                      <>
                        <span className="text-[var(--pb-silver-4)]">·</span>
                        <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{currentUser.country}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsCustomerPortalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ===== BODY: Sidebar + Content ===== */}
            <div className="flex flex-1 overflow-hidden">
              {/* SIDEBAR NAVIGATION */}
              <nav className="w-48 sm:w-56 border-r border-white/10 bg-[#0c0e14] overflow-y-auto pb-4 shrink-0 hidden sm:block">
                {['Account', 'Settings'].map((group) => (
                  <div key={group} className="mb-4">
                    <div className="px-4 pt-4 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--pb-silver-4)]">
                      {group}
                    </div>
                    {NAV_SECTIONS.filter(s => s.group === group).map(section => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveTab(section.id)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors ${
                            activeTab === section.id
                              ? 'bg-[var(--pb-red)]/10 text-[var(--pb-red-bright)] border-l-2 border-[var(--pb-red)]'
                              : 'text-[var(--pb-silver-3)] hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{section.label}</span>
                          {section.id === 'orders' && customerOrders.length > 0 && (
                            <span className="ml-auto text-[10px] font-mono text-[var(--pb-silver-4)]">{customerOrders.length}</span>
                          )}
                          {section.id === 'keys' && allDigitalKeys.length > 0 && (
                            <span className="ml-auto text-[10px] font-mono text-[var(--pb-silver-4)]">{allDigitalKeys.length}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* MOBILE TAB BAR (visible on small screens) */}
              <div className="sm:hidden flex overflow-x-auto border-b border-white/10 bg-[#0c0e14]">
                {NAV_SECTIONS.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`px-3 py-2.5 text-[10px] font-medium shrink-0 flex items-center gap-1 border-b-2 ${
                        activeTab === section.id ? 'text-[var(--pb-red-bright)] border-[var(--pb-red)]' : 'text-[var(--pb-silver-3)] border-transparent'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{section.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* MAIN CONTENT */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6">

                {/* ===== OVERVIEW TAB ===== */}
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    {/* Account Balances */}
                    <div>
                      <h3 className="text-xs font-mono font-bold text-[var(--pb-silver-2)] uppercase tracking-wider mb-3">Account Balances</h3>
                      <div className="space-y-2">
                        {/* Store Credit */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#12141F] border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[var(--pb-emerald)]/15 border border-[var(--pb-emerald)]/30 flex items-center justify-center">
                              <Wallet className="w-4 h-4 text-[var(--pb-emerald)]" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">PlayBeat Store Credit</div>
                              <div className="text-[10px] text-[var(--pb-silver-4)]">Redeemable on any purchase</div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-white font-mono">{formatPrice(storeCredit)}</div>
                        </div>
                        {/* PlayBeat Points */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#12141F] border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[var(--pb-gold)]/15 border border-[var(--pb-gold)]/30 flex items-center justify-center">
                              <Award className="w-4 h-4 text-[var(--pb-gold)]" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">PlayBeat Points</div>
                              <div className="text-[10px] text-[var(--pb-silver-4)]">Earn 10 pts per $1 spent</div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-[var(--pb-gold)] font-mono">{playbeatPoints.toLocaleString()} pts</div>
                        </div>
                        {/* Available Balance */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#12141F] border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[var(--pb-red)]/15 border border-[var(--pb-red-line)] flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-[var(--pb-red-bright)]" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">Available Balance</div>
                              <div className="text-[10px] text-[var(--pb-silver-4)]">Withdrawable seller earnings</div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-white font-mono">{formatPrice(availableBalance)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Invite Friends Banner */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/20 border border-purple-500/30 flex items-center justify-between gap-3 cursor-pointer hover:from-purple-600/40 hover:to-pink-600/30 transition-colors"
                      onClick={() => addToast('info', 'Invite Friends', 'Share your referral link to earn PlayBeat Points!')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center">
                          <Gift className="w-5 h-5 text-purple-300" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Invite friends & start earning!</div>
                          <div className="text-[11px] text-purple-300/70">Get 500 PlayBeat Points for each friend who makes their first purchase.</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-purple-300 shrink-0" />
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-[#12141F] border border-white/10 text-center">
                        <div className="text-[10px] font-mono text-[var(--pb-silver-4)] uppercase">Orders</div>
                        <div className="text-lg font-bold text-white font-mono mt-1">{customerOrders.length}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#12141F] border border-white/10 text-center">
                        <div className="text-[10px] font-mono text-[var(--pb-silver-4)] uppercase">Total Spent</div>
                        <div className="text-lg font-bold text-white font-mono mt-1">{formatPrice(totalSpent)}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#12141F] border border-white/10 text-center">
                        <div className="text-[10px] font-mono text-[var(--pb-silver-4)] uppercase">Member Since</div>
                        <div className="text-sm font-bold text-white font-mono mt-1">{new Date(currentUser.createdAt).getFullYear()}</div>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                      <h3 className="text-xs font-mono font-bold text-[var(--pb-silver-2)] uppercase tracking-wider mb-3">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setActiveTab('orders')} className="p-3 rounded-xl bg-[#12141F] border border-white/10 hover:border-[var(--pb-red-line)] text-left transition-colors">
                          <ShoppingBag className="w-4 h-4 text-[var(--pb-red-bright)] mb-1.5" />
                          <div className="text-xs font-bold text-white">View Orders</div>
                          <div className="text-[10px] text-[var(--pb-silver-4)]">{customerOrders.length} purchases</div>
                        </button>
                        <button onClick={() => setActiveTab('keys')} className="p-3 rounded-xl bg-[#12141F] border border-white/10 hover:border-[var(--pb-red-line)] text-left transition-colors">
                          <Key className="w-4 h-4 text-[var(--pb-emerald)] mb-1.5" />
                          <div className="text-xs font-bold text-white">Digital Keys</div>
                          <div className="text-[10px] text-[var(--pb-silver-4)]">{allDigitalKeys.length} licenses</div>
                        </button>
                        <button onClick={() => setActiveTab('personal')} className="p-3 rounded-xl bg-[#12141F] border border-white/10 hover:border-[var(--pb-red-line)] text-left transition-colors">
                          <Settings className="w-4 h-4 text-[var(--pb-silver-2)] mb-1.5" />
                          <div className="text-xs font-bold text-white">Edit Profile</div>
                          <div className="text-[10px] text-[var(--pb-silver-4)]">Personal info</div>
                        </button>
                        <button onClick={() => setActiveTab('security')} className="p-3 rounded-xl bg-[#12141F] border border-white/10 hover:border-[var(--pb-red-line)] text-left transition-colors">
                          <Lock className="w-4 h-4 text-[var(--pb-gold)] mb-1.5" />
                          <div className="text-xs font-bold text-white">Security</div>
                          <div className="text-[10px] text-[var(--pb-silver-4)]">Password & 2FA</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== PURCHASE ORDERS TAB ===== */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[var(--pb-red-bright)]" />
                        Purchase Orders
                      </h3>
                      <span className="text-[10px] font-mono text-[var(--pb-silver-4)]">{customerOrders.length} total</span>
                    </div>

                    {/* Banner for gift cards / different product types */}
                    <div className="p-3 rounded-xl bg-[var(--pb-gold)]/5 border border-[var(--pb-gold)]/15 flex items-center justify-between gap-3">
                      <div className="text-[11px] text-[var(--pb-silver-2)]">
                        To view Gift Cards, Games, Game Coaching, GamePal, Game Coins, Items, Accounts, Telco, Software & Apps, or Payment Cards orders.
                      </div>
                      <button
                        onClick={() => addToast('info', 'All Orders', 'Showing all order types in your account.')}
                        className="px-3 py-1.5 rounded-lg bg-[var(--pb-red)] text-white text-[10px] font-bold flex items-center gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" /> View All
                      </button>
                    </div>

                    {/* Orders Table */}
                    {customerOrders.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-[#141622] border border-white/5 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                          <AlertCircle className="w-6 h-6 text-[var(--pb-silver-4)]" />
                        </div>
                        <div className="text-sm font-bold text-white">No orders yet</div>
                        <p className="text-xs text-[var(--pb-silver-3)] max-w-sm mx-auto">
                          You haven't placed any orders yet. Browse the catalog and make your first purchase to see it here.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-[#12141F] border border-white/10 overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#0c0e14] border-b border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--pb-silver-4)]">
                          <div className="col-span-3">Order Date</div>
                          <div className="col-span-4">Product</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Status</div>
                          <div className="col-span-1 text-right">Price</div>
                        </div>
                        {/* Table rows */}
                        {customerOrders.map((ord) => (
                          <div key={ord.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 text-xs items-center hover:bg-white/[0.02]">
                            <div className="col-span-3 text-[var(--pb-silver-2)] font-mono">
                              {new Date(ord.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="col-span-4 text-white font-medium truncate">
                              {ord.items[0]?.productTitle || 'Multiple Items'}
                              {ord.items.length > 1 && <span className="text-[var(--pb-silver-4)] ml-1">+{ord.items.length - 1} more</span>}
                            </div>
                            <div className="col-span-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                ord.items[0]?.productType === 'physical_projector'
                                  ? 'bg-blue-500/15 text-blue-400'
                                  : 'bg-emerald-500/15 text-emerald-400'
                              }`}>
                                {ord.items[0]?.productType === 'physical_projector' ? 'Physical' : 'Digital'}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                ord.orderStatus === 'completed' || ord.orderStatus === 'shipped'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : ord.orderStatus === 'processing'
                                  ? 'bg-amber-500/15 text-amber-400'
                                  : 'bg-white/10 text-[var(--pb-silver-2)]'
                              }`}>
                                {ord.orderStatus}
                              </span>
                            </div>
                            <div className="col-span-1 text-right text-white font-mono font-bold">
                              {formatPrice(ord.total)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== DIGITAL KEY LOCKER TAB ===== */}
                {activeTab === 'keys' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                        <Key className="w-4 h-4 text-[var(--pb-emerald)]" />
                        Digital Key Locker
                      </h3>
                      <span className="text-[10px] font-mono text-[var(--pb-silver-4)]">{allDigitalKeys.length} keys</span>
                    </div>
                    {allDigitalKeys.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-[#141622] border border-white/5 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                          <Key className="w-6 h-6 text-[var(--pb-silver-4)]" />
                        </div>
                        <div className="text-sm font-bold text-white">No digital license keys yet</div>
                        <p className="text-xs text-[var(--pb-silver-3)]">When you purchase CD keys or SaaS tools, your keys will appear here instantly.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allDigitalKeys.map((item, i) => (
                          <div key={i} className="p-4 rounded-xl bg-[#12141F] border border-white/10 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-xs font-bold text-white">{item.productTitle}</div>
                                {item.variation && <div className="text-[10px] text-[var(--pb-silver-4)] font-mono">Edition: {item.variation}</div>}
                              </div>
                              <span className="px-2 py-0.5 rounded bg-[var(--pb-emerald)]/10 text-[var(--pb-emerald)] text-[9px] font-mono font-bold border border-[var(--pb-emerald)]/20">ACTIVE</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-black/40 border border-white/10 font-mono text-xs text-[var(--pb-emerald)]">
                              <span className="font-bold truncate">{item.key}</span>
                              <button onClick={() => copyKey(item.key)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-1 shrink-0">
                                <Copy className="w-3 h-3" />
                                <span>{copiedKey === item.key ? 'COPIED' : 'COPY'}</span>
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[var(--pb-silver-4)] font-mono">
                              <span>Order #{item.orderId}</span>
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== HARDWARE SHIPMENTS TAB ===== */}
                {activeTab === 'tracking' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-400" />
                      Hardware Shipments
                    </h3>
                    {allPhysicalShipments.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-[#141622] border border-white/5 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                          <Truck className="w-6 h-6 text-[var(--pb-silver-4)]" />
                        </div>
                        <div className="text-sm font-bold text-white">No physical projector shipments</div>
                        <p className="text-xs text-[var(--pb-silver-3)]">Smart Projector orders will show live DHL / FedEx tracking here.</p>
                      </div>
                    ) : (
                      allPhysicalShipments.map((ship, idx) => (
                        <div key={idx} className="p-5 rounded-xl bg-[#12141F] border border-white/10 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                            <div>
                              <div className="text-sm font-bold text-white">{ship.productTitle}</div>
                              <div className="text-xs text-[var(--pb-silver-4)] font-mono">Order #{ship.orderId}</div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-[var(--pb-red)]/15 text-[var(--pb-red-bright)] border border-[var(--pb-red-line)] text-xs font-mono font-bold">
                              DHL: {ship.trackingNumber}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                            <div className="p-2 rounded-lg bg-[var(--pb-emerald)]/15 border border-[var(--pb-emerald)]/30 text-[var(--pb-emerald)]">
                              <div className="font-bold">1. Placed</div><div className="text-[10px] text-[var(--pb-silver-4)]">Verified</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[var(--pb-emerald)]/15 border border-[var(--pb-emerald)]/30 text-[var(--pb-emerald)]">
                              <div className="font-bold">2. Dispatched</div><div className="text-[10px] text-[var(--pb-silver-4)]">Hub</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[var(--pb-red)]/15 border border-[var(--pb-red-line)] text-[var(--pb-red-bright)] animate-pulse">
                              <div className="font-bold">3. In Transit</div><div className="text-[10px] text-[var(--pb-silver-4)]">Air Cargo</div>
                            </div>
                            <div className="p-2 rounded-lg bg-white/5 text-[var(--pb-silver-4)]">
                              <div className="font-bold">4. Delivery</div><div className="text-[10px] text-[var(--pb-silver-4)]">Est. 2 Days</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ===== PERSONAL INFO TAB ===== */}
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[var(--pb-silver-2)]" />
                        Personal Information
                      </h3>
                      <button
                        onClick={() => isEditingPersonal ? savePersonalInfo() : setIsEditingPersonal(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                          isEditingPersonal
                            ? 'bg-[var(--pb-emerald)] text-white'
                            : 'bg-white/5 text-[var(--pb-silver-2)] hover:bg-white/10'
                        }`}
                      >
                        {isEditingPersonal ? <><Save className="w-3 h-3" /> Save</> : <><Edit2 className="w-3 h-3" /> Edit</>}
                      </button>
                    </div>

                    <div className="p-5 rounded-xl bg-[#12141F] border border-white/10 space-y-4">
                      {/* First Name + Last Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono text-[var(--pb-silver-3)] mb-1.5 uppercase tracking-wider">First Name</label>
                          <input
                            type="text"
                            value={personalInfo.firstName}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                            disabled={!isEditingPersonal}
                            placeholder="Enter first name"
                            className="w-full bg-[var(--pb-ink)] border border-[var(--pb-line)] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--pb-red-line)] disabled:opacity-60"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-[var(--pb-silver-3)] mb-1.5 uppercase tracking-wider">Last Name</label>
                          <input
                            type="text"
                            value={personalInfo.lastName}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                            disabled={!isEditingPersonal}
                            placeholder="Enter last name"
                            className="w-full bg-[var(--pb-ink)] border border-[var(--pb-line)] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--pb-red-line)] disabled:opacity-60"
                          />
                        </div>
                      </div>

                      {/* National Identity Number */}
                      <div>
                        <label className="block text-[11px] font-mono text-[var(--pb-silver-3)] mb-1.5 uppercase tracking-wider">National Identity Number</label>
                        <input
                          type="text"
                          value={personalInfo.nationalId}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, nationalId: e.target.value })}
                          disabled={!isEditingPersonal}
                          placeholder="CNIC / National ID / Passport (optional)"
                          className="w-full bg-[var(--pb-ink)] border border-[var(--pb-line)] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--pb-red-line)] disabled:opacity-60"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-[11px] font-mono text-[var(--pb-silver-3)] mb-1.5 uppercase tracking-wider">Gender</label>
                        <div className="flex items-center gap-4">
                          {(['male', 'female', 'rather_not_say'] as const).map(g => (
                            <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="gender"
                                checked={personalInfo.gender === g}
                                onChange={() => setPersonalInfo({ ...personalInfo, gender: g })}
                                disabled={!isEditingPersonal}
                                className="accent-[var(--pb-red)]"
                              />
                              <span className="text-xs text-[var(--pb-silver-2)] capitalize">
                                {g === 'rather_not_say' ? 'Rather not say' : g}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-[11px] font-mono text-[var(--pb-silver-3)] mb-1.5 uppercase tracking-wider">Date of Birth</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            value={personalInfo.dobDay}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, dobDay: e.target.value })}
                            disabled={!isEditingPersonal}
                            placeholder="Day"
                            min="1" max="31"
                            className="bg-[var(--pb-ink)] border border-[var(--pb-line)] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--pb-red-line)] disabled:opacity-60"
                          />
                          <select
                            value={personalInfo.dobMonth}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, dobMonth: e.target.value })}
                            disabled={!isEditingPersonal}
                            className="bg-[var(--pb-ink)] border border-[var(--pb-line)] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--pb-red-line)] disabled:opacity-60"
                          >
                            <option value="">Month</option>
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={personalInfo.dobYear}
                            onChange={(e) => setPersonalInfo({ ...personalInfo, dobYear: e.target.value })}
                            disabled={!isEditingPersonal}
                            placeholder="Year"
                            min="1950" max="2010"
                            className="bg-[var(--pb-ink)] border border-[var(--pb-line)] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--pb-red-line)] disabled:opacity-60"
                          />
                        </div>
                      </div>

                      {/* Contact info (read from signup) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
                        <div>
                          <label className="block text-[11px] font-mono text-[var(--pb-silver-3)] mb-1.5 uppercase tracking-wider">Phone</label>
                          <div className="flex items-center gap-2 text-xs text-white">
                            <Phone className="w-3.5 h-3.5 text-[var(--pb-silver-4)]" />
                            {personalInfo.phone || currentUser.phone || 'Not provided'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-[var(--pb-silver-3)] mb-1.5 uppercase tracking-wider">Country</label>
                          <div className="flex items-center gap-2 text-xs text-white">
                            <Globe className="w-3.5 h-3.5 text-[var(--pb-silver-4)]" />
                            {personalInfo.country || currentUser.country || 'Not provided'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== SOCIAL CONNECT TAB ===== */}
                {activeTab === 'social' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      Social Connect
                    </h3>
                    <p className="text-xs text-[var(--pb-silver-3)]">Link your social accounts for faster checkout and exclusive offers.</p>
                    <div className="space-y-2">
                      {['Discord', 'Steam', 'Google', 'Facebook', 'Apple'].map(platform => (
                        <div key={platform} className="flex items-center justify-between p-3.5 rounded-xl bg-[#12141F] border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                              <Users className="w-4 h-4 text-[var(--pb-silver-3)]" />
                            </div>
                            <span className="text-xs font-bold text-white">{platform}</span>
                          </div>
                          <button
                            onClick={() => addToast('info', 'Coming Soon', `${platform} integration will be available soon.`)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--pb-silver-2)] text-xs font-bold"
                          >
                            Connect
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== PRIVACY & SECURITY TAB ===== */}
                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[var(--pb-gold)]" />
                      Privacy & Security
                    </h3>
                    <div className="p-5 rounded-xl bg-[#12141F] border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Account Email</div>
                          <div className="text-[11px] text-[var(--pb-silver-4)] font-mono">{currentUser.email}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[var(--pb-emerald)]/15 text-[var(--pb-emerald)] text-[10px] font-bold">Verified</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Two-Factor Authentication</div>
                          <div className="text-[11px] text-[var(--pb-silver-4)]">Add an extra layer of security</div>
                        </div>
                        <button onClick={() => addToast('info', '2FA Setup', 'Two-factor authentication setup will be available soon.')} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--pb-silver-2)] text-xs font-bold">Enable</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Security Tier</div>
                          <div className="text-[11px] text-[var(--pb-emerald)]">256-Bit SSL Protected Account</div>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-[var(--pb-emerald)]" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Change Password</div>
                          <div className="text-[11px] text-[var(--pb-silver-4)]">Update your account password</div>
                        </div>
                        <button onClick={() => addToast('info', 'Password Change', 'Password change flow will open.')} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--pb-silver-2)] text-xs font-bold">Change</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== VERIFICATION TAB ===== */}
                {activeTab === 'verification' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-[var(--pb-emerald)]" />
                      Verification
                    </h3>
                    <div className="p-5 rounded-xl bg-[#12141F] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Email Verification</div>
                          <div className="text-[11px] text-[var(--pb-emerald)]">✓ Verified</div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[var(--pb-emerald)]" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Phone Verification</div>
                          <div className="text-[11px] text-[var(--pb-silver-4)]">Not verified</div>
                        </div>
                        <button onClick={() => addToast('info', 'Phone Verification', 'Phone verification will be available soon.')} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--pb-silver-2)] text-xs font-bold">Verify</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Identity Verification</div>
                          <div className="text-[11px] text-[var(--pb-silver-4)]">Upload ID for higher limits</div>
                        </div>
                        <button onClick={() => addToast('info', 'KYC', 'Identity verification (KYC) will be available soon.')} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--pb-silver-2)] text-xs font-bold">Upload</button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--pb-emerald)]/5 border border-[var(--pb-emerald)]/15 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-white">Need help?</div>
                        <div className="text-[11px] text-[var(--pb-silver-3)]">VIP concierge support via WhatsApp.</div>
                      </div>
                      <button onClick={() => setIsWhatsAppModalOpen(true)} className="px-3 py-1.5 rounded-lg bg-[var(--pb-emerald)] text-white text-xs font-bold flex items-center gap-1.5">
                        <MessageCircle className="w-3 h-3" /> Support
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
