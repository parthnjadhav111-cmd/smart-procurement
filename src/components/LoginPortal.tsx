import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Building2,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Truck,
  Layers,
  KeyRound,
  FileCheck2,
} from 'lucide-react';
import { FarmerProfile, AdminOfficerProfile, Language } from '../types';
import { INITIAL_FARMER, DEFAULT_OFFICER, INITIAL_CENTERS } from '../data/mockData';

interface LoginPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onFarmerLoginSuccess: (farmer: FarmerProfile) => void;
  onAdminLoginSuccess: (officer: AdminOfficerProfile) => void;
  onStartNewFarmerRegistration: () => void;
  lang: Language;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  isOpen,
  onClose,
  onFarmerLoginSuccess,
  onAdminLoginSuccess,
  onStartNewFarmerRegistration,
  lang,
}) => {
  if (!isOpen) return null;

  // Active login view: 'farmer' or 'admin'
  const [activePortal, setActivePortal] = useState<'farmer' | 'admin'>('farmer');

  // Farmer form state
  const [farmerPhone, setFarmerPhone] = useState('+91 98901 23456');
  const [farmerOtp, setFarmerOtp] = useState('1234');
  const [farmerStep, setFarmerStep] = useState<'phone' | 'otp'>('phone');
  const [farmerError, setFarmerError] = useState('');

  // Admin form state
  const [officerId, setOfficerId] = useState('ADM-PUN-01');
  const [officerPass, setOfficerPass] = useState('admin123');
  const [selectedCenterId, setSelectedCenterId] = useState('PC-101');
  const [adminError, setAdminError] = useState('');

  // 1-Click Demo Farmer
  const handleQuickDemoFarmer = () => {
    onFarmerLoginSuccess(INITIAL_FARMER);
    onClose();
  };

  // 1-Click Demo Admin
  const handleQuickDemoAdmin = () => {
    const matchedCenter = INITIAL_CENTERS.find((c) => c.center_id === selectedCenterId) || INITIAL_CENTERS[0];
    onAdminLoginSuccess({
      ...DEFAULT_OFFICER,
      center_id: matchedCenter.center_id,
      center_name: matchedCenter.name,
    });
    onClose();
  };

  // Farmer regular login submit
  const handleFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (farmerStep === 'phone') {
      if (!farmerPhone || farmerPhone.length < 8) {
        setFarmerError('Please enter a valid mobile number');
        return;
      }
      setFarmerError('');
      setFarmerStep('otp');
    } else {
      if (farmerOtp === '1234' || farmerOtp === '1111') {
        onFarmerLoginSuccess(INITIAL_FARMER);
        onClose();
      } else {
        setFarmerError('Invalid OTP. Use demo OTP: 1234');
      }
    }
  };

  // Admin regular login submit
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerId) {
      setAdminError('Please enter Officer ID');
      return;
    }
    if (officerPass !== 'admin123' && officerPass !== '1234' && officerPass.length < 3) {
      setAdminError('Invalid password. Demo password is admin123');
      return;
    }
    const matchedCenter = INITIAL_CENTERS.find((c) => c.center_id === selectedCenterId) || INITIAL_CENTERS[0];
    onAdminLoginSuccess({
      ...DEFAULT_OFFICER,
      officer_id: officerId,
      center_id: matchedCenter.center_id,
      center_name: matchedCenter.name,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div
        id="dual-login-portal-modal"
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-emerald-900 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/60 border border-emerald-400/40 flex items-center justify-center text-xl shadow-inner">
              🌾
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                Mandi Gate & Procurement Authentication
              </h2>
              <p className="text-xs text-emerald-200">
                Government APMC Unified MSP Procurement Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close login modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Dedicated Login Switcher Tabs */}
        <div className="grid grid-cols-2 bg-stone-100 p-1.5 border-b border-stone-200 text-xs font-bold">
          <button
            id="tab-farmer-login"
            onClick={() => {
              setActivePortal('farmer');
              setFarmerError('');
            }}
            className={`py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${
              activePortal === 'farmer'
                ? 'bg-white text-emerald-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="text-base">👨‍🌾</span>
            <span className="font-extrabold text-xs sm:text-sm">Farmer Login</span>
          </button>

          <button
            id="tab-admin-login"
            onClick={() => {
              setActivePortal('admin');
              setAdminError('');
            }}
            className={`py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${
              activePortal === 'admin'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="text-base">🏛️</span>
            <span className="font-extrabold text-xs sm:text-sm">Mandi Admin Login</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6">
          {/* ================= FARMER LOGIN VIEW ================= */}
          {activePortal === 'farmer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Farmer Identity Sign-In</h3>
                  <p className="text-xs text-stone-500">
                    Track your live queue, view digital tokens, and receive gate arrival notices.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                  Aadhaar Linked
                </span>
              </div>

              {/* 1-Click Fast Demo Login for Farmers */}
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border-2 border-emerald-300 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <strong className="text-xs font-bold text-emerald-950">
                      Quick Demo Farmer (Ramesh Patil)
                    </strong>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                    Token P-105
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Log in instantly with active Paddy appointment (10:00 AM slot) and 4 demo farmers ahead in line.
                </p>
                <button
                  id="btn-quick-farmer-login"
                  onClick={handleQuickDemoFarmer}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>One-Click Login as Farmer (Ramesh Patil)</span>
                </button>
              </div>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-stone-200" />
                <span className="px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  or Enter Mobile Number
                </span>
                <div className="flex-1 border-t border-stone-200" />
              </div>

              <form onSubmit={handleFarmerSubmit} className="space-y-3 text-xs">
                {farmerError && (
                  <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
                    {farmerError}
                  </div>
                )}

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={farmerPhone}
                      onChange={(e) => setFarmerPhone(e.target.value)}
                      placeholder="+91 98000 00000"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {farmerStep === 'otp' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-amber-900 block">
                        Enter 4-Digit OTP (Demo: 1234)
                      </label>
                      <button
                        type="button"
                        onClick={() => setFarmerOtp('1234')}
                        className="text-[10px] text-emerald-700 font-bold underline"
                      >
                        Autofill 1234
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      value={farmerOtp}
                      onChange={(e) => setFarmerOtp(e.target.value)}
                      className="w-full text-center tracking-widest text-lg font-mono font-black py-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{farmerStep === 'phone' ? 'Get OTP' : 'Verify & Enter Farmer Dashboard'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* New registration prompt */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500">First time using procurement?</span>
                <button
                  onClick={() => {
                    onClose();
                    onStartNewFarmerRegistration();
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-extrabold flex items-center gap-1"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Register New Farmer Account</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= MANDI ADMIN LOGIN VIEW ================= */}
          {activePortal === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Mandi Officer & Security Console</h3>
                  <p className="text-xs text-stone-500">
                    Control gate verification permissions, queue dispatch, and weighbridge scales.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-stone-100 text-stone-800 text-[10px] font-bold rounded-full border border-stone-200">
                  APMC Authority
                </span>
              </div>

              {/* 1-Click Fast Demo Login for Officers */}
              <div className="p-3.5 bg-stone-900 text-white rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <strong className="text-xs font-bold text-stone-100">
                      APMC Officer (Sanjay Kulkarni)
                    </strong>
                  </div>
                  <span className="text-[10px] font-mono bg-stone-800 text-amber-300 px-2 py-0.5 rounded font-bold border border-stone-700">
                    ID: ADM-PUN-01
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Log in directly to manage gate check-ins, grant farmer permissions, and advance live counters.
                </p>
                <button
                  id="btn-quick-admin-login"
                  onClick={handleQuickDemoAdmin}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>One-Click Login as Mandi Administrator</span>
                </button>
              </div>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-stone-200" />
                <span className="px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  or Enter Mandi Credentials
                </span>
                <div className="flex-1 border-t border-stone-200" />
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-3 text-xs">
                {adminError && (
                  <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
                    {adminError}
                  </div>
                )}

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Procurement Center Location *
                  </label>
                  <select
                    value={selectedCenterId}
                    onChange={(e) => setSelectedCenterId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {INITIAL_CENTERS.map((c) => (
                      <option key={c.center_id} value={c.center_id}>
                        {c.name} ({c.center_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Officer ID *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={officerId}
                        onChange={(e) => setOfficerId(e.target.value)}
                        placeholder="ADM-PUN-01"
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                      <UserCheck className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Security PIN / Password *
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={officerPass}
                        onChange={(e) => setOfficerPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Access Mandi Admin Console</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
