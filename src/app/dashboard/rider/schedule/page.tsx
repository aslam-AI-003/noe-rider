'use client';

import React, { useState } from 'react';
import {
  CalendarClock, Sun, Sunset, Moon, Coffee, Clock, CheckCircle2,
  Play, Pause, Zap, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER SCHEDULE — Work Shifts & Break Mode
// Premium design inspired by Uber Driver
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Shift {
  id: string;
  label: string;
  time: string;
  icon: React.ElementType;
  color: string;
  multiplier: string;
  demand: 'Low' | 'Medium' | 'High' | 'Peak';
}

const SHIFTS: Shift[] = [
  { id: 'morning', label: 'Morning', time: '6:00 AM – 12:00 PM', icon: Sun, color: '#f59e0b', multiplier: '1.0x', demand: 'Medium' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM – 5:00 PM', icon: Sunset, color: '#ef4444', multiplier: '1.5x', demand: 'Peak' },
  { id: 'evening', label: 'Evening', time: '5:00 PM – 10:00 PM', icon: Moon, color: '#8b5cf6', multiplier: '1.3x', demand: 'High' },
  { id: 'night', label: 'Night', time: '10:00 PM – 6:00 AM', icon: Moon, color: '#3b82f6', multiplier: '1.2x', demand: 'Low' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEMAND_COLORS = {
  Low: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  Medium: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  High: { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.25)' },
  Peak: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.4)' },
};

export default function RiderSchedulePage() {
  const [selectedShifts, setSelectedShifts] = useState<string[]>(['afternoon', 'evening']);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimer, setBreakTimer] = useState(0);

  const toggleShift = (id: string) => {
    setSelectedShifts(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const startBreak = () => {
    setIsOnBreak(true);
    setBreakTimer(30);
    toast('☕ Break started! 30 min rest time', { icon: '⏸️' });
  };

  const endBreak = () => {
    setIsOnBreak(false);
    setBreakTimer(0);
    toast.success('Back online! Ready for orders 🚀');
  };

  const totalHours = selectedShifts.length * 5 * selectedDays.length;

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 header-glass">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-lg font-black text-body flex items-center gap-2">
            <CalendarClock size={20} className="text-accent" /> Work Schedule
          </h1>
          <p className="text-[11px] text-muted mt-0.5">Choose your shifts & working days</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Break Mode Card */}
        <div className="rounded-2xl p-4 border" style={{
          background: isOnBreak ? 'rgba(245,158,11,0.06)' : 'rgba(34,197,94,0.04)',
          borderColor: isOnBreak ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.15)'
        }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: isOnBreak ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.12)' }}>
              {isOnBreak ? <Coffee size={22} className="text-amber-400" /> : <Play size={22} className="text-emerald-400" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-body">{isOnBreak ? 'On Break' : 'Currently Active'}</p>
              <p className="text-[11px] text-muted">
                {isOnBreak ? `${breakTimer} min break remaining` : 'You are receiving orders'}
              </p>
            </div>
            <button onClick={isOnBreak ? endBreak : startBreak}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              style={{
                background: isOnBreak ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.12)',
                color: isOnBreak ? '#34d399' : '#fbbf24',
                border: `1px solid ${isOnBreak ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
              }}>
              {isOnBreak ? <><Play size={12} /> Resume</> : <><Pause size={12} /> Break</>}
            </button>
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-body">Working Days</h3>
            <span className="text-[11px] text-muted">{selectedDays.length} days selected</span>
          </div>
          <div className="flex gap-2">
            {DAYS.map(day => {
              const isSelected = selectedDays.includes(day);
              return (
                <button key={day} onClick={() => toggleDay(day)}
                  className="flex-1 py-3 rounded-xl text-center text-xs font-bold transition-all border"
                  style={{
                    background: isSelected ? 'rgba(255,193,7,0.12)' : 'var(--card-bg)',
                    borderColor: isSelected ? 'rgba(255,193,7,0.35)' : 'var(--card-border)',
                    color: isSelected ? 'var(--orange)' : '#666',
                  }}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shift Selection */}
        <div className="rounded-2xl p-4 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-body">Choose Shifts</h3>
            <span className="text-[11px] text-accent font-bold">{selectedShifts.length} selected</span>
          </div>
          <div className="space-y-2.5">
            {SHIFTS.map(shift => {
              const isSelected = selectedShifts.includes(shift.id);
              const demand = DEMAND_COLORS[shift.demand];
              return (
                <button key={shift.id} onClick={() => toggleShift(shift.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left"
                  style={{
                    background: isSelected ? `${shift.color}08` : 'rgba(255,255,255,0.01)',
                    borderColor: isSelected ? `${shift.color}35` : 'var(--card-border)',
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${shift.color}15` }}>
                    <shift.icon size={18} style={{ color: shift.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-body">{shift.label}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold border"
                        style={{ background: demand.bg, color: demand.text, borderColor: demand.border }}>
                        {shift.demand}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-muted flex items-center gap-1"><Clock size={9} /> {shift.time}</span>
                      <span className="text-[10px] font-bold flex items-center gap-0.5" style={{ color: shift.color }}>
                        <Zap size={8} /> {shift.multiplier}
                      </span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? '' : ''}`}
                    style={{ borderColor: isSelected ? shift.color : '#444', background: isSelected ? shift.color : 'transparent' }}>
                    {isSelected && <CheckCircle2 size={12} className="text-black" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estimated Summary */}
        <div className="rounded-2xl p-4 border" style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.06), rgba(139,92,246,0.04))', borderColor: 'var(--card-border)' }}>
          <h3 className="text-sm font-bold text-body mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-accent" /> Weekly Estimate
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl" style={{ background: 'var(--card-bg)' }}>
              <p className="text-lg font-black text-body">{totalHours}h</p>
              <p className="text-[9px] text-faint">Total Hours</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'var(--card-bg)' }}>
              <p className="text-lg font-black text-accent">₹{Math.round(totalHours * 85)}</p>
              <p className="text-[9px] text-faint">Est. Earnings</p>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'var(--card-bg)' }}>
              <p className="text-lg font-black text-emerald-400">{Math.round(totalHours * 1.8)}</p>
              <p className="text-[9px] text-faint">Est. Orders</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button onClick={() => toast.success('Schedule saved! ✅')}
          className="w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--orange), #ff9800)', color: '#121212' }}>
          <CheckCircle2 size={16} /> Save Schedule
        </button>

      </div>
    </div>
  );
}
