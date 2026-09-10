import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { FarmerProfile, LandUnit, CropType } from '../types';
import { INITIAL_FARMER } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (farmer: FarmerProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'details' | 'otp'>('details');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [landArea, setLandArea] = useState<number>(4.5);
  const [landUnit, setLandUnit] = useState<LandUnit>('Acre');
  const [mainCrop, setMainCrop] = useState<CropType>('Paddy');
  const [otherCrops, setOtherCrops] = useState<string>('Wheat, Soyabean');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill demo
  const handlePreFillDemo = () => {
    setName('Santosh Tukaram Shinde');
    setPhone('+91 98901 23456');
    setVillage('Daund');
    setDistrict('Pune');
    setLandArea(6.0);
    setLandUnit('Acre');
    setMainCrop('Wheat');
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg('');
    setStep('otp');
    setOtp('1234'); // Simulated OTP autofill for ease of demonstration
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1234' && otp !== '1111') {
      setErrorMsg('Invalid OTP. Use 1234 for demo prototype.');
      return;
    }

    if (mode === 'login') {
      // Log in as demo farmer
      onSuccess(INITIAL_FARMER);
    } else {
      const otherArr = otherCrops
        .split(',')
        .map((s) => s.trim() as CropType)
        .filter(Boolean);

      const newFarmer: FarmerProfile = {
        farmer_id: `MH-${district.substring(0, 3).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name || 'Demo Farmer',
        phone: phone || '+91 98000 00000',
        village: village || 'Manchar',
        district: district || 'Pune',
        latitude: 18.5204,
        longitude: 73.8567,
        land_area: landArea,
        land_unit: landUnit,
        main_crop: mainCrop,
        other_crops: otherArr.length > 0 ? otherArr : ['Wheat'],
        active_crop: mainCrop,
        is_verified: true,
      };
      onSuccess(newFarmer);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="auth-modal"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center font-bold text-xl">
              🌾
            </div>
            <div>
              <h2 className="text-lg font-black">
                {mode === 'login' ? 'Farmer Login' : 'Farmer Registration'}
              </h2>
              <p className="text-xs text-emerald-200">
                Direct APMC Govt Verification (Section 1)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-emerald-700/50 hover:bg-emerald-700 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-bold text-stone-700">
          <button
            onClick={() => {
              setMode('login');
              setStep('details');
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'login'
                ? 'bg-white text-emerald-900 border-b-2 border-emerald-700'
                : 'hover:bg-stone-100'
            }`}
          >
            Registered Farmer Login
          </button>
          <button
            onClick={() => {
              setMode('register');
              setStep('details');
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'register'
                ? 'bg-white text-emerald-900 border-b-2 border-emerald-700'
                : 'hover:bg-stone-100'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 mb-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              {mode === 'login' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98220 14589"
                        defaultValue="+91 98220 14589"
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 text-xs space-y-1">
                    <p className="font-bold text-stone-800">Quick Demo Access:</p>
                    <p>Default demo farmer: <strong>Ramesh Patil</strong> (Pune District, Paddy, Token P-105)</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-stone-500 font-semibold">
                      Enter details as per 7/12 land record
                    </span>
                    <button
                      type="button"
                      onClick={handlePreFillDemo}
                      className="text-[11px] font-bold text-emerald-800 underline"
                    >
                      Pre-fill Sample
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Santosh Tukaram Shinde"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-semibold text-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98000 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        District *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-semibold"
                      >
                        <option value="Pune">Pune</option>
                        <option value="Nashik">Nashik</option>
                        <option value="Satara">Satara</option>
                        <option value="Ahmednagar">Ahmednagar</option>
                        <option value="Nagpur">Nagpur</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Village / Taluka *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Theur, Haveli"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Main Crop *
                      </label>
                      <select
                        value={mainCrop}
                        onChange={(e) => setMainCrop(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-semibold"
                      >
                        <option value="Paddy">Paddy</option>
                        <option value="Wheat">Wheat</option>
                        <option value="Soyabean">Soyabean</option>
                        <option value="Cotton">Cotton</option>
                        <option value="Maize">Maize</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Land Area *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={landArea}
                        onChange={(e) => setLandArea(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                        Land Unit
                      </label>
                      <select
                        value={landUnit}
                        onChange={(e) => setLandUnit(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-semibold"
                      >
                        <option value="Acre">Acre</option>
                        <option value="Hectare">Hectare</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md mt-4"
              >
                <span>Get Simulated OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                <span className="font-bold">Simulated OTP Sent:</span> A verification code has been generated. Use <strong>1234</strong> to proceed.
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Enter 4-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center text-2xl tracking-widest font-black py-2.5 rounded-xl border-2 border-emerald-600 bg-stone-50 font-mono text-emerald-900 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 py-2.5 border border-stone-300 rounded-xl font-bold text-stone-700 text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs shadow-md"
                >
                  Verify & Enter Dashboard
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
