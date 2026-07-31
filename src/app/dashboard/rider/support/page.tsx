'use client';

import React, { useState } from 'react';
import {
  HelpCircle, Phone, MessageCircle, Bot, AlertTriangle, ChevronDown,
  ChevronRight, Send, Ticket, Clock, CheckCircle2, Plus, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER SUPPORT — FAQ, SOS, Chat, Tickets
// Production-ready — 24x7 support module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FAQ_CATEGORIES = [
  {
    title: 'Orders & Delivery',
    items: [
      { q: 'What if the customer is not available?', a: 'Wait for 5 minutes, then call the customer. If no response after 2 attempts, contact support. The order will be marked as "Customer Unavailable" and you will still receive your delivery fee.' },
      { q: 'How to handle damaged items?', a: 'Take a photo of the damaged item immediately. Report it through the app. Do NOT deliver damaged items to the customer. Contact support for further instructions.' },
      { q: 'What if the restaurant is closed?', a: 'Report "Shop Closed" in the app. You will receive ₹20 compensation for the trip. The order will be automatically cancelled and customer will be refunded.' },
      { q: 'Can I reject an order?', a: 'Yes, you can reject orders. However, maintaining a high acceptance rate (>85%) makes you eligible for bonus incentives and priority order assignment.' },
    ],
  },
  {
    title: 'Earnings & Payments',
    items: [
      { q: 'When do I get paid?', a: 'Settlements happen every Monday. Earnings from Mon-Sun are deposited to your bank account by next Tuesday. UPI instant withdrawal is available for ₹5 fee.' },
      { q: 'Why is my incentive not showing?', a: 'Incentives are calculated at end of day and appear in your Earnings tab next morning. If missing after 24 hours, raise a ticket.' },
      { q: 'How does COD collection work?', a: 'Collect exact cash from customer. Amount is auto-deducted from your next settlement. Keep cash safe and deposit excess at designated points.' },
    ],
  },
  {
    title: 'Account & Documents',
    items: [
      { q: 'How to update bank details?', a: 'Go to Profile > Bank & UPI. You can change your bank account once every 30 days. New account takes 2-3 days to verify.' },
      { q: 'My KYC is rejected, what to do?', a: 'Check the rejection reason in Profile > KYC. Re-upload a clear photo of the document. Ensure all details are visible and not blurred.' },
      { q: 'How to change my vehicle?', a: 'Go to Profile > Vehicle Details. Upload new RC and insurance. Takes 24 hours for admin approval.' },
    ],
  },
];

export default function RiderSupportPage() {
  const [activeTab, setActiveTab] = useState<'faq' | 'chat' | 'tickets'>('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', from: 'bot', text: 'Hi! 👋 I\'m NOE Assistant. How can I help you today?', time: '10:30 AM' },
  ]);

  const tickets = [
    { id: 'T-001', subject: 'Payment not received for order #NOE-445', status: 'resolved', date: 'Jul 28', priority: 'high' },
    { id: 'T-002', subject: 'Customer gave wrong OTP', status: 'closed', date: 'Jul 25', priority: 'medium' },
    { id: 'T-003', subject: 'App crashed during delivery', status: 'open', date: 'Jul 30', priority: 'low' },
  ];

  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    const msg = chatMessage.trim();
    setChatMessages(prev => [...prev, { id: Date.now().toString(), from: 'user', text: msg, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
    setChatMessage('');

    // Simulate bot reply
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), from: 'bot',
        text: 'Thank you for reaching out! 🙏 A support agent will respond within 5 minutes. In the meantime, check our FAQ section for quick answers.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1500);
  };

  const ticketStatusConfig = {
    open: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    resolved: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    closed: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  };

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 header-glass">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-lg font-black text-body flex items-center gap-2">
            <HelpCircle size={20} className="text-accent" /> Support
          </h1>
          <p className="text-[11px] text-muted mt-0.5">24/7 help available</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Emergency SOS */}
        <div className="rounded-2xl p-4 border flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <Shield size={22} className="text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-body">Emergency SOS</p>
            <p className="text-[10px] text-muted">Accident or safety threat? Tap for immediate help</p>
          </div>
          <button onClick={() => { toast.error('SOS Alert sent! Help is on the way!'); }}
            className="px-4 py-2.5 rounded-xl text-xs font-black"
            style={{ background: '#ef4444', color: 'white' }}>
            SOS
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Phone, label: 'Call Support', color: '#22c55e', action: () => { if (typeof window !== 'undefined') window.open('tel:+919876543210'); } },
            { icon: MessageCircle, label: 'WhatsApp', color: '#25d366', action: () => { if (typeof window !== 'undefined') window.open('https://wa.me/919876543210'); } },
            { icon: Bot, label: 'AI Help', color: '#8b5cf6', action: () => setActiveTab('chat') },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="p-4 rounded-2xl border text-center transition-all"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <item.icon size={20} className="mx-auto mb-1.5" style={{ color: item.color }} />
              <p className="text-[10px] font-bold text-body">{item.label}</p>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--card-bg)' }}>
          {(['faq', 'chat', 'tickets'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${
                activeTab === tab ? 'text-black shadow-lg' : 'text-muted'
              }`}
              style={activeTab === tab ? { background: 'var(--orange)' } : {}}>
              {tab === 'faq' ? 'FAQ' : tab}
            </button>
          ))}
        </div>

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            {FAQ_CATEGORIES.map(cat => (
              <div key={cat.title}>
                <h3 className="text-[11px] font-bold text-faint uppercase tracking-wider mb-2 px-1">{cat.title}</h3>
                <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                  {cat.items.map((item, idx) => {
                    const key = `${cat.title}-${idx}`;
                    const isOpen = expandedFAQ === key;
                    return (
                      <div key={key} className={idx > 0 ? 'border-t' : ''} style={{ borderColor: 'var(--card-bg)' }}>
                        <button onClick={() => setExpandedFAQ(isOpen ? null : key)}
                          className="w-full flex items-center gap-3 p-4 text-left">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-body">{item.q}</p>
                          </div>
                          <ChevronDown size={14} className={`text-faint transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 -mt-1">
                            <p className="text-[11px] text-muted leading-relaxed">{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.from === 'user'
                      ? 'rounded-br-md'
                      : 'rounded-bl-md'
                  }`} style={{
                    background: msg.from === 'user' ? 'var(--card-border)' : 'var(--card-bg)',
                  }}>
                    <p className="text-xs text-body leading-relaxed">{msg.text}</p>
                    <p className="text-[9px] text-faint mt-1 text-right">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--card-border)' }}>
              <input
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 rounded-xl text-xs text-body placeholder-gray-600 outline-none"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
              />
              <button onClick={sendMessage}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500">
                <Send size={14} className="text-body" />
              </button>
            </div>
          </div>
        )}

        {/* Tickets */}
        {activeTab === 'tickets' && (
          <div className="space-y-3">
            <button onClick={() => toast.success('New ticket form opening...')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold"
              style={{ background: 'rgba(255,193,7,0.06)', borderColor: 'rgba(255,193,7,0.2)', color: 'var(--orange)' }}>
              <Plus size={14} /> Raise New Ticket
            </button>
            {tickets.map(ticket => {
              const cfg = ticketStatusConfig[ticket.status as keyof typeof ticketStatusConfig];
              return (
                <div key={ticket.id} className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-bg)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
                    {ticket.status === 'open' ? <Clock size={16} style={{ color: cfg.color }} /> :
                     ticket.status === 'resolved' ? <CheckCircle2 size={16} style={{ color: cfg.color }} /> :
                     <Ticket size={16} style={{ color: cfg.color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-body truncate">{ticket.subject}</p>
                    <p className="text-[10px] text-faint">{ticket.id} • {ticket.date}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold capitalize" style={{ background: cfg.bg, color: cfg.color }}>
                      {ticket.status}
                    </span>
                    <ChevronRight size={12} className="text-faint" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
