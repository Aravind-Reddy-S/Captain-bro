import React, { useContext, useEffect, useMemo, useState } from 'react';
import { OrderContext } from '../context/OrderContext';
import { useAdmin } from '../hooks/useAdmin';
import { formatPrice } from '../utils/formatPrice';
import { FaChartPie, FaChartLine, FaFire, FaTrophy, FaMotorcycle, FaUsers } from 'react-icons/fa';

const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', fill: '#F59E0B' },
  accepted: { bg: '#DBEAFE', fill: '#3B82F6' },
  preparing: { bg: '#E9D5FF', fill: '#8B5CF6' },
  dispatched: { bg: '#CFFAFE', fill: '#06B6D4' },
  delivered: { bg: '#D1FAE5', fill: '#10B981' },
  cancelled: { bg: '#FEE2E2', fill: '#EF4444' }
};

const CATEGORY_COLORS = [
  '#8B0000', '#D97706', '#059669', '#2563EB', '#7C3AED', '#DB2777', '#0891B2', '#65A30D'
];

export const Analytics = () => {
  const { orders, fetchOrders } = useContext(OrderContext);
  const { riders, customers, fetchRiders, fetchCustomers } = useAdmin();

  useEffect(() => {
    fetchOrders();
    fetchRiders();
    fetchCustomers();
  }, [fetchOrders, fetchRiders, fetchCustomers]);

  // Revenue by category
  const categoryRevenue = useMemo(() => {
    const map = {};
    orders.filter(o => o.status === 'delivered').forEach(order => {
      (order.items || []).forEach(item => {
        const cat = item.category || 'other';
        map[cat] = (map[cat] || 0) + (item.price * (item.quantity || 1));
      });
    });
    return Object.entries(map)
      .map(([name, revenue], i) => ({ name, revenue, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  const totalRevenue = useMemo(() => categoryRevenue.reduce((s, c) => s + c.revenue, 0), [categoryRevenue]);

  // Order status distribution
  const statusDist = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({
      status,
      count,
      color: STATUS_COLORS[status]?.fill || '#9CA3AF'
    }));
  }, [orders]);

  // Top selling products
  const topProducts = useMemo(() => {
    const map = {};
    orders.filter(o => o.status === 'delivered').forEach(order => {
      (order.items || []).forEach(item => {
        const key = item.name || item.id;
        if (!map[key]) map[key] = { name: key, qty: 0, revenue: 0 };
        map[key].qty += item.quantity || 1;
        map[key].revenue += item.price * (item.quantity || 1);
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [orders]);

  // Rider performance
  const riderPerf = useMemo(() => {
    const map = {};
    orders.filter(o => o.status === 'delivered' && o.riderId).forEach(order => {
      if (!map[order.riderId]) map[order.riderId] = { id: order.riderId, name: order.riderName || order.riderId, deliveries: 0 };
      map[order.riderId].deliveries += 1;
    });
    return Object.values(map).sort((a, b) => b.deliveries - a.deliveries);
  }, [orders]);

  // Weekly orders trend
  const weeklyTrend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = orders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr)).length;
      days.push({ label, count, dateStr });
    }
    return days;
  }, [orders]);

  const maxOrders = Math.max(...weeklyTrend.map(d => d.count), 1);

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 pb-20 text-left">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-neutral-dark flex items-center gap-2">
          <FaChartPie className="text-primary" /> Analytics & Insights
        </h2>
        <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">
          Business intelligence for Super Admin
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-neutral-border flex flex-col gap-0.5 items-center text-center">
          <FaChartLine className="text-primary text-sm" />
          <span className="text-[9px] font-bold text-neutral-dark/40 uppercase">Revenue</span>
          <span className="text-sm font-black text-neutral-dark">{formatPrice(totalRevenue)}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-neutral-border flex flex-col gap-0.5 items-center text-center">
          <FaUsers className="text-blue-600 text-sm" />
          <span className="text-[9px] font-bold text-neutral-dark/40 uppercase">Customers</span>
          <span className="text-sm font-black text-neutral-dark">{customers.length}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-neutral-border flex flex-col gap-0.5 items-center text-center">
          <FaMotorcycle className="text-emerald-600 text-sm" />
          <span className="text-[9px] font-bold text-neutral-dark/40 uppercase">Riders</span>
          <span className="text-sm font-black text-neutral-dark">{riders.length}</span>
        </div>
      </div>

      {/* Orders Trend Bar Chart */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-border flex flex-col gap-3 shadow-xs">
        <h4 className="text-[10px] font-bold text-neutral-dark/40 uppercase tracking-wider flex items-center gap-1.5">
          <FaChartLine className="text-primary" /> Weekly Orders Trend
        </h4>
        <div className="flex items-end gap-2 h-[100px]">
          {weeklyTrend.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[8px] font-bold text-neutral-dark/60">{d.count}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 transition-all duration-300"
                style={{ height: `${Math.max((d.count / maxOrders) * 70, 4)}px` }}
              />
              <span className="text-[8px] font-bold text-neutral-dark/40">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-border flex flex-col gap-3 shadow-xs">
        <h4 className="text-[10px] font-bold text-neutral-dark/40 uppercase tracking-wider flex items-center gap-1.5">
          <FaChartPie className="text-purple-600" /> Order Status Distribution
        </h4>
        {statusDist.length === 0 ? (
          <p className="text-xs text-neutral-dark/40 font-semibold text-center py-4">No orders yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {statusDist.map(s => (
              <div key={s.status} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-xs font-bold text-neutral-dark capitalize flex-1">{s.status}</span>
                <span className="text-xs font-black text-neutral-dark">{s.count}</span>
                <div className="w-24 h-2 bg-neutral-light rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(s.count / orders.length) * 100}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revenue by Category */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-border flex flex-col gap-3 shadow-xs">
        <h4 className="text-[10px] font-bold text-neutral-dark/40 uppercase tracking-wider flex items-center gap-1.5">
          <FaFire className="text-orange-500" /> Revenue by Category
        </h4>
        {categoryRevenue.length === 0 ? (
          <p className="text-xs text-neutral-dark/40 font-semibold text-center py-4">No delivered orders yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {categoryRevenue.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-xs font-bold text-neutral-dark capitalize flex-1">{c.name}</span>
                <span className="text-xs font-black text-neutral-dark">{formatPrice(c.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Selling Products */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-border flex flex-col gap-3 shadow-xs">
        <h4 className="text-[10px] font-bold text-neutral-dark/40 uppercase tracking-wider flex items-center gap-1.5">
          <FaTrophy className="text-yellow-500" /> Top Selling Products
        </h4>
        {topProducts.length === 0 ? (
          <p className="text-xs text-neutral-dark/40 font-semibold text-center py-4">No sales data yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2.5">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                  i === 1 ? 'bg-gray-100 text-gray-600 border border-gray-300' :
                  i === 2 ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                  'bg-neutral-light text-neutral-dark/50 border border-neutral-border'
                }`}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-neutral-dark truncate block">{p.name}</span>
                  <span className="text-[9px] text-neutral-dark/40 font-semibold">{p.qty} sold</span>
                </div>
                <span className="text-xs font-black text-neutral-dark">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rider Performance */}
      <div className="bg-white p-4 rounded-3xl border border-neutral-border flex flex-col gap-3 shadow-xs">
        <h4 className="text-[10px] font-bold text-neutral-dark/40 uppercase tracking-wider flex items-center gap-1.5">
          <FaMotorcycle className="text-emerald-600" /> Rider Performance
        </h4>
        {riderPerf.length === 0 ? (
          <p className="text-xs text-neutral-dark/40 font-semibold text-center py-4">No delivery data yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {riderPerf.map((r, i) => (
              <div key={r.id} className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-[10px] font-black">
                  {i + 1}
                </span>
                <span className="text-xs font-bold text-neutral-dark flex-1 truncate">{r.name}</span>
                <span className="text-xs font-black text-emerald-600">{r.deliveries} deliveries</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
