import React from 'react';
import {
  User,
  MapPin,
  Calendar,
  Ticket,
  Navigation,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import {
  FarmerProfile,
  ProcurementCenter,
  Appointment,
  Language,
} from '../types';
import { translations } from '../translations/translations';
import { INITIAL_FARMER, INITIAL_CENTERS } from '../data/mockData';

interface DashboardViewProps {
  farmer?: FarmerProfile;
  nearestCenter?: ProcurementCenter | null;
  activeAppointment?: Appointment | null;
  queueStatus?: {
    current_token: string;
    user_token: string;
    farmers_ahead: number;
    estimated_waiting_mins: number;
    recommended_arrival_time: string;
  };
  data?: {
    farmer?: FarmerProfile;
    nearest_center?: ProcurementCenter | null;
    active_appointment?: Appointment | null;
    queue_summary?: {
      current_token: string;
      user_token: string;
      farmers_ahead: number;
      estimated_wait_mins: number;
      recommended_arrival_time: string;
      status?: string;
    };
    recent_notifications?: any[];
  };
  lang: Language;
  currentStageIndex?: number;
  onConfirmArrival?: () => void;
  onNavigate: (tab: 'home' | 'centers' | 'schedule' | 'queue' | 'profile' | 'admin') => void;
  onSelectCenter: (center: ProcurementCenter) => void;
  onOpenCropRegistration: () => void;
  onOpenProcurementStatus: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  farmer,
  nearestCenter,
  activeAppointment,
  queueStatus,
  data,
  lang,
  currentStageIndex = 4,
  onConfirmArrival,
  onNavigate,
  onSelectCenter,
  onOpenCropRegistration,
  onOpenProcurementStatus,
}) => {
  const t = translations[lang] || translations.en;

  // Resilient data fallbacks
  const safeFarmer = farmer || data?.farmer || INITIAL_FARMER;
  const safeNearestCenter =
    nearestCenter !== undefined ? nearestCenter : (data?.nearest_center || INITIAL_CENTERS[0]);
  const safeAppointment =
    activeAppointment !== undefined ? activeAppointment : (data?.active_appointment || null);
  const safeQueueStatus = queueStatus || {
    current_token: data?.queue_summary?.current_token || 'P-101',
    user_token: data?.queue_summary?.user_token || 'P-105',
    farmers_ahead: data?.queue_summary?.farmers_ahead ?? 4,
    estimated_waiting_mins: data?.queue_summary?.estimated_wait_mins ?? 35,
    recommended_arrival_time: data?.queue_summary?.recommended_arrival_time || '10:35 AM',
  };

  // Direct Directions URL for Google Maps
  const directionsUrl = safeNearestCenter
    ? `https://www.google.com/maps/dir/?api=1&origin=${safeFarmer.latitude},${safeFarmer.longitude}&destination=${safeNearestCenter.latitude},${safeNearestCenter.longitude}`
    : '#';

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3 sm:px-4 pt-4">
      {/* Welcome Banner with Quick Alert */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-2xl text-white p-4 sm:p-5 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-4 text-8xl">
          🌾
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-700/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kharif & Rabi MSP Season 2026-27 Active</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {t.welcome}, {safeFarmer.name}!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Check procurement schedules, book slots with zero wait, and track your live queue position from your farm.
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <button
              id="dashboard-register-crop-btn"
              onClick={onOpenCropRegistration}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.register_crop}</span>
            </button>
            <button
              id="dashboard-lifecycle-btn"
              onClick={onOpenProcurementStatus}
              className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-700/80 hover:bg-emerald-700 text-emerald-100 font-medium text-xs rounded-xl border border-emerald-600 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.procurement_status}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 MAJOR CARDS (Section 3 & Section 16 Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1 — MY PROFILE (Section 3 & 16) */}
        <div
          id="card-my-profile"
          className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    👨🌾 {t.my_profile}
                  </h3>
                  <span className="text-xs text-stone-500 font-mono">
                    ID: {safeFarmer.farmer_id}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Verified
              </span>
            </div>

            {/* Profile summary details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500 text-xs">Farmer Name:</span>
                <span className="font-semibold text-stone-900">{safeFarmer.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500 text-xs">Village & District:</span>
                <span className="font-semibold text-stone-900">{safeFarmer.village}, {safeFarmer.district}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-50">
                <span className="text-stone-500 text-xs">Main Crop:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                  🌾 {safeFarmer.main_crop}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500 text-xs">Total Land Area:</span>
                <span className="font-semibold text-stone-900">{safeFarmer.land_area} {safeFarmer.land_unit}s</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100">
            <button
              id="view-profile-btn"
              onClick={() => onNavigate('profile')}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>{t.view_profile}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 2 — NEAREST PROCUREMENT CENTER (Section 3 & 16) */}
        <div
          id="card-nearest-center"
          className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    📍 {t.nearest_center}
                  </h3>
                  <span className="text-xs text-stone-500 font-mono">
                    ID: {safeNearestCenter?.center_id || 'PC-101'}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {t.open_status.split('/')[0].trim()}
              </span>
            </div>

            {safeNearestCenter ? (
              <div className="space-y-2 text-sm">
                <div>
                  <h4 className="font-extrabold text-stone-900 text-base">
                    {safeNearestCenter.name}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                    {safeNearestCenter.address}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 bg-stone-50 rounded-xl p-2 text-center text-xs">
                  <div className="border-r border-stone-200 pr-1">
                    <span className="block text-stone-500 text-[10px]">Distance</span>
                    <strong className="text-emerald-800 font-bold text-sm">
                      {safeNearestCenter.distance_km || 8.4} km
                    </strong>
                  </div>
                  <div className="border-r border-stone-200 pr-1">
                    <span className="block text-stone-500 text-[10px]">Slots Left</span>
                    <strong className="text-amber-700 font-bold text-sm">
                      {safeNearestCenter.available_slots}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-stone-500 text-[10px]">Rating</span>
                    <strong className="text-stone-800 font-bold text-sm">
                      ⭐ {safeNearestCenter.rating}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-stone-600 pt-1">
                  <span className="text-stone-400">Accepted:</span>
                  <div className="flex gap-1 flex-wrap">
                    {safeNearestCenter.accepted_crops.map((c) => (
                      <span key={c} className="px-1.5 py-0.5 bg-stone-200/80 rounded text-[11px] font-medium text-stone-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-500">
                Finding closest procurement center based on your GPS...
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
            <button
              id="nearest-view-details-btn"
              onClick={() => {
                if (safeNearestCenter) onSelectCenter(safeNearestCenter);
                else onNavigate('centers');
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-xs"
            >
              <span>{t.view_details}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <a
              id="nearest-get-directions-btn"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.get_directions}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
            </a>
          </div>
        </div>

        {/* CARD 3 — MY SCHEDULE (Section 3 & 16) */}
        <div
          id="card-my-schedule"
          className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    📅 {t.my_schedule}
                  </h3>
                  <span className="text-xs text-stone-500">
                    Upcoming Appointment
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                🟢 Confirmed
              </span>
            </div>

            {safeAppointment ? (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      🌾 {safeAppointment.crop_type} Procurement
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm mt-1">
                      {safeAppointment.center_name}
                    </h4>
                    <p className="text-xs text-stone-500">
                      Center: {safeAppointment.center_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-mono block">Token</span>
                    <span className="font-black font-mono text-lg text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 inline-block">
                      {safeAppointment.token_id}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="text-stone-500">Date:</span>
                    <strong className="font-semibold">{safeAppointment.date}</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="text-stone-500">Slot Window:</span>
                    <strong className="font-semibold text-emerald-900">{safeAppointment.time_slot}</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="text-stone-500">Registered Quantity:</span>
                    <strong className="font-semibold">{safeAppointment.quantity} {safeAppointment.unit}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-500">
                No appointment scheduled. Book a slot from nearby procurement centers.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100">
            <button
              id="view-schedule-btn"
              onClick={() => onNavigate('schedule')}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-amber-50 hover:text-amber-900 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>{t.view_schedule}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 4 — TRACK QUEUE (Section 3 & 16) */}
        <div
          id="card-track-queue"
          className="bg-white rounded-2xl border-2 border-emerald-600/30 p-4 sm:p-5 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    🎫 {t.track_queue}
                  </h3>
                  <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
                    Live Queue Active
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                Counter 1 & 2
              </span>
            </div>

            {/* Queue Board */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-center">
                <div className="bg-white rounded-lg p-2 border border-stone-100 shadow-2xs">
                  <span className="text-[11px] text-stone-500 block">Current Serving</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-stone-900">
                    {safeQueueStatus.current_token}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-0.5">
                    🟢 In Counter
                  </span>
                </div>
                <div className="bg-emerald-50/80 rounded-lg p-2 border border-emerald-200 shadow-2xs">
                  <span className="text-[11px] text-emerald-900 font-bold block">Your Token</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-800">
                    {safeQueueStatus.user_token}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded inline-block mt-0.5">
                    🔵 {safeFarmer.name}
                  </span>
                </div>
              </div>

              {/* Waiting metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <User className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-stone-500 text-[10px] block">Farmers Ahead</span>
                    <strong className="text-stone-900 font-bold text-sm">
                      {safeQueueStatus.farmers_ahead}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-stone-500 text-[10px] block">Estimated Wait</span>
                    <strong className="text-emerald-800 font-bold text-sm">
                      {safeQueueStatus.estimated_waiting_mins} min
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs bg-amber-50/70 border border-amber-200/80 rounded-xl px-2.5 py-1.5 text-amber-900">
                <span className="font-medium">Recommended Arrival:</span>
                <span className="font-bold font-mono">{safeQueueStatus.recommended_arrival_time}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100">
            <button
              id="track-queue-primary-btn"
              onClick={() => onNavigate('queue')}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Ticket className="w-4 h-4" />
              <span>{t.track_queue}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 15 — Overall Procurement Status Tracking Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{t.procurement_status} (Token {safeQueueStatus.user_token})</span>
            </h3>
            <p className="text-xs text-stone-500">
              Complete government crop acquisition lifecycle
            </p>
          </div>
          <button
            onClick={onOpenProcurementStatus}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline flex items-center gap-0.5"
          >
            <span>View All 9 Stages</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stepper overview */}
        <div className="overflow-x-auto pb-2 pt-1">
          <div className="min-w-[580px] flex items-center justify-between relative">
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-stone-200 -z-0" />
            <div
              className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-emerald-600 -z-0 transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(15, ((currentStageIndex - 1) / 6) * 100))}%`,
              }}
            />

            {[
              { id: '1', label: 'Registered', isDone: currentStageIndex > 1, isCurrent: currentStageIndex === 1 },
              { id: '2', label: 'Scheduled', isDone: currentStageIndex > 2, isCurrent: currentStageIndex === 2 },
              { id: '3', label: 'Token Issued', isDone: currentStageIndex > 3, isCurrent: currentStageIndex === 3 },
              { id: '4', label: 'Farmer Arrived', isDone: currentStageIndex > 4, isCurrent: currentStageIndex === 4 },
              { id: '5', label: 'Weighing', isDone: currentStageIndex > 5, isCurrent: currentStageIndex === 5 },
              { id: '6', label: 'Quality Check', isDone: currentStageIndex > 6, isCurrent: currentStageIndex === 6 },
              { id: '7', label: 'Payment (DBT)', isDone: currentStageIndex >= 9, isCurrent: currentStageIndex >= 7 && currentStageIndex <= 8 },
            ].map((step) => {
              return (
                <div key={step.id} className="flex flex-col items-center gap-1 z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      step.isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : step.isCurrent
                        ? 'bg-amber-400 border-amber-500 text-stone-900 animate-pulse ring-2 ring-amber-200'
                        : 'bg-white border-stone-300 text-stone-400'
                    }`}
                  >
                    {step.isDone ? '✓' : step.id}
                  </div>
                  <span
                    className={`text-[11px] font-semibold whitespace-nowrap ${
                      step.isCurrent
                        ? 'text-stone-900 font-bold'
                        : step.isDone
                        ? 'text-emerald-800'
                        : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task 4 Arrival Completion Banner if active */}
        {currentStageIndex === 4 && onConfirmArrival && (
          <div className="mt-3 pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span className="text-xs font-bold text-amber-950">
                Task 4: Have you reached the procurement center gate?
              </span>
            </div>
            <button
              onClick={onConfirmArrival}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Arrived (Complete Task 4)</span>
            </button>
          </div>
        )}
      </div>

      {/* APMC Mandi Officer Desk Quick Access Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 rounded-2xl p-5 text-white shadow-md border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-stone-900 uppercase">
              Admin & Inspector Console
            </span>
            <span className="text-xs text-stone-300 font-semibold">APMC Pune Mandi Yard</span>
          </div>
          <h4 className="text-base font-bold text-white">
            Procurement Officer & Weighbridge Station
          </h4>
          <p className="text-xs text-stone-300 max-w-xl">
            Live token queue dispatching, automated weighbridge scale gross/tare deductions, moisture meter inspection, and MSP Direct Benefit Transfer authorization.
          </p>
        </div>

        <button
          onClick={() => onNavigate('admin')}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all shrink-0 flex items-center gap-2"
        >
          <span>Open Officer Panel</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
