import React, { useState } from 'react';
import {
  UserCheck,
  Phone,
  ShieldCheck,
  MapPin,
  Landmark,
  Sprout,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Building2,
  FileText,
  CreditCard,
  ArrowRight,
  Locate,
  Globe2,
} from 'lucide-react';
import { FarmerProfile, Language, CropType, LandUnit, HarvestStatus, CropRecord } from '../types';
import { api } from '../api';

interface FarmerRegistrationPanelProps {
  onRegisterSuccess: (farmer: FarmerProfile, initialCrops?: CropRecord[]) => void;
  lang: Language;
  onLanguageChange: (l: Language) => void;
  onOpenAdmin?: () => void;
}

const DISTRICT_LIST = [
  'Pune',
  'Nashik',
  'Satara',
  'Ahmednagar',
  'Solapur',
  'Kolhapur',
  'Nagpur',
  'Amravati',
  'Aurangabad',
];

const CROPS: { type: CropType; msp: number; labelEn: string; labelMr: string }[] = [
  { type: 'Paddy', msp: 2300, labelEn: 'Paddy (Dhan)', labelMr: 'भात / धान' },
  { type: 'Wheat', msp: 2275, labelEn: 'Wheat (Gehun)', labelMr: 'गहू' },
  { type: 'Soyabean', msp: 4892, labelEn: 'Soyabean', labelMr: 'सोयाबीन' },
  { type: 'Cotton', msp: 7121, labelEn: 'Cotton (Kapas)', labelMr: 'कापूस' },
  { type: 'Maize', msp: 2090, labelEn: 'Maize (Makka)', labelMr: 'मका' },
  { type: 'Gram (Chana)', msp: 5440, labelEn: 'Gram (Chana)', labelMr: 'हरभरा' },
];

export const FarmerRegistrationPanel: React.FC<FarmerRegistrationPanelProps> = ({
  onRegisterSuccess,
  lang,
  onLanguageChange,
  onOpenAdmin,
}) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [landRecord712, setLandRecord712] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [taluka, setTaluka] = useState('Haveli');
  const [village, setVillage] = useState('Wagholi');
  const [state] = useState('Maharashtra');
  const [landArea, setLandArea] = useState('4.5');
  const [landUnit, setLandUnit] = useState<LandUnit>('Acre');
  const [latitude, setLatitude] = useState(18.5204);
  const [longitude, setLongitude] = useState(73.8567);
  const [locating, setLocating] = useState(false);

  // Bank Info for DBT
  const [bankName, setBankName] = useState('Bank of Maharashtra');
  const [bankAccount, setBankAccount] = useState('60123984711');
  const [bankIfsc, setBankIfsc] = useState('MAHB0000042');

  // Primary Crop
  const [selectedCrop, setSelectedCrop] = useState<CropType>('Paddy');
  const [cropQuantity, setCropQuantity] = useState('1200');
  const [harvestStatus, setHarvestStatus] = useState<HarvestStatus>('Ready for Procurement');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1-Click Quick Fill for testing
  const handleQuickFill = () => {
    setFullName('Suresh Baburao Patil');
    setPhone('9822456789');
    setOtp('1234');
    setOtpSent(true);
    setOtpVerified(true);
    setAadhaarNumber('7845 9210 3381');
    setLandRecord712('Gat No. 184/2A');
    setDistrict('Pune');
    setTaluka('Haveli');
    setVillage('Wagholi');
    setLandArea('4.5');
    setLandUnit('Acre');
    setBankName('Bank of Maharashtra');
    setBankAccount('60183928172');
    setBankIfsc('MAHB0000102');
    setSelectedCrop('Paddy');
    setCropQuantity('1200');
    setHarvestStatus('Ready for Procurement');
    setErrorMsg(null);
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg(null);
    setOtpSent(true);
    // Auto-fill demonstration OTP
    setOtp('1234');
  };

  const handleVerifyOtp = () => {
    if (otp === '1234' || otp === '1111') {
      setOtpVerified(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Invalid OTP. For prototype demo, please enter 1234.');
    }
  };

  const handleDetectLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
          setLocating(false);
        },
        () => {
          // Fallback location for Pune agricultural region
          setLatitude(18.5204);
          setLongitude(73.8567);
          setLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name as per 7/12 land record.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const generatedFarmerId = `MH-${district.slice(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        farmer_id: generatedFarmerId,
        name: fullName.trim(),
        phone: phone.trim(),
        village: village.trim() || 'Wagholi',
        taluka: taluka.trim() || 'Haveli',
        district,
        state,
        latitude,
        longitude,
        land_area: Number(landArea) || 4.5,
        land_unit: landUnit,
        main_crop: selectedCrop,
        other_crops: [selectedCrop === 'Paddy' ? 'Wheat' : 'Paddy'],
        aadhaar_number: aadhaarNumber || '•••• •••• 9102',
        land_record_712: landRecord712 || 'Gat No. 142/A',
        bank_name: bankName,
        bank_account: bankAccount,
        bank_ifsc: bankIfsc,
        initial_crop_quantity: Number(cropQuantity) || 1200,
        initial_crop_unit: 'kg',
        harvest_status: harvestStatus,
      };

      const result = await api.registerFarmer(payload);
      onRegisterSuccess(result.farmer, result.crops);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 py-6 px-3 sm:px-6 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        {/* Top Official Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-stone-900 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  Government of Maharashtra • e-Kharid Portal
                </span>
                <span className="text-emerald-300 text-xs font-semibold">Kharif/Rabi 2026-27</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                शेतकरी नवीन नोंदणी • Farmer Registration Panel
              </h1>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
                Register fresh to clear previous farmer records, issue your unique Farmer ID, and unlock guaranteed Minimum Support Price (MSP) mandi slot booking.
              </p>
            </div>

            {/* Language Switcher & Quick Fill */}
            <div className="flex sm:flex-col items-end gap-2 shrink-0">
              <div className="bg-white/10 p-1 rounded-xl flex items-center gap-1 border border-white/20">
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    lang === 'en' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('mr')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    lang === 'mr' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  मराठी
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('hi')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    lang === 'hi' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
              </div>

              <div className="flex items-center gap-2">
                {onOpenAdmin && (
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="px-3 py-1.5 bg-stone-900/80 hover:bg-stone-900 text-amber-300 font-bold text-xs rounded-xl border border-stone-700 shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Mandi Admin</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                  <span>Quick-Fill Sample</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notice Strip */}
        <div className="bg-emerald-50 border-y border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">
              Fresh Registration Mode: Submitting this form deletes all old demo history and opens your active procurement workflow.
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Personal & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <UserCheck className="w-5 h-5 text-emerald-700" />
              <h2 className="font-bold text-stone-900 text-sm sm:text-base">
                1. Farmer Personal & Mobile Verification (वैयक्तिक तपशील)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">
                  Full Name (पूर्ण नाव) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Baburao Patil"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">
                  Mobile Number (मोबाईल क्रमांक) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 font-bold text-stone-400 text-xs">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="9822012345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-11 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  {!otpVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-all shrink-0"
                    >
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  ) : (
                    <div className="px-3 py-2.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      Verified
                    </div>
                  )}
                </div>
              </div>

              {otpSent && !otpVerified && (
                <div className="sm:col-span-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                      <span>Enter 4-Digit OTP sent to +91 {phone}</span>
                      <span className="text-emerald-700 font-mono text-[11px] bg-emerald-100 px-2 py-0.5 rounded">
                        Demo Code: 1234
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Auto-filled for rapid testing or type 1234.
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-24 px-3 py-1.5 text-center font-mono font-black text-sm tracking-widest bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs"
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Aadhaar Card Number (आधार क्रमांक)</label>
                <input
                  type="text"
                  placeholder="e.g. 7845 9210 3381"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">7/12 Land Record / Gat No. (७/१२ गट क्रमांक)</label>
                <input
                  type="text"
                  placeholder="e.g. Gat No. 184/2A"
                  value={landRecord712}
                  onChange={(e) => setLandRecord712(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Farm Location & Area */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <h2 className="font-bold text-stone-900 text-sm sm:text-base">
                2. Land Location & Acreage (जमीन व पत्ता तपशील)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">District (जिल्हा)</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {DISTRICT_LIST.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Taluka / Tehsil (तालुका)</label>
                <input
                  type="text"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  placeholder="e.g. Haveli"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Village / Gram Panchayat (गाव)</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Wagholi"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-stone-700">Total Cultivated Farm Area (एकूण शेती क्षेत्र)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    placeholder="4.5"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <select
                    value={landUnit}
                    onChange={(e) => setLandUnit(e.target.value as LandUnit)}
                    className="w-32 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shrink-0"
                  >
                    <option value="Acre">Acres (एकर)</option>
                    <option value="Guntha">Gunthas (गुंठे)</option>
                    <option value="Hectare">Hectares (हेक्टर)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-stone-800 font-bold flex items-center justify-center gap-1.5 transition-all text-xs"
                >
                  <Locate className={`w-4 h-4 text-emerald-700 ${locating ? 'animate-spin' : ''}`} />
                  <span>{locating ? 'Detecting GPS...' : 'Auto-Detect Farm GPS'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Crop for Procurement */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <Sprout className="w-5 h-5 text-emerald-700" />
              <h2 className="font-bold text-stone-900 text-sm sm:text-base">
                3. Primary Crop Registration for Mandi Sale (पिक नोंदणी व हमीभाव)
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CROPS.map((c) => {
                const isSelected = selectedCrop === c.type;
                return (
                  <button
                    type="button"
                    key={c.type}
                    onClick={() => setSelectedCrop(c.type)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-stone-900 text-xs">{c.labelEn}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{c.labelMr}</div>
                    <div className="text-[10px] font-mono font-bold text-emerald-800 mt-2 bg-emerald-100/60 px-1.5 py-0.5 rounded inline-block">
                      MSP: ₹{c.msp.toLocaleString()}/Qtl
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">
                  Estimated Quantity to Sell (विक्रीसाठी अंदाजे वजन)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={cropQuantity}
                    onChange={(e) => setCropQuantity(e.target.value)}
                    placeholder="1200"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <div className="px-3.5 py-2.5 bg-stone-100 border border-stone-300 rounded-xl font-bold text-stone-700 shrink-0">
                    kg ({(Number(cropQuantity || 0) / 100).toFixed(1)} Qtl)
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Current Harvest Status (कापणीची स्थिती)</label>
                <select
                  value={harvestStatus}
                  onChange={(e) => setHarvestStatus(e.target.value as HarvestStatus)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Ready for Procurement">Ready for Procurement (कापणी पूर्ण व तयार)</option>
                  <option value="Harvested & Stored">Harvested & Stored (गोदामात साठवलेले)</option>
                  <option value="Harvesting in Progress">Harvesting in Progress (कापणी सुरू आहे)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Bank Details for DBT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <Landmark className="w-5 h-5 text-emerald-700" />
              <h2 className="font-bold text-stone-900 text-sm sm:text-base">
                4. Bank Account for Direct MSP Payout (थेट बँक खात्यात रक्कम जमा)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Bank Name (बँकेचे नाव)</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Bank of Maharashtra"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">Account Number (खाते क्रमांक)</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="60183928172"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700">IFSC Code (आयएफएससी कोड)</label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  placeholder="MAHB0000042"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono uppercase text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
            <p className="text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              Direct Benefit Transfer (DBT) will be electronically credited to this Aadhaar-linked account within 48 hours of weighbridge receipt generation.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-stone-500 hover:text-stone-800 text-xs font-bold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset with Sample Values
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering Farmer & Initializing Portal...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration & Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
