import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  Calendar,
  CheckCircle2,
  Users,
  Navigation,
  ShieldCheck,
  Star,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ProcurementCenter, CenterSlot, Language } from '../types';
import { translations } from '../translations/translations';
import { INITIAL_SLOTS } from '../data/mockData';

interface CenterDetailsModalProps {
  center: ProcurementCenter | null;
  onClose: () => void;
  onBookSlot: (center: ProcurementCenter, slot: CenterSlot, date: string) => void;
  lang: Language;
  farmerLocation: { latitude: number; longitude: number };
}

export const CenterDetailsModal: React.FC<CenterDetailsModalProps> = ({
  center,
  onClose,
  onBookSlot,
  lang,
  farmerLocation,
}) => {
  if (!center) return null;
  const t = translations[lang];

  const [selectedDate, setSelectedDate] = useState('Tomorrow, 11 Sept 2026');
  const [selectedSlot, setSelectedSlot] = useState<CenterSlot>(INITIAL_SLOTS[2]); // Default 10:00 - 11:00 AM

  const dates = [
    'Today, 10 Sept 2026',
    'Tomorrow, 11 Sept 2026',
    'Saturday, 12 Sept 2026',
    'Monday, 14 Sept 2026',
  ];

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${farmerLocation.latitude},${farmerLocation.longitude}&destination=${center.latitude},${center.longitude}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="center-details-modal"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black bg-emerald-700 px-2 py-0.5 rounded border border-emerald-500">
                {center.center_id}
              </span>
              <span className="text-xs font-bold text-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {center.status}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black">{center.name}</h2>
            <p className="text-xs text-emerald-100 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>{center.address}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-700/50 hover:bg-emerald-700 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-800 text-sm">
          {/* Metrics summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-center">
              <span className="text-xs text-stone-500 block">Distance</span>
              <strong className="text-base font-black text-emerald-800">
                {center.distance_km || 8.4} km
              </strong>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-center">
              <span className="text-xs text-stone-500 block">Available Slots</span>
              <strong className="text-base font-black text-amber-700">
                {center.available_slots}
              </strong>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-center">
              <span className="text-xs text-stone-500 block">Current Queue</span>
              <strong className="text-base font-black text-stone-900">
                {center.current_queue} Farmers
              </strong>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-center">
              <span className="text-xs text-stone-500 block">Daily Capacity</span>
              <strong className="text-base font-black text-stone-700">
                {center.capacity}/day
              </strong>
            </div>
          </div>

          {/* Center Info Grid */}
          <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                Operating Hours:
              </span>
              <strong className="text-stone-900">{center.operating_hours}</strong>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                Helpline / Incharge:
              </span>
              <a href={`tel:${center.contact}`} className="font-semibold text-emerald-800 hover:underline">
                {center.contact}
              </a>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                Active Weighing Counters:
              </span>
              <strong className="text-stone-900">{center.active_counters} Counters (5-7 min/farmer)</strong>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-stone-500 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                Farmer Feedback Rating:
              </span>
              <strong className="text-stone-900">⭐ {center.rating} / 5.0</strong>
            </div>
          </div>

          {/* Accepted Crops */}
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
              Accepted Government MSP Crops
            </label>
            <div className="flex flex-wrap gap-2">
              {center.accepted_crops.map((crop) => (
                <span
                  key={crop}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  {crop}
                </span>
              ))}
            </div>
          </div>

          {/* SCHEDULE SELECTOR (Section 5) */}
          <div className="border-t border-stone-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Select Procurement Schedule</span>
              </h3>
              <span className="text-xs text-stone-500">Pick date & time slot</span>
            </div>

            {/* Date Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dates.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDate === d
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Time Slots List (Section 5 Example) */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-500 block">
                Available Time Slots for {selectedDate}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INITIAL_SLOTS.map((slot) => {
                  const isSelected = selectedSlot.id === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-emerald-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-stone-900 block">
                          {slot.time_range}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Available: <strong>{slot.available_slots} slots</strong>
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
            <span>{t.get_directions}</span>
          </a>

          <button
            id="book-procurement-slot-btn"
            onClick={() => onBookSlot(center, selectedSlot, selectedDate)}
            className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <span>{t.book_slot.toUpperCase()}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
