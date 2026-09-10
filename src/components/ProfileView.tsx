import React, { useState } from 'react';
import {
  User,
  MapPin,
  Phone,
  Sprout,
  ShieldCheck,
  Edit3,
  Check,
  Compass,
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { FarmerProfile, Language, LandUnit, CropType } from '../types';
import { translations } from '../translations/translations';
import { INITIAL_FARMER } from '../data/mockData';

interface ProfileViewProps {
  farmer?: FarmerProfile;
  lang: Language;
  onUpdateProfile: (updates: Partial<FarmerProfile>) => Promise<void>;
  onUpdateLocation: (lat: number, lng: number) => Promise<void>;
  onOpenAuthModal: () => void;
  onStartNewRegistration?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  farmer,
  lang,
  onUpdateProfile,
  onUpdateLocation,
  onOpenAuthModal,
  onStartNewRegistration,
}) => {
  const safeFarmer = farmer || INITIAL_FARMER;
  const t = translations[lang] || translations.en;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FarmerProfile>({ ...safeFarmer });
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Sync state if prop updates
  React.useEffect(() => {
    setFormData({ ...(farmer || INITIAL_FARMER) });
  }, [farmer]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile(formData);
    setIsEditing(false);
  };

  // Browser GPS Location update
  const handleGetBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Acquiring high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Math.round(position.coords.latitude * 10000) / 10000;
        const lng = Math.round(position.coords.longitude * 10000) / 10000;
        await onUpdateLocation(lat, lng);
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        setIsLocating(false);
        setLocationStatus(`Updated to your current GPS: ${lat}°, ${lng}°`);
        setTimeout(() => setLocationStatus(null), 5000);
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus(`GPS permission denied or unavailable. Kept fallback Pune coordinates.`);
        setTimeout(() => setLocationStatus(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4 pb-24 max-w-3xl mx-auto px-3 sm:px-4 pt-4">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white font-bold text-3xl flex items-center justify-center overflow-hidden border-4 border-emerald-100 shadow-md">
              {safeFarmer.photo_url ? (
                <img
                  src={safeFarmer.photo_url}
                  alt={safeFarmer.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                safeFarmer.name.charAt(0)
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">{safeFarmer.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                VERIFIED FARMER
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono">
              Farmer ID: <strong>{safeFarmer.farmer_id}</strong>
            </p>
            <p className="text-xs text-stone-600 flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{safeFarmer.village}, {safeFarmer.district}, Maharashtra</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-600" />
              <span>Edit Details</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs"
            >
              Cancel
            </button>
          )}

          <button
            onClick={onOpenAuthModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs"
          >
            Switch User
          </button>
        </div>
      </div>

      {/* Profile Form / Details Grid */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>Personal Information</span>
            </h3>
            <span className="text-xs text-stone-400">UIDAI / APMC Linked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-stone-500 font-medium block mb-1">Farmer Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-stone-50 font-bold text-stone-900">
                  {safeFarmer.name}
                </div>
              )}
            </div>

            <div>
              <label className="text-stone-500 font-medium block mb-1">Verified Mobile Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900 font-mono"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-stone-50 font-bold text-stone-900 font-mono flex items-center justify-between">
                  <span>{safeFarmer.phone}</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    OTP Verified
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-stone-500 font-medium block mb-1">Village / Taluka</label>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900"
                />
              ) : (
                <div className="p-2.5 rounded-xl bg-stone-50 font-bold text-stone-900">
                  {safeFarmer.village}
                </div>
              )}
            </div>

            <div>
              <label className="text-stone-500 font-medium block mb-1">District</label>
              {isEditing ? (
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900"
                >
                  <option value="Pune">Pune</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Satara">Satara</option>
                  <option value="Ahmednagar">Ahmednagar</option>
                  <option value="Nagpur">Nagpur</option>
                </select>
              ) : (
                <div className="p-2.5 rounded-xl bg-stone-50 font-bold text-stone-900">
                  {safeFarmer.district}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Agricultural Information */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-700" />
              <span>Agricultural Information</span>
            </h3>
            <span className="text-xs text-stone-400">7/12 Land Record Sync</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-stone-500 font-medium block mb-1">Total Land Area & Unit</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.land_area}
                    onChange={(e) => setFormData({ ...formData, land_area: Number(e.target.value) })}
                    className="w-2/3 px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900"
                  />
                  <select
                    value={formData.land_unit}
                    onChange={(e) => setFormData({ ...formData, land_unit: e.target.value as LandUnit })}
                    className="w-1/3 px-2 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900"
                  >
                    <option value="Acre">Acre</option>
                    <option value="Hectare">Hectare</option>
                    <option value="Guntha">Guntha</option>
                  </select>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-stone-50 font-bold text-stone-900">
                  {safeFarmer.land_area} {safeFarmer.land_unit}s
                </div>
              )}
            </div>

            <div>
              <label className="text-stone-500 font-medium block mb-1">Main Crop</label>
              {isEditing ? (
                <select
                  value={formData.main_crop}
                  onChange={(e) => setFormData({ ...formData, main_crop: e.target.value as CropType })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900"
                >
                  <option value="Paddy">Paddy (Rice)</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Soyabean">Soyabean</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Maize">Maize</option>
                  <option value="Gram (Chana)">Gram (Chana)</option>
                </select>
              ) : (
                <div className="p-2.5 rounded-xl bg-stone-50 font-bold text-emerald-900 flex items-center gap-1.5">
                  <span>🌾</span>
                  <span>{safeFarmer.main_crop}</span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="text-stone-500 font-medium block mb-1">Other Crops Grown</label>
              <div className="p-2.5 rounded-xl bg-stone-50 flex flex-wrap gap-1.5">
                {(safeFarmer.other_crops || []).map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 bg-white rounded-lg border border-stone-200 font-bold text-stone-800 text-[11px]"
                  >
                    🌱 {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Location & GPS (Section 2 Mandate) */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Current GPS Location</span>
            </h3>
            <span className="text-xs text-stone-400">For center distance matching</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-stone-500 block">Registered Coordinates:</span>
                <strong className="font-mono text-sm text-stone-900">
                  {safeFarmer.latitude.toFixed(4)}° N, {safeFarmer.longitude.toFixed(4)}° E
                </strong>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Location is only used to compute nearest procurement centers.
                </p>
              </div>

              {/* "Update Location" Button (Section 2 Requirement) */}
              <button
                type="button"
                id="update-location-btn"
                onClick={handleGetBrowserLocation}
                disabled={isLocating}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0 disabled:opacity-50"
              >
                <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : t.update_location}</span>
              </button>
            </div>

            {locationStatus && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{locationStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reset & Start Fresh Farmer Registration Section */}
        {onStartNewRegistration && (
          <div className="bg-amber-50/70 border border-amber-300 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Reset Account & Start Fresh Registration
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Wipe all existing appointment history, weighments, and tokens to open the registration panel from starting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all farmer history and start fresh from the registration panel?')) {
                    onStartNewRegistration();
                  }
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all shrink-0"
              >
                Delete History & Register Fresh
              </button>
            </div>
          </div>
        )}

        {/* Save button if editing */}
        {isEditing && (
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
