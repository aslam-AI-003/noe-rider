'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Crown, Medal, Trophy, TrendingUp, Star, Bike, Zap, Timer,
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER LEADERBOARD — Weekly/Monthly Rankings
// Gamification inspired by Swiggy/Uber
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TABS = ['This Week', 'This Month', 'All Time'] as const;

interface LeaderboardEntry {
  rank: number;
  name: string;
  riderId: string;
  deliveries: number;
  rating: number;
  avgTime: string;
  earnings: number;
  isCurrentUser?: boolean;
}

export default function RiderLeaderboardPage() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('This Week');

  const riderName = user?.displayName || 'You';

  // Simulated leaderboard data
  const weeklyData: LeaderboardEntry[] = [
    { rank: 1, name: 'Karthik M', riderId: 'NOE-R-K1', deliveries: 87, rating: 4.9, avgTime: '14m', earnings: 4350 },
    { rank: 2, name: 'Rajesh S', riderId: 'NOE-R-R2', deliveries: 82, rating: 4.8, avgTime: '16m', earnings: 4100 },
    { rank: 3, name: 'Suresh P', riderId: 'NOE-R-S3', deliveries: 76, rating: 4.9, avgTime: '15m', earnings: 3800 },
    { rank: 4, name: 'Murugan K', riderId: 'NOE-R-M4', deliveries: 71, rating: 4.7, avgTime: '17m', earnings: 3550 },
    { rank: 5, name: 'Senthil R', riderId: 'NOE-R-S5', deliveries: 68, rating: 4.8, avgTime: '16m', earnings: 3400 },
    { rank: 6, name: 'Arun V', riderId: 'NOE-R-A6', deliveries: 64, rating: 4.6, avgTime: '18m', earnings: 3200 },
    { rank: 7, name: riderName, riderId: user?.uid?.slice(-6) || 'NOE-R-U7', deliveries: 58, rating: 4.8, avgTime: '15m', earnings: 2900, isCurrentUser: true },
    { rank: 8, name: 'Vijay D', riderId: 'NOE-R-V8', deliveries: 54, rating: 4.5, avgTime: '19m', earnings: 2700 },
    { rank: 9, name: 'Kumar T', riderId: 'NOE-R-K9', deliveries: 49, rating: 4.6, avgTime: '20m', earnings: 2450 },
    { rank: 10, name: 'Dinesh L', riderId: 'NOE-R-D10', deliveries: 45, rating: 4.4, avgTime: '21m', earnings: 2250 },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={18} className="text-accent" />;
    if (rank === 2) return <Medal size={18} className="text-secondary" />;
    if (rank === 3) return <Medal size={18} className="text-amber-600" />;
    return <span className="text-xs font-black text-faint">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'linear-gradient(135deg, rgba(255,193,7,0.12), rgba(255,193,7,0.04))';
    if (rank === 2) return 'linear-gradient(135deg, rgba(192,192,192,0.08), rgba(192,192,192,0.02))';
    if (rank === 3) return 'linear-gradient(135deg, rgba(205,127,50,0.08), rgba(205,127,50,0.02))';
    return 'var(--card-bg)';
  };

  const currentUserEntry = weeklyData.find(e => e.isCurrentUser);

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 header-glass">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-lg font-black text-body flex items-center gap-2">
            <Trophy size={20} className="text-accent" /> Leaderboard
          </h1>
          <p className="text-[11px] text-muted mt-0.5">Compete with riders in your zone</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Your Position Card */}
        {currentUserEntry && (
          <div className="rounded-2xl p-5 border" style={{ background: 'linear-gradient(135deg, var(--card-bg), rgba(139,92,246,0.04))', borderColor: 'rgba(255,193,7,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black"
                style={{ background: 'var(--card-border)', color: 'var(--orange)' }}>
                #{currentUserEntry.rank}
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-body">Your Position</p>
                <p className="text-[11px] text-muted">{currentUserEntry.deliveries} deliveries this week</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-accent font-bold flex items-center gap-0.5"><Star size={9} fill="var(--orange)" /> {currentUserEntry.rating}</span>
                  <span className="text-[10px] text-muted flex items-center gap-0.5"><Timer size={9} /> {currentUserEntry.avgTime} avg</span>
                  <span className="text-[10px] text-emerald-400 font-bold">₹{currentUserEntry.earnings}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +2</p>
                <p className="text-[9px] text-faint">vs last week</p>
              </div>
            </div>
          </div>
        )}

        {/* Period Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--card-bg)' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab ? 'text-black shadow-lg' : 'text-muted'
              }`}
              style={activeTab === tab ? { background: 'var(--orange)' } : {}}>
              {tab}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-3 py-4">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black mb-1"
              style={{ background: 'rgba(192,192,192,0.15)', color: '#c0c0c0', border: '2px solid rgba(192,192,192,0.3)' }}>
              {weeklyData[1].name[0]}
            </div>
            <div className="w-16 pt-6 pb-2 rounded-t-xl text-center" style={{ background: 'rgba(192,192,192,0.08)' }}>
              <Medal size={14} className="mx-auto text-secondary mb-1" />
              <p className="text-[9px] font-bold text-body truncate px-1">{weeklyData[1].name.split(' ')[0]}</p>
              <p className="text-[8px] text-faint">{weeklyData[1].deliveries} orders</p>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-black mb-1"
              style={{ background: 'rgba(255,193,7,0.2)', color: 'var(--orange)', border: '2px solid rgba(255,193,7,0.4)' }}>
              {weeklyData[0].name[0]}
            </div>
            <div className="w-18 pt-8 pb-2 rounded-t-xl text-center px-3" style={{ background: 'var(--card-bg)' }}>
              <Crown size={16} className="mx-auto text-accent mb-1" />
              <p className="text-[10px] font-bold text-body">{weeklyData[0].name.split(' ')[0]}</p>
              <p className="text-[8px] text-accent">{weeklyData[0].deliveries} orders</p>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black mb-1"
              style={{ background: 'rgba(205,127,50,0.15)', color: '#cd7f32', border: '2px solid rgba(205,127,50,0.3)' }}>
              {weeklyData[2].name[0]}
            </div>
            <div className="w-16 pt-5 pb-2 rounded-t-xl text-center" style={{ background: 'rgba(205,127,50,0.06)' }}>
              <Medal size={14} className="mx-auto text-amber-600 mb-1" />
              <p className="text-[9px] font-bold text-body truncate px-1">{weeklyData[2].name.split(' ')[0]}</p>
              <p className="text-[8px] text-faint">{weeklyData[2].deliveries} orders</p>
            </div>
          </div>
        </div>

        {/* Full Rankings */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          {weeklyData.map((entry, idx) => (
            <div key={entry.riderId}
              className={`flex items-center gap-3 p-4 ${idx > 0 ? 'border-t' : ''} ${entry.isCurrentUser ? 'ring-1 ring-[var(--orange)]/30' : ''}`}
              style={{
                background: entry.isCurrentUser ? 'rgba(255,193,7,0.06)' : getRankBg(entry.rank),
                borderColor: 'var(--card-bg)',
              }}>
              {/* Rank */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--card-bg)' }}>
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar + Name */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: entry.isCurrentUser ? 'rgba(255,193,7,0.2)' : 'var(--card-border)', color: entry.isCurrentUser ? 'var(--orange)' : '#888' }}>
                {entry.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${entry.isCurrentUser ? 'text-accent' : 'text-body'}`}>
                  {entry.name} {entry.isCurrentUser && '(You)'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-faint flex items-center gap-0.5"><Bike size={8} /> {entry.deliveries}</span>
                  <span className="text-[9px] text-faint flex items-center gap-0.5"><Star size={8} fill="var(--orange)" stroke="none" /> {entry.rating}</span>
                  <span className="text-[9px] text-faint flex items-center gap-0.5"><Zap size={8} /> {entry.avgTime}</span>
                </div>
              </div>

              {/* Earnings */}
              <div className="text-right">
                <p className="text-xs font-black text-body">₹{entry.earnings}</p>
                <p className="text-[9px] text-faint">earned</p>
              </div>
            </div>
          ))}
        </div>

        {/* Criteria */}
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-xs font-bold text-body mb-2">Ranking Criteria</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Total Deliveries', weight: '40%' },
              { label: 'Customer Rating', weight: '25%' },
              { label: 'Avg Delivery Time', weight: '20%' },
              { label: 'Acceptance Rate', weight: '15%' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--card-bg)' }}>
                <span className="text-[10px] text-muted">{item.label}</span>
                <span className="text-[10px] font-bold text-accent">{item.weight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prize Info */}
        <div className="rounded-2xl p-4 border" style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.06), rgba(139,92,246,0.04))', borderColor: 'var(--card-border)' }}>
          <h3 className="text-xs font-bold text-body mb-2 flex items-center gap-1.5">
            <Trophy size={12} className="text-accent" /> Weekly Prizes
          </h3>
          <div className="space-y-1.5">
            {[
              { rank: '🥇 #1', prize: '₹2,000 bonus + Gold Badge' },
              { rank: '🥈 #2', prize: '₹1,000 bonus + Silver Badge' },
              { rank: '🥉 #3', prize: '₹500 bonus + Bronze Badge' },
              { rank: '🏆 Top 10', prize: '₹200 bonus each' },
            ].map(item => (
              <div key={item.rank} className="flex items-center justify-between">
                <span className="text-[11px] text-body">{item.rank}</span>
                <span className="text-[10px] text-muted">{item.prize}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
