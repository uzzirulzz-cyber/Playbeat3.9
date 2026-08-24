import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Role } from '../../types';
import {
  Shield,
  UserCheck,
  Key,
  Lock,
  Smartphone,
  History,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';

export const AdminRolesView: React.FC = () => {
  const { currentUser, switchUserRole, adminLogs, addToast } = useStore();
  const [selectedRole, setSelectedRole] = useState<Role>(currentUser.role);

  const roleDefinitions: { role: Role; title: string; description: string; permissions: string[] }[] = [
    {
      role: 'super_admin',
      title: 'Super Administrator (Root)',
      description: 'Unrestricted full access to store, finances, API keys, database, server controls, and team accounts.',
      permissions: ['Full Access', 'Financial Balances', 'Product Deletions', 'API Credentials', 'User Roles', 'Server Health']
    },
    {
      role: 'admin',
      title: 'Administrator',
      description: 'Manage products, orders, customers, marketing campaigns, and supplier bridges.',
      permissions: ['Product Management', 'Order Management', 'Customer CRM', 'Marketing & TikTok', 'G2G Sync']
    },
    {
      role: 'product_manager',
      title: 'Product Manager (Catalog Lead)',
      description: 'Manage 4K projectors, digital software catalog, variations, pricing, and stock levels.',
      permissions: ['Product Create/Edit', 'Price Management', 'Hardware Stock', 'Variation Dedup']
    },
    {
      role: 'finance_manager',
      title: 'Finance Manager',
      description: 'Reconcile payment gateways (JazzCash, Easypaisa, Stripe), review payment receipts, and manage margins.',
      permissions: ['Financial Balances', 'Payment Verification', 'Ledger Export', 'Profit Margins']
    },
    {
      role: 'support_agent',
      title: 'Customer Support Agent',
      description: 'Respond to WhatsApp concierge tickets, view order histories, and re-issue digital license keys.',
      permissions: ['View Orders', 'Re-issue Keys', 'Customer Chat', 'View Catalog']
    },
    {
      role: 'marketing_manager',
      title: 'Marketing & Growth Manager',
      description: 'Manage TikTok leads engine, create discount promo coupons, and configure abandoned cart sequences.',
      permissions: ['TikTok Tracking', 'Coupons & Promos', 'Abandoned Carts', 'Storefront Banners']
    }
  ];

  const handleRoleChange = (role: Role) => {
    switchUserRole(role);
    setSelectedRole(role);
    addToast('success', 'Admin Session Updated', `Switched active role to ${role.replace('_', ' ').toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#10182A] border border-[#26334A] shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#1769FF] text-xs font-mono font-bold uppercase tracking-widest mb-1">
            <Shield className="w-4 h-4 text-[#1769FF]" />
            <span>Role-Based Access Control & Security</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Admin Roles, Permissions & 2FA Enforcement</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Configure granular staff roles (Super Admin, Product Lead, Finance, Support, Marketing) with two-factor authentication and session audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#08152F] border border-[#00D99A]/30 text-xs font-mono text-[#00D99A]">
          <span className="w-2 h-2 rounded-full bg-[#00D99A] animate-pulse" />
          <span>Active Role: <strong className="text-white">{currentUser.role.replace('_', ' ').toUpperCase()}</strong></span>
        </div>
      </div>

      {/* ROLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roleDefinitions.map((item) => {
          const isCurrent = currentUser.role === item.role;
          return (
            <div
              key={item.role}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-[#121C30] border-[#1769FF] shadow-[0_0_20px_rgba(23,105,255,0.15)]'
                  : 'bg-[#10182A] border-[#26334A] hover:border-[#1769FF]/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{item.title}</span>
                  {isCurrent ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1769FF]/20 text-[#287BFF] border border-[#1769FF]/40">
                      CURRENT SESSION
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Role ID: {item.role}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{item.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.permissions.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#08152F] text-slate-300 border border-[#26334A]">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#26334A] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-[#00D99A] font-mono">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>2FA Enforced (Authenticator App)</span>
                </div>
                <button
                  onClick={() => handleRoleChange(item.role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all ${
                    isCurrent
                      ? 'bg-white/10 text-white cursor-default'
                      : 'btn-primary'
                  }`}
                >
                  {isCurrent ? 'Active' : 'Test Role'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AUDIT LOGS TABLE */}
      <div className="rounded-2xl bg-[#10182A] border border-[#26334A] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#26334A] flex items-center justify-between">
          <div className="font-bold text-white text-sm uppercase tracking-wider font-mono flex items-center gap-2">
            <History className="w-4 h-4 text-[#1769FF]" />
            Security & Activity Audit Logs
          </div>
          <span className="text-xs text-slate-400 font-mono">Immutable cryptographic ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#08152F] border-b border-[#26334A] text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26334A]/50">
              {adminLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#121C30]">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{log.adminName}</td>
                  <td className="py-3 px-4 text-[#1769FF] font-bold">{log.action}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] uppercase">{log.targetType}</td>
                  <td className="py-3 px-4 text-slate-300 text-right truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
