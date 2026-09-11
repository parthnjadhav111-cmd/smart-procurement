import React, { useState } from 'react';
import {
  Wheat,
  ShieldCheck,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  Phone,
  Lock,
  Sparkles,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { FarmerProfile, AdminOfficerProfile, Language } from '../types';
import { INITIAL_FARMER, DEFAULT_OFFICER } from '../data/mockData';
import { DEMO_FARMERS_ROSTER } from '../../server/db';
import { translations } from '../translations/translations';

interface AmazonLoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onFarmerLoginSuccess: (farmer: FarmerProfile) => void;
  onAdminLoginSuccess: (officer: AdminOfficerProfile) => void;
  onStartNewFarmerRegistration: () => void;
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  canDismiss?: boolean;
}

export const AmazonLoginModal: React.FC<AmazonLoginModalProps> = ({
  isOpen,
  onClose,
  onFarmerLoginSuccess,
  onAdminLoginSuccess,
  onStartNewFarmerRegistration,
  lang,
  onLanguageChange,
  canDismiss = false,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'farmer' | 'admin'>('farmer');

  // Farmer form state
  const [farmerIdentifier, setFarmerIdentifier] = useState('9822014589');
  const [farmerOtp, setFarmerOtp] = useState('1234');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [showNeedHelp, setShowNeedHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Admin form state
  const [officerId, setOfficerId] = useState('OFF-PUN-042');
  const [officerPassword, setOfficerPassword] = useState('mandi123');
  const [selectedCenterId, setSelectedCenterId] = useState('PC-101');

  if (!isOpen) return null;

  // Handle Farmer Login
  const handleFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Find matching demo farmer or fallback to INITIAL_FARMER
      const cleanNum = farmerIdentifier.replace(/[^0-9]/g, '');
      const found = DEMO_FARMERS_ROSTER.find(
        (f) =>
          f.phone.replace(/[^0-9]/g, '').includes(cleanNum) ||
          f.farmer_id.toLowerCase() === farmerIdentifier.toLowerCase()
      ) || INITIAL_FARMER;

      onFarmerLoginSuccess(found);
    }, 400);
  };

  // Handle Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const officer: AdminOfficerProfile = {
        ...DEFAULT_OFFICER,
        officer_id: officerId.trim() || 'OFF-PUN-042',
        center_id: selectedCenterId,
      };
      onAdminLoginSuccess(officer);
    }, 400);
  };

  // Fast 1-click Demo selection
  const selectDemoFarmer = (f: FarmerProfile) => {
    setFarmerIdentifier(f.phone.replace(/[^0-9]/g, '').slice(-10));
    setFarmerOtp('1234');
    onFarmerLoginSuccess(f);
  };

  const selectDemoAdmin = (officer: AdminOfficerProfile) => {
    setOfficerId(officer.officer_id);
    setSelectedCenterId(officer.center_id);
    onAdminLoginSuccess(officer);
  };

  return (
    <div className="w-full max-w-[430px] my-auto">
      {/* Amazon-Style Sign In Container Box */}
      <div className="bg-white rounded-xl shadow-2xl border border-stone-300 overflow-hidden text-stone-900 transition-all">
        {/* Top Government Tricolor Stripe */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-amber-600" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-emerald-600" />
        </div>

        {/* Header Branding Area */}
        <div className="pt-5 pb-3 px-6 text-center border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
              <Wheat className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black tracking-wider text-amber-800 uppercase block leading-tight">
                KISAN SETU
              </span>
              <span className="text-[10px] text-stone-500 font-medium leading-none">
                National Procurement Portal
              </span>
            </div>
          </div>

          {/* Language Switcher Pill */}
          {onLanguageChange && (
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[11px] font-bold">
              {(['en', 'hi', 'mr'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onLanguageChange(l)}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    lang === l ? 'bg-amber-500 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'म'}
                </button>
              ))}
            </div>
          )}

          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              title="Close and explore as guest"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Amazon-style Tabs Selector */}
        <div className="grid grid-cols-2 bg-stone-100/80 border-b border-stone-200 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('farmer');
              setErrorMsg(null);
            }}
            className={`py-3 px-4 flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === 'farmer'
                ? 'bg-white text-stone-900 border-amber-500 font-extrabold shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 border-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-600" />
            <span>Kisan (Farmer)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setErrorMsg(null);
            }}
            className={`py-3 px-4 flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === 'admin'
                ? 'bg-white text-stone-900 border-amber-500 font-extrabold shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 border-transparent'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-stone-700" />
            <span>Mandi Officer (Admin)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Main Title Heading */}
          <h2 className="text-xl font-bold text-stone-900 mb-1">
            {activeTab === 'farmer' ? 'Sign in to Kisan Portal' : 'Mandi Officer Sign-in'}
          </h2>
          <p className="text-xs text-stone-500 mb-5">
            {activeTab === 'farmer'
              ? 'Access your procurement appointments, live token queue, and MSP payout receipts.'
              : 'Authorized APMC Mandi gate dispatch, weighbridge entry, and farmer verification.'}
          </p>

          {errorMsg && (
            <div className="mb-4 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: FARMER LOGIN (AMAZON STYLE) */}
          {activeTab === 'farmer' && (
            <form onSubmit={handleFarmerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Mobile phone number or Farmer ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={farmerIdentifier}
                    onChange={(e) => setFarmerIdentifier(e.target.value)}
                    placeholder="e.g. 9822014589 or MH-PUN-2026-8841"
                    required
                    className="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 rounded focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              {isOtpSent && (
                <div className="animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-800">
                      Enter 4-Digit OTP
                    </label>
                    <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                      Demo OTP: 1234
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={farmerOtp}
                    onChange={(e) => setFarmerOtp(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3 py-2 text-sm text-center tracking-widest font-mono font-bold border border-stone-300 rounded focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                </div>
              )}

              {/* Amazon-style Amber Continue Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-md text-sm font-semibold bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] hover:from-[#f5d78e] hover:to-[#eeb933] border border-[#a88734] active:border-[#a88734] active:bg-[#f0c14b] text-stone-900 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isOtpSent ? 'Verify OTP & Sign In' : 'Continue to Dashboard'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Keep Me Signed In Checkbox */}
              <div className="flex items-center gap-2 pt-1 text-xs text-stone-600">
                <input
                  type="checkbox"
                  id="keepSignedIn"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
                <label htmlFor="keepSignedIn" className="cursor-pointer select-none">
                  Keep me signed in on this device
                </label>
              </div>

              {/* Need Help Accordion (Amazon Style) */}
              <div className="pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowNeedHelp(!showNeedHelp)}
                  className="text-xs text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                >
                  {showNeedHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>Need help with sign-in?</span>
                </button>
                {showNeedHelp && (
                  <div className="mt-2 text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded border border-stone-200 space-y-1">
                    <p>• <strong>Forgot Farmer ID:</strong> Check your SMS or Kisan 7/12 receipt.</p>
                    <p>• <strong>OTP Delay:</strong> Use default demonstration code <strong>1234</strong>.</p>
                    <p>• <strong>Toll-Free Kisan Helpline:</strong> 1800-180-1551 (6 AM – 10 PM)</p>
                  </div>
                )}
              </div>

              {/* Quick 1-Click Demo Farmers */}
              <div className="pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Quick 1-Click Demo Farmers
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                    Pre-booked Slots
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {DEMO_FARMERS_ROSTER.slice(0, 4).map((f) => (
                    <button
                      key={f.farmer_id}
                      type="button"
                      onClick={() => selectDemoFarmer(f)}
                      className="text-left p-2 rounded-lg border border-stone-200 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/60 transition-all text-xs group cursor-pointer"
                    >
                      <div className="font-bold text-stone-900 truncate group-hover:text-amber-900">
                        {f.name.split(' ')[0]} {f.name.split(' ')[1] || ''}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate flex items-center justify-between">
                        <span>{f.main_crop}</span>
                        <span className="font-mono text-emerald-700 font-bold">{f.farmer_id.slice(-4)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amazon-style Divider: New to Portal */}
              <div className="relative pt-3 text-center">
                <div className="absolute inset-0 flex items-center pt-3">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-2 text-stone-500 font-medium">
                    New to Kisan Procurement?
                  </span>
                </div>
              </div>

              {/* Amazon-style Secondary Button: Create Account */}
              <button
                type="button"
                onClick={onStartNewFarmerRegistration}
                className="w-full py-2 px-4 rounded-md text-xs font-semibold bg-gradient-to-b from-[#f2f3f4] to-[#e7e9ec] hover:from-[#e7e9ec] hover:to-[#dadde2] border border-[#a2a6ac] text-stone-900 shadow-2xs transition-all cursor-pointer text-center"
              >
                Create your Farmer Account / Register
              </button>
            </form>
          )}

          {/* TAB 2: MANDI ADMIN LOGIN */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Mandi Officer ID / Badge Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    placeholder="e.g. OFF-PUN-042"
                    required
                    className="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 rounded focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Security Password / Officer PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    value={officerPassword}
                    onChange={(e) => setOfficerPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 rounded focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Assigned APMC Procurement Center
                </label>
                <select
                  value={selectedCenterId}
                  onChange={(e) => setSelectedCenterId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white font-medium"
                >
                  <option value="PC-101">Pune District Procurement Center (PC-101)</option>
                  <option value="PC-201">Nashik Krishak Grain Terminal (PC-201)</option>
                  <option value="PC-301">Satara District Grain Depot (PC-301)</option>
                  <option value="PC-401">Ahmednagar Krishak Seva Center (PC-401)</option>
                </select>
              </div>

              {/* Amazon-style Admin Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-md text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Sign In to Mandi Admin Console</span>
                  </>
                )}
              </button>

              {/* Quick Demo Officer Selectors */}
              <div className="pt-2 border-t border-stone-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                  1-Click Test Mandi Officers
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      selectDemoAdmin({
                        ...DEFAULT_OFFICER,
                        officer_id: 'OFF-PUN-042',
                        center_id: 'PC-101',
                      })
                    }
                    className="w-full text-left p-2.5 rounded-lg border border-stone-200 hover:border-amber-500 bg-stone-50 hover:bg-amber-50/50 transition-all text-xs flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-stone-900 group-hover:text-amber-900">
                        Shri V. S. Deshmukh
                      </div>
                      <div className="text-[10px] text-stone-500">
                        Senior Mandi Inspector • Pune APMC (PC-101)
                      </div>
                    </div>
                    <span className="text-[10px] bg-stone-200 group-hover:bg-amber-200 text-stone-700 px-2 py-0.5 rounded font-mono font-bold">
                      Login
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      selectDemoAdmin({
                        officer_id: 'OFF-NAS-019',
                        name: 'Smt. Meenakshi Rao',
                        designation: 'Mandi Quality & Procurement Officer',
                        center_id: 'PC-201',
                        center_name: 'Nashik Krishak Grain Terminal',
                        jurisdiction: 'Nashik District APMC',
                        badge_number: 'MAH-APMC-7712',
                      })
                    }
                    className="w-full text-left p-2.5 rounded-lg border border-stone-200 hover:border-amber-500 bg-stone-50 hover:bg-amber-50/50 transition-all text-xs flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-stone-900 group-hover:text-amber-900">
                        Smt. Meenakshi Rao
                      </div>
                      <div className="text-[10px] text-stone-500">
                        Quality & Weighbridge Officer • Nashik (PC-201)
                      </div>
                    </div>
                    <span className="text-[10px] bg-stone-200 group-hover:bg-amber-200 text-stone-700 px-2 py-0.5 rounded font-mono font-bold">
                      Login
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Amazon Disclaimer & Terms */}
          <div className="mt-5 pt-4 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed text-center">
            By continuing, you agree to the National Mandi Procurement{' '}
            <a href="#terms" className="text-amber-800 hover:underline">
              Conditions of Use
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-amber-800 hover:underline">
              Privacy Notice
            </a>
            .
          </div>
        </div>

        {/* Footer Sub-Bar */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted APMC Gate</span>
          </span>
          <button
            onClick={() => {
              onFarmerLoginSuccess(INITIAL_FARMER);
            }}
            className="text-amber-800 font-bold hover:underline flex items-center gap-0.5"
          >
            <span>Explore as Guest</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
