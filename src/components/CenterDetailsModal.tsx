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
  Truck,
  FileText,
  Wheat,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { ProcurementCenter, CenterSlot, Language, CropType, FarmerProfile } from '../types';
import { translations } from '../translations/translations';
import { INITIAL_SLOTS, INITIAL_FARMER } from '../data/mockData';

interface CenterDetailsModalProps {
  center: ProcurementCenter | null;
  onClose: () => void;
  onBookSlot: (
    center: ProcurementCenter,
    slot: CenterSlot,
    date: string,
    details?: {
      crop_type?: CropType;
      quantity?: number;
      unit?: string;
      vehicle_number?: string;
      vehicle_type?: string;
      driver_name?: string;
      driver_phone?: string;
      moisture_content?: number;
      gat_number?: string;
      variety?: string;
      bags_count?: number;
    }
  ) => void;
  lang: Language;
  farmerLocation: { latitude: number; longitude: number };
  slots?: CenterSlot[];
  farmer?: FarmerProfile;
}

export const CenterDetailsModal: React.FC<CenterDetailsModalProps> = ({
  center,
  onClose,
  onBookSlot,
  lang,
  farmerLocation,
  slots = INITIAL_SLOTS,
  farmer = INITIAL_FARMER,
}) => {
  if (!center) return null;
  const t = translations[lang];

  // Default to slot-2 (09:30 - 10:30 AM) or first available slot
  const availableSlotsList = slots && slots.length > 0 ? slots : INITIAL_SLOTS;
  const defaultSlot = availableSlotsList.find((s) => s.available_slots > 0) || availableSlotsList[1];

  const [selectedDate, setSelectedDate] = useState('Tomorrow, 11 Sept 2026');
  const [selectedSlot, setSelectedSlot] = useState<CenterSlot>(defaultSlot);

  // Form Details State (All Details Required for Procurement Scheduling)
  const [cropType, setCropType] = useState<CropType>(farmer.main_crop || 'Paddy');
  const [variety, setVariety] = useState<string>('Grade A Common');
  const [quantity, setQuantity] = useState<number>(800);
  const [unit, setUnit] = useState<'kg' | 'Quintal'>('kg');
  const [moistureContent, setMoistureContent] = useState<number>(12.0);
  const [bagsCount, setBagsCount] = useState<number>(16);

  // Logistics & Vehicle Details
  const [vehicleType, setVehicleType] = useState<string>('Tractor Trolley');
  const [vehicleNumber, setVehicleNumber] = useState<string>(farmer.vehicle_number || 'MH-12-TR-8841');
  const [driverName, setDriverName] = useState<string>(farmer.name || 'Sanjay Patil');
  const [driverPhone, setDriverPhone] = useState<string>(farmer.phone || '+91 98220 88410');

  // Land Verification
  const [gatNumber, setGatNumber] = useState<string>(farmer.land_record_712 || 'Gat No. 142/B');

  // Error validation
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dates = [
    'Today, 10 Sept 2026',
    'Tomorrow, 11 Sept 2026',
    'Saturday, 12 Sept 2026',
    'Monday, 14 Sept 2026',
  ];

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${farmerLocation.latitude},${farmerLocation.longitude}&destination=${center.latitude},${center.longitude}`;

  const isSlotUnavailable = selectedSlot.available_slots <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSlotUnavailable) {
      setErrorMsg(`The slot "${selectedSlot.time_range}" is fully booked and unavailable. Please pick an open slot.`);
      return;
    }
    if (!quantity || quantity <= 0) {
      setErrorMsg('Please specify a valid crop procurement quantity.');
      return;
    }
    if (!vehicleNumber.trim()) {
      setErrorMsg('Please enter your vehicle registration plate number.');
      return;
    }

    setErrorMsg(null);
    onBookSlot(center, selectedSlot, selectedDate, {
      crop_type: cropType,
      quantity: Number(quantity),
      unit,
      vehicle_number: vehicleNumber.trim().toUpperCase(),
      vehicle_type: vehicleType,
      driver_name: driverName.trim(),
      driver_phone: driverPhone.trim(),
      moisture_content: Number(moistureContent),
      gat_number: gatNumber.trim(),
      variety: variety.trim(),
      bags_count: Number(bagsCount),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="center-details-modal"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto"
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-stone-800 text-sm">
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

          {/* Token Generation Rule Callout (Addressing User Instruction) */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
              <Tag className="w-4 h-4 text-emerald-700" />
              <span>OFFICIAL TOKEN ID GENERATION NOTICE</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              In accordance with APMC Mandi rules, <strong>no token is pre-issued</strong>.
              Your unique Digital Token ID (e.g., <strong>P-108</strong>) will be dynamically generated and assigned to Weighbridge Bay A <strong>only when you submit this schedule</strong> with your crop and vehicle details.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: Date & Slot Selection with Booked / Not Available Status */}
          <div className="border border-stone-200 rounded-2xl p-4 space-y-3 bg-stone-50/50">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>1. Select Date & Procurement Time Slot</span>
              </h3>
              <span className="text-xs text-stone-500">Pick date & window</span>
            </div>

            {/* Date Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dates.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDate === d
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Slots List showing Booked / Not Available */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-600">
                  Select an available time slot for {selectedDate}:
                </span>
                <span className="text-[11px] font-bold text-stone-500">
                  Live Slot Capacity
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {availableSlotsList.map((slot) => {
                  const isSelected = selectedSlot.id === slot.id;
                  const isFull = slot.available_slots <= 0;
                  const bookedCount = slot.booked_farmers?.length || 0;

                  return (
                    <div
                      key={slot.id}
                      onClick={() => {
                        if (!isFull) {
                          setSelectedSlot(slot);
                          setErrorMsg(null);
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all ${
                        isFull
                          ? 'border-rose-200 bg-rose-50/40 opacity-75 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-600 bg-emerald-50/90 shadow-xs cursor-pointer'
                          : 'border-stone-200 bg-white hover:border-emerald-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-stone-900">
                              {slot.time_range}
                            </span>
                            {isFull ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                🔴 BOOKED / NOT AVAILABLE (FULL)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                🟢 {slot.available_slots} Slots Available
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500">
                            Total Capacity: {slot.total_slots} vehicles • {slot.available_slots} spots left
                          </p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isFull
                              ? 'border-stone-300 bg-stone-100 text-stone-400'
                              : isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isSelected && !isFull && <span className="text-[10px]">✓</span>}
                          {isFull && <span className="text-[9px]">✕</span>}
                        </div>
                      </div>

                      {/* Show Booked Farmers in this slot */}
                      {slot.booked_farmers && slot.booked_farmers.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-stone-200/60 text-xs">
                          <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                            Booked Farmers ({bookedCount}):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {slot.booked_farmers.map((bf) => (
                              <span
                                key={bf.token_id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[11px] text-stone-700"
                              >
                                <strong className="font-mono text-emerald-800">{bf.token_id}</strong>: {bf.farmer_name}
                                <span className="text-stone-400 text-[10px]">({bf.crop_type})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: Crop & Harvest Details */}
          <div className="border border-stone-200 rounded-2xl p-4 space-y-3 bg-white">
            <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
              <Wheat className="w-4 h-4 text-emerald-700" />
              <span>2. Crop & Harvest Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Crop Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value as CropType)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Paddy">Paddy (Dhan - MSP ₹2,300/Q)</option>
                  <option value="Wheat">Wheat (Gehun - MSP ₹2,275/Q)</option>
                  <option value="Soyabean">Soyabean (MSP ₹4,892/Q)</option>
                  <option value="Gram (Chana)">Gram / Chana (MSP ₹5,440/Q)</option>
                  <option value="Cotton">Cotton (MSP ₹7,121/Q)</option>
                  <option value="Maize">Maize (Makka - MSP ₹2,090/Q)</option>
                  <option value="Sugarcane">Sugarcane (FRP ₹340/Q)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Crop Variety / Grade
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Grade A, Sharbati, Lokwan"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Procurement Quantity <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-24 px-2 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800"
                  >
                    <option value="kg">kg</option>
                    <option value="Quintal">Quintal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Moisture Content % (Standard limit ≤ 14%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="25"
                    value={moistureContent}
                    onChange={(e) => setMoistureContent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-stone-500">%</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Estimated Gunny Bags / Packaging
                </label>
                <input
                  type="number"
                  min="1"
                  value={bagsCount}
                  onChange={(e) => setBagsCount(Math.max(1, Number(e.target.value)))}
                  placeholder="e.g. 16 gunny bags"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Logistics & Vehicle Information */}
          <div className="border border-stone-200 rounded-2xl p-4 space-y-3 bg-white">
            <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>3. Vehicle & Transport Logistics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Vehicle Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Tractor Trolley">Tractor Trolley</option>
                  <option value="Mahindra Bolero Pickup">Mahindra Bolero Pickup</option>
                  <option value="Tata Ace Mini Truck">Tata Ace Mini Truck</option>
                  <option value="6-Wheeler Heavy Truck">6-Wheeler Heavy Truck</option>
                  <option value="Bullock Cart">Bullock Cart</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Vehicle Registration Plate <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. MH-12-TR-8841"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Driver / Accompanier Name
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Driver Phone Number
                </label>
                <input
                  type="tel"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Land Verification & Gate Bay */}
          <div className="border border-stone-200 rounded-2xl p-4 space-y-3 bg-stone-50/60">
            <h3 className="font-black text-stone-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>4. Land Verification & Unloading Bay</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  7/12 Land Record / Gat Survey Number
                </label>
                <input
                  type="text"
                  value={gatNumber}
                  onChange={(e) => setGatNumber(e.target.value)}
                  placeholder="e.g. Gat No. 142/B"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-medium text-stone-800"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Assigned Mandi Gate & Weighbridge
                </label>
                <div className="px-3 py-2 bg-emerald-100/60 border border-emerald-300 rounded-xl font-bold text-emerald-900">
                  Bay A (Main Weighbridge Scale)
                </div>
              </div>
            </div>
          </div>
        </form>

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
            type="button"
            onClick={handleSubmit}
            disabled={isSlotUnavailable}
            className={`w-full sm:w-auto flex-1 py-3 px-6 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              isSlotUnavailable
                ? 'bg-stone-400 text-white cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:shadow-lg'
            }`}
          >
            {isSlotUnavailable ? (
              <span>SLOT NOT AVAILABLE (CHOOSE ANOTHER)</span>
            ) : (
              <>
                <span>CONFIRM SCHEDULE & GENERATE TOKEN ID</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
