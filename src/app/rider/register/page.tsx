'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bike, Check, Car, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { riderService } from '@/lib/firestoreService';
import toast from 'react-hot-toast';

const VEHICLE_TYPES = [
  { label: 'Bike' as const, icon: Bike, desc: 'Motorcycle/Scooter' },
  { label: 'Cycle' as const, icon: Bike, desc: 'Bicycle' },
  { label: 'Auto' as const, icon: Car, desc: 'Auto Rickshaw' },
];

// Validation helpers
const isMotorized = (type: string) => type === 'Bike' || type === 'Auto';

const validateAadhaar = (val: string) => /^\d{12}$/.test(val);
const validatePhone = (val: string) => /^\d{10}$/.test(val);
const validateLicense = (val: string) => /^[A-Z]{2}\d{2}\d{4}\d{7}$/.test(val.toUpperCase().replace(/\s|-/g, ''));
const validateVehicleNumber = (val: string) => {
  const cleaned = val.toUpperCase().replace(/\s|-/g, '');
  return /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(cleaned);
};

export default function RiderRegisterPage() {
  const router = useRouter();
  const { addRiderRegistration } = useStore();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    aadhaarNumber: '',
    licenseNumber: '',
    vehicleType: 'Bike' as 'Bike' | 'Cycle' | 'Auto',
    vehicleNumber: '',
    vehicleModel: '',
  });

  // Step 1 validation
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!validatePhone(form.phone)) newErrors.phone = 'Enter valid 10-digit phone number';
    if (!form.city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3 validation
  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!validateAadhaar(form.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Enter valid 12-digit Aadhaar number';
    }
    if (isMotorized(form.vehicleType)) {
      if (!validateLicense(form.licenseNumber)) {
        newErrors.licenseNumber = 'Enter valid 15-char DL (e.g., TN0520230012345)';
      }
      if (!validateVehicleNumber(form.vehicleNumber)) {
        newErrors.vehicleNumber = 'Enter valid plate (e.g., TN45AB1234)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      toast.error('Please fix the errors');
      return;
    }

    const riderData = {
      id: 'rider-reg-' + Date.now().toString(36),
      name: form.name,
      phone: form.phone,
      email: form.email,
      city: form.city,
      vehicleType: form.vehicleType,
      vehicleNumber: form.vehicleNumber,
      vehicleModel: form.vehicleModel,
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

  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
        <AlertCircle size={10} /> {errors[field]}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 relative">
            <Image
              src="/images/UIimage.png"
              alt="NOX Delivery"
              width={96}
              height={96}
              className="rounded-full object-cover drop-shadow-[0_0_15px_rgba(14,159,110,0.4)]"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-white">Become a <span className="text-emerald-400">Delivery Partner</span></h1>
          <p className="text-sm text-gray-400 mt-1">Earn ₹15,000 - ₹30,000 per month</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-20 h-1.5 rounded-full transition-all ${s <= step ? 'bg-emerald-500' : 'bg-gray-700'}`} />
          ))}
        </div>

        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Personal Details</h2>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Full Name *</label>
              <input
                value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
              <FieldError field="name" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Phone Number * <span className="text-gray-600">(10 digits)</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => { setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }); setErrors({ ...errors, phone: '' }); }}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                maxLength={10}
              />
              <FieldError field="phone" />
              {form.phone && !errors.phone && (
                <p className="text-[10px] text-gray-500 mt-1">{form.phone.length}/10 digits</p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">Email (Optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">City *</label>
              <input
                value={form.city}
                onChange={e => { setForm({ ...form, city: e.target.value }); setErrors({ ...errors, city: '' }); }}
                placeholder="e.g., Thanjavur"
                className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
              <FieldError field="city" />
            </div>
            <button onClick={() => {
              if (validateStep1()) setStep(2);
            }} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-bold hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.98]">Next → Vehicle Details</button>
          </div>
        )}

        {/* Step 2: Vehicle */}
        {step === 2 && (
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Vehicle Type</h2>
            <div className="grid grid-cols-2 gap-3">
              {VEHICLE_TYPES.map(v => (
                <button
                  key={v.label}
                  onClick={() => setForm({ ...form, vehicleType: v.label })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    form.vehicleType === v.label
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-emerald-500/40'
                  }`}
                >
                  <v.icon size={28} className={form.vehicleType === v.label ? 'text-emerald-400 mx-auto' : 'text-gray-500 mx-auto'} />
                  <p className="text-sm font-bold text-white mt-2">{v.label}</p>
                  <p className="text-[10px] text-gray-500">{v.desc}</p>
                </button>
              ))}
            </div>

            {/* Show info about what documents are needed */}
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <p className="text-[11px] text-emerald-400 font-bold">
                {isMotorized(form.vehicleType)
                  ? '📋 Next step: Aadhaar + Driving License + Vehicle Number required'
                  : '📋 Next step: Only Aadhaar number required'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm font-bold text-gray-300 hover:bg-gray-700 transition-all">← Back</button>
              <button onClick={() => { setErrors({}); setStep(3); }} className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-bold hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.98]">Next → Documents</button>
            </div>
          </div>
        )}

        {/* Step 3: Documents & Vehicle Details */}
        {step === 3 && (
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Documents & Vehicle Details</h2>

            {/* Aadhaar — Always required */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                Aadhaar Number * <span className="text-gray-600">(12 digits)</span>
              </label>
              <input
                value={form.aadhaarNumber}
                onChange={e => { setForm({ ...form, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) }); setErrors({ ...errors, aadhaarNumber: '' }); }}
                placeholder="Enter 12-digit Aadhaar number"
                className={`w-full px-4 py-3 bg-gray-800/80 border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.aadhaarNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/30'
                }`}
                maxLength={12}
              />
              <FieldError field="aadhaarNumber" />
              {form.aadhaarNumber && !errors.aadhaarNumber && (
                <p className={`text-[10px] mt-1 ${form.aadhaarNumber.length === 12 ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {form.aadhaarNumber.length}/12 digits {form.aadhaarNumber.length === 12 ? '✅' : ''}
                </p>
              )}
            </div>

            {/* Motorized vehicle fields */}
            {isMotorized(form.vehicleType) && (
              <>
                {/* Driving License */}
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block">
                    Driving License * <span className="text-gray-600">(15 chars: e.g., TN0520230012345)</span>
                  </label>
                  <input
                    value={form.licenseNumber}
                    onChange={e => { setForm({ ...form, licenseNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15) }); setErrors({ ...errors, licenseNumber: '' }); }}
                    placeholder="e.g., TN0520230012345"
                    className={`w-full px-4 py-3 bg-gray-800/80 border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all uppercase tracking-wider ${
                      errors.licenseNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/30'
                    }`}
                    maxLength={15}
                  />
                  <FieldError field="licenseNumber" />
                  {form.licenseNumber && !errors.licenseNumber && (
                    <p className={`text-[10px] mt-1 ${form.licenseNumber.length === 15 ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {form.licenseNumber.length}/15 chars {form.licenseNumber.length === 15 ? '✅' : ''}
                    </p>
                  )}
                  <p className="text-[9px] text-gray-600 mt-0.5">Format: State(2) + RTO(2) + Year(4) + Number(7)</p>
                </div>

                {/* Vehicle Number */}
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block">
                    Vehicle Number (Plate) * <span className="text-gray-600">(e.g., TN45AB1234)</span>
                  </label>
                  <input
                    value={form.vehicleNumber}
                    onChange={e => { setForm({ ...form, vehicleNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 13) }); setErrors({ ...errors, vehicleNumber: '' }); }}
                    placeholder="e.g., TN45AB1234"
                    className={`w-full px-4 py-3 bg-gray-800/80 border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all uppercase tracking-wider ${
                      errors.vehicleNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/30'
                    }`}
                    maxLength={13}
                  />
                  <FieldError field="vehicleNumber" />
                  {form.vehicleNumber && !errors.vehicleNumber && (
                    <p className={`text-[10px] mt-1 ${validateVehicleNumber(form.vehicleNumber) ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {form.vehicleNumber.length} chars {validateVehicleNumber(form.vehicleNumber) ? '✅' : ''}
                    </p>
                  )}
                  <p className="text-[9px] text-gray-600 mt-0.5">Format: State(2) + District(2) + Series(1-2 letters) + Number(4)</p>
                </div>

                {/* Vehicle Model */}
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block">
                    Vehicle Model <span className="text-gray-600">(Optional)</span>
                  </label>
                  <input
                    value={form.vehicleModel}
                    onChange={e => setForm({ ...form, vehicleModel: e.target.value.slice(0, 30) })}
                    placeholder="e.g., Honda Activa 6G / TVS Jupiter"
                    className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    maxLength={30}
                  />
                </div>
              </>
            )}

            {/* Non-motorized info */}
            {!isMotorized(form.vehicleType) && (
              <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-xl">
                <p className="text-[11px] text-gray-400">
                  🚶 <strong>{form.vehicleType}</strong> — No vehicle documents required. Only Aadhaar is needed.
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <p className="text-xs text-emerald-400 font-bold mb-1">📋 Summary</p>
              <p className="text-[11px] text-gray-400">{form.name} • {form.phone} • {form.city}</p>
              <p className="text-[11px] text-gray-400">Vehicle: {form.vehicleType}
                {form.vehicleNumber && ` • ${form.vehicleNumber}`}
                {form.vehicleModel && ` • ${form.vehicleModel}`}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm font-bold text-gray-300 hover:bg-gray-700 transition-all">← Back</button>
              <button onClick={handleSubmit} className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-bold hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.98]">Submit Application</button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={36} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-white">Application Submitted! 🎉</h2>
            <p className="text-sm text-gray-400 mt-2">Your rider application is under review. Admin will approve within 24 hours.</p>
            <div className="mt-6 space-y-3">
              <Link href="/rider/login" className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-bold hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.98] inline-flex items-center justify-center gap-2">
                <Bike size={16} /> Go to Rider Login
              </Link>
            </div>
          </div>
        )}

        {/* Benefits */}
        {step < 4 && (
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: '💰', title: '₹40/delivery', sub: 'Guaranteed' },
              { icon: '⏰', title: 'Flexible', sub: 'Work anytime' },
              { icon: '📱', title: 'Easy App', sub: 'Simple to use' },
            ].map(b => (
              <div key={b.title} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
                <span className="text-2xl">{b.icon}</span>
                <p className="text-xs font-bold text-white mt-1">{b.title}</p>
                <p className="text-[10px] text-gray-500">{b.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Already have account */}
        {step < 4 && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Already registered?{' '}
              <Link href="/rider/login" className="text-emerald-400 font-bold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        )}

        {/* Footer branding */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-600">© 2026 NOX — Namba Ooru Express</p>
        </div>
      </div>
    </div>
  );
}
