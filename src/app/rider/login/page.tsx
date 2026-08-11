'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Phone, Lock, LogIn, Search, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { riderService } from '@/lib/firestoreService';
import toast from 'react-hot-toast';

export default function RiderLoginPage() {
  const router = useRouter();
  const setUser = useStore(s => s.setUser);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Status check state
  const [statusPhone, setStatusPhone] = useState('');
  const [statusResult, setStatusResult] = useState<{
    status: string;
    riderId?: string;
    name?: string;
    reason?: string;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const checkStatus = async () => {
    if (!statusPhone || statusPhone.length < 10) {
      toast.error('Enter valid 10-digit phone number');
      return;
    }
    setStatusLoading(true);
    setStatusResult(null);
    try {
      const rider = await riderService.findByPhone(statusPhone.trim());
      if (rider) {
        setStatusResult({
          status: rider.status,
          riderId: rider.riderId || rider.password,
          name: rider.name,
          reason: rider.rejectionReason,
        });
      } else {
        // Fallback: check local store
        const state = useStore.getState();
        const localRider = state.riderRegistrations.find((r: any) => r.phone === statusPhone.trim());
        if (localRider) {
          setStatusResult({
            status: localRider.status,
            riderId: localRider.riderId || localRider.password,
            name: localRider.name,
            reason: localRider.rejectionReason,
          });
        } else {
          setStatusResult({ status: 'not_found' });
        }
      }
    } catch (err) {
      // Fallback: check local store on error
      const state = useStore.getState();
      const localRider = state.riderRegistrations.find((r: any) => r.phone === statusPhone.trim());
      if (localRider) {
        setStatusResult({
          status: localRider.status,
          riderId: localRider.riderId || localRider.password,
          name: localRider.name,
          reason: localRider.rejectionReason,
        });
      } else {
        setStatusResult({ status: 'not_found' });
      }
    }
    setStatusLoading(false);
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      toast.error('Enter phone number and Rider ID');
      return;
    }

    setLoading(true);

    try {
      const state = useStore.getState();
      const allRiders = state.riderRegistrations;

      // First check local Zustand store
      let rider = allRiders.find(
        (r: any) => r.status === 'approved' && r.phone === phone.trim() && r.password === password.trim()
      );

      // Fallback: case-insensitive local check
      if (!rider) {
        rider = allRiders.find(
          (r: any) => r.status === 'approved' &&
               r.phone === phone.trim() &&
               r.password?.toUpperCase() === password.trim().toUpperCase()
        );
      }

      // If not found locally, check Firestore
      if (!rider) {
        const firestoreRider = await riderService.findByCredentials(phone.trim(), password.trim());
        if (firestoreRider) {
          rider = firestoreRider;
          state.addRiderRegistration(firestoreRider);
        }
        if (!rider) {
          const firestoreRider2 = await riderService.findByCredentials(phone.trim(), password.trim().toUpperCase());
          if (firestoreRider2) {
            rider = firestoreRider2;
            state.addRiderRegistration(firestoreRider2);
          }
        }
      }

      if (rider) {
        setUser({
          uid: rider.riderId || rider.id,
          displayName: rider.name,
          phone: rider.phone,
          email: rider.email,
          role: 'rider',
        });

        state.setRiderOnline(rider.riderId || rider.id, true);
        toast.success(`Welcome, ${rider.name}! 🚴`);
        router.push('/dashboard/rider');
      } else {
        toast.error('Invalid credentials. Check phone & Rider ID.');
      }
    } catch (err) {
      console.error('[Rider Login] Error:', err);
      toast.error('Login failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-sm w-full">

        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-5 relative">
            <Image
              src="/images/UIimage.png"
              alt="NOX Delivery"
              width={128}
              height={128}
              className="rounded-full object-cover drop-shadow-[0_0_20px_rgba(14,159,110,0.4)]"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            NOX <span className="text-emerald-400">Rider</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Namba Ooru Express — Delivery Partner</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 space-y-5 shadow-2xl shadow-emerald-900/10">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block flex items-center gap-1.5">
              <Phone size={12} className="text-emerald-400" /> Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter registered phone number"
              className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              maxLength={15}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block flex items-center gap-1.5">
              <Lock size={12} className="text-emerald-400" /> Rider ID (Password)
            </label>
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your Rider ID (e.g., NOX-R-XXXX)"
              className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
            <p className="text-[10px] text-gray-500 mt-1.5">
              Your Rider ID was provided by admin after approval
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-bold hover:from-emerald-500 hover:to-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-600/25 active:scale-[0.98]"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <LogIn size={16} /> Start Delivering
              </>
            )}
          </button>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-xs text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/rider/register" className="text-emerald-400 font-bold hover:underline">
              Register as Rider
            </Link>
          </p>
        </div>

        {/* ━━━ CHECK APPLICATION STATUS ━━━ */}
        <div className="mt-6 bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-emerald-400" />
            <p className="text-xs font-bold text-white">Check Application Status</p>
          </div>
          <div className="flex gap-2">
            <input
              type="tel"
              value={statusPhone}
              onChange={e => setStatusPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter your phone number"
              className="flex-1 px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              maxLength={10}
            />
            <button
              onClick={checkStatus}
              disabled={statusLoading}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all disabled:opacity-50"
            >
              {statusLoading ? '...' : 'Check'}
            </button>
          </div>

          {/* Status Result */}
          {statusResult && (
            <div className={`p-3 rounded-xl border ${
              statusResult.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30' :
              statusResult.status === 'pending' ? 'bg-amber-500/10 border-amber-500/30' :
              statusResult.status === 'rejected' ? 'bg-red-500/10 border-red-500/30' :
              'bg-gray-800 border-gray-700'
            }`}>
              {statusResult.status === 'approved' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <p className="text-sm font-bold text-emerald-400">Approved! 🎉</p>
                  </div>
                  <p className="text-xs text-gray-300">Welcome, {statusResult.name}!</p>
                  <div className="p-2.5 bg-gray-900/80 rounded-lg">
                    <p className="text-[10px] text-gray-500">Your Rider ID (use as password):</p>
                    <p className="text-lg font-black text-emerald-400 tracking-wider">{statusResult.riderId}</p>
                  </div>
                  <p className="text-[10px] text-gray-400">🚀 Use your phone + this Rider ID above to login and Go Live!</p>
                </div>
              )}
              {statusResult.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-400" />
                  <div>
                    <p className="text-sm font-bold text-amber-400">Under Review ⏳</p>
                    <p className="text-[10px] text-gray-400">Admin will review your application soon. Check back later!</p>
                  </div>
                </div>
              )}
              {statusResult.status === 'rejected' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <XCircle size={16} className="text-red-400" />
                    <p className="text-sm font-bold text-red-400">Rejected ❌</p>
                  </div>
                  {statusResult.reason && (
                    <p className="text-[10px] text-gray-400">Reason: {statusResult.reason}</p>
                  )}
                  <p className="text-[10px] text-gray-500">You can re-register with corrected details.</p>
                </div>
              )}
              {statusResult.status === 'not_found' && (
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-bold text-gray-400">Not Found</p>
                    <p className="text-[10px] text-gray-500">No application found for this number. <Link href="/rider/register" className="text-emerald-400 font-bold">Register here</Link></p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer branding */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-600">&copy; 2026 NOX — Namba Ooru Express</p>
        </div>
      </div>
    </div>
  );
}
