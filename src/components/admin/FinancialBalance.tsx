import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Wallet, CreditCard, Smartphone, Bitcoin, Citrus, TrendingUp, Clock, ArrowRight } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard, Wallet, Smartphone, Bitcoin, Citrus,
};

const formatCurrency = (amount: number, currency: string): string => {
  if (currency === 'PKR') return `Rs ${amount.toLocaleString('en-PK')}`;
  if (currency === 'USDT') return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const daysUntil = (iso: string): number => {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const FinancialBalance: React.FC = () => {
  const { gatewayBalances, orders } = useStore();

  // Compute total available across USD-equivalent balances
  // For simplicity in this demo we sum USD + USDT amounts and treat PKR separately
  const usdTotal = gatewayBalances
    .filter(g => g.currency === 'USD' || g.currency === 'USDT')
    .reduce((sum, g) => sum + g.available, 0);
  const usdPending = gatewayBalances
    .filter(g => g.currency === 'USD' || g.currency === 'USDT')
    .reduce((sum, g) => sum + g.pending, 0);
  const pkrTotal = gatewayBalances
    .filter(g => g.currency === 'PKR')
    .reduce((sum, g) => sum + g.available, 0);
  const pkrPending = gatewayBalances
    .filter(g => g.currency === 'PKR')
    .reduce((sum, g) => sum + g.pending, 0);

  // Last 7 days of order revenue (for the trend chart)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dayKey = d.toISOString().split('T')[0];
    const dayOrders = orders.filter(o => o.createdAt.startsWith(dayKey));
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
    };
  });

  // Find next settlement
  const nextSettlement = gatewayBalances
    .filter(g => g.available > 0)
    .map(g => ({ gateway: g.gateway, days: daysUntil(g.nextSettlementAt), amount: g.available, currency: g.currency }))
    .sort((a, b) => a.days - b.days)[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="admin-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">Financial Balance</h1>
            <p className="text-xs text-gray-500 mt-0.5">Real-time balances across all payment gateways and settlement timelines.</p>
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-4 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">USD Available</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">${usdTotal.toFixed(2)}</div>
            <div className="text-[10px] text-amber-400 mt-1 font-mono">+${usdPending.toFixed(2)} pending</div>
          </div>
          <div className="p-4 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">PKR Available</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">Rs {pkrTotal.toLocaleString('en-PK')}</div>
            <div className="text-[10px] text-amber-400 mt-1 font-mono">+Rs {pkrPending.toLocaleString('en-PK')} pending</div>
          </div>
          <div className="p-4 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Next Settlement</div>
            {nextSettlement ? (
              <>
                <div className="text-2xl font-bold text-white mt-1 font-mono">{nextSettlement.days}d</div>
                <div className="text-[10px] text-gray-500 mt-1 font-mono">{nextSettlement.gateway} · {formatCurrency(nextSettlement.amount, nextSettlement.currency)}</div>
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-500 mt-1 font-mono">—</div>
            )}
          </div>
        </div>
      </div>

      {/* Gateway balances grid */}
      <div>
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span>Gateway Balances ({gatewayBalances.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gatewayBalances.map((gw) => {
            const Icon = ICON_MAP[gw.icon] || Wallet;
            const settlementDays = daysUntil(gw.nextSettlementAt);
            const isSettledToday = settlementDays <= 0;
            const totalBalance = gw.available + gw.pending;
            const availablePercent = totalBalance > 0 ? (gw.available / totalBalance) * 100 : 0;
            return (
              <div key={gw.id} className="admin-card p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0f141c] border border-[#1f2937] flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{gw.gateway}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{gw.currency}</div>
                    </div>
                  </div>
                  <span className={`admin-pill-${isSettledToday ? 'green' : settlementDays <= 1 ? 'amber' : 'blue'}`}>
                    {isSettledToday ? 'settling today' : `${settlementDays}d`}
                  </span>
                </div>

                {/* Available balance */}
                <div className="mb-3">
                  <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Available</div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">{formatCurrency(gw.available, gw.currency)}</div>
                </div>

                {/* Pending */}
                {gw.pending > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />Pending
                      </span>
                      <span className="text-amber-400 font-mono">{formatCurrency(gw.pending, gw.currency)}</span>
                    </div>
                    <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${availablePercent}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">{availablePercent.toFixed(0)}% available · {(100 - availablePercent).toFixed(0)}% pending</div>
                  </div>
                )}

                {/* Settlement info */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1f2937]">
                  <div className="text-[10px] text-gray-500 font-mono">
                    {gw.settlementFrequency} cadence
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                    <ArrowRight className="w-3 h-3" />
                    <span>{isSettledToday ? 'settling now' : `next in ${settlementDays}d`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last 7 days revenue (simple sparkline-style display) */}
      <div className="admin-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Last 7 Days Revenue</h2>
          </div>
          <span className="admin-pill-green">From {orders.length} orders</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((d, i) => {
            const maxValue = Math.max(...last7Days.map(x => x.revenue), 1);
            const heightPercent = (d.revenue / maxValue) * 100;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full h-20 bg-[#1f2937] rounded-md overflow-hidden flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-md transition-all"
                    style={{ height: `${Math.max(2, heightPercent)}%` }}
                    title={`$${d.revenue.toFixed(2)}`}
                  />
                </div>
                <div className="text-[9px] text-gray-500 font-mono">{d.day}</div>
                <div className="text-[9px] text-gray-400 font-mono">${d.revenue.toFixed(0)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
