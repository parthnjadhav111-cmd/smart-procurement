import React, { useState } from 'react';
import {
  Bell,
  Send,
  Sliders,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { ProcurementCenter, Language } from '../../types';

interface AdminCapacityConfigProps {
  center: ProcurementCenter;
  onUpdateCenter: (updates: {
    active_counters?: number;
    capacity?: number;
    avg_processing_mins?: number;
    status?: ProcurementCenter['status'];
  }) => Promise<any>;
  onBroadcast: (title: string, message: string, alertType?: 'status' | 'turn' | 'queue') => Promise<boolean>;
  lang: Language;
}

export const AdminCapacityConfig: React.FC<AdminCapacityConfigProps> = ({
  center,
  onUpdateCenter,
  onBroadcast,
}) => {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'status' | 'turn' | 'queue'>('status');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Center capacity form
  const [dailyCapacity, setDailyCapacity] = useState<number>(center.capacity || 150);
  const [avgSpeed, setAvgSpeed] = useState<number>(center.avg_processing_mins || 7);
  const [savedConfigMsg, setSavedConfigMsg] = useState(false);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setIsSending(true);
    try {
      await onBroadcast(broadcastTitle, broadcastMessage, broadcastType);
      setSentSuccess(true);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setTimeout(() => setSentSuccess(false), 4000);
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateClick = (title: string, msg: string, type: 'status' | 'turn' | 'queue') => {
    setBroadcastTitle(title);
    setBroadcastMessage(msg);
    setBroadcastType(type);
  };

  const handleSaveCenterConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateCenter({
      capacity: dailyCapacity,
      avg_processing_mins: avgSpeed,
    });
    setSavedConfigMsg(true);
    setTimeout(() => setSavedConfigMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Broadcast Sender (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-700" />
              <h3 className="font-extrabold text-stone-900 text-base">
                Procurement Yard Public Announcement (Broadcast)
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">Push Notification to Farmers</span>
          </div>

          <p className="text-xs text-stone-600">
            Send an instant notification alert to all farmers currently queued, en-route, or booked for today at this procurement center.
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Announcement Title *</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Weighbridge Scale 2 Now Open for Wheat Unloading"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Detailed Message *</label>
              <textarea
                required
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter detailed instruction for arriving or queued farmers..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold text-stone-700">Alert Priority:</span>
              <div className="flex gap-2">
                {[
                  { id: 'status', label: 'Operational Update', color: 'emerald' },
                  { id: 'queue', label: 'Queue Flow Advisory', color: 'amber' },
                  { id: 'turn', label: 'Urgent Action Alert', color: 'red' },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-1.5 cursor-pointer text-stone-700">
                    <input
                      type="radio"
                      name="alertType"
                      checked={broadcastType === item.id}
                      onChange={() => setBroadcastType(item.id as any)}
                      className="text-emerald-700 accent-emerald-700"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {sentSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Announcement broadcasted successfully to all queued farmer apps!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || !broadcastTitle || !broadcastMessage}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Announcement to All Farmers</span>
            </button>
          </form>

          {/* Quick Pre-Set Templates */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Quick One-Click Templates:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleTemplateClick(
                    'Weighbridge Scale 2 Open',
                    'Weighbridge scale 2 is now open. Paddy vehicles please proceed to Bay B to expedite queue.',
                    'status'
                  )
                }
                className="p-2 text-left rounded-lg bg-stone-50 hover:bg-emerald-50 border border-stone-200 text-stone-700 hover:text-emerald-900 transition-all text-xs"
              >
                <strong className="block">Scale 2 Expedited Intake</strong>
                <span className="text-[10px] text-stone-500">Diverts paddy loads to Bay B</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleTemplateClick(
                    'Moisture Testing Advisory',
                    'Please ensure paddy moisture is within 14% FAQ limit. High moisture loads should use the drying floor.',
                    'queue'
                  )
                }
                className="p-2 text-left rounded-lg bg-stone-50 hover:bg-emerald-50 border border-stone-200 text-stone-700 hover:text-emerald-900 transition-all text-xs"
              >
                <strong className="block">Moisture Compliance Notice</strong>
                <span className="text-[10px] text-stone-500">Reminds farmers of 14% FAQ rule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center Intake Capacity & Quota Config (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-700" />
              <h3 className="font-extrabold text-stone-900 text-base">Center Quota & Speed</h3>
            </div>
            <Building className="w-4 h-4 text-stone-400" />
          </div>

          <form onSubmit={handleSaveCenterConfig} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Daily Intake Quota Capacity (Tonnes / Day)
              </label>
              <input
                type="number"
                value={dailyCapacity}
                onChange={(e) => setDailyCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Current Center Allocation: {dailyCapacity} MT ({dailyCapacity * 10} Quintals).
              </p>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Target Processing Speed (Minutes per Vehicle)
              </label>
              <input
                type="number"
                value={avgSpeed}
                onChange={(e) => setAvgSpeed(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Used by the queue engine to calculate ETA for arriving farmers.
              </p>
            </div>

            {savedConfigMsg && (
              <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Center operational parameters updated successfully!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold transition-all shadow-xs"
            >
              Update Center Parameters
            </button>
          </form>

          {/* Slot Allocation Summary */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-stone-800">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                Hourly Slot Caps
              </span>
              <span className="text-emerald-800">12 Farmers / Slot</span>
            </div>
            <div className="space-y-1.5 text-stone-600 text-[11px]">
              <div className="flex justify-between">
                <span>09:00 AM – 10:00 AM:</span>
                <strong className="text-stone-900 font-mono">10 / 12 Booked</strong>
              </div>
              <div className="flex justify-between">
                <span>10:00 AM – 11:00 AM:</span>
                <strong className="text-emerald-800 font-mono font-bold">12 / 12 Booked (Full)</strong>
              </div>
              <div className="flex justify-between">
                <span>11:00 AM – 12:00 PM:</span>
                <strong className="text-stone-900 font-mono">8 / 12 Booked</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
