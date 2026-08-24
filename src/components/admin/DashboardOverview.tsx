import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  DollarSign,
  ShoppingCart,
  Layers,
  Server,
  Zap,
  Truck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  Compass,
  Key,
  Projector,
  Clock,
  Activity,
  CreditCard,
  BarChart3,
  LineChart,
  PieChart,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const DashboardOverview: React.FC = () => {
  const { orders, products, formatPrice, g2gSettings, setAdminTab } = useStore();
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '14d' | '30d' | '90d'>('7d');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const projectorCount = products.filter(p => p.productType === 'physical_projector').length;

  // Chart Mock Data based on timeRange
  const chartDataMap: Record<string, { label: string; revenue: number; orders: number }[]> = {
    today: [
      { label: '00:00', revenue: 140, orders: 3 },
      { label: '04:00', revenue: 90, orders: 2 },
      { label: '08:00', revenue: 380, orders: 7 },
      { label: '12:00', revenue: 840, orders: 14 },
      { label: '16:00', revenue: 1120, orders: 19 },
      { label: '20:00', revenue: 950, orders: 16 }
    ],
    '7d': [
      { label: 'Mon', revenue: 1240, orders: 24 },
      { label: 'Tue', revenue: 1890, orders: 32 },
      { label: 'Wed', revenue: 2450, orders: 41 },
      { label: 'Thu', revenue: 2120, orders: 38 },
      { label: 'Fri', revenue: 3890, orders: 58 },
      { label: 'Sat', revenue: 4920, orders: 72 },
      { label: 'Sun', revenue: 4210, orders: 64 }
    ],
    '14d': [
      { label: 'W1 D1', revenue: 1400, orders: 22 },
      { label: 'W1 D3', revenue: 2100, orders: 34 },
      { label: 'W1 D5', revenue: 3200, orders: 48 },
      { label: 'W1 D7', revenue: 4100, orders: 60 },
      { label: 'W2 D2', revenue: 2800, orders: 42 },
      { label: 'W2 D4', revenue: 3900, orders: 55 },
      { label: 'W2 D7', revenue: 5200, orders: 78 }
    ],
    '30d': [
      { label: 'Week 1', revenue: 14200, orders: 210 },
      { label: 'Week 2', revenue: 18900, orders: 280 },
      { label: 'Week 3', revenue: 22400, orders: 340 },
      { label: 'Week 4', revenue: 26800, orders: 395 }
    ],
    '90d': [
      { label: 'Month 1', revenue: 54000, orders: 810 },
      { label: 'Month 2', revenue: 72500, orders: 1100 },
      { label: 'Month 3', revenue: 98400, orders: 1450 }
    ]
  };

  const currentChartData = chartDataMap[timeRange] || chartDataMap['7d'];
  const maxRev = Math.max(...currentChartData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      {/* 1. QUICK SHORTCUTS & ACTION BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setAdminTab('nav-manager')}
          className="p-3.5 rounded-2xl bg-[#10182A] border border-[#1769FF]/40 hover:border-[#1769FF] transition-all flex items-center justify-between group shadow-lg text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1769FF]/20 flex items-center justify-center text-[#1769FF] group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Navigation & Offers</div>
              <div className="text-[10px] text-slate-400 font-mono">Flash Deals & Banners</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#1769FF] transition-colors" />
        </button>

        <button
          onClick={() => setAdminTab('smart-projectors')}
          className="p-3.5 rounded-2xl bg-[#10182A] border border-[#26334A] hover:border-[#1769FF]/50 transition-all flex items-center justify-between group shadow-lg text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10182A] border border-[#26334A] flex items-center justify-center text-[#1769FF] group-hover:scale-110 transition-transform">
              <Projector className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">4K Projectors</div>
              <div className="text-[10px] text-slate-400 font-mono">{projectorCount} Models Active</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#1769FF] transition-colors" />
        </button>

        <button
          onClick={() => setAdminTab('license-vault')}
          className="p-3.5 rounded-2xl bg-[#10182A] border border-[#26334A] hover:border-[#00D99A]/50 transition-all flex items-center justify-between group shadow-lg text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00D99A]/15 flex items-center justify-center text-[#00D99A] group-hover:scale-110 transition-transform">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Digital License Vault</div>
              <div className="text-[10px] text-slate-400 font-mono">Instant Auto-Delivery</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#00D99A] transition-colors" />
        </button>

        <button
          onClick={() => setAdminTab('payments')}
          className="p-3.5 rounded-2xl bg-[#10182A] border border-[#26334A] hover:border-[#FFC928]/50 transition-all flex items-center justify-between group shadow-lg text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFC928]/15 flex items-center justify-center text-[#FFC928] group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Payment Gateways</div>
              <div className="text-[10px] text-slate-400 font-mono">JazzCash • Stripe • Crypto</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#FFC928] transition-colors" />
        </button>
      </div>

      {/* 2. TOP METRIC WIDGET CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#10182A] border border-[#26334A] space-y-3 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Gross Platform Sales</span>
            <div className="p-2 rounded-xl bg-[#00D99A]/15 text-[#00D99A] border border-[#00D99A]/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{formatPrice(totalRevenue)}</div>
            <div className="text-[11px] text-[#00D99A] font-mono flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +24.8% vs last week
            </div>
          </div>
        </div>

        {/* Metric 2: Orders Fulfilled */}
        <div className="p-5 rounded-2xl bg-[#10182A] border border-[#26334A] space-y-3 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Orders Processed</span>
            <div className="p-2 rounded-xl bg-[#1769FF]/15 text-[#1769FF] border border-[#1769FF]/30">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{totalOrders} Orders</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">100% automated key delivery</div>
          </div>
        </div>

        {/* Metric 3: Active Catalog SKUs */}
        <div className="p-5 rounded-2xl bg-[#10182A] border border-[#26334A] space-y-3 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Catalog SKUs</span>
            <div className="p-2 rounded-xl bg-[#FFC928]/15 text-[#FFC928] border border-[#FFC928]/30">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{totalProducts} Listed</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Digital Keys & 4K Projectors</div>
          </div>
        </div>

        {/* Metric 4: Sourcing Engine */}
        <div className="p-5 rounded-2xl bg-[#10182A] border border-[#26334A] space-y-3 relative overflow-hidden group shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">G2G Wholesale Bridge</span>
            <div className="p-2 rounded-xl bg-[#FF304F]/15 text-[#FF304F] border border-[#FF304F]/30">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">Connected</div>
            <div className="text-[11px] text-[#00D99A] font-mono flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D99A] animate-pulse" />
              Markup: +{g2gSettings.marginMarkupPercent}% Active
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE REVENUE & ORDER ANALYTICS CHART */}
      <div className="p-6 rounded-2xl bg-[#10182A] border border-[#26334A] space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26334A] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#1769FF] uppercase tracking-wider font-bold">
              <Activity className="w-4 h-4 text-[#1769FF]" />
              <span>Interactive Performance Telemetry</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">Revenue & Order Volume Progression</h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Chart Type Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#08152F] border border-[#26334A]">
              <button
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${chartType === 'area' ? 'bg-[#1769FF] text-white' : 'text-slate-400 hover:text-white'}`}
                title="Area Chart"
              >
                <LineChart className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${chartType === 'bar' ? 'bg-[#1769FF] text-white' : 'text-slate-400 hover:text-white'}`}
                title="Bar Chart"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Time Range Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#08152F] border border-[#26334A] text-xs font-mono">
              {(['today', '7d', '14d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all ${
                    timeRange === r
                      ? 'bg-[#1769FF] text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Chart Bars / Area */}
        <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 px-2">
          {currentChartData.map((point, index) => {
            const heightPercent = Math.max(12, Math.round((point.revenue / maxRev) * 100));
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#08152F] border border-[#26334A] px-2 py-1 rounded-lg text-[10px] font-mono text-white whitespace-nowrap shadow-xl z-20">
                  <div>{formatPrice(point.revenue)}</div>
                  <div className="text-slate-400">{point.orders} orders</div>
                </div>

                <div className="w-full flex items-end justify-center h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-500 relative overflow-hidden ${
                      chartType === 'bar'
                        ? 'bg-gradient-to-t from-[#1769FF] to-[#6B4DFF]'
                        : 'bg-gradient-to-t from-[#1769FF]/30 via-[#1769FF]/60 to-[#287BFF] border-t-2 border-[#1769FF]'
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 truncate w-full text-center">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. RECENT ORDERS & BREAKDOWNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#10182A] border border-[#26334A] space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#26334A]">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Recent Live Orders
            </span>
            <span className="text-xs text-[#00D99A] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D99A] animate-ping" />
              Live Stream
            </span>
          </div>

          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-3 rounded-xl bg-[#08152F] border border-[#26334A] flex items-center justify-between hover:bg-[#121C30] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#10182A] border border-[#26334A] flex items-center justify-center font-mono text-xs font-bold text-white">
                    #{order.orderNumber?.replace('ORD-', '') || order.id.slice(0, 4)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[200px]">
                      {order.items[0]?.productTitle || 'Digital License'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {order.customerEmail} • {order.items.length} item(s)
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#1769FF]">
                    {formatPrice(order.total)}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                    order.paymentStatus === 'paid' ? 'bg-[#00D99A]/15 text-[#00D99A]' :
                    order.paymentStatus === 'pending' ? 'bg-[#FFC928]/15 text-[#FFC928]' :
                    'bg-[#FF304F]/15 text-[#FF304F]'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic & Fulfillment Diagnostics (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#10182A] border border-[#26334A] space-y-4 shadow-xl">
          <div className="pb-3 border-b border-[#26334A]">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Acquisition & Channel Attribution
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>TikTok Organic & Influencers</span>
                <span className="text-[#FF304F] font-bold">42%</span>
              </div>
              <div className="w-full bg-[#08152F] h-2 rounded-full overflow-hidden border border-[#26334A]">
                <div className="bg-[#FF304F] h-full rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Google Search & High-Intent SEO</span>
                <span className="text-[#1769FF] font-bold">28%</span>
              </div>
              <div className="w-full bg-[#08152F] h-2 rounded-full overflow-hidden border border-[#26334A]">
                <div className="bg-[#1769FF] h-full rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>WhatsApp Concierge & VIP Direct</span>
                <span className="text-[#00D99A] font-bold">18%</span>
              </div>
              <div className="w-full bg-[#08152F] h-2 rounded-full overflow-hidden border border-[#26334A]">
                <div className="bg-[#00D99A] h-full rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Direct Brand Word-of-Mouth</span>
                <span className="text-[#FFC928] font-bold">12%</span>
              </div>
              <div className="w-full bg-[#08152F] h-2 rounded-full overflow-hidden border border-[#26334A]">
                <div className="bg-[#FFC928] h-full rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#08152F] border border-[#26334A] space-y-1 mt-4">
            <div className="text-[11px] text-[#00D99A] font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>TLS 1.3 Express API Ingress Active</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Average delivery time: 1.4 seconds from checkout confirmation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
