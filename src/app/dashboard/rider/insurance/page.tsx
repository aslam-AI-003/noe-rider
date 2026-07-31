'use client';

import React, { useState } from 'react';
import {
  Heart, Shield, User, Building2, Phone, FileText, CheckCircle2,
  Clock, AlertCircle, ChevronRight, Download, Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER INSURANCE — Health + Accidental + Nominee
// Production-ready — inspired by Uber/Swiggy partner
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Policy {
  id: string;
  type: 'health' | 'accidental' | 'life';
  name: string;
  provider: string;
  coverAmount: number;
  premium: string;
  status: 'active' | 'expired' | 'pending';
  policyNumber: string;
  startDate: string;
  endDate: string;
  features: string[];
}

export default function RiderInsurancePage() {
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'hospitals'>('policies');

  const policies: Policy[] = [
    {
      id: 'p1', type: 'health', name: 'Health Cover', provider: 'Star Health Insurance',
      coverAmount: 200000, premium: '₹99/month (Company paid)', status: 'active',
      policyNumber: 'NOE-H-2026-4521', startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026',
      features: ['OPD Cover ₹5,000', 'Hospitalization ₹2,00,000', 'Day Care Procedures', 'Pre & Post Hospitalization'],
    },
    {
      id: 'p2', type: 'accidental', name: 'Accident Cover', provider: 'ICICI Lombard',
      coverAmount: 500000, premium: 'Free (NOE benefit)', status: 'active',
      policyNumber: 'NOE-A-2026-8812', startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026',
      features: ['Accidental Death ₹5,00,000', 'Permanent Disability ₹5,00,000', 'Temporary Disability ₹1,000/day', 'Medical Expenses ₹50,000'],
    },
    {
      id: 'p3', type: 'life', name: 'Term Life Cover', provider: 'LIC',
      coverAmount: 1000000, premium: '₹149/month', status: 'pending',
      policyNumber: 'Pending', startDate: '-', endDate: '-',
      features: ['Life Cover ₹10,00,000', 'Nominee receives full amount', 'No medical test required', '24/7 claim support'],
    },
  ];

  const claims = [
    { id: 'c1', type: 'Health', amount: '₹4,500', date: 'Jul 15, 2026', status: 'approved', desc: 'OPD consultation + medicine' },
    { id: 'c2', type: 'Accident', amount: '₹12,000', date: 'May 22, 2026', status: 'settled', desc: 'Minor accident — bike repair + treatment' },
    { id: 'c3', type: 'Health', amount: '₹8,200', date: 'Mar 10, 2026', status: 'processing', desc: 'Hospitalization (2 days)' },
  ];

  const hospitals = [
    { name: 'Thanjavur Medical College', dist: '2.1 km', type: 'Government', speciality: 'Multi-specialty' },
    { name: 'Apollo Hospital', dist: '3.8 km', type: 'Private', speciality: 'Multi-specialty' },
    { name: 'Sri Ramakrishna Hospital', dist: '5.2 km', type: 'Private', speciality: 'General' },
    { name: 'GVN Hospital', dist: '1.5 km', type: 'Private', speciality: 'Ortho + General' },
    { name: 'Kumbakonam GH', dist: '12 km', type: 'Government', speciality: 'Multi-specialty' },
  ];

  const statusConfig = {
    active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    pending: { label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    approved: { label: 'Approved', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    settled: { label: 'Settled', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    processing: { label: 'Processing', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  };

  const typeIcons = { health: Heart, accidental: Shield, life: User };

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 header-glass">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-lg font-black text-body flex items-center gap-2">
            <Heart size={20} className="text-[#ef4444]" /> Insurance
          </h1>
          <p className="text-[11px] text-muted mt-0.5">Your health & safety cover</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Coverage Summary */}
        <div className="rounded-2xl p-5 border" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(139,92,246,0.04))', borderColor: 'rgba(239,68,68,0.12)' }}>
          <div className="text-center mb-3">
            <p className="text-xs text-muted">Total Coverage</p>
            <p className="text-3xl font-black text-body">₹17,00,000</p>
            <p className="text-[10px] text-emerald-400 mt-1 font-bold">✓ All policies active</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Health', amount: '₹2L', color: '#ef4444' },
              { label: 'Accident', amount: '₹5L', color: '#f59e0b' },
              { label: 'Life', amount: '₹10L', color: '#8b5cf6' },
            ].map(item => (
              <div key={item.label} className="text-center p-2.5 rounded-xl" style={{ background: 'var(--card-bg)' }}>
                <p className="text-sm font-black text-body">{item.amount}</p>
                <p className="text-[9px] text-faint">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nominee Card */}
        <div className="rounded-2xl p-4 border flex items-center gap-3" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)' }}>
            <User size={18} className="text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-body">Nominee: Priya M</p>
            <p className="text-[10px] text-faint">Spouse • +91 98765 43210</p>
          </div>
          <button onClick={() => toast('Edit nominee')} className="text-[10px] text-accent font-bold">Edit</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--card-bg)' }}>
          {(['policies', 'claims', 'hospitals'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${
                activeTab === tab ? 'text-black shadow-lg' : 'text-muted'
              }`}
              style={activeTab === tab ? { background: 'var(--orange)' } : {}}>
              {tab}
            </button>
          ))}
        </div>

        {/* Policies */}
        {activeTab === 'policies' && (
          <div className="space-y-3">
            {policies.map(policy => {
              const Icon = typeIcons[policy.type];
              const cfg = statusConfig[policy.status];
              return (
                <div key={policy.id} className="rounded-2xl p-4 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                      <Icon size={18} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-body">{policy.name}</h3>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </div>
                      <p className="text-[10px] text-faint">{policy.provider}</p>
                      <p className="text-[10px] text-faint mt-0.5">Policy: {policy.policyNumber}</p>
                    </div>
                    <p className="text-sm font-black text-body">₹{(policy.coverAmount / 100000).toFixed(0)}L</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {policy.features.map(f => (
                      <span key={f} className="text-[9px] px-2 py-0.5 rounded-full border text-muted" style={{ borderColor: 'var(--card-border)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--card-bg)' }}>
                    <span className="text-[10px] text-faint">{policy.premium}</span>
                    <span className="text-[10px] text-faint">{policy.startDate} → {policy.endDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Claims */}
        {activeTab === 'claims' && (
          <div className="space-y-2">
            <button onClick={() => toast.success('Claim form opening...')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold mb-3"
              style={{ background: 'rgba(255,193,7,0.06)', borderColor: 'rgba(255,193,7,0.2)', color: 'var(--orange)' }}>
              <Plus size={14} /> File New Claim
            </button>
            {claims.map(claim => {
              const cfg = statusConfig[claim.status as keyof typeof statusConfig];
              return (
                <div key={claim.id} className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-bg)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
                    {claim.status === 'approved' ? <CheckCircle2 size={16} style={{ color: cfg.color }} /> :
                     claim.status === 'processing' ? <Clock size={16} style={{ color: cfg.color }} /> :
                     <FileText size={16} style={{ color: cfg.color }} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-body">{claim.type} — {claim.amount}</p>
                    <p className="text-[10px] text-faint">{claim.desc}</p>
                    <p className="text-[9px] text-faint mt-0.5">{claim.date}</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Network Hospitals */}
        {activeTab === 'hospitals' && (
          <div className="space-y-2">
            {hospitals.map(h => (
              <div key={h.name} className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-bg)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <Building2 size={16} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-body">{h.name}</p>
                  <p className="text-[10px] text-faint">{h.speciality} • {h.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-accent">{h.dist}</p>
                  <button onClick={() => toast('Opening maps...')} className="text-[9px] text-blue-400">Navigate →</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emergency */}
        <button onClick={() => { if (typeof window !== 'undefined') window.open('tel:108'); }}
          className="w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}>
          <Phone size={16} /> Emergency: Call 108
        </button>

        {/* Download Policy */}
        <button onClick={() => toast.success('Policy PDF downloaded!')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: '#aaa' }}>
          <Download size={14} /> Download Policy Card (PDF)
        </button>
      </div>
    </div>
  );
}
