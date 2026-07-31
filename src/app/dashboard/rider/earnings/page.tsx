'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Bike,
  IndianRupee, Download, ChevronRight, Zap, Gift, CloudRain,
} from 'lucide-react';

const TABS = ['Today', 'This Week', 'This Month'] as const;

function generateEarningsData(deliveredCount: number) {
  const perOrder = 45;
  const today = deliveredCount * perOrder;
  return {
    today: { earnings: today, orders: deliveredCount, hours: Math.max(1, Math.round(deliveredCount * 0.4)), bonus: deliveredCount >= 5 ? 100 : 0, tips: Math.round(deliveredCount * 8) },
    week: { earnings: Math.round(today * 5.5), orders: Math.round(deliveredCount * 5.5), hours: Math.round(deliveredCount * 2.2), bonus: 350, tips: Math.round(deliveredCount * 44) },
    month: { earnings: Math.round(today * 22), orders: Math.round(deliveredCount * 22), hours: Math.round(deliveredCount * 8.8), bonus: 1500, tips: Math.round(deliveredCount * 176) },
  };
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full rounded-t-md transition-all duration-300"
            style={{ height: `${(val / max) * 100}%`, minHeight: '4px', background: color, opacity: i === data.length - 1 ? 1 : 0.5 }} />
          <span className="text-[8px] text-faint">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
        </div>
      ))}
    </div>
  );
}

function ProgressRing({ value, max, color, label, icon: Icon }: { value: number; max: number; color: string; label: string; icon: React.ElementType }) {
  const pct = Math.min((value / max) * 100, 100);
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--card-border)" strokeWidth="5" />
          <circle cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-black text-body">{value}/{max}</p>
        <p className="text-[9px] text-faint">{label}</p>
      </div>
    </div>
  );
}

export default function RiderEarningsPage() {
  const { demoOrders, user } = useStore();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Today');

  const riderId = user?.uid || 'rider-001';
  const deliveredOrders = demoOrders.filter(o => o.status === 'delivered' && o.riderId === riderId);
  const data = generateEarningsData(deliveredOrders.length);
  const current = activeTab === 'Today' ? data.today : activeTab === 'This Week' ? data.week : data.month;
  const weeklyData = [180, 225, 270, 135, 315, 360, data.today.earnings || 90];

  const settlements = [
    { id: 1, amount: 2450, date: 'Jul 28, 2026', method: 'UPI' },
    { id: 2, amount: 3200, date: 'Jul 21, 2026', method: 'Bank' },
    { id: 3, amount: 1890, date: 'Jul 14, 2026', method: 'UPI' },
  ];

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 header-glass">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black text-body flex items-center gap-2">
                <Wallet size={20} className="text-accent" /> Earnings
              </h1>
              <p className="text-[11px] text-muted mt-0.5">Track your income & payouts</p>
            </div>
            <button className="px-3 py-1.5 rounded-xl text-xs font-bold surface flex items-center gap-1.5 text-accent">
              <Download size={12} /> Statement
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        {/* Period Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl surface">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab ? 'bg-orange-500 text-white shadow-lg' : 'text-muted hover:text-body'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Main Earnings Card */}
        <div className="glass-card p-5">
          <div className="text-center mb-4">
            <p className="text-xs text-muted mb-1">{activeTab}&apos;s Earnings</p>
            <div className="flex items-center justify-center gap-1">
              <IndianRupee size={24} className="text-accent" />
              <span className="text-4xl font-black text-body">{current.earnings}</span>
            </div>
            {current.bonus > 0 && (
              <p className="text-[11px] mt-1 text-emerald-500 font-bold flex items-center justify-center gap-1">
                <ArrowUpRight size={12} /> +₹{current.bonus} bonus included
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Orders', value: current.orders.toString(), icon: Bike, color: 'var(--orange)' },
              { label: 'Hours', value: `${current.hours}h`, icon: Clock, color: '#3b82f6' },
              { label: 'Bonus', value: `₹${current.bonus}`, icon: Zap, color: '#10b981' },
              { label: 'Tips', value: `₹${current.tips}`, icon: Gift, color: '#ec4899' },
            ].map(stat => (
              <div key={stat.label} className="text-center p-2.5 rounded-xl surface">
                <stat.icon size={14} className="mx-auto mb-1" style={{ color: stat.color }} />
                <p className="text-sm font-black text-body">{stat.value}</p>
                <p className="text-[9px] text-faint">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="glass-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-body flex items-center gap-2">
              <TrendingUp size={14} className="text-accent" /> Weekly Trend
            </h3>
            <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
              <ArrowUpRight size={11} /> +12%
            </span>
          </div>
          <MiniBarChart data={weeklyData} color="var(--orange)" />
        </div>

        {/* Performance Rings */}
        <div className="glass-sm p-4">
          <h3 className="text-sm font-bold text-body mb-4">Performance</h3>
          <div className="flex justify-around">
            <ProgressRing value={Math.min(current.orders, 10)} max={10} color="var(--orange)" label="Orders" icon={Bike} />
            <ProgressRing value={Math.min(current.hours, 8)} max={8} color="#3b82f6" label="Hours" icon={Clock} />
            <ProgressRing value={95} max={100} color="#10b981" label="On-Time %" icon={Zap} />
          </div>
        </div>

        {/* Breakdown */}
        <div className="glass-sm p-4">
          <h3 className="text-sm font-bold text-body mb-3">Breakdown</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Delivery Fee', amount: current.orders * 35, color: 'var(--orange)', icon: Bike },
              { label: 'Distance Bonus', amount: current.orders * 10, color: '#3b82f6', icon: TrendingUp },
              { label: 'Peak Hour Bonus', amount: Math.round(current.bonus * 0.6), color: '#f59e0b', icon: Zap },
              { label: 'Rain Incentive', amount: Math.round(current.bonus * 0.2), color: '#06b6d4', icon: CloudRain },
              { label: 'Tips', amount: current.tips, color: '#ec4899', icon: Gift },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                  <item.icon size={14} style={{ color: item.color }} />
                </div>
                <span className="flex-1 text-xs text-secondary">{item.label}</span>
                <span className="text-xs font-bold text-body">₹{item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settlement History */}
        <div className="glass-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-body">Settlements</h3>
            <button className="text-[11px] text-accent font-bold">View All</button>
          </div>
          <div className="space-y-2">
            {settlements.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl surface">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10">
                  <ArrowDownRight size={16} className="text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-body">₹{s.amount}</p>
                  <p className="text-[10px] text-faint">{s.date} • {s.method}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-emerald-500">Paid</span>
                  <ChevronRight size={12} className="text-faint" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Withdraw */}
        <button className="w-full py-4 rounded-2xl text-sm font-black bg-orange-500 text-white flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Wallet size={16} /> Withdraw to Bank
        </button>
      </div>
    </div>
  );
}
