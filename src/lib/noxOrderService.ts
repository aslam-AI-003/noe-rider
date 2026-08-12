/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NOX ORDER SERVICE — Rider Operations
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Rider App Operations:
 * - Listen for available deliveries (ready_for_pickup in my area)
 * - Accept delivery assignment
 * - Mark as picked up
 * - Mark as delivered (with OTP verification)
 * - Update rider location
 * - Get delivery history
 */

import {
  collection, doc, getDoc, getDocs, updateDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { NoxOrder, NoxOrderStatus } from '@/types/noxOrder';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getDb() {
  if (!db) {
    console.warn('⚠️ Firebase not initialized.');
    return null;
  }
  return db;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LISTEN AVAILABLE ORDERS — Orders needing a rider (accepted/preparing/ready, no rider assigned)
// Rider gets notified as soon as vendor accepts!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function listenAvailableOrders(area: string, callback: (orders: NoxOrder[]) => void): () => void {
  const firestore = getDb();
  if (!firestore) { callback([]); return () => {}; }

  // Listen for orders that are accepted/preparing/ready and have no rider yet
  const q = query(
    collection(firestore, 'orders'),
    where('status', 'in', ['accepted', 'preparing', 'ready']),
    where('riderId', '==', null),
    limit(20)
  );

  return onSnapshot(q, (snapshot: any) => {
    const orders = snapshot.docs.map((d: any) => d.data() as NoxOrder);
    callback(orders);
  }, (error: any) => {
    console.error('Listen available orders error:', error);
    // Fallback: try without compound query (might need index)
    const q2 = query(
      collection(firestore, 'orders'),
      where('status', '==', 'ready'),
      where('riderId', '==', null),
      limit(20)
    );
    onSnapshot(q2, (snap: any) => {
      callback(snap.docs.map((d: any) => d.data() as NoxOrder));
    }, () => callback([]));
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LISTEN MY ACTIVE DELIVERY — Rider's current active orders
// Since rider accept doesn't change status, we listen for riderId == me
// with all active statuses (accepted/preparing/ready/picked_up/in_transit)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function listenMyDelivery(riderId: string, callback: (orders: NoxOrder[]) => void): () => void {
  const firestore = getDb();
  if (!firestore) { callback([]); return () => {}; }

  // Rider's orders = any order where riderId is set to me AND not delivered/cancelled
  const q = query(
    collection(firestore, 'orders'),
    where('riderId', '==', riderId),
    where('status', 'in', ['accepted', 'preparing', 'ready', 'picked_up', 'in_transit', 'on_the_way']),
    limit(10)
  );

  return onSnapshot(q, (snapshot: any) => {
    const orders = snapshot.docs.map((d: any) => d.data() as NoxOrder);
    callback(orders);
  }, (error: any) => {
    console.error('Listen my delivery error:', error);
    callback([]);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACCEPT DELIVERY — Rider accepts a delivery
// NOTE: Does NOT change order status! Vendor continues their own flow.
// Rider just gets assigned while vendor prepares in parallel.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function acceptDelivery(
  orderId: string,
  riderId: string,
  riderName: string,
  riderPhone: string
): Promise<boolean> {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const orderRef = doc(firestore, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return false;

    const order = orderSnap.data() as NoxOrder;
    
    // Check if already assigned
    if (order.riderId) {
      console.warn('Order already assigned to another rider');
      return false;
    }

    const updatedTimeline = [...order.timeline, {
      status: order.status as NoxOrderStatus, // Keep current status (don't change to rider_assigned)
      timestamp: new Date().toISOString(),
      note: `Rider ${riderName} assigned — heading to shop`,
      updatedBy: riderId,
    }];

    // Only set riderId/riderName/riderPhone — DO NOT change order status!
    // Vendor continues: accepted → preparing → ready (independently)
    // Rider travels to shop in parallel
    await updateDoc(orderRef, {
      riderId,
      riderName,
      riderPhone,
      // status NOT changed — vendor flow continues independently
      updatedAt: serverTimestamp(),
      timeline: updatedTimeline,
    });

    console.log('✅ Rider assigned (status unchanged):', orderId, '— current status:', order.status);
    return true;
  } catch (error) {
    console.error('Error accepting delivery:', error);
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK PICKED UP — Rider picked up from shop
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function markPickedUp(orderId: string, riderId: string): Promise<boolean> {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const orderRef = doc(firestore, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return false;

    const order = orderSnap.data() as NoxOrder;
    const updatedTimeline = [...order.timeline, {
      status: 'picked_up' as NoxOrderStatus,
      timestamp: new Date().toISOString(),
      note: 'Rider picked up from shop',
      updatedBy: riderId,
    }];

    await updateDoc(orderRef, {
      status: 'picked_up',
      pickedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeline: updatedTimeline,
    });

    return true;
  } catch (error) {
    console.error('Error marking picked up:', error);
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK IN TRANSIT — Rider on the way to customer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function markInTransit(orderId: string, riderId: string): Promise<boolean> {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const orderRef = doc(firestore, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return false;

    const order = orderSnap.data() as NoxOrder;
    const updatedTimeline = [...order.timeline, {
      status: 'in_transit' as NoxOrderStatus,
      timestamp: new Date().toISOString(),
      note: 'On the way to delivery address',
      updatedBy: riderId,
    }];

    await updateDoc(orderRef, {
      status: 'in_transit',
      updatedAt: serverTimestamp(),
      timeline: updatedTimeline,
    });

    return true;
  } catch (error) {
    console.error('Error marking in transit:', error);
    return false;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARK DELIVERED — Rider completes delivery (OTP verified)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function markDelivered(orderId: string, riderId: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const firestore = getDb();
  if (!firestore) return { success: false, error: 'Firebase not initialized' };

  try {
    const orderRef = doc(firestore, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return { success: false, error: 'Order not found' };

    const order = orderSnap.data() as NoxOrder;
    
    // Verify OTP
    if (order.deliveryOTP !== otp) {
      return { success: false, error: 'Invalid OTP. Please ask customer for correct OTP.' };
    }

    const updatedTimeline = [...order.timeline, {
      status: 'delivered' as NoxOrderStatus,
      timestamp: new Date().toISOString(),
      note: 'Delivered successfully — OTP verified',
      updatedBy: riderId,
    }];

    await updateDoc(orderRef, {
      status: 'delivered',
      deliveredAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeline: updatedTimeline,
      paymentStatus: order.paymentMethod === 'COD' ? 'paid' : order.paymentStatus,
    });

    console.log('✅ Order delivered:', orderId);
    return { success: true };
  } catch (error) {
    console.error('Error marking delivered:', error);
    return { success: false, error: 'Failed to update order' };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UPDATE RIDER LOCATION — Real-time tracking
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function updateRiderLocation(
  orderId: string,
  location: { lat: number; lng: number }
): Promise<void> {
  const firestore = getDb();
  if (!firestore) return;

  try {
    await updateDoc(doc(firestore, 'orders', orderId), {
      riderLocation: location,
    });
  } catch (error) {
    // Silent fail for location updates — high frequency
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET DELIVERY HISTORY — Rider's past deliveries
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getDeliveryHistory(riderId: string): Promise<NoxOrder[]> {
  const firestore = getDb();
  if (!firestore) return [];

  try {
    const q = query(
      collection(firestore, 'orders'),
      where('riderId', '==', riderId),
      where('status', '==', 'delivered'),
      orderBy('deliveredAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => d.data() as NoxOrder);
  } catch (error) {
    console.error('Error fetching delivery history:', error);
    return [];
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET TODAY'S EARNINGS — Rider earnings for today
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function getTodayDeliveries(riderId: string): Promise<NoxOrder[]> {
  const firestore = getDb();
  if (!firestore) return [];

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(firestore, 'orders'),
      where('riderId', '==', riderId),
      where('deliveredAt', '>=', today),
      orderBy('deliveredAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => d.data() as NoxOrder);
  } catch (error) {
    console.error('Error fetching today deliveries:', error);
    return [];
  }
}
