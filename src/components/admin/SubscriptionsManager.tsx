import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BillingCycle, CustomerSubscriptionStatus, SubscriptionPlan } from '../../types';
import {
  Plus,
  CreditCard,
  TrendingUp,
  Users,
  AlertTriangle,
  RefreshCw,
  Archive,
  X,
  Loader2,
  Calendar,
  Repeat,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SUB_STATUS_META: Record<CustomerSubscriptionStatus, { pill: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: { pill: 'admin-pill-green', label: 'Active', icon: CheckCircle2 },
  trialing: { pill: 'admin-pill-blue', label: 'Trialing', icon: Clock },
  past_due: { pill: 'admin-pill-amber', label: 'Past Due', icon: AlertTriangle },
  cancelled: { pill: 'admin-pill-red', label: 'Cancelled', icon: Ban },
  expired: { pill: 'admin-pill-red', label: 'Expired', icon: XCircle },
};

const BILLING_LABEL: Record<BillingCycle, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const daysUntil = (iso: string): number => {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const SubscriptionsManager: React.FC = () => {
  const {
    subscriptionPlans,
    customerSubscriptions,
    createSubscriptionPlan,
    archiveSubscriptionPlan,
    retryFailedSubscription,
    cancelSubscription,
    formatPrice,
    addToast,
  } = useStore();

  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerSubscriptionStatus>('all');

  // New-plan form state
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    billingCycle: 'monthly' as BillingCycle,
    price: 9.99,
    trialDays: 0,
    isActive: true,
  });

  // ---- Aggregate stats ----
  const activeSubsCount = customerSubscriptions.filter(s => s.status === 'active' || s.status === 'trialing').length;
  const totalMrr = subscriptionPlans.reduce((sum, p) => sum + p.mrr, 0);
  const pastDueCount = customerSubscriptions.filter(s => s.status === 'past_due').length;
  const churnRate = customerSubscriptions.length > 0
    ? ((customerSubscriptions.filter(s => s.status === 'cancelled').length / customerSubscriptions.length) * 100).toFixed(1)
    : '0';

  // Filtered subscriptions for the table
  const filteredSubs = statusFilter === 'all'
    ? customerSubscriptions
    : customerSubscriptions.filter(s => s.status === statusFilter);

  const pastDueSubs = customerSubscriptions.filter(s => s.status === 'past_due');

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || newPlan.price <= 0) {
      addToast('error', 'Missing Fields', 'Plan name and a valid price are required.');
      return;
    }
    createSubscriptionPlan({
      name: newPlan.name,
      description: newPlan.description,
      billingCycle: newPlan.billingCycle,
      price: Number(newPlan.price),
      trialDays: Number(newPlan.trialDays) || 0,
      isActive: newPlan.isActive,
      status: 'active',
    });
    setNewPlan({ name: '', description: '', billingCycle: 'monthly', price: 9.99, trialDays: 0, isActive: true });
    setIsCreatePlanOpen(false);
  };

  const handleRetry = (id: string) => {
    setRetryingId(id);
    // Brief delay to show the spinner before the toast fires
    setTimeout(() => {
      retryFailedSubscription(id);
      setRetryingId(null);
    }, 700);
  };

  return (
    <div className="space-y-5">
      {/* ============================================
          HEADER + STATS
          ============================================ */}
      <div className="admin-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-display">Subscriptions</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage recurring plans, customer subscriptions, and dunning queue.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreatePlanOpen(true)}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>Total MRR</span>
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">${totalMrr.toFixed(2)}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">monthly recurring</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono">
              <Users className="w-2.5 h-2.5" />
              <span>Active Subs</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">{activeSubsCount}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{customerSubscriptions.length} total</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>Past Due</span>
            </div>
            <div className={`text-xl font-bold mt-1 ${pastDueCount > 0 ? 'text-amber-400' : 'text-white'}`}>{pastDueCount}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">needs attention</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="flex items-center gap-1 text-[10px] uppercase text-gray-500 tracking-wider font-mono">
              <Ban className="w-2.5 h-2.5" />
              <span>Churn Rate</span>
            </div>
            <div className={`text-xl font-bold mt-1 ${Number(churnRate) > 10 ? 'text-red-400' : 'text-white'}`}>{churnRate}%</div>
            <div className="text-[10px] text-gray-500 mt-0.5">last 30 days</div>
          </div>
        </div>
      </div>

      {/* ============================================
          DUNNING QUEUE (Past-due subscriptions)
          ============================================ */}
      {pastDueSubs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Dunning Queue ({pastDueSubs.length} past due)</span>
            </h2>
          </div>
          <div className="admin-card p-4 space-y-2">
            {pastDueSubs.map((sub) => {
              const isRetrying = retryingId === sub.id;
              return (
                <div key={sub.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{sub.customerName}</div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {sub.planName} · {sub.failedAttempts} failed {sub.failedAttempts === 1 ? 'attempt' : 'attempts'} · {formatPrice(sub.amount)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRetry(sub.id)}
                    disabled={isRetrying}
                    className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isRetrying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Retry Charge</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Cancel ${sub.customerName}'s subscription?`)) {
                        cancelSubscription(sub.id);
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-[11px] font-bold uppercase tracking-wider border border-red-500/30 flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================
          PLAN GRID
          ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span>Subscription Plans ({subscriptionPlans.length})</span>
          </h2>
        </div>
        {subscriptionPlans.length === 0 ? (
          <div className="admin-card p-10 text-center">
            <CreditCard className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No subscription plans yet.</p>
            <button
              onClick={() => setIsCreatePlanOpen(true)}
              className="mt-3 admin-gold-pill"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Plan</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`admin-card p-5 ${plan.status === 'archived' ? 'opacity-60' : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{plan.name}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-purple-500/15 text-purple-400">
                        {BILLING_LABEL[plan.billingCycle]}
                      </span>
                      {plan.trialDays > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-blue-500/15 text-blue-400">
                          {plan.trialDays}-day trial
                        </span>
                      )}
                      {plan.status === 'archived' && (
                        <span className="admin-pill-red">Archived</span>
                      )}
                      {plan.status === 'active' && (
                        <span className="admin-pill-green">Active</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-gray-400 leading-snug mb-3 line-clamp-2 min-h-[2.4em]">
                  {plan.description || 'No description provided.'}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-emerald-400 font-mono">{formatPrice(plan.price)}</span>
                  <span className="text-[10px] text-gray-500 font-mono">/ {BILLING_LABEL[plan.billingCycle].toLowerCase().replace('ly', '')}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-[#0f141c] border border-[#1f2937]">
                    <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono">Subscribers</div>
                    <div className="text-sm font-bold text-white font-mono">{plan.subscribers}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0f141c] border border-[#1f2937]">
                    <div className="text-[9px] uppercase text-gray-500 tracking-wider font-mono">MRR</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">${plan.mrr.toFixed(2)}</div>
                  </div>
                </div>

                {/* Actions */}
                {plan.status === 'active' && (
                  <div className="flex items-center gap-2 pt-3 border-t border-[#1f2937]">
                    <button
                      onClick={() => {
                        if (window.confirm(`Archive ${plan.name}? It will no longer accept new sign-ups.`)) {
                          archiveSubscriptionPlan(plan.id);
                        }
                      }}
                      className="flex-1 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-[11px] font-bold uppercase tracking-wider border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive Plan</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================
          CUSTOMER SUBSCRIPTIONS TABLE
          ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>Customer Subscriptions ({filteredSubs.length})</span>
          </h2>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            {(['all', 'active', 'trialing', 'past_due', 'cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  statusFilter === s
                    ? 'bg-purple-600/30 text-purple-300'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-card overflow-hidden">
          {filteredSubs.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-500">
              No subscriptions match this filter.
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#1f2937] text-gray-500 uppercase text-[10px] tracking-wider font-mono bg-[#0f141c]">
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Plan</th>
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Started</th>
                    <th className="p-3 font-medium">Renews</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]/60">
                  {filteredSubs.map((sub) => {
                    const status = SUB_STATUS_META[sub.status];
                    const StatusIcon = status.icon;
                    const renewDays = daysUntil(sub.renewsAt);
                    return (
                      <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-[10px] border border-purple-500/30 shrink-0">
                              {sub.customerName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-white font-medium truncate">{sub.customerName}</div>
                              <div className="text-[10px] text-gray-500 font-mono truncate">{sub.customerEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-gray-300">{sub.planName}</td>
                        <td className="p-3 font-mono text-emerald-400">{formatPrice(sub.amount)}</td>
                        <td className="p-3 text-gray-400 font-mono text-[11px]">{formatDate(sub.startedAt)}</td>
                        <td className="p-3">
                          <div className="text-gray-300 font-mono text-[11px]">{formatDate(sub.renewsAt)}</div>
                          {sub.status === 'active' && renewDays > 0 && (
                            <div className="text-[10px] text-gray-500 mt-0.5">in {renewDays}d</div>
                          )}
                          {sub.status === 'past_due' && renewDays < 0 && (
                            <div className="text-[10px] text-amber-400 mt-0.5">{Math.abs(renewDays)}d overdue</div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`${status.pill} flex items-center gap-1 w-fit`}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {status.label}
                          </span>
                          {sub.failedAttempts > 0 && (
                            <div className="text-[10px] text-amber-400 mt-1 font-mono">{sub.failedAttempts} failed</div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {sub.status === 'past_due' && (
                            <button
                              onClick={() => handleRetry(sub.id)}
                              disabled={retryingId === sub.id}
                              className="px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {retryingId === sub.id ? 'Retrying...' : 'Retry'}
                            </button>
                          )}
                          {(sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due') && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Cancel ${sub.customerName}'s subscription?`)) {
                                  cancelSubscription(sub.id);
                                }
                              }}
                              className="px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/30 ml-1"
                            >
                              Cancel
                            </button>
                          )}
                          {sub.status === 'cancelled' && (
                            <span className="text-[10px] text-gray-600 font-mono">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ============================================
          CREATE PLAN MODAL
          ============================================ */}
      <AnimatePresence>
        {isCreatePlanOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatePlanOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl bg-[#151a23] border border-[#252b3b] shadow-2xl p-6 z-10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-plan-title"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <h3 id="create-plan-title" className="text-base font-bold text-white font-display">Create Subscription Plan</h3>
                </div>
                <button onClick={() => setIsCreatePlanOpen(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreatePlan} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="e.g. Premium Streaming Bundle"
                    className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                    placeholder="What's included in this plan?"
                    className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600 resize-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Billing Cycle</label>
                    <select
                      value={newPlan.billingCycle}
                      onChange={(e) => setNewPlan({ ...newPlan, billingCycle: e.target.value as BillingCycle })}
                      className="input-sharp w-full px-2 py-2 text-xs text-white"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                      className="input-sharp w-full px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Trial (days)</label>
                    <input
                      type="number"
                      min="0"
                      value={newPlan.trialDays}
                      onChange={(e) => setNewPlan({ ...newPlan, trialDays: Number(e.target.value) })}
                      className="input-sharp w-full px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-[11px] text-gray-300 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={newPlan.isActive}
                    onChange={(e) => setNewPlan({ ...newPlan, isActive: e.target.checked })}
                    className="accent-purple-500 w-3.5 h-3.5"
                  />
                  <span>Activate immediately upon creation</span>
                </label>
                <div className="flex items-center gap-2 pt-2">
                  <button type="button" onClick={() => setIsCreatePlanOpen(false)} className="flex-1 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 text-xs font-bold uppercase tracking-wider">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Create Plan</span>
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
