'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Bike, Car, Zap, FileText, Shield, Calendar, CheckCircle2,
  AlertTriangle, Upload, Camera, ChevronRight, Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER VEHICLE MODULE — Documents, Insurance, Details
// Production-ready design
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Document {
  id: string;
  name: string;
  status: 'verified' | 'pending' | 'expired' | 'not_uploaded';
  expiryDate?: string;
  uploadedDate?: string;
  icon: React.ElementType;
}

const VEHICLE_TYPES = [
  { id: 'bike', label: 'Motorcycle', icon: Bike, desc: 'Hero Splendor / TVS Apache' },
  { id: 'scooter', label: 'Scooter', icon: Bike, desc: 'Honda Activa / TVS Jupiter' },
  { id: 'ev', label: 'Electric', icon: Zap, desc: 'Ather / Ola Electric / Bounce' },
  { id: 'cycle', label: 'Bicycle', icon: Bike, desc: 'Any bicycle / e-cycle' },
  { id: 'auto', label: 'Auto', icon: Car, desc: 'Auto Rickshaw / e-auto' },
];

export default function RiderVehiclePage() {
  const { user, riderRegistrations } = useStore();
  const rider = riderRegistrations.find(r => r.status === 'approved' && (r.riderId === user?.uid || r.phone === user?.phone));
  const [selectedType, setSelectedType] = useState(rider?.vehicleType?.toLowerCase() || 'bike');
  const [ownership, setOwnership] = useState<'own' | 'rental'>('own');

  const documents: Document[] = [
    { id: 'rc', name: 'Registration Certificate (RC)', status: 'verified', uploadedDate: 'Jan 15, 2026', expiryDate: 'Jan 2031', icon: FileText },
    { id: 'license', name: 'Driving License', status: rider?.licenseNumber ? 'verified' : 'pending', uploadedDate: rider?.licenseNumber ? 'Dec 2025' : undefined, expiryDate: 'Dec 2030', icon: Shield },
    { id: 'insurance', name: 'Vehicle Insurance', status: 'verified', uploadedDate: 'Mar 2026', expiryDate: 'Mar 2027', icon: Shield },
    { id: 'pollution', name: 'PUC Certificate', status: 'expired', uploadedDate: 'Jun 2025', expiryDate: 'Jun 2026', icon: AlertTriangle },
    { id: 'permit', name: 'Fitness Certificate', status: 'not_uploaded', icon: FileText },
  ];

  const statusConfig = {
    verified: { label: 'Verified', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    pending: { label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    not_uploaded: { label: 'Upload', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  };

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 header-glass">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-lg font-black text-body flex items-center gap-2">
            <Bike size={20} className="text-accent" /> Vehicle & Documents
          </h1>
          <p className="text-[11px] text-muted mt-0.5">Manage your vehicle details</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Current Vehicle Card */}
        <div className="rounded-2xl p-5 border" style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.06), rgba(139,92,246,0.03))', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,193,7,0.12)' }}>
              <Bike size={26} className="text-accent" />
            </div>
            <div>
              <h2 className="text-base font-black text-body">{rider?.vehicleType || 'Bike'}</h2>
              <p className="text-[11px] text-muted">TN-45-AB-1234 • {ownership === 'own' ? 'Own Vehicle' : 'Rental'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,197,94,0.1)', color: '#34d399' }}>✓ Active</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,193,7,0.1)', color: 'var(--orange)' }}>Petrol</span>
              </div>
            </div>
          </div>

          {/* Ownership Toggle */}
          <div className="flex gap-2">
            {(['own', 'rental'] as const).map(type => (
              <button key={type} onClick={() => setOwnership(type)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all"
                style={{
                  background: ownership === type ? 'rgba(255,193,7,0.1)' : 'var(--card-bg)',
                  borderColor: ownership === type ? 'rgba(255,193,7,0.3)' : 'var(--card-border)',
                  color: ownership === type ? 'var(--orange)' : '#888',
                }}>
                {type === 'own' ? '🏠 Own Vehicle' : '🔑 Rental'}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-sm font-bold text-body mb-3">Vehicle Type</h3>
          <div className="space-y-2">
            {VEHICLE_TYPES.map(v => (
              <button key={v.id} onClick={() => { setSelectedType(v.id); toast.success(`${v.label} selected`); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
                style={{
                  background: selectedType === v.id ? 'rgba(255,193,7,0.06)' : 'transparent',
                  borderColor: selectedType === v.id ? 'rgba(255,193,7,0.3)' : 'var(--card-bg)',
                }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: selectedType === v.id ? 'var(--card-border)' : 'var(--card-bg)' }}>
                  <v.icon size={16} style={{ color: selectedType === v.id ? 'var(--orange)' : '#888' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-body">{v.label}</p>
                  <p className="text-[10px] text-faint">{v.desc}</p>
                </div>
                <div className="w-4 h-4 rounded-full border-2" style={{
                  borderColor: selectedType === v.id ? 'var(--orange)' : '#444',
                  background: selectedType === v.id ? 'var(--orange)' : 'transparent'
                }} />
              </button>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-body">Documents</h3>
            <span className="text-[10px] text-emerald-400 font-bold">{documents.filter(d => d.status === 'verified').length}/{documents.length} verified</span>
          </div>
          <div className="space-y-2">
            {documents.map(doc => {
              const cfg = statusConfig[doc.status];
              return (
                <div key={doc.id} className="flex items-center gap-3 p-3.5 rounded-xl border" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'var(--card-bg)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
                    <doc.icon size={16} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-body">{doc.name}</p>
                    <p className="text-[10px] text-faint">
                      {doc.expiryDate ? `Expires: ${doc.expiryDate}` : 'Not uploaded'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    {doc.status === 'not_uploaded' || doc.status === 'expired' ? (
                      <button onClick={() => toast.success('Upload feature coming soon!')} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,193,7,0.1)' }}>
                        <Upload size={12} className="text-accent" />
                      </button>
                    ) : (
                      <ChevronRight size={12} className="text-faint" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Photo */}
        <button onClick={() => toast.success('Camera feature coming soon!')}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border text-sm font-bold transition-all"
          style={{ background: 'rgba(255,193,7,0.06)', borderColor: 'rgba(255,193,7,0.2)', color: 'var(--orange)' }}>
          <Camera size={16} /> Upload Vehicle Photo
        </button>

        {/* Service History */}
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-sm font-bold text-body mb-3 flex items-center gap-2">
            <Settings size={14} className="text-muted" /> Service Reminders
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Oil Change', due: 'In 500 km', color: '#22c55e' },
              { label: 'Tyre Check', due: 'In 2 weeks', color: '#fbbf24' },
              { label: 'Insurance Renewal', due: 'Mar 2027', color: '#22c55e' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--card-bg)' }}>
                <span className="text-xs text-secondary">{item.label}</span>
                <span className="text-[10px] font-bold" style={{ color: item.color }}>{item.due}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
