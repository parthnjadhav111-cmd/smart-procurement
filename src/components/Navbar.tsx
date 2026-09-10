import React from 'react';
import {
  Bell,
  Volume2,
  MapPin,
  Globe2,
  ShieldCheck,
  Building2,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';
import { FarmerProfile, Language } from '../types';
import { translations } from '../translations/translations';

interface NavbarProps {
  farmer?: FarmerProfile;
  farmerName?: string;
  farmerId?: string;
  lang: Language;
  onSelectLang?: (lang: Language) => void;
  onLanguageChange?: (lang: Language) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
  isAdminView?: boolean;
  onOpenAdmin?: () => void;
  onBackToFarmerPortal?: () => void;
  onStartNewRegistration?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  farmer,
  farmerName,
  farmerId,
  lang,
  onSelectLang,
  onLanguageChange,
  unreadCount,
  onOpenNotifications,
  onOpenProfile,
  speechEnabled,
  onToggleSpeech,
  isAdminView = false,
  onOpenAdmin,
  onBackToFarmerPortal,
  onStartNewRegistration,
}) => {
  const t = translations[lang] || translations.en;
  const currentFarmerName = farmer?.name || farmerName || 'Ramesh Patil';
  const currentFarmerId = farmer?.farmer_id || farmerId || 'MH-PUN-2026-8841';
  const currentVillage = farmer?.village || 'Theur, Haveli';
  const currentPhoto = farmer?.photo_url;
  const handleLang = onSelectLang || onLanguageChange || (() => {});

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
      {/* Top Govt Bar */}
      <div className="bg-emerald-800 text-emerald-50 px-3 py-1 text-xs flex items-center justify-between font-medium">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate">Department of Agriculture & Farmers Welfare • Maharashtra State APMC</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Govt MSP Verified</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Farmer Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-900/10 text-xl shrink-0">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-stone-900 leading-tight">
                {t.app_title}
              </h1>
              {isAdminView ? (
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-800 text-white shadow-xs">
                  MANDI OFFICER PANEL
                </span>
              ) : (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  FARMER PORTAL
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 flex items-center gap-1">
              {isAdminView ? (
                <span className="font-semibold text-emerald-800">
                  Procurement Center APMC Yard Console
                </span>
              ) : (
                <>
                  <span>{t.welcome}, <strong className="text-emerald-800 font-semibold">{currentFarmerName.split(' ')[0]}</strong></span>
                  <span className="text-stone-300">•</span>
                  <span className="inline-flex items-center text-stone-500 truncate max-w-[140px] sm:max-w-[200px]">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0 mr-0.5" />
                    {currentVillage}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls: Language, Speech, Notification, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
            <button
              onClick={() => handleLang('en')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                lang === 'en' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => handleLang('hi')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                lang === 'hi' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
              }`}
              title="हिन्दी"
            >
              हिं
            </button>
            <button
              onClick={() => handleLang('mr')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                lang === 'mr' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-700 hover:text-stone-900'
              }`}
              title="मराठी"
            >
              मरा
            </button>
          </div>

          {/* Voice Accessibility Helper Button */}
          <button
            onClick={onToggleSpeech}
            className={`p-2 rounded-lg border transition-colors ${
              speechEnabled
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
            }`}
            title={speechEnabled ? 'Voice Guidance Active' : 'Enable Voice Guidance'}
            aria-label="Toggle voice guidance"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 transition-colors"
            title={t.notifications}
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Farmer Avatar/Profile Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            title={t.view_profile}
          >
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center overflow-hidden">
              {currentPhoto ? (
                <img src={currentPhoto} alt={currentFarmerName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                currentFarmerName.charAt(0)
              )}
            </div>
            <span className="text-xs font-bold text-emerald-900 hidden md:inline">
              {currentFarmerId.split('-').slice(-1)[0]}
            </span>
          </button>

          {/* New Registration Reset Button */}
          {onStartNewRegistration && !isAdminView && (
            <button
              onClick={onStartNewRegistration}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs transition-colors"
              title="Delete all history and register fresh farmer"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-700" />
              <span>New Farmer</span>
            </button>
          )}

          {/* Admin Panel Quick Access Button */}
          {isAdminView ? (
            <button
              onClick={onBackToFarmerPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-extrabold shadow-sm transition-all"
              title="Return to Farmer View"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Farmer App</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm transition-all"
              title="Mandi Officer / Admin Panel"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Panel</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
