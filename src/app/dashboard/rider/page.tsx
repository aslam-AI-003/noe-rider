'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useStore, DemoOrder } from '@/store/useStore';
import {
  listenAvailableOrders, listenMyDelivery,
  acceptDelivery, markPickedUp, markInTransit, markDelivered,
  updateRiderLocation,
} from '@/lib/noxOrderService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NoxOrder } from '@/types/noxOrder';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Bike, UserRound, MapPin, Phone, Store, CheckCircle2,
  Navigation, Shield, Wallet, Clock, Package, TrendingUp, LogOut, MapPinned,
} from 'lucide-react';

// Dynamic import for map (client-only)
const LiveMap = dynamic(() => import('@/components/ui/LiveMap'), { ssr: false });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER DASHBOARD — Enhanced with OTP, Auto-assign, Earnings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STATUS_FLOW: Record<string, { next: DemoOrder['status']; label: string; color: string }> = {
  ready:      { next: 'picked_up', label: '📦 Pick Up Order', color: 'bg-purple-500' },
  picked_up:  { next: 'on_the_way', label: '🚴 Start Delivery', color: 'bg-blue-500' },
  on_the_way: { next: 'delivered', label: '✅ Mark Delivered (OTP)', color: 'bg-emerald-500' },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ready:      { label: '📦 Ready for Pickup', color: 'text-orange-600 dark:text-[#0E9F6E]' },
  picked_up:  { label: '🏃 Picked Up', color: 'text-purple-600 dark:text-purple-400' },
  on_the_way: { label: '🛵 On the Way', color: 'text-blue-600 dark:text-blue-400' },
  delivered:  { label: '✅ Delivered', color: 'text-emerald-600 dark:text-emerald-400' },
};

// Calculate distance between two coordinates (Haversine formula) — returns km
function calcDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Pricing: ₹40 base (within 4km from shop to customer) + ₹8/km above 4km
function calcDeliveryEarning(order: any): number {
  const shopLat = order.shopLat || order.pickupLat;
  const shopLng = order.shopLng || order.pickupLng;
  const custLat = order.customerLat || order.deliveryLat;
  const custLng = order.customerLng || order.deliveryLng;
  
  let distKm = 3; // default if coordinates not available
  if (shopLat && shopLng && custLat && custLng) {
    distKm = calcDistanceKm(shopLat, shopLng, custLat, custLng);
  } else if (order.distanceKm) {
    distKm = order.distanceKm;
  }

  if (distKm <= 4) return 40;
  return 40 + Math.ceil(distKm - 4) * 8;
}

// Get distance text for display
function getDistanceText(order: any): string {
  const shopLat = order.shopLat || order.pickupLat;
  const shopLng = order.shopLng || order.pickupLng;
  const custLat = order.customerLat || order.deliveryLat;
  const custLng = order.customerLng || order.deliveryLng;
  
  if (shopLat && shopLng && custLat && custLng) {
    const km = calcDistanceKm(shopLat, shopLng, custLat, custLng);
    return `${km.toFixed(1)} km`;
  }
  return order.distanceKm ? `${order.distanceKm} km` : '~3 km';
}

// Generate 4-digit OTP for delivery
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Sound for new delivery
function playNewDeliverySound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    setTimeout(() => ctx.close(), 700);
  } catch (e) {}
}

export default function RiderDashboard() {
  const { demoOrders, updateDemoOrderStatus, user, setRiderOnline, logout } = useStore();
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [currentOTP, setCurrentOTP] = useState('');
  const [deliveryOrderId, setDeliveryOrderId] = useState<string | null>(null);
  const [riderGPS, setRiderGPS] = useState<{ lat: number; lng: number } | null>(null);
  const prevCountRef = useRef<number>(0);
  const gpsWatchRef = useRef<number | null>(null);

  const riderId = user?.uid || 'rider-001';
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);

  // Rider sees orders assigned to them (ready, picked_up, on_the_way)
  const riderOrders = myOrders.filter(o =>
    ['ready', 'picked_up', 'on_the_way'].includes(o.status)
  );
  const deliveredOrders = myOrders.filter(o => o.status === 'delivered');
  const activeOrder = riderOrders[0];

  // New delivery alert
  const readyCount = availableOrders.length + riderOrders.filter(o => o.status === 'ready').length;

  // ━━━ GPS: Track rider's live location ━━━
  useEffect(() => {
    setMounted(true);

    // Start GPS tracking
    if (navigator.geolocation) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (pos) => setRiderGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log('GPS permission denied — using default'),
        { enableHighAccuracy: true }
      );
      // Watch position (updates every few seconds when moving)
      gpsWatchRef.current = navigator.geolocation.watchPosition(
        (pos) => setRiderGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }

    // Subscribe to real-time Firestore: my assigned orders + available orders (NOX Service)
    if (riderId) {
      const unsubMy = listenMyDelivery(riderId, (noxOrders) => {
        // Convert NoxOrder to local format
        const mapped = noxOrders.map((o: any) => ({
          id: o.orderId,
          orderId: o.orderId,
          shopName: o.shopName,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          items: o.items || [],
          total: o.total,
          totalAmount: o.total,
          status: o.status === 'rider_assigned' ? 'ready' : o.status,
          paymentMethod: o.paymentMethod || 'cod',
          createdAt: typeof o.createdAt === 'string' ? o.createdAt : new Date().toISOString(),
          updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : new Date().toISOString(),
          deliveryOtp: o.deliveryOTP,
          deliveryAddress: o.deliveryAddress,
          shopLat: o.shopLocation?.lat,
          shopLng: o.shopLocation?.lng,
          customerLat: o.customerLocation?.lat,
          customerLng: o.customerLocation?.lng,
          address: { 
            label: 'Delivery', 
            fullAddress: o.deliveryAddress || 'Thanjavur',
            lat: o.customerLocation?.lat,
            lng: o.customerLocation?.lng,
          },
        }));
        setMyOrders(mapped);
      });
      const unsubAvailable = listenAvailableOrders('Thanjavur', (noxOrders) => {
        // Convert NoxOrder to local format for display
        const mapped = noxOrders.map((o: any) => ({
          id: o.orderId,
          orderId: o.orderId,
          shopName: o.shopName,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          items: o.items || [],
          total: o.total,
          totalAmount: o.total,
          status: o.status,
          paymentMethod: o.paymentMethod || 'cod',
          createdAt: typeof o.createdAt === 'string' ? o.createdAt : new Date().toISOString(),
          deliveryOtp: o.deliveryOTP,
          deliveryAddress: o.deliveryAddress,
          shopLat: o.shopLocation?.lat,
          shopLng: o.shopLocation?.lng,
          customerLat: o.customerLocation?.lat,
          customerLng: o.customerLocation?.lng,
          address: {
            label: 'Delivery',
            fullAddress: o.deliveryAddress || 'Thanjavur',
            lat: o.customerLocation?.lat,
            lng: o.customerLocation?.lng,
          },
        }));
        setAvailableOrders(mapped);
      });
      return () => {
        unsubMy();
        unsubAvailable();
        if (gpsWatchRef.current !== null) navigator.geolocation.clearWatch(gpsWatchRef.current);
      };
    }

    return () => {
      if (gpsWatchRef.current !== null) navigator.geolocation.clearWatch(gpsWatchRef.current);
    };
  }, [riderId]);

  // ━━━ Upload GPS to Firestore when online (every 30s) ━━━
  useEffect(() => {
    if (!isOnline || !riderGPS || !db) return;

    // Upload immediately
    const uploadGPS = () => {
      if (!riderGPS || !db) return;
      setDoc(doc(db, 'riderLocations', riderId), {
        lat: riderGPS.lat,
        lng: riderGPS.lng,
        riderId,
        riderName: user?.displayName || 'Rider',
        updatedAt: new Date().toISOString(),
        isOnline: true,
      }, { merge: true }).catch(() => {});
    };

    uploadGPS();
    const interval = setInterval(uploadGPS, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isOnline, riderGPS, riderId, user?.displayName]);

  // Mark offline in Firestore when going offline
  useEffect(() => {
    if (!db || !riderId) return;
    if (!isOnline) {
      setDoc(doc(db, 'riderLocations', riderId), { isOnline: false, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    }
  }, [isOnline, riderId]);

  useEffect(() => {
    if (readyCount > prevCountRef.current && readyCount > 0) {
      playNewDeliverySound();
      toast('🚴 New delivery assigned!', {
        icon: '📦',
        style: { fontWeight: 'bold', background: '#1e293b', color: '#fff', border: '1px solid #8b5cf6' },
      });
    }
    prevCountRef.current = readyCount;
  }, [readyCount]);

  if (!mounted) return <div className="min-h-screen app-bg" />;

  // Real earnings based on distance pricing
  const todayTotal = deliveredOrders.reduce((s, o) => s + calcDeliveryEarning(o), 0);
  const earnings = {
    today: todayTotal,
    deliveries: deliveredOrders.length,
    trips: riderOrders.length + deliveredOrders.length,
    perOrder: deliveredOrders.length > 0 ? Math.round(todayTotal / deliveredOrders.length) : 40,
  };

  const handleStatusChange = async (orderId: string, newStatus: DemoOrder['status']) => {
    if (newStatus === 'delivered') {
      // Show OTP modal — rider must enter customer's OTP
      const order = myOrders.find(o => o.id === orderId) || availableOrders.find(o => o.id === orderId);
      const firestoreOtp = (order as any)?.deliveryOtp || '';
      setCurrentOTP(firestoreOtp);
      setDeliveryOrderId(orderId);
      setOtpInput('');
      setShowOTPModal(true);
      if (firestoreOtp) {
        toast(`Ask customer for OTP`, { icon: '🔐', duration: 5000 });
      } else {
        const fallbackOtp = generateOTP();
        setCurrentOTP(fallbackOtp);
        toast(`Dev OTP: ${fallbackOtp}`, { icon: '🔐', duration: 10000,
          style: { fontWeight: 'bold', background: '#1e293b', color: '#fff' }
        });
      }
      return;
    }

    // Use NOX service for status updates
    try {
      let success = false;
      if (newStatus === 'picked_up') {
        success = await markPickedUp(orderId, riderId);
        if (success) toast.success('Order picked up! Head to customer 🚴');
      } else if (newStatus === 'on_the_way') {
        success = await markInTransit(orderId, riderId);
        if (success) toast.success('On the way! Customer notified 📱');
      }
      if (!success) toast.error('Failed to update status');
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const verifyOTPAndDeliver = async () => {
    if (!deliveryOrderId) return;
    
    // Use NOX markDelivered which validates OTP server-side
    const result = await markDelivered(deliveryOrderId, riderId, otpInput);
    if (result.success) {
      toast.success('Delivery completed! ₹40 earned 💰');
      setShowOTPModal(false);
      setDeliveryOrderId(null);
    } else {
      toast.error(result.error || 'Wrong OTP! Ask customer for correct OTP.');
    }
  };

  const toggleOnline = () => {
    const newState = !isOnline;
    setIsOnline(newState);
    if (user?.uid) {
      setRiderOnline(user.uid, newState);
    }
    toast(newState ? '🟢 You are now Online!' : '🔴 You went Offline', { duration: 2000 });
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="min-h-screen app-bg pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 header-glass">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="btn-icon">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-sm font-black text-body flex items-center gap-1.5">
                <Bike size={14} className="text-purple-600 dark:text-purple-400" /> {user?.displayName || 'Rider'}
              </h1>
              <p className="text-[10px] text-faint">ID: {riderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleOnline}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* Earnings card */}
        <div className="glass-card p-4 bg-gradient-to-br from-purple-400/6 to-indigo-600/6">
          <div className="text-center mb-3">
            <p className="text-xs text-muted">Today&apos;s Earnings</p>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400">₹{earnings.today}</p>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-subtle">
            <div className="text-center">
              <p className="text-lg font-black text-body">{earnings.deliveries}</p>
              <p className="text-[9px] text-faint">Delivered</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-body">{earnings.trips}</p>
              <p className="text-[9px] text-faint">Trips</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-body">₹{earnings.perOrder}</p>
              <p className="text-[9px] text-faint">Per Order</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-body">{riderGPS ? '📍' : '⚠️'}</p>
              <p className="text-[9px] text-faint">GPS</p>
            </div>
          </div>
        </div>

        {/* 🔔 Available Orders — Accept/Reject */}
        {availableOrders.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-body flex items-center gap-2">
              <div className="w-2 h-2 bg-[#0E9F6E] rounded-full animate-pulse" />
              New Delivery Requests ({availableOrders.length})
            </h2>
            {availableOrders.map((order: any) => (
              <div key={order.id} className="glass-card p-4 border-l-4 border-[#0E9F6E] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-body">{order.orderId || `#${order.id.slice(0,8)}`}</p>
                    <p className="text-xs text-muted">{order.shopName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-accent">₹{order.totalAmount || order.total}</p>
                    <p className="text-[9px] text-faint">{getDistanceText(order)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-faint">
                  <MapPin size={10} /> {order.deliveryAddress || 'Nearby'}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Package size={12} /> {order.items?.length || 0} items • {(order.paymentMethod || 'cod').toUpperCase()}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    You earn: ₹{calcDeliveryEarning(order)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const success = await acceptDelivery(
                          order.id,
                          riderId,
                          user?.displayName || 'Rider',
                          user?.phone || '9876543210'
                        );
                        if (success) {
                          toast.success('🎉 Order accepted! Head to pickup');
                        } else {
                          toast.error('Order already taken by another rider');
                        }
                      } catch (e) { toast.error('Failed to accept'); }
                    }}
                    className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all active:scale-95"
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => {
                      // Just hide from local list (rider skips)
                      setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
                      toast('Order skipped', { icon: '⏭️' });
                    }}
                    className="px-4 py-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all"
                  >
                    ✕ Skip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active delivery */}
        {activeOrder ? (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-body flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              Active Delivery
            </h2>

            <div className="glass-card p-4 border-l-4 border-purple-500 space-y-3">
              {/* Order header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-body">#{activeOrder.id}</p>
                  <p className="text-[10px] text-faint">{timeAgo(activeOrder.createdAt)}</p>
                </div>
                <span className={`text-xs font-bold ${STATUS_LABELS[activeOrder.status]?.color || 'text-body'}`}>
                  {STATUS_LABELS[activeOrder.status]?.label || activeOrder.status}
                </span>
              </div>

              {/* ━━━ LIVE MAP — Shop + Customer + Rider GPS ━━━ */}
              <div className="rounded-xl overflow-hidden border border-subtle">
                <LiveMap
                  pins={[
                    { lat: 10.787, lng: 79.138, label: activeOrder.shopName, type: 'shop', popup: `🏪 ${activeOrder.shopName}` },
                    { lat: activeOrder.address.lat || 10.792, lng: activeOrder.address.lng || 79.145, label: activeOrder.customerName, type: 'customer', popup: `📍 ${activeOrder.address.fullAddress}` },
                    ...(riderGPS ? [{ lat: riderGPS.lat, lng: riderGPS.lng, label: 'You', type: 'rider' as const, popup: '🛵 Your Location' }] : []),
                  ]}
                  className="h-44 w-full"
                  showRoute={true}
                />
              </div>

              {/* GPS Status */}
              <div className="flex items-center gap-2 p-2 surface rounded-lg">
                <MapPinned size={12} className={riderGPS ? 'text-emerald-500' : 'text-red-500'} />
                <p className="text-[10px] text-faint">
                  {riderGPS ? `📍 GPS Active: ${riderGPS.lat.toFixed(4)}, ${riderGPS.lng.toFixed(4)}` : '⚠️ GPS not available — enable location'}
                </p>
              </div>

              {/* Route: Shop → Customer */}
              <div className="space-y-2">
                {/* Pickup */}
                <div className="p-3 surface rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0E9F6E]/10 rounded-lg flex items-center justify-center">
                    <Store size={14} className="text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-body">Pickup: {activeOrder.shopName}</p>
                    <p className="text-[10px] text-faint">📍 Shop location</p>
                  </div>
                  {activeOrder.status === 'ready' && (
                    <a href={`https://www.google.com/maps/dir/?api=1${riderGPS ? `&origin=${riderGPS.lat},${riderGPS.lng}` : ''}&destination=${encodeURIComponent(activeOrder.shopName + ' Thanjavur')}&travelmode=driving`}
                      target="_blank" rel="noopener"
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-blue-500/20">
                      <Navigation size={10} /> Navigate
                    </a>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-4 bg-purple-500/30" />
                </div>

                {/* Drop — Customer Address */}
                <div className="p-3 surface rounded-xl space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                      <UserRound size={14} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-body">Drop: {activeOrder.customerName}</p>
                      <p className="text-[10px] text-faint">📞 {activeOrder.customerPhone}</p>
                    </div>
                  </div>
                  {/* Full address display */}
                  <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
                    <p className="text-[11px] font-semibold text-body flex items-start gap-1.5">
                      <MapPin size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      {activeOrder.address.fullAddress}
                    </p>
                    {activeOrder.address.label && (
                      <p className="text-[9px] text-faint mt-0.5 ml-4">📌 {activeOrder.address.label}</p>
                    )}
                  </div>
                  {/* Navigate to Customer button */}
                  {['picked_up', 'on_the_way'].includes(activeOrder.status) && (
                    <a href={`https://www.google.com/maps/dir/?api=1${riderGPS ? `&origin=${riderGPS.lat},${riderGPS.lng}` : ''}&destination=${encodeURIComponent(activeOrder.address.fullAddress)}&travelmode=driving`}
                      target="_blank" rel="noopener"
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20">
                      <Navigation size={12} /> Navigate to Customer
                    </a>
                  )}
                </div>
              </div>

              {/* Items + Payment */}
              <div className="flex items-center justify-between p-2.5 bg-purple-500/6 rounded-lg">
                <span className="text-xs text-secondary">{activeOrder.items.length} items • {activeOrder.paymentMethod.toUpperCase()}</span>
                <span className="text-sm font-black text-purple-600 dark:text-purple-400">₹{activeOrder.total}</span>
              </div>

              {/* Collect COD warning */}
              {activeOrder.paymentMethod === 'cod' && activeOrder.status === 'on_the_way' && (
                <div className="p-2.5 bg-[#0E9F6E]/10 border border-[#0E9F6E]/20 rounded-lg flex items-center gap-2">
                  <Wallet size={14} className="text-amber-600" />
                  <p className="text-xs text-amber-700 dark:text-[#0E9F6E] font-bold">Collect ₹{activeOrder.total} cash on delivery</p>
                </div>
              )}

              {/* Action button */}
              {STATUS_FLOW[activeOrder.status] && (
                <button onClick={() => handleStatusChange(activeOrder.id, STATUS_FLOW[activeOrder.status].next)}
                  className={`w-full ${STATUS_FLOW[activeOrder.status].color} text-white text-sm font-bold py-3.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2`}>
                  {STATUS_FLOW[activeOrder.status].label}
                </button>
              )}

              {/* Call customer */}
              <div className="flex gap-2">
                <a href={`tel:${activeOrder.customerPhone}`} className="flex-1 flex items-center justify-center gap-2 py-2 surface rounded-lg text-xs font-bold text-secondary">
                  <Phone size={12} /> Call Customer
                </a>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 surface rounded-lg text-xs font-bold text-secondary">
                  <Shield size={12} /> Report Issue
                </button>
              </div>
            </div>

            {/* Other pending deliveries */}
            {riderOrders.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs text-faint font-semibold">Queue ({riderOrders.length - 1} more)</p>
                {riderOrders.slice(1).map(order => (
                  <div key={order.id} className="glass-sm p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-body">#{order.id} • {order.shopName}</p>
                      <p className="text-[10px] text-faint">{order.customerName} • ₹{order.total}</p>
                    </div>
                    <span className={`text-[10px] font-bold ${STATUS_LABELS[order.status]?.color || ''}`}>
                      {STATUS_LABELS[order.status]?.label || order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <Bike size={44} className="text-faint mx-auto mb-3" />
            <p className="text-sm font-bold text-muted">
              {isOnline ? 'Waiting for deliveries...' : 'You are offline'}
            </p>
            <p className="text-xs text-faint mt-1">
              {isOnline
                ? 'Orders will auto-assign when shops mark them ready'
                : 'Go online to receive delivery requests'}
            </p>
          </div>
        )}

        {/* Completed deliveries */}
        {deliveredOrders.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-faint mb-2 flex items-center gap-1">
              <CheckCircle2 size={12} /> Completed ({deliveredOrders.length})
            </h3>
            <div className="space-y-2">
              {deliveredOrders.slice(0, 5).map(order => (
                <div key={order.id} className="glass-sm p-3 flex items-center justify-between opacity-70">
                  <div>
                    <p className="text-xs font-bold text-body">#{order.id}</p>
                    <p className="text-[10px] text-faint">{order.shopName} → {order.customerName} • {getDistanceText(order)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+₹{calcDeliveryEarning(order)}</p>
                    <p className="text-[10px] text-faint">{timeAgo(order.updatedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Info */}
        <div className="glass-sm p-3 text-center">
          <p className="text-[10px] text-faint">💰 Pricing: ₹40 (up to 4km) + ₹8/km extra • Distance = Shop → Customer</p>
        </div>
      </div>

      {/* ━━━━━ OTP VERIFICATION MODAL ━━━━━ */}
      {showOTPModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOTPModal(false)} />
          <div className="relative glass-card rounded-3xl w-full max-w-xs p-6 space-y-4 animate-scale-up text-center">
            <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto">
              <Shield size={28} className="text-emerald-500" />
            </div>
            <h2 className="text-lg font-black text-body">Verify Delivery OTP</h2>
            <p className="text-xs text-muted">Ask customer for the 4-digit OTP sent to their phone</p>

            {/* OTP hint for demo */}
            <div className="p-3 bg-[#0E9F6E]/10 border border-[#0E9F6E]/20 rounded-xl">
              <p className="text-[10px] text-faint">Demo OTP (shown in toast):</p>
              <p className="text-2xl font-black text-amber-600 tracking-widest">{currentOTP}</p>
            </div>

            <input
              type="text"
              value={otpInput}
              onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter 4-digit OTP"
              className="input-glass text-center text-2xl font-black tracking-[0.5em]"
              maxLength={4}
              autoFocus
            />

            <button
              onClick={verifyOTPAndDeliver}
              disabled={otpInput.length !== 4}
              className="btn-primary w-full py-3.5 disabled:opacity-40"
            >
              ✅ Verify & Complete Delivery
            </button>

            <button onClick={() => setShowOTPModal(false)} className="text-xs text-muted hover:text-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
