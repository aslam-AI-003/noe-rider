'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bike, Phone, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { riderService } from '@/lib/firestoreService';
import toast from 'react-hot-toast';

export default function RiderLoginPage() {
  const router = useRouter();
  const setUser = useStore(s => s.setUser);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!phone || !password) {
      toast.error('Enter phone number and Rider ID');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const state = useStore.getState();
      const allRiders = state.riderRegistrations;

      let rider = allRiders.find(
        r => r.status === 'approved' && r.phone === phone.trim() && r.password === password.trim()
      );

      // Fallback: case-insensitive
      if (!rider) {
        rider = allRiders.find(
          r => r.status === 'approved' &&
               r.phone === phone.trim() &&
               r.password?.toUpperCase() === password.trim().toUpperCase()
        );
      }

      if (rider) {
        setUser({
          uid: rider.riderId || rider.id,
          displayName: rider.name,
          phone: rider.phone,
          email: rider.email,
          role: 'rider',
        });

        // Mark rider as online
        state.setRiderOnline(rider.riderId || rider.id, true);

        toast.success(`Welcome, ${rider.name}! 🚴`);
        router.push('/dashboard/rider');
      } else {
        toast.error('Invalid credentials. Check phone & Rider ID.');
        console.log('[Rider Login] Entered:', { phone: phone.trim(), password: password.trim() });
        console.log('[Rider Login] Available:', allRiders.map(r => ({
          phone: r.phone, password: r.password, status: r.status, riderId: r.riderId
        })));
      }

      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-secondary mb-6">
          <ArrowLeft size={16} /> Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
            <Bike size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-body">Rider Login</h1>
          <p className="text-sm text-muted mt-1">Login to start deliveries</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-muted mb-2 block flex items-center gap-1.5">
              <Phone size={12} /> Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter registered phone number"
              className="input-glass text-sm"
              maxLength={15}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted mb-2 block flex items-center gap-1.5">
              <Lock size={12} /> Rider ID (Password)
            </label>
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your Rider ID (e.g., NOE-R-XXXX)"
              className="input-glass text-sm"
            />
            <p className="text-[10px] text-faint mt-1.5">
              Your Rider ID was provided by admin after approval
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

        {/* Help */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-xs text-faint">
            Don&apos;t have an account?{' '}
            <Link href="/rider/register" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
              Register as Rider
            </Link>
          </p>
        </div>

        {/* How to */}
        <div className="mt-6 surface rounded-xl p-4">
          <p className="text-[10px] font-bold text-faint uppercase mb-2">How to get credentials:</p>
          <ol className="text-[11px] text-muted space-y-1.5 list-decimal list-inside">
            <li>Register at <span className="text-purple-600 dark:text-purple-400 font-bold">/rider/register</span></li>
            <li>Admin approves at <span className="text-purple-600 dark:text-purple-400 font-bold">/admin/riders</span></li>
            <li>Use Phone + Rider ID to login here</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
