import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, Role } from '../../types';
import {
  Shield, Plus, Ban, CheckCircle2, KeyRound, Trash2, X, Eye, EyeOff,
  Search, Mail, Lock, AlertCircle, Loader2, UserCheck, Crown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ADMIN_ROLES: { role: Role; label: string; desc: string }[] = [
  { role: 'super_admin', label: 'Super Admin', desc: 'Full platform access — can manage other admins' },
  { role: 'admin', label: 'Admin', desc: 'Full platform access — cannot manage other admins' },
  { role: 'product_manager', label: 'Product Manager', desc: 'Catalog, pricing, variant protection & import queues' },
  { role: 'order_manager', label: 'Order Manager', desc: 'Order fulfillment, digital keys dispatch & DHL tracking' },
  { role: 'finance_manager', label: 'Finance Manager', desc: 'Payment gateways, settlements & financial reports' },
  { role: 'support_agent', label: 'Support Agent', desc: 'Handle customer tickets and order inquiries' },
  { role: 'content_manager', label: 'Content Manager', desc: 'Banners, copy editor, homepage content' },
  { role: 'marketing_manager', label: 'Marketing Manager', desc: 'TikTok leads, social automation, email campaigns' },
  { role: 'read_only', label: 'Read Only', desc: 'View-only access — no data modifications' },
];

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'admin-pill-purple',
  admin: 'admin-pill-blue',
  product_manager: 'admin-pill-green',
  order_manager: 'admin-pill-green',
  finance_manager: 'admin-pill-amber',
  support_agent: 'admin-pill-blue',
  content_manager: 'admin-pill-green',
  marketing_manager: 'admin-pill-amber',
  read_only: 'admin-pill-amber',
  customer: 'admin-pill-green',
};

const formatDate = (iso?: string): string => {
  if (!iso) return 'never';
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const timeAgo = (iso?: string): string => {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const SuperAgentManagement: React.FC = () => {
  const { addToast } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '', email: '', password: '', role: 'support_agent' as Role,
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      addToast('error', 'Load Failed', 'Could not load admin users.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // Only show admin/staff users (not customers)
  const adminUsers = users.filter(u => u.role !== 'customer');
  const filtered = adminUsers.filter(u => {
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      addToast('error', 'Missing Fields', 'Name, email, and password are required.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('success', 'Agent Created', `${createForm.name} added as ${createForm.role}.`);
        setCreateForm({ name: '', email: '', password: '', role: 'support_agent' });
        setIsCreateOpen(false);
        fetchUsers();
      } else {
        addToast('error', 'Creation Failed', data.error || 'Could not create agent.');
      }
    } catch {
      addToast('error', 'Creation Failed', 'Network error.');
    }
    setCreating(false);
  };

  const handleRoleChange = async (user: User, newRole: Role) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not update role.');
      addToast('success', 'Role Updated', `${user.name} is now ${newRole.replace(/_/g, ' ')}.`);
      fetchUsers();
    } catch {
      addToast('error', 'Update Failed', 'Could not update role.');
    }
  };

  const handleSuspend = async (user: User) => {
    if (user.id === 'usr-admin-default') {
      addToast('error', 'Cannot Suspend', 'The default admin account cannot be suspended.');
      return;
    }
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not update status.');
      addToast('info', newStatus === 'suspended' ? 'Agent Suspended' : 'Agent Reactivated', `${user.name} is now ${newStatus}.`);
      fetchUsers();
    } catch {
      addToast('error', 'Action Failed', 'Could not update status.');
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !newPassword || newPassword.length < 8) {
      addToast('error', 'Invalid Password', 'Password must be at least 8 characters.');
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
    if (user.id === 'usr-admin-default') {
      addToast('error', 'Cannot Delete', 'The default admin account cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete agent account for ${user.name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('info', 'Agent Deleted', `${user.name} has been removed.`);
        fetchUsers();
      } else {
        addToast('error', 'Delete Failed', data.error || 'Could not delete agent.');
      }
    } catch {
      addToast('error', 'Delete Failed', 'Network error.');
    }
  };

  // Stats
  const totalAgents = adminUsers.length;
  const activeAgents = adminUsers.filter(u => u.status === 'active').length;
  const suspendedAgents = adminUsers.filter(u => u.status === 'suspended').length;
  const superAdmins = adminUsers.filter(u => u.role === 'super_admin').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="admin-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-display">Super Agent Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage admin staff accounts — create agents, assign roles, reset passwords.</p>
            </div>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /><span>Add Agent</span>
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Total Agents</div>
            <div className="text-xl font-bold text-white mt-1">{totalAgents}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Active</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{activeAgents}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Suspended</div>
            <div className="text-xl font-bold text-red-400 mt-1">{suspendedAgents}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Super Admins</div>
            <div className="text-xl font-bold text-purple-400 mt-1">{superAdmins}</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-gray-400" />
          <span>Admin & Staff Accounts ({filtered.length})</span>
        </h2>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-sharp pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 w-full sm:w-72" />
        </div>
      </div>

      {/* Agent cards */}
      {loading ? (
        <div className="admin-card p-10 text-center">
          <Loader2 className="w-6 h-6 text-gray-500 animate-spin mx-auto" />
          <p className="text-xs text-gray-500 mt-2">Loading agents...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card p-10 text-center">
          <Shield className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No admin agents found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((user) => (
            <div key={user.id} className="admin-card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 ${
                  user.role === 'super_admin' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                  user.role === 'admin' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                  'bg-gray-500/15 text-gray-300 border-gray-500/30'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-white truncate">{user.name}</div>
                    {user.id === 'usr-admin-default' && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono truncate">{user.email}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`${ROLE_COLORS[user.role] || 'admin-pill-blue'} !text-[9px]`}>{user.role.replace(/_/g, ' ')}</span>
                    {user.status === 'active' && <span className="admin-pill-green !text-[9px]">Active</span>}
                    {user.status === 'suspended' && <span className="admin-pill-red !text-[9px]">Suspended</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
                <div>
                  <span className="text-gray-500 font-mono">Joined:</span>
                  <span className="text-gray-300 ml-1">{formatDate(user.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-mono">Last login:</span>
                  <span className="text-gray-300 ml-1">{timeAgo(user.lastLogin)}</span>
                </div>
              </div>

              {/* Role selector */}
              <div className="mb-3">
                <label className="block text-[10px] uppercase text-gray-500 tracking-wider font-mono mb-1">Role</label>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user, e.target.value as Role)}
                  disabled={user.id === 'usr-admin-default'}
                  className="input-sharp w-full px-2 py-1.5 text-xs text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {ADMIN_ROLES.map(r => (
                    <option key={r.role} value={r.role}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#1f2937]">
                <button onClick={() => setResetTarget(user)}
                  className="flex-1 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20 flex items-center justify-center gap-1.5 transition-colors">
                  <KeyRound className="w-3 h-3" /><span>Reset PW</span>
                </button>
                <button onClick={() => handleSuspend(user)} disabled={user.id === 'usr-admin-default'}
                  className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${user.status === 'suspended' ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'}`}>
                  {user.status === 'suspended' ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                  <span className="hidden sm:inline">{user.status === 'suspended' ? 'Activate' : 'Suspend'}</span>
                </button>
                <button onClick={() => handleDelete(user)} disabled={user.id === 'usr-admin-default'}
                  className="p-2 rounded-lg bg-[#1f2937] hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Delete agent">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md rounded-2xl bg-[#151a23] border border-[#252b3b] shadow-2xl p-6 z-10" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-purple-400" /><h3 className="text-base font-bold text-white font-display">Add New Agent</h3></div>
                <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Full Name</label>
                  <input type="text" required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="John Doe" className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600" />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Email Address</label>
                  <input type="email" required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="agent@playbeat.digital" className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600" />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Password</label>
                  <div className="relative">
                    <input type={showCreatePassword ? 'text' : 'password'} required value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Minimum 8 characters" className="input-sharp w-full px-3 py-2 pr-10 text-xs text-white placeholder-gray-600 font-mono" />
                    <button type="button" onClick={() => setShowCreatePassword(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-200">
                      {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Role</label>
                  <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })} className="input-sharp w-full px-2 py-2 text-xs text-white">
                    {ADMIN_ROLES.map(r => <option key={r.role} value={r.role}>{r.label} — {r.desc}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <button onClick={() => setIsCreateOpen(false)} className="flex-1 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 text-xs font-bold uppercase tracking-wider">Cancel</button>
                <button onClick={handleCreate} disabled={creating} className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create Agent</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal (reused from AccountManagement pattern) */}
      <AnimatePresence>
        {resetTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setResetTarget(null)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md rounded-2xl bg-[#151a23] border border-[#252b3b] shadow-2xl p-6 z-10" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-amber-400" /><h3 className="text-base font-bold text-white font-display">Reset Agent Password</h3></div>
                <button onClick={() => setResetTarget(null)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937] mb-4">
                <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Agent</div>
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
