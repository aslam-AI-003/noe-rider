'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Wallet, CalendarClock, Trophy, User,
  Bike, Heart, HelpCircle, Medal, X, Menu,
} from 'lucide-react';

// ━━━━━ Bottom Nav (5 main tabs) ━━━━━
const RIDER_NAV = [
  { href: '/dashboard/rider', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/rider/earnings', icon: Wallet, label: 'Earnings' },
  { href: '/dashboard/rider/schedule', icon: CalendarClock, label: 'Schedule' },
  { href: '/dashboard/rider/incentives', icon: Trophy, label: 'Quests' },
  { href: '/dashboard/rider/profile', icon: User, label: 'Profile' },
];

// ━━━━━ Sidebar items (accessible from hamburger menu) ━━━━━
const SIDEBAR_ITEMS = [
  { href: '/dashboard/rider', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/rider/earnings', icon: Wallet, label: 'Earnings' },
  { href: '/dashboard/rider/schedule', icon: CalendarClock, label: 'Schedule' },
  { href: '/dashboard/rider/incentives', icon: Trophy, label: 'Quests & Rewards' },
  { href: '/dashboard/rider/leaderboard', icon: Medal, label: 'Leaderboard' },
  { href: '/dashboard/rider/vehicle', icon: Bike, label: 'Vehicle & Documents' },
  { href: '/dashboard/rider/insurance', icon: Heart, label: 'Insurance' },
  { href: '/dashboard/rider/support', icon: HelpCircle, label: 'Support' },
  { href: '/dashboard/rider/profile', icon: User, label: 'Profile & Settings' },
];

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen app-bg">
      {children}

      {/* ━━━ FLOATING MENU BUTTON (top-right, visible on all pages except home which has its own header) ━━━ */}
      {pathname !== '/dashboard/rider' && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 right-4 z-40 w-10 h-10 rounded-xl surface shadow-md flex items-center justify-center"
        >
          <Menu size={18} className="text-body" />
        </button>
      )}

      {/* ━━━ SIDEBAR DRAWER ━━━ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 app-bg border-l border-subtle shadow-xl overflow-y-auto animate-slide-in-right">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-subtle">
              <h2 className="text-sm font-bold text-body">Rider Menu</h2>
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg surface flex items-center justify-center">
                <X size={16} className="text-muted" />
              </button>
            </div>

            {/* Sidebar Items */}
            <div className="p-3 space-y-1">
              {SIDEBAR_ITEMS.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive ? 'bg-orange-500/10 border border-orange-500/20' : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}>
                    <item.icon size={18} className={isActive ? 'text-accent' : 'text-muted'} />
                    <span className={`text-sm font-medium ${isActive ? 'text-accent' : 'text-body'}`}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ━━━ BOTTOM NAVIGATION ━━━ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-lg mx-auto">
          <div className="mx-3 mb-3 rounded-2xl border border-subtle shadow-lg"
            style={{ background: 'var(--bottom-nav-bg)', borderColor: 'var(--bottom-nav-border)' }}>
            <div className="flex items-center justify-around py-2.5">
              {RIDER_NAV.map(item => {
                const isActive = pathname === item.href || (item.href !== '/dashboard/rider' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}
                    className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                      isActive ? 'text-accent' : 'text-muted'
                    }`}>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    <span className={`text-[9px] font-bold ${isActive ? 'text-accent' : 'text-faint'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-orange-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
