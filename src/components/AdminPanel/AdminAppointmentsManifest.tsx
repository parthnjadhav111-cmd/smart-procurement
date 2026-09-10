import React, { useState } from 'react';
import {
  Calendar,
  Search,
  CheckCircle2,
  Truck,
  Printer,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Appointment, Language } from '../../types';

interface AdminAppointmentsManifestProps {
  appointments: Appointment[];
  onCheckIn: (appointmentId: string, details: { vehicle_number: string; gate_bay: string }) => Promise<boolean>;
  lang: Language;
}

export const AdminAppointmentsManifest: React.FC<AdminAppointmentsManifestProps> = ({
  appointments,
  onCheckIn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSlot, setFilterSlot] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Check-in modal state
  const [checkInApt, setCheckInApt] = useState<Appointment | null>(null);
  const [vehicleReg, setVehicleReg] = useState('MH-12-TR-4421');
  const [assignedBay, setAssignedBay] = useState('Bay A (Main Weighbridge)');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenCheckIn = (apt: Appointment) => {
    setCheckInApt(apt);
    setVehicleReg(`MH-12-TR-${apt.token_id?.replace('P-', '') || '101'}`);
  };

  const handleConfirmCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInApt) return;
    setIsProcessing(true);
    try {
      await onCheckIn(checkInApt.appointment_id, {
        vehicle_number: vehicleReg,
        gate_bay: assignedBay,
      });
      setCheckInApt(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      (apt.token_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.crop_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.farmer_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.appointment_id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSlot = filterSlot === 'All' || apt.time_slot.includes(filterSlot);
    const matchesStatus = filterStatus === 'All' || apt.status === filterStatus;

    return matchesSearch && matchesSlot && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <h3 className="font-extrabold text-stone-900 text-lg">
                Daily Mandi Appointment & Gate Manifest
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified farmer bookings scheduled for procurement today at Pune APMC Mandi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs border border-stone-300 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Roster
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Token (P-105), Farmer ID, Crop..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div>
            <select
              value={filterSlot}
              onChange={(e) => setFilterSlot(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="All">All Time Slots (Morning & Afternoon)</option>
              <option value="09:00">09:00 AM – 10:00 AM</option>
              <option value="10:00">10:00 AM – 11:00 AM</option>
              <option value="11:00">11:00 AM – 12:00 PM</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed / Gate Check-in Pending</option>
              <option value="Completed">Completed (Weighed & Paid)</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Manifest Records Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Token ID</th>
                <th className="p-3.5">Farmer & Reg ID</th>
                <th className="p-3.5">Crop & Booked Qty</th>
                <th className="p-3.5">Assigned Slot</th>
                <th className="p-3.5">Center Bay</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Gate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredAppointments.map((apt) => (
                <tr key={apt.appointment_id} className="hover:bg-stone-50/70 transition-all">
                  <td className="p-3.5 font-mono font-extrabold text-stone-950">
                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {apt.token_id || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <strong className="text-stone-900 font-semibold block text-xs">{apt.farmer_id}</strong>
                    <span className="text-[10px] text-stone-500 font-mono">Appt: {apt.appointment_id}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-stone-900">{apt.crop_type}</span>
                    <span className="text-stone-500 block text-[11px] font-mono">
                      {apt.quantity} {apt.unit} ({(apt.quantity / 100).toFixed(1)} Qtl)
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-stone-700 font-medium">{apt.time_slot}</td>
                  <td className="p-3.5 text-stone-600">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono text-[11px]">
                      Bay 1 / Yard 2
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        apt.status === 'Completed'
                          ? 'bg-stone-100 text-stone-600 border border-stone-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {apt.status !== 'Completed' ? (
                      <button
                        onClick={() => handleOpenCheckIn(apt)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Gate Check-In
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="p-8 text-center text-stone-500 text-xs">
            No matching appointments found for selected filter criteria.
          </div>
        )}
      </div>

      {/* GATE CHECK-IN MODAL */}
      {checkInApt && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                Mandi Gate Security Arrival Verification
              </h3>
              <button
                onClick={() => setCheckInApt(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckIn} className="space-y-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-500">Token ID:</span>
                  <strong className="text-emerald-800">{checkInApt.token_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Farmer:</span>
                  <strong className="text-stone-900">{checkInApt.farmer_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Crop / Qty:</span>
                  <span>
                    {checkInApt.crop_type} • {checkInApt.quantity} {checkInApt.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Slot:</span>
                  <span>{checkInApt.time_slot}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Arriving Vehicle Registration No. *
                </label>
                <input
                  type="text"
                  required
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                  placeholder="e.g. MH-12-TR-4421"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Assigned Unloading Bay</label>
                <select
                  value={assignedBay}
                  onChange={(e) => setAssignedBay(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                >
                  <option value="Bay A (Main Weighbridge)">Bay A (Main Weighbridge Scale 1)</option>
                  <option value="Bay B (Secondary Scale)">Bay B (Secondary Pit Scale 2)</option>
                  <option value="Bay C (Bulk Tractor Bay)">Bay C (Bulker & Tractor Bay 3)</option>
                  <option value="Drying Yard (High Moisture Inspection)">Drying Yard (Sun-Drying Area)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCheckInApt(null)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Gate Entry & Send SMS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
