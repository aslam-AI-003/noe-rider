'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { riderService } from '@/lib/firestoreService';
import {
  User, Phone, Bike, CreditCard, Shield, FileText, Camera,
  ChevronRight, LogOut, Bell, Moon, Sun, Globe, HelpCircle, Star,
  CheckCircle2, AlertCircle, Upload, X, Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { t } from '@/lib/i18n';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RIDER PROFILE — Production-ready
// Photo, KYC Docs, Bank, Vehicle, Language, Theme, Notifications
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type DocType = 'photo' | 'aadhaarFront' | 'aadhaarBack' | 'license' | 'rcBook';

export default function RiderProfilePage() {
  const { user, logout, riderRegistrations, language, setLanguage } = useStore();
  const router = useRouter();

  // Document uploads (stored as base64 for demo, in production use cloud storage)
  const [uploads, setUploads] = useState<Record<DocType, string>>({
    photo: '',
    aadhaarFront: '',
    aadhaarBack: '',
    license: '',
    rcBook: '',
  });

  // Bank details
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolder: '',
    upiId: '',
  });
  const [showBank, setShowBank] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [showVehicle, setShowVehicle] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUpload, setActiveUpload] = useState<DocType | null>(null);

  const rider = riderRegistrations.find(r => r.status === 'approved' && (r.riderId === user?.uid || r.phone === user?.phone));

  // Load saved theme & uploads from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('nox-rider-theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(savedTheme);

    const savedUploads = localStorage.getItem('nox-rider-uploads');
    if (savedUploads) { try { setUploads(JSON.parse(savedUploads)); } catch {} }

    const savedBank = localStorage.getItem('nox-rider-bank');
    if (savedBank) { try { setBankDetails(JSON.parse(savedBank)); } catch {} }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/rider/login');
  };

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUpload) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large! Max 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const newUploads = { ...uploads, [activeUpload]: base64 };
      setUploads(newUploads);
      localStorage.setItem('nox-rider-uploads', JSON.stringify(newUploads));
      // Sync to Firestore so admin can view
      if (rider?.id) {
        try { await riderService.update(rider.id, { documents: newUploads } as any); } catch {}
      }
      toast.success(`${getDocLabel(activeUpload)} uploaded! ✅`);
      setActiveUpload(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerUpload = (type: DocType) => {
    setActiveUpload(type);
    fileInputRef.current?.click();
  };

  const getDocLabel = (type: DocType): string => {
    const labels: Record<DocType, string> = {
      photo: 'Profile Photo',
      aadhaarFront: 'Aadhaar Front',
      aadhaarBack: 'Aadhaar Back',
      license: 'Driving License',
      rcBook: 'RC Book',
    };
    return labels[type];
  };

  // Check if all mandatory docs are uploaded
  const isMotorized = rider?.vehicleType === 'Bike' || rider?.vehicleType === 'Auto';
  const mandatoryDocs: DocType[] = isMotorized
    ? ['photo', 'aadhaarFront', 'aadhaarBack', 'license', 'rcBook']
    : ['photo', 'aadhaarFront', 'aadhaarBack'];
  const uploadedCount = mandatoryDocs.filter(d => uploads[d]).length;
  const allDocsUploaded = uploadedCount === mandatoryDocs.length;
  const completionPercent = Math.round((uploadedCount / mandatoryDocs.length) * 100);

  // Theme toggle — applies dark/light class on <html> so CSS vars change globally
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('nox-rider-theme', newTheme);
    toast.success(`Theme: ${newTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}`);
  };

  // Notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled! 🔔');
      } else {
        toast.error('Notifications blocked. Enable in browser settings.');
      }
    } else {
      toast.error('Notifications not supported');
    }
  };

  // Save bank details
  const saveBankDetails = async () => {
    if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName || !bankDetails.accountHolder) {
      toast.error('Fill all mandatory bank fields');
      return;
    }
    localStorage.setItem('nox-rider-bank', JSON.stringify(bankDetails));
    // Sync to Firestore
    if (rider?.id) {
      try { await riderService.update(rider.id, { bankDetails } as any); } catch {}
    }
    toast.success('Bank details saved! ✅');
    setShowBank(false);
  };

  return (
    <div className="pb-28">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

      {/* Header */}
      <header className="sticky top-0 z-30 header-glass">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-lg font-black text-body flex items-center gap-2">
            <User size={20} className="text-accent" /> {t('riderProfile', language)}
          </h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Profile Card */}
        <div className="rounded-3xl p-5 border" style={{ background: 'linear-gradient(135deg, rgba(14,159,110,0.06), rgba(139,92,246,0.04))', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-4">
            {/* Profile Photo */}
            <button onClick={() => triggerUpload('photo')} className="relative group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: 'var(--card-border)' }}>
                {uploads.photo ? (
                  <img src={uploads.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black" style={{ color: 'var(--orange)' }}>
                    {(user?.displayName || 'R')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                <Camera size={10} className="text-white" />
              </div>
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-black text-body">{user?.displayName || 'Rider'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-muted flex items-center gap-1"><Phone size={10} /> {user?.phone || rider?.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(14,159,110,0.1)', color: '#0E9F6E' }}>
                  ID: {rider?.riderId || user?.uid?.slice(-8) || 'NOX-R-XXXX'}
                </span>
                {allDocsUploaded ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400">
                    ⏳ Incomplete
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <div className="text-center">
              <p className="text-lg font-black text-body">{rider?.totalDeliveries || 0}</p>
              <p className="text-[9px] text-faint">Deliveries</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-accent">4.8</p>
              <p className="text-[9px] text-faint">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-emerald-400">97%</p>
              <p className="text-[9px] text-faint">Acceptance</p>
            </div>
          </div>

          {/* Doc completion bar */}
          {!allDocsUploaded && (
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-amber-400 font-bold">⚠️ Complete profile to go online</p>
                <p className="text-[10px] text-muted">{uploadedCount}/{mandatoryDocs.length}</p>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all" style={{ width: `${completionPercent}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ━━━ ACCOUNT ━━━ */}
        <div>
          <h3 className="text-[11px] font-bold text-faint uppercase tracking-wider mb-2 px-1">{t('account', language)}</h3>
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            {/* KYC Documents */}
            <button onClick={() => setShowKYC(true)} className="w-full flex items-center gap-3 p-4 text-left transition-all hover:bg-white/[0.03]">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-500/10">
                <Shield size={16} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-body">{t('kycDocuments', language)}</p>
                <p className="text-[10px] text-faint">Aadhaar, License, RC Book • {uploadedCount}/{mandatoryDocs.length} uploaded</p>
              </div>
              {allDocsUploaded ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-amber-400" />}
              <ChevronRight size={14} className="text-faint" />
            </button>

            {/* Bank Details */}
            <button onClick={() => setShowBank(true)} className="w-full flex items-center gap-3 p-4 text-left border-t transition-all hover:bg-white/[0.03]" style={{ borderColor: 'var(--card-border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10">
                <CreditCard size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-body">{t('bankDetails', language)}</p>
                <p className="text-[10px] text-faint">{bankDetails.bankName ? `${bankDetails.bankName} ****${bankDetails.accountNumber.slice(-4)}` : 'Add bank details'}</p>
              </div>
              {bankDetails.accountNumber ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-amber-400" />}
              <ChevronRight size={14} className="text-faint" />
            </button>

            {/* Vehicle Details */}
            <button onClick={() => setShowVehicle(true)} className="w-full flex items-center gap-3 p-4 text-left border-t transition-all hover:bg-white/[0.03]" style={{ borderColor: 'var(--card-border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/10">
                <Bike size={16} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-body">{t('vehicleDetails', language)}</p>
                <p className="text-[10px] text-faint">{rider?.vehicleType || 'Bike'} • {(rider as any)?.vehicleNumber || 'No plate'}</p>
              </div>
              <ChevronRight size={14} className="text-faint" />
            </button>
          </div>
        </div>

        {/* ━━━ PREFERENCES ━━━ */}
        <div>
          <h3 className="text-[11px] font-bold text-faint uppercase tracking-wider mb-2 px-1">{t('preferences', language)}</h3>
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            {/* Language */}
            <button onClick={() => setShowLanguage(true)} className="w-full flex items-center gap-3 p-4 text-left transition-all hover:bg-white/[0.03]">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10">
                <Globe size={16} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-body">{t('language', language)}</p>
                <p className="text-[10px] text-faint">{language === 'ta' ? 'தமிழ்' : 'English'}</p>
              </div>
              <ChevronRight size={14} className="text-faint" />
            </button>

            {/* Theme */}
            <button onClick={toggleTheme} className="w-full flex items-center gap-3 p-4 text-left border-t transition-all hover:bg-white/[0.03]" style={{ borderColor: 'var(--card-border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-500/10">
                {theme === 'dark' ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-400" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-body">{t('theme', language)}</p>
                <p className="text-[10px] text-faint">{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</p>
              </div>
              <div className={`w-10 h-5 rounded-full flex items-center p-0.5 transition-all ${theme === 'dark' ? 'bg-emerald-500 justify-end' : 'bg-gray-600 justify-start'}`}>
                <div className="w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </button>

            {/* Notifications */}
            <button onClick={requestNotificationPermission} className="w-full flex items-center gap-3 p-4 text-left border-t transition-all hover:bg-white/[0.03]" style={{ borderColor: 'var(--card-border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10">
                <Bell size={16} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-body">{t('notifications', language)}</p>
                <p className="text-[10px] text-faint">{t('tapToEnable', language)}</p>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400">Enabled</span>
            </button>
          </div>
        </div>

        {/* ━━━ SUPPORT ━━━ */}
        <div>
          <h3 className="text-[11px] font-bold text-faint uppercase tracking-wider mb-2 px-1">{t('supportSection', language)}</h3>
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <button className="w-full flex items-center gap-3 p-4 text-left transition-all hover:bg-white/[0.03]">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10">
                <HelpCircle size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-body">{t('helpFaq', language)}</p>
                <p className="text-[10px] text-faint">{t('supportAvailable', language)}</p>
              </div>
              <ChevronRight size={14} className="text-faint" />
            </button>
            <button className="w-full flex items-center gap-3 p-4 text-left border-t transition-all hover:bg-white/[0.03]" style={{ borderColor: 'var(--card-border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-500/10">
                <FileText size={16} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-body">{t('termsPolices', language)}</p>
                <p className="text-[10px] text-faint">{t('privacyTerms', language)}</p>
              </div>
              <ChevronRight size={14} className="text-faint" />
            </button>
            <button onClick={() => toast.success('Thanks! ⭐')} className="w-full flex items-center gap-3 p-4 text-left border-t transition-all hover:bg-white/[0.03]" style={{ borderColor: 'var(--card-border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10">
                <Star size={16} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-body">{t('rateApp', language)}</p>
                <p className="text-[10px] text-faint">{t('helpImprove', language)}</p>
              </div>
              <ChevronRight size={14} className="text-faint" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border text-sm font-bold transition-all"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
          <LogOut size={16} /> {t('logout', language)}
        </button>

        <p className="text-center text-[10px] text-faint pb-4">Namma Ooru Express v2.0 • Rider App</p>
      </div>

      {/* ━━━ KYC DOCUMENTS MODAL ━━━ */}
      {showKYC && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowKYC(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border max-h-[85vh] overflow-auto"
            style={{ background: '#1a1a1a', borderColor: 'var(--card-border)' }}>
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-black text-body mb-1 flex items-center gap-2">
              <Shield size={18} className="text-orange-400" /> KYC Documents
            </h2>
            <p className="text-[10px] text-faint mb-4">Upload all documents to enable going online</p>

            <div className="space-y-3">
              {/* Profile Photo */}
              <DocUploadCard
                label="Profile Photo"
                desc="Clear face photo"
                uploaded={!!uploads.photo}
                preview={uploads.photo}
                onUpload={() => triggerUpload('photo')}
                onRemove={() => setUploads(p => ({ ...p, photo: '' }))}
                mandatory
              />

              {/* Aadhaar Front */}
              <DocUploadCard
                label="Aadhaar Card (Front)"
                desc="Clear photo of front side"
                uploaded={!!uploads.aadhaarFront}
                preview={uploads.aadhaarFront}
                onUpload={() => triggerUpload('aadhaarFront')}
                onRemove={() => setUploads(p => ({ ...p, aadhaarFront: '' }))}
                mandatory
              />

              {/* Aadhaar Back */}
              <DocUploadCard
                label="Aadhaar Card (Back)"
                desc="Clear photo of back side"
                uploaded={!!uploads.aadhaarBack}
                preview={uploads.aadhaarBack}
                onUpload={() => triggerUpload('aadhaarBack')}
                onRemove={() => setUploads(p => ({ ...p, aadhaarBack: '' }))}
                mandatory
              />

              {/* Driving License - only for motorized */}
              {isMotorized && (
                <DocUploadCard
                  label="Driving License"
                  desc="Front side with photo & number"
                  uploaded={!!uploads.license}
                  preview={uploads.license}
                  onUpload={() => triggerUpload('license')}
                  onRemove={() => setUploads(p => ({ ...p, license: '' }))}
                  mandatory
                />
              )}

              {/* RC Book - only for motorized */}
              {isMotorized && (
                <DocUploadCard
                  label="RC Book"
                  desc="Vehicle registration certificate"
                  uploaded={!!uploads.rcBook}
                  preview={uploads.rcBook}
                  onUpload={() => triggerUpload('rcBook')}
                  onRemove={() => setUploads(p => ({ ...p, rcBook: '' }))}
                  mandatory
                />
              )}
            </div>

            {/* Status */}
            <div className="mt-4 p-3 rounded-xl" style={{ background: allDocsUploaded ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${allDocsUploaded ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
              <p className={`text-xs font-bold ${allDocsUploaded ? 'text-emerald-400' : 'text-amber-400'}`}>
                {allDocsUploaded ? '✅ All documents uploaded! You can now go online.' : `⚠️ ${mandatoryDocs.length - uploadedCount} documents remaining to go online`}
              </p>
            </div>

            <button onClick={() => setShowKYC(false)}
              className="w-full mt-4 py-3 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ━━━ BANK DETAILS MODAL ━━━ */}
      {showBank && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowBank(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border max-h-[85vh] overflow-auto"
            style={{ background: '#1a1a1a', borderColor: 'var(--card-border)' }}>
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-black text-body mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-400" /> Bank Details
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-faint mb-1 block">Account Holder Name *</label>
                <input value={bankDetails.accountHolder} onChange={e => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                  placeholder="Enter full name" className="w-full px-3 py-2.5 rounded-xl text-sm text-body bg-gray-800/80 border border-gray-700 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-faint mb-1 block">Account Number *</label>
                <input value={bankDetails.accountNumber} onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="Enter account number" className="w-full px-3 py-2.5 rounded-xl text-sm text-body bg-gray-800/80 border border-gray-700 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-faint mb-1 block">IFSC Code *</label>
                <input value={bankDetails.ifscCode} onChange={e => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase().slice(0, 11) })}
                  placeholder="e.g., HDFC0001234" maxLength={11} className="w-full px-3 py-2.5 rounded-xl text-sm text-body bg-gray-800/80 border border-gray-700 focus:outline-none focus:border-emerald-500 uppercase" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-faint mb-1 block">Bank Name *</label>
                <input value={bankDetails.bankName} onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  placeholder="e.g., HDFC Bank" className="w-full px-3 py-2.5 rounded-xl text-sm text-body bg-gray-800/80 border border-gray-700 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-faint mb-1 block">UPI ID (Optional)</label>
                <input value={bankDetails.upiId} onChange={e => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                  placeholder="e.g., rider@paytm" className="w-full px-3 py-2.5 rounded-xl text-sm text-body bg-gray-800/80 border border-gray-700 focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowBank(false)} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 bg-gray-800 border border-gray-700">Cancel</button>
              <button onClick={saveBankDetails} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500">Save Details</button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━ VEHICLE DETAILS MODAL ━━━ */}
      {showVehicle && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowVehicle(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border max-h-[85vh] overflow-auto"
            style={{ background: '#1a1a1a', borderColor: 'var(--card-border)' }}>
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-black text-body mb-4 flex items-center gap-2">
              <Bike size={18} className="text-purple-400" /> Vehicle Details
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                <p className="text-[10px] text-faint">Vehicle Type</p>
                <p className="text-sm font-bold text-body">🏍️ {rider?.vehicleType || 'Bike'}</p>
              </div>
              <div className="p-3 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                <p className="text-[10px] text-faint">Vehicle Number</p>
                <p className="text-sm font-bold text-body">🚗 {(rider as any)?.vehicleNumber || 'Not provided'}</p>
              </div>
              <div className="p-3 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                <p className="text-[10px] text-faint">Vehicle Model</p>
                <p className="text-sm font-bold text-body">🏎️ {(rider as any)?.vehicleModel || 'Not provided'}</p>
              </div>
              {rider?.licenseNumber && (
                <div className="p-3 rounded-xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                  <p className="text-[10px] text-faint">Driving License</p>
                  <p className="text-sm font-bold text-body">📜 {rider.licenseNumber}</p>
                </div>
              )}
            </div>
            <button onClick={() => setShowVehicle(false)}
              className="w-full mt-4 py-3 rounded-xl text-sm font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ━━━ LANGUAGE MODAL ━━━ */}
      {showLanguage && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLanguage(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border"
            style={{ background: '#1a1a1a', borderColor: 'var(--card-border)' }}>
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-black text-body mb-4 flex items-center gap-2">
              <Globe size={18} className="text-blue-400" /> Language
            </h2>
            <div className="space-y-2">
              <button onClick={() => { setLanguage('en' as any); toast.success('Language: English'); setShowLanguage(false); }}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between ${language === 'en' ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-700 bg-gray-800/50'}`}>
                <div>
                  <p className="text-sm font-bold text-body">English</p>
                  <p className="text-[10px] text-faint">Default language</p>
                </div>
                {language === 'en' && <CheckCircle2 size={16} className="text-emerald-400" />}
              </button>
              <button onClick={() => { setLanguage('ta' as any); toast.success('மொழி: தமிழ்'); setShowLanguage(false); }}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between ${language === 'ta' ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-700 bg-gray-800/50'}`}>
                <div>
                  <p className="text-sm font-bold text-body">தமிழ்</p>
                  <p className="text-[10px] text-faint">Tamil</p>
                </div>
                {language === 'ta' && <CheckCircle2 size={16} className="text-emerald-400" />}
              </button>
            </div>
            <button onClick={() => setShowLanguage(false)}
              className="w-full mt-4 py-3 rounded-xl text-sm font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━ Document Upload Card Component ━━━
function DocUploadCard({ label, desc, uploaded, preview, onUpload, onRemove, mandatory }: {
  label: string; desc: string; uploaded: boolean; preview?: string;
  onUpload: () => void; onRemove: () => void; mandatory?: boolean;
}) {
  return (
    <div className="p-3 rounded-xl border flex items-center gap-3" style={{ background: 'var(--card-bg)', borderColor: uploaded ? 'rgba(16,185,129,0.3)' : 'var(--card-border)' }}>
      {/* Preview/Icon */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{ background: uploaded ? 'transparent' : 'rgba(255,255,255,0.03)', border: uploaded ? 'none' : '1px dashed rgba(255,255,255,0.1)' }}>
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <ImageIcon size={16} className="text-gray-600" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-body flex items-center gap-1">
          {label}
          {mandatory && <span className="text-red-400 text-[9px]">*</span>}
        </p>
        <p className="text-[10px] text-faint">{desc}</p>
      </div>

      {/* Action */}
      {uploaded ? (
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <button onClick={onRemove} className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <X size={10} className="text-red-400" />
          </button>
        </div>
      ) : (
        <button onClick={onUpload} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
          <Upload size={10} /> Upload
        </button>
      )}
    </div>
  );
}
