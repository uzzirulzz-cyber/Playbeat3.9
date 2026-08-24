import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Zap,
  Key,
  Copy,
  ExternalLink,
  ChevronDown,
  DollarSign
} from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, formatPrice, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q);
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    addToast('success', 'Order Updated', `Order #${orderId} status changed to ${newStatus}.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#10121B] border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Orders & Fulfillment Engine</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monitor instant digital key dispatches and DHL projector shipments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#141622] border border-white/5 text-xs font-mono">
            <span className="text-neutral-400">Total Processed: </span>
            <span className="text-emerald-400 font-bold">{orders.length} Orders</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-[#10121B] border border-white/5 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141622] rounded-xl border border-white/10 pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500/50"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-[#10121B] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#141622] font-mono text-neutral-400 uppercase text-[11px]">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items / Type</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((ord) => {
                const hasProjector = ord.items.some(i => i.productType === 'physical_projector');
                return (
                  <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono">
                      <div className="text-white font-bold">{ord.id}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{new Date(ord.createdAt).toLocaleString()}</div>
                    </td>

                    <td className="p-4">
                      <div className="text-white font-bold">{ord.customerName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{ord.customerEmail}</div>
                    </td>

                    <td className="p-4">
                      <div className="text-white font-medium truncate max-w-xs">
                        {ord.items[0]?.productTitle}
                        {ord.items.length > 1 && ` (+${ord.items.length - 1} more)`}
                      </div>
                      <div className="mt-0.5">
                        {hasProjector ? (
                          <span className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                            <Truck className="w-2.5 h-2.5" /> Hardware Shipment
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" /> Instant Key Issued
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-mono">
                      <div className="font-bold text-white text-sm">{formatPrice(ord.total)}</div>
                      <div className="text-[10px] text-emerald-400 font-bold uppercase">{ord.paymentStatus}</div>
                    </td>

                    <td className="p-4 font-mono">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300 text-[10px] uppercase font-bold">
                        {ord.paymentGateway}
                      </span>
                    </td>

                    <td className="p-4">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                        className="bg-[#141622] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-red-500/50"
                      >
                        <option value="completed">Completed</option>
                        <option value="shipped">Shipped</option>
                        <option value="processing">Processing</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
