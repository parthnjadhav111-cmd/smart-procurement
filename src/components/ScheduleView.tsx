import React, { useState } from 'react';
import {
  CalendarDays,
  Ticket,
  MapPin,
  Clock,
  Navigation,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  QrCode,
  ArrowUpRight,
  PlusCircle,
  XCircle,
} from 'lucide-react';
import { Appointment, Language, CenterSlot } from '../types';
import { translations } from '../translations/translations';
import { INITIAL_SLOTS } from '../data/mockData';
import { Users, Truck, ArrowRight } from 'lucide-react';

interface ScheduleViewProps {
  appointments: Appointment[];
  lang: Language;
  onNavigateToQueue: () => void;
  onOpenCropRegistration: () => void;
  onCancelAppointment: (id: string) => void;
  onRescheduleAppointment: (id: string) => void;
  onSimulateLateArrival: (id: string) => void;
  farmerLocation: { latitude: number; longitude: number };
  slots?: CenterSlot[];
  onSelectSlotToBook?: (slot: CenterSlot) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  appointments,
  lang,
  onNavigateToQueue,
  onOpenCropRegistration,
  onCancelAppointment,
  onRescheduleAppointment,
  onSimulateLateArrival,
  farmerLocation,
  slots = INITIAL_SLOTS,
  onSelectSlotToBook,
}) => {
  const t = translations[lang];
  const [selectedTokenModal, setSelectedTokenModal] = useState<Appointment | null>(null);

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-3 sm:px-4 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-800" />
            <span>{t.my_schedule}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your government procurement appointments, digital tokens, and time slots.
          </p>
        </div>
        <button
          onClick={onOpenCropRegistration}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto text-2xl">
            📅
          </div>
          <h3 className="text-base font-bold text-stone-900">No appointments scheduled</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Select a nearby procurement center and book a verified time slot for your crop.
          </p>
          <button
            onClick={onOpenCropRegistration}
            className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs hover:bg-emerald-800"
          >
            Register Crop & Book Slot
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${farmerLocation.latitude},${farmerLocation.longitude}&destination=${apt.center_lat},${apt.center_lng}`;

            return (
              <div
                key={apt.appointment_id}
                id={`appointment-card-${apt.appointment_id.toLowerCase()}`}
                className="bg-white rounded-3xl border-2 border-stone-200 p-4 sm:p-6 shadow-xs hover:border-emerald-400 transition-all space-y-4"
              >
                {/* Top status bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                      🌾 {apt.crop_type} Procurement
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      Crop ID: {apt.crop_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.is_late ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        Late Re-Queued
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {apt.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Center & Token Highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-xs font-semibold text-stone-400 uppercase">
                      Procurement Center
                    </span>
                    <h3 className="text-base font-extrabold text-stone-900">
                      {apt.center_name}
                    </h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{apt.center_address}</span>
                    </p>
                    <div className="text-xs text-stone-600 pt-1">
                      Center Code: <strong className="font-mono text-stone-900">{apt.center_id}</strong> •
                      Quantity: <strong>{apt.quantity} {apt.unit}</strong>
                    </div>
                  </div>

                  {/* Token Box (Section 8) */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/80 border-2 border-emerald-300 rounded-2xl p-3 text-center flex flex-col justify-center items-center">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                      Official Token
                    </span>
                    <span className="text-3xl font-black font-mono text-emerald-900 my-0.5">
                      {apt.token_id}
                    </span>
                    <button
                      onClick={() => setSelectedTokenModal(apt)}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 underline mt-0.5 flex items-center gap-1"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>View Pass</span>
                    </button>
                  </div>
                </div>

                {/* Date & Time Slot Grid */}
                <div className="grid grid-cols-2 gap-2 bg-stone-50 rounded-2xl p-3 text-xs border border-stone-100">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Appointment Date</span>
                    <strong className="text-stone-900 text-sm font-bold flex items-center gap-1 mt-0.5">
                      <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
                      {apt.date}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Scheduled Time Window</span>
                    <strong className="text-emerald-900 text-sm font-black flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      {apt.time_slot}
                    </strong>
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={onNavigateToQueue}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Track Live Queue</span>
                    </button>

                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>Directions</span>
                      <ArrowUpRight className="w-3 h-3 text-stone-400" />
                    </a>

                    <button
                      onClick={() => onRescheduleAppointment(apt.appointment_id)}
                      className="px-3 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-bold text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reschedule</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Simulator for Late Arrival testing (Section 12) */}
                    <button
                      onClick={() => onSimulateLateArrival(apt.appointment_id)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-[11px] border border-amber-200"
                      title="Simulates Section 12 Late Arrival flow"
                    >
                      Simulate Late Arrival
                    </button>

                    <button
                      onClick={() => onCancelAppointment(apt.appointment_id)}
                      className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Cancel appointment"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TODAY'S APMC TIME SLOTS & BOOKED DEMO FARMERS */}
      <div className="mt-8 bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <h3 className="text-base font-extrabold text-stone-900">
                Today's APMC Slot Roster & Booked Farmers
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Live schedule distribution across all 7 operational Mandi time windows.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Total Slots Today: 105
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {slots.map((slot) => {
            const isFull = slot.available_slots <= 0;
            const bookedFarmers = slot.booked_farmers || [];
            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border-2 transition-all space-y-2.5 ${
                  isFull
                    ? 'bg-rose-50/40 border-rose-300'
                    : 'bg-stone-50 border-stone-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <Clock className={`w-3.5 h-3.5 ${isFull ? 'text-rose-600' : 'text-emerald-700'}`} />
                    {slot.time_range}
                  </span>
                  {isFull ? (
                    <span className="text-[10px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                      🔴 BOOKED / NOT AVAILABLE
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-300">
                      🟢 {slot.available_slots} available / {slot.total_slots}
                    </span>
                  )}
                </div>

                {bookedFarmers.length > 0 ? (
                  <div className="space-y-1.5 pt-1 border-t border-stone-200/60">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                      Booked Farmers ({bookedFarmers.length}):
                    </span>
                    <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                      {bookedFarmers.map((f) => (
                        <div
                          key={f.token_id}
                          className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-stone-200/80 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-[11px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {f.token_id}
                            </span>
                            <span className="font-bold text-stone-900">{f.farmer_name}</span>
                            <span className="text-[11px] text-stone-500 font-medium">
                              ({f.crop_type})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {f.vehicle_number && (
                              <span className="text-[10px] text-stone-500 font-mono flex items-center gap-0.5">
                                <Truck className="w-3 h-3 text-stone-400" />
                                {f.vehicle_number}
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                f.gate_status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : f.gate_status === 'Entered' || f.gate_status === 'Weighbridge'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {f.gate_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-stone-400 italic py-1">
                    No farmers booked in this slot yet (all {slot.available_slots} slots open)
                  </div>
                )}

                <div className="pt-1">
                  {isFull ? (
                    <button
                      disabled
                      className="w-full py-1.5 px-3 rounded-xl bg-stone-200 text-stone-500 font-bold text-xs cursor-not-allowed text-center"
                    >
                      Slot Full • Not Available
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (onSelectSlotToBook) {
                          onSelectSlotToBook(slot);
                        } else {
                          onOpenCropRegistration();
                        }
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Select & Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DIGITAL PROCUREMENT TOKEN MODAL (Section 8) */}
      {selectedTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border-4 border-emerald-700 overflow-hidden text-center p-6 space-y-4">
            <div className="text-xs font-extrabold tracking-widest text-emerald-800 uppercase">
              GOVERNMENT OF MAHARASHTRA • APMC
            </div>

            <div className="py-2 border-y-2 border-dashed border-stone-300">
              <span className="text-xs text-stone-500 font-medium block">Digital Procurement Pass</span>
              <div className="text-5xl font-black font-mono text-emerald-800 my-1">
                {selectedTokenModal.token_id}
              </div>
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                🟢 CONFIRMED
              </span>
            </div>

            {/* Simulated QR Code */}
            <div className="w-40 h-40 mx-auto bg-stone-50 border-2 border-stone-800 rounded-2xl p-2 flex flex-col items-center justify-center">
              <div className="grid grid-cols-6 gap-1 w-full h-full p-1 opacity-80">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                        ? 'bg-stone-900'
                        : i % 5 === 0
                        ? 'bg-emerald-800'
                        : 'bg-stone-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-stone-500 mt-1">
                SECURE QR • {selectedTokenModal.appointment_id}
              </span>
            </div>

            <div className="text-xs text-left bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
              <div><strong>Center:</strong> {selectedTokenModal.center_id} ({selectedTokenModal.center_name})</div>
              <div><strong>Crop:</strong> {selectedTokenModal.crop_type} ({selectedTokenModal.quantity} {selectedTokenModal.unit})</div>
              <div><strong>Slot:</strong> {selectedTokenModal.date} • {selectedTokenModal.time_slot}</div>
              <div><strong>Crop Reg ID:</strong> {selectedTokenModal.crop_id}</div>
            </div>

            <button
              onClick={() => setSelectedTokenModal(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
