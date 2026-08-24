import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, Role } from '../../types';
import {
  Users, Search, Ban, CheckCircle2, KeyRound, Trash2, X, Eye, EyeOff,
  Mail, ShoppingBag, DollarSign, Clock, AlertCircle, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  product_manager: 'Product Manager',
  order_manager: 'Order Manager',
  finance_manager: 'Finance Manager',
  support_agent: 'Support Agent',
  content_manager: 'Content Manager',
  marketing_manager: 'Marketing Manager',
  read_only: 'Read Only',
  customer: 'Customer',
};

const formatDate = (iso?: string): string => {
  if (!iso) return 'never';
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const timeAgo = (iso?: string): string => {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

export const AccountManagement: React.FC = () => {
  const { addToast, formatPrice } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      addToast('error', 'Load Failed', 'Could not load user accounts.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    if (u.role !== 'customer') return false; // this page is for customer accounts only
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSuspend = async (user: User) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      addToast('success', newStatus === 'suspended' ? 'Account Suspended' : 'Account Reactivated', `${user.name} is now ${newStatus}.`);
      fetchUsers();
    } catch {
      addToast('error', 'Action Failed', 'Could not update account status.');
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !newPassword) return;
    if (newPassword.length < 8) {
      addToast('error', 'Password Too Short', 'Password must be at least 8 characters.');
      return;
    }
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Password Reset', `Password for ${resetTarget.name} has been reset.`);
        setResetTarget(null);
        setNewPassword('');
      } else {
        addToast('error', 'Reset Failed', data.error || 'Could not reset password.');
      }
    } catch {
      addToast('error', 'Reset Failed', 'Network error.');
    }
    setResetting(false);
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete account for ${user.name} (${user.email})? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('info', 'Account Deleted', `${user.name} has been removed.`);
        fetchUsers();
      } else {
        addToast('error', 'Delete Failed', data.error || 'Could not delete account.');
      }
    } catch {
      addToast('error', 'Delete Failed', 'Network error.');
    }
  };

  // Stats
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const activeCustomers = users.filter(u => u.role === 'customer' && u.status === 'active').length;
  const suspendedCustomers = users.filter(u => u.role === 'customer' && u.status === 'suspended').length;
  const totalRevenue = users.filter(u => u.role === 'customer').reduce((sum, u) => sum + u.totalSpent, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="admin-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">Account Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage customer accounts — suspend, reset passwords, view order history.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Total Customers</div>
            <div className="text-xl font-bold text-white mt-1">{totalCustomers}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Active</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{activeCustomers}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Suspended</div>
            <div className="text-xl font-bold text-red-400 mt-1">{suspendedCustomers}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Lifetime Revenue</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{formatPrice(totalRevenue)}</div>
          </div>
        </div>
      </div>

      {/* Filter + search */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0f141c] border border-[#1f2937]">
          {(['all', 'active', 'suspended'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors ${statusFilter === s ? 'bg-blue-600/30 text-blue-300' : 'text-gray-500 hover:text-gray-300'}`}
            >{s}</button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-sharp pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 w-full sm:w-72" />
        </div>
      </div>

      {/* Users table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <Loader2 className="w-6 h-6 text-gray-500 animate-spin mx-auto" />
            <p className="text-xs text-gray-500 mt-2">Loading accounts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-gray-500">No customer accounts match this filter.</div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500 uppercase text-[10px] tracking-wider font-mono bg-[#0f141c]">
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Orders</th>
                  <th className="p-3 font-medium">Spent</th>
                  <th className="p-3 font-medium">Joined</th>
                  <th className="p-3 font-medium">Last Login</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/60">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-[10px] border border-blue-500/30 shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">{user.name}</div>
                          <div className="text-[10px] text-gray-500 font-mono truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-white">{user.ordersCount}</td>
                    <td className="p-3 font-mono text-emerald-400">{formatPrice(user.totalSpent)}</td>
                    <td className="p-3 text-gray-400 font-mono text-[11px]">{formatDate(user.createdAt)}</td>
                    <td className="p-3 text-gray-400 font-mono text-[11px]">{timeAgo(user.lastLogin)}</td>
                    <td className="p-3">
                      {user.status === 'active' && <span className="admin-pill-green">Active</span>}
                      {user.status === 'suspended' && <span className="admin-pill-red">Suspended</span>}
                      {user.status === 'pending_verification' && <span className="admin-pill-amber">Pending</span>}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setResetTarget(user)}
                          className="p-2 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
                          title="Reset password" aria-label="Reset password">
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleSuspend(user)}
                          className={`p-2 rounded-md border transition-colors ${user.status === 'suspended' ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'}`}
                          title={user.status === 'suspended' ? 'Reactivate' : 'Suspend'} aria-label={user.status === 'suspended' ? 'Reactivate' : 'Suspend'}>
                          {user.status === 'suspended' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleDelete(user)}
                          className="p-2 rounded-md bg-[#1f2937] hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete account" aria-label="Delete account">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setResetTarget(null)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md rounded-2xl bg-[#151a23] border border-[#252b3b] shadow-2xl p-6 z-10" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-amber-400" /><h3 className="text-base font-bold text-white font-display">Reset Password</h3></div>
                <button onClick={() => setResetTarget(null)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937] mb-4">
                <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Account</div>
                <div className="text-sm font-bold text-white mt-1">{resetTarget.name}</div>
                <div className="text-[11px] text-gray-400 font-mono">{resetTarget.email}</div>
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">New Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" className="input-sharp w-full px-3 py-2 pr-10 text-xs text-white font-mono" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-200">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-300/80 mt-3 flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>The user will need to use this new password on next login. They will NOT be automatically notified.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <button onClick={() => setResetTarget(null)} className="flex-1 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 text-xs font-bold uppercase tracking-wider">Cancel</button>
                <button onClick={handleResetPassword} disabled={resetting || !newPassword} className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  <span>Reset Password</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
