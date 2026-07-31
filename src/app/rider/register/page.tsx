'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bike, Check, ArrowLeft, Car, PersonStanding, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { riderService } from '@/lib/firestoreService';
import toast from 'react-hot-toast';

const VEHICLE_TYPES = [
  { label: 'Bike' as const, icon: Bike, desc: 'Motorcycle/Scooter' },
  { label: 'Cycle' as const, icon: Bike, desc: 'Bicycle' },
  { label: 'Auto' as const, icon: Car, desc: 'Auto Rickshaw' },
  { label: 'Walking' as const, icon: PersonStanding, desc: 'On Foot' },
];

export default function RiderRegisterPage() {
  const router = useRouter();
  const { addRiderRegistration } = useStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    aadhaarNumber: '',
    licenseNumber: '',
    vehicleType: 'Bike' as 'Bike' | 'Cycle' | 'Auto' | 'Walking',
  });

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.city || !form.aadhaarNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    const riderData = {
      id: 'rider-reg-' + Date.now().toString(36),
      name: form.name,
      phone: form.phone,
      email: form.email,
      city: form.city,
      vehicleType: form.vehicleType,
      aadhaarNumber: form.aadhaarNumber,
      licenseNumber: form.licenseNumber,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    // Save to Zustand (instant UI)
    addRiderRegistration(riderData);

    // Save to Firestore (persistence + multi-device)
    try {
      const firestoreId = await riderService.create(riderData);
      if (firestoreId) {
        console.log('✅ Rider saved to Firestore:', firestoreId);
      }
    } catch (err) {
      console.warn('Firestore write failed (demo mode):', err);
    }

    toast.success('Registration submitted! 🎉 Wait for admin approval.');
    setStep(4); // Success
  };

  return (
    <div className="min-h-screen app-bg py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-secondary mb-6">
          <ArrowLeft size={16} /> Back
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
            <Bike size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-body">Become a <span className="text-purple-600 dark:text-purple-400">Delivery Partner</span></h1>
          <p className="text-sm text-muted mt-1">Earn ₹15,000 - ₹30,000 per month</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-20 h-1.5 rounded-full transition-all ${s <= step ? 'bg-purple-500' : 'bg-[var(--bg3)]'}`} />
          ))}
        </div>

        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-body">Personal Details</h2>
            <div>
              <label className="text-xs font-bold text-muted mb-1 block">Full Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" className="input-glass text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted mb-1 block">Phone Number *</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" className="input-glass text-sm" maxLength={10} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted mb-1 block">Email (Optional)</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="input-glass text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted mb-1 block">City *</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g., Thanjavur" className="input-glass text-sm" />
            </div>
            <button onClick={() => {
              if (!form.name || !form.phone || !form.city) { toast.error('Fill required fields'); return; }
              setStep(2);
            }} className="btn-primary w-full py-3">Next → Vehicle Details</button>
          </div>
        )}

        {/* Step 2: Vehicle */}
        {step === 2 && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-body">Vehicle Type</h2>
            <div className="grid grid-cols-2 gap-3">
              {VEHICLE_TYPES.map(v => (
                <button
                  key={v.label}
                  onClick={() => setForm({ ...form, vehicleType: v.label })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    form.vehicleType === v.label
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-[var(--card-border)] surface hover:border-purple-500/40'
                  }`}
                >
                  <v.icon size={28} className={form.vehicleType === v.label ? 'text-purple-600 dark:text-purple-400 mx-auto' : 'text-muted mx-auto'} />
                  <p className="text-sm font-bold text-body mt-2">{v.label}</p>
                  <p className="text-[10px] text-faint">{v.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 surface rounded-xl text-sm font-bold text-secondary">← Back</button>
              <button onClick={() => setStep(3)} className="flex-1 btn-primary py-3">Next → Documents</button>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-body">Documents</h2>
            <div>
              <label className="text-xs font-bold text-muted mb-1 block">Aadhaar Number *</label>
              <input value={form.aadhaarNumber} onChange={e => setForm({ ...form, aadhaarNumber: e.target.value })} placeholder="12-digit Aadhaar number" className="input-glass text-sm" maxLength={12} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted mb-1 block">Driving License (Optional for Bike/Auto)</label>
              <input value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} placeholder="License number" className="input-glass text-sm" />
            </div>
            <div className="p-4 bg-purple-500/5 border border-purple-500/15 rounded-xl">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">📋 Summary</p>
              <p className="text-[11px] text-muted">{form.name} • {form.phone} • {form.city}</p>
              <p className="text-[11px] text-muted">Vehicle: {form.vehicleType}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="flex-1 py-3 surface rounded-xl text-sm font-bold text-secondary">← Back</button>
              <button onClick={handleSubmit} className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all">Submit Application</button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="glass-card p-8 text-center">
            <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={36} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-body">Application Submitted! 🎉</h2>
            <p className="text-sm text-muted mt-2">Your rider application is under review. Admin will approve within 24 hours.</p>
            <div className="mt-6 space-y-3">
              <Link href="/rider/login" className="btn-primary w-full py-3 inline-flex items-center justify-center gap-2">
                <Bike size={16} /> Go to Rider Login
              </Link>
              <Link href="/" className="block text-sm text-muted hover:text-secondary text-center">
                ← Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Benefits */}
        {step < 4 && (
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: '💰', title: '₹45/delivery', sub: 'Guaranteed' },
              { icon: '⏰', title: 'Flexible', sub: 'Work anytime' },
              { icon: '📱', title: 'Easy App', sub: 'Simple to use' },
            ].map(b => (
              <div key={b.title} className="glass-sm p-3 text-center">
                <span className="text-2xl">{b.icon}</span>
                <p className="text-xs font-bold text-body mt-1">{b.title}</p>
                <p className="text-[10px] text-faint">{b.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
