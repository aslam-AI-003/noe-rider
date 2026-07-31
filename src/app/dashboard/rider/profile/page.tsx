'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import {
  User, Phone, Bike, CreditCard, Shield, FileText,
  ChevronRight, LogOut, Bell, Moon, Globe, HelpCircle, Star,
  CheckCircle2, AlertCircle, Clock, Heart, Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER PROFILE — KYC, Bank, Vehicle, Settings
// Premium design inspired by Uber/Swiggy Partner
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function RiderProfilePage() {
  const { user, logout, riderRegistrations } = useStore();
  const router = useRouter();
  const [showKYC, setShowKYC] = useState(false);

  const rider = riderRegistrations.find(r => r.status === 'approved' && (r.riderId === user?.uid || r.phone === user?.phone));

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/rider/login');
  };

  // KYC items
  const kycItems = [
    { label: 'Aadhaar Card', status: rider?.aadhaarNumber ? 'verified' : 'pending', value: rider?.aadhaarNumber ? `****${rider.aadhaarNumber.slice(-4)}` : 'Not submitted' },
    { label: 'Driving License', status: rider?.licenseNumber ? 'verified' : rider?.vehicleType === 'Cycle' || rider?.vehicleType === 'Walking' ? 'not_required' : 'pending', value: rider?.licenseNumber || 'Not submitted' },
    { label: 'PAN Card', status: 'pending', value: 'Not submitted' },
    { label: 'Bank Account', status: 'verified', value: 'HDFC ****4521' },
  ];

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: Shield, label: 'KYC Documents', desc: 'Aadhaar, License, PAN', color: 'var(--orange)', action: () => setShowKYC(true) },
        { icon: CreditCard, label: 'Bank & UPI', desc: 'HDFC ****4521 • UPI linked', color: '#22c55e', action: () => toast('Bank settings') },
        { icon: Bike, label: 'Vehicle Details', desc: `${rider?.vehicleType || 'Bike'} • RC uploaded`, color: '#8b5cf6', action: () => toast('Vehicle details') },
        { icon: Heart, label: 'Insurance', desc: 'Health + Accidental cover', color: '#ef4444', action: () => toast('Insurance details') },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Globe, label: 'Language', desc: 'English', color: '#3b82f6', action: () => toast('Language settings') },
        { icon: Moon, label: 'Dark Mode', desc: 'Always On', color: '#6366f1', action: () => toast('Theme toggle') },
        { icon: Bell, label: 'Notifications', desc: 'All enabled', color: '#f59e0b', action: () => toast('Notification settings') },
        { icon: Smartphone, label: 'App Lock', desc: 'PIN / Biometric', color: '#06b6d4', action: () => toast('Security settings') },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & FAQ', desc: '24/7 support available', color: '#10b981', action: () => toast('Opening help') },
        { icon: FileText, label: 'Terms & Policies', desc: 'Privacy, Terms of Service', color: '#64748b', action: () => toast('Opening terms') },
        { icon: Star, label: 'Rate the App', desc: 'Help us improve', color: '#fbbf24', action: () => toast('Thanks! ⭐') },
      ],
    },
  ];

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 header-glass">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-lg font-black text-body flex items-center gap-2">
            <User size={20} className="text-accent" /> Profile
          </h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Profile Card */}
        <div className="rounded-3xl p-5 border" style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.06), rgba(139,92,246,0.04))', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
              style={{ background: 'var(--card-border)', color: 'var(--orange)' }}>
              {(user?.displayName || 'R')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-body">{user?.displayName || 'Rider'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-muted flex items-center gap-1"><Phone size={10} /> {user?.phone || rider?.phone || '9876543210'}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'var(--card-border)', color: 'var(--orange)' }}>
                  ID: {rider?.riderId || user?.uid?.slice(-8) || 'NOE-R-001'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#34d399' }}>
                  ✓ Verified
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <div className="text-center">
              <p className="text-lg font-black text-body">{rider?.totalDeliveries || 0}</p>
              <p className="text-[9px] text-faint">Deliveries</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-accent">4.8</p>
              <p className="text-[9px] text-faint">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-emerald-400">97%</p>
              <p className="text-[9px] text-faint">Acceptance</p>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map(section => (
          <div key={section.title}>
            <h3 className="text-[11px] font-bold text-faint uppercase tracking-wider mb-2 px-1">{section.title}</h3>
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              {section.items.map((item, idx) => (
                <button key={item.label} onClick={item.action}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-all hover:bg-white/[0.03] ${idx > 0 ? 'border-t' : ''}`}
                  style={{ borderColor: 'var(--card-bg)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${item.color}12` }}>
                    <item.icon size={16} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-body">{item.label}</p>
                    <p className="text-[10px] text-faint">{item.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-faint" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border text-sm font-bold transition-all"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
          <LogOut size={16} /> Logout
        </button>

        <p className="text-center text-[10px] text-faint pb-4">Namma Ooru Express v2.0 • Rider App</p>
      </div>

      {/* KYC Modal */}
      {showKYC && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowKYC(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border max-h-[80vh] overflow-auto"
            style={{ background: '#1a1a1a', borderColor: 'var(--card-border)' }}>
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-black text-body mb-4 flex items-center gap-2">
              <Shield size={18} className="text-accent" /> KYC Documents
            </h2>
            <div className="space-y-3">
              {kycItems.map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3.5 rounded-xl border"
                  style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.status === 'verified' ? 'bg-emerald-500/15' : item.status === 'not_required' ? 'bg-gray-500/15' : 'bg-amber-500/15'
                  }`}>
                    {item.status === 'verified' ? <CheckCircle2 size={16} className="text-emerald-400" /> :
                     item.status === 'not_required' ? <Clock size={16} className="text-muted" /> :
                     <AlertCircle size={16} className="text-amber-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-body">{item.label}</p>
                    <p className="text-[10px] text-faint">{item.value}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                    item.status === 'verified' ? 'bg-emerald-500/15 text-emerald-400' :
                    item.status === 'not_required' ? 'bg-gray-500/15 text-muted' :
                    'bg-amber-500/15 text-amber-400'
                  }`}>
                    {item.status === 'verified' ? '✓ Verified' : item.status === 'not_required' ? 'N/A' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowKYC(false)}
              className="w-full mt-4 py-3 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(255,193,7,0.1)', color: 'var(--orange)', border: '1px solid rgba(255,193,7,0.25)' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
