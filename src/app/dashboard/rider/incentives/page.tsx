'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Trophy, Zap, Target, Flame, Gift, Star, Crown, Medal,
  CloudRain, Sun, Moon, PartyPopper, Timer, TrendingUp,
} from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER INCENTIVES — Quests, Badges, Achievements
// Gamification system inspired by Swiggy/Uber
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TABS = ['Daily', 'Weekly', 'Badges'] as const;

interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  icon: React.ElementType;
  color: string;
  type: 'orders' | 'hours' | 'streak' | 'special';
  expiresIn?: string;
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  earned: boolean;
  earnedDate?: string;
}

export default function RiderIncentivesPage() {
  const { demoOrders, user } = useStore();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Daily');

  const riderId = user?.uid || 'rider-001';
  const deliveredToday = demoOrders.filter(o => o.status === 'delivered' && o.riderId === riderId).length;

  // Daily Quests
  const dailyQuests: Quest[] = [
    { id: 'dq1', title: 'Complete 5 Orders', description: 'Deliver 5 orders today', target: 5, current: Math.min(deliveredToday, 5), reward: 100, icon: Target, color: 'var(--orange)', type: 'orders' },
    { id: 'dq2', title: 'Complete 10 Orders', description: 'Deliver 10 orders for bonus', target: 10, current: Math.min(deliveredToday, 10), reward: 250, icon: Flame, color: '#ef4444', type: 'orders' },
    { id: 'dq3', title: 'Peak Hour Hero', description: 'Complete 3 orders between 12-2 PM', target: 3, current: Math.min(deliveredToday, 2), reward: 75, icon: Sun, color: '#f59e0b', type: 'special', expiresIn: '2h left' },
    { id: 'dq4', title: 'Night Owl', description: 'Complete 3 orders after 8 PM', target: 3, current: 0, reward: 100, icon: Moon, color: '#8b5cf6', type: 'special', expiresIn: '6h left' },
    { id: 'dq5', title: 'Rain Warrior', description: 'Complete any delivery in rain', target: 1, current: 0, reward: 50, icon: CloudRain, color: '#06b6d4', type: 'special' },
  ];

  // Weekly Quests
  const weeklyQuests: Quest[] = [
    { id: 'wq1', title: 'Weekly 30', description: 'Complete 30 orders this week', target: 30, current: Math.min(deliveredToday * 4, 30), reward: 500, icon: Trophy, color: 'var(--orange)', type: 'orders' },
    { id: 'wq2', title: '5-Day Streak', description: 'Work 5 consecutive days', target: 5, current: 3, reward: 300, icon: Flame, color: '#ef4444', type: 'streak' },
    { id: 'wq3', title: 'Speed Demon', description: 'Average delivery under 20 min', target: 20, current: 18, reward: 200, icon: Zap, color: '#22c55e', type: 'special' },
    { id: 'wq4', title: '100% Acceptance', description: 'Accept all orders for 3 days', target: 3, current: 2, reward: 400, icon: Star, color: '#3b82f6', type: 'streak' },
    { id: 'wq5', title: 'Refer a Rider', description: 'Invite a friend to join NOE', target: 1, current: 0, reward: 500, icon: Gift, color: '#f472b6', type: 'special' },
  ];

  // Badges
  const badges: Badge[] = [
    { id: 'b1', title: 'First Delivery', description: 'Completed your first delivery', icon: PartyPopper, color: 'var(--orange)', earned: deliveredToday >= 1 },
    { id: 'b2', title: 'Speed Star', description: 'Delivered in under 15 min', icon: Zap, color: '#22c55e', earned: deliveredToday >= 2, earnedDate: 'Today' },
    { id: 'b3', title: '50 Orders', description: 'Completed 50 deliveries', icon: Medal, color: '#60a5fa', earned: false },
    { id: 'b4', title: '100 Orders', description: 'Century! 100 deliveries done', icon: Trophy, color: '#f59e0b', earned: false },
    { id: 'b5', title: 'Rain Warrior', description: 'Delivered in heavy rain', icon: CloudRain, color: '#06b6d4', earned: false },
    { id: 'b6', title: 'Night King', description: '25 deliveries after 9 PM', icon: Moon, color: '#8b5cf6', earned: false },
    { id: 'b7', title: '5-Star Rider', description: 'Got 10 five-star ratings', icon: Star, color: 'var(--orange)', earned: deliveredToday >= 3, earnedDate: 'Jul 28' },
    { id: 'b8', title: 'Champion', description: 'Top 3 in weekly leaderboard', icon: Crown, color: '#ef4444', earned: false },
    { id: 'b9', title: '30-Day Streak', description: 'Worked 30 days straight', icon: Flame, color: '#f97316', earned: false },
  ];

  const currentQuests = activeTab === 'Daily' ? dailyQuests : weeklyQuests;

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 header-glass">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black text-body flex items-center gap-2">
                <Trophy size={20} className="text-accent" /> Quests & Rewards
              </h1>
              <p className="text-[11px] text-muted mt-0.5">Complete quests to earn bonus</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5"
              style={{ background: 'var(--card-bg)', borderColor: 'rgba(255,193,7,0.25)' }}>
              <Trophy size={12} className="text-accent" />
              <span className="text-xs font-black text-accent">{badges.filter(b => b.earned).length}/{badges.length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--card-bg)' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab ? 'text-black shadow-lg' : 'text-muted hover:text-body'
              }`}
              style={activeTab === tab ? { background: 'var(--orange)' } : {}}>
              {tab}
            </button>
          ))}
        </div>

        {/* Total Potential Earnings Banner */}
        {activeTab !== 'Badges' && (
          <div className="rounded-2xl p-4 border flex items-center gap-3" style={{ background: 'linear-gradient(135deg, var(--card-bg), rgba(34,197,94,0.05))', borderColor: 'rgba(255,193,7,0.2)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--card-border)' }}>
              <Gift size={22} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted">Potential Bonus</p>
              <p className="text-xl font-black text-body">
                ₹{currentQuests.reduce((s, q) => s + q.reward, 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-faint">{currentQuests.filter(q => q.current >= q.target).length}/{currentQuests.length}</p>
              <p className="text-[10px] text-emerald-400 font-bold">Completed</p>
            </div>
          </div>
        )}

        {/* Quest Cards */}
        {activeTab !== 'Badges' && (
          <div className="space-y-3">
            {currentQuests.map(quest => {
              const pct = Math.min((quest.current / quest.target) * 100, 100);
              const isComplete = quest.current >= quest.target;

              return (
                <div key={quest.id} className={`rounded-2xl p-4 border transition-all ${isComplete ? 'opacity-60' : ''}`}
                  style={{ background: 'var(--card-bg)', borderColor: isComplete ? 'rgba(34,197,94,0.3)' : 'var(--card-border)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${quest.color}15` }}>
                      <quest.icon size={18} style={{ color: quest.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-body">{quest.title}</h3>
                        {isComplete && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">✓ Done</span>}
                      </div>
                      <p className="text-[11px] text-muted">{quest.description}</p>

                      {/* Progress bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: isComplete ? '#22c55e' : quest.color }} />
                        </div>
                        <span className="text-[10px] font-bold text-muted">{quest.current}/{quest.target}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-sm font-black" style={{ color: quest.color }}>₹{quest.reward}</span>
                      {quest.expiresIn && (
                        <span className="text-[9px] text-faint flex items-center gap-0.5">
                          <Timer size={8} /> {quest.expiresIn}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Badges Grid */}
        {activeTab === 'Badges' && (
          <div className="grid grid-cols-3 gap-3">
            {badges.map(badge => (
              <div key={badge.id} className={`rounded-2xl p-4 border text-center transition-all ${badge.earned ? '' : 'opacity-40 grayscale'}`}
                style={{ background: 'var(--card-bg)', borderColor: badge.earned ? `${badge.color}30` : 'var(--card-border)' }}>
                <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ background: badge.earned ? `${badge.color}18` : 'rgba(255,255,255,0.05)' }}>
                  <badge.icon size={20} style={{ color: badge.earned ? badge.color : '#666' }} />
                </div>
                <p className="text-[11px] font-bold text-body leading-tight">{badge.title}</p>
                <p className="text-[9px] text-faint mt-0.5">{badge.description}</p>
                {badge.earned && badge.earnedDate && (
                  <p className="text-[8px] text-emerald-400 mt-1 font-bold">✓ {badge.earnedDate}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Teaser */}
        <div className="rounded-2xl p-4 border flex items-center gap-3" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
            <TrendingUp size={18} className="text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-body">Your Rank: #7</p>
            <p className="text-[10px] text-faint">Top 10 this week! Keep going 🔥</p>
          </div>
          <Crown size={18} className="text-accent" />
        </div>

      </div>
    </div>
  );
}
