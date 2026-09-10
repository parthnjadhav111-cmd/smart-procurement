import React, { useState } from 'react';
import {
  Volume2,
  Play,
  CheckCircle2,
  PlusCircle,
  Sliders,
  Radio,
  Clock,
  User,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { QueueItem, ProcurementCenter, Language } from '../../types';

interface AdminQueueDispatchProps {
  queueList: QueueItem[];
  center: ProcurementCenter;
  onCallToken: (tokenId?: string, counterNumber?: number) => Promise<{ called_token: string; counter: number }>;
  onUpdateTokenStatus: (tokenId: string, status: QueueItem['status']) => Promise<boolean>;
  onUpdateCenterConfig: (updates: {
    active_counters?: number;
    status?: ProcurementCenter['status'];
    avg_processing_mins?: number;
  }) => Promise<any>;
  onCreateManualToken: (data: {
    farmer_name: string;
    phone: string;
    crop_type: string;
    estimated_kg: number;
    vehicle_number: string;
  }) => Promise<any>;
  lang: Language;
}

export const AdminQueueDispatch: React.FC<AdminQueueDispatchProps> = ({
  queueList,
  center,
  onCallToken,
  onUpdateTokenStatus,
  onUpdateCenterConfig,
  onCreateManualToken,
}) => {
  const [activeCounter, setActiveCounter] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isCalling, setIsCalling] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('');

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInCrop, setWalkInCrop] = useState('Paddy');
  const [walkInKg, setWalkInKg] = useState('1200');
  const [walkInVehicle, setWalkInVehicle] = useState('');

  // Find currently serving token
  const currentlyServing = queueList.find((q) => q.status === 'Serving') || queueList[0];
  const waitingTokens = queueList.filter((q) => q.status === 'Waiting');

  // Trigger speech synthesis announcement if available
  const announceToken = (token: string, counter: number) => {
    const text = `Attention please. Token Number ${token}, please proceed to Counter Number ${counter}. Krupaya lakshya dya. Token kramank ${token}, Counter kramank ${counter} var ya.`;
    setLastAnnouncement(`Token ${token} called to Counter ${counter}`);
    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    }
  };

  const handleCallNext = async () => {
    setIsCalling(true);
    try {
      const result = await onCallToken(undefined, activeCounter);
      if (result?.called_token) {
        announceToken(result.called_token, result.counter);
      }
    } finally {
      setIsCalling(false);
    }
  };

  const handleCallSpecific = async (tokenId: string) => {
    setIsCalling(true);
    try {
      const result = await onCallToken(tokenId, activeCounter);
      if (result?.called_token) {
        announceToken(result.called_token, result.counter);
      }
    } finally {
      setIsCalling(false);
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName) return;
    await onCreateManualToken({
      farmer_name: walkInName,
      phone: walkInPhone || '+91 98000 00000',
      crop_type: walkInCrop,
      estimated_kg: Number(walkInKg) || 1000,
      vehicle_number: walkInVehicle || 'MH-12-WALK-IN',
    });
    setShowWalkInModal(false);
    setWalkInName('');
    setWalkInPhone('');
    setWalkInVehicle('');
  };

  const filteredQueue = queueList.filter((item) => {
    if (filterStatus === 'All') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Dispatch Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Token Calling Stage (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
              <h3 className="font-extrabold text-stone-900 text-lg">Live Mandi Token Calling Station</h3>
            </div>

            {/* Counter Selection */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-500 font-semibold">Your Counter:</span>
              <select
                value={activeCounter}
                onChange={(e) => setActiveCounter(Number(e.target.value))}
                className="font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1 focus:outline-none"
              >
                {Array.from({ length: center.active_counters || 2 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Counter #{i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Large Call Display */}
          <div className="p-6 bg-gradient-to-br from-stone-900 to-emerald-950 text-white rounded-2xl border border-emerald-800/40 text-center relative overflow-hidden shadow-inner">
            <div className="absolute top-3 left-4 text-xs font-mono text-emerald-400/80 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              PUBLIC ADDRESS DISPATCH
            </div>

            <div className="py-3">
              <span className="text-xs uppercase tracking-widest text-stone-300 font-semibold block mb-1">
                CURRENTLY AT WEIGHBRIDGE COUNTER #{activeCounter}
              </span>
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-emerald-300 drop-shadow-md">
                {currentlyServing?.token_id || 'WAITING'}
              </div>
              <p className="text-sm font-semibold text-stone-200 mt-2">
                {currentlyServing?.farmer_name} • {currentlyServing?.crop_type}
              </p>
            </div>

            {lastAnnouncement && (
              <div className="mt-2 text-xs bg-black/40 border border-emerald-500/30 rounded-lg py-1.5 px-3 inline-flex items-center gap-1.5 text-emerald-200 font-mono">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Last Broadcast: {lastAnnouncement}</span>
              </div>
            )}
          </div>

          {/* Action Call Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCallNext}
              disabled={isCalling || waitingTokens.length === 0}
              className="py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Call Next Waiting Farmer ({waitingTokens.length} in queue)</span>
            </button>

            <button
              onClick={() => setShowWalkInModal(true)}
              className="py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>Issue Walk-in / Emergency Token</span>
            </button>
          </div>
        </div>

        {/* Center Operations Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-700" />
                Mandi Operational Controls
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {center.status}
              </span>
            </div>

            {/* Active Counters Controller */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                <span>Active Weighing Counters:</span>
                <strong className="text-emerald-800 text-sm">{center.active_counters} Active Stations</strong>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => onUpdateCenterConfig({ active_counters: num })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      center.active_counters === num
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {num} {num === 1 ? 'Station' : 'Stations'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-500">
                Adjusting counters recalculates predicted wait times for all waiting farmers instantly.
              </p>
            </div>

            {/* Mandi Operational Status */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-stone-700 block">Center Gate Status:</span>
              <div className="grid grid-cols-2 gap-2">
                {(['Open', 'Accepting Farmers', 'Yard Full', 'Closed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateCenterConfig({ status: st })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      center.status === st
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{st}</span>
                    {center.status === st && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Average Processing Speed */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-stone-700">
                <span>Avg Weighment & Inspection Speed:</span>
                <strong className="text-stone-900">{center.avg_processing_mins || 7} mins / vehicle</strong>
              </div>
              <p className="text-[11px] text-stone-500">
                Based on automated gross/tare weigh scales and digital moisture probing.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 border-t border-stone-100 pt-3 flex items-center justify-between font-mono">
            <span>Center ID: {center.center_id}</span>
            <span>Capacity: {center.capacity} tonnes/day</span>
          </div>
        </div>
      </div>

      {/* Live Queue Management Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-stone-900 text-base">Live Queue Manifest ({queueList.length} Farmers)</h3>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            {['All', 'Waiting', 'Serving', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Pos</th>
                <th className="p-3">Token</th>
                <th className="p-3">Farmer Name</th>
                <th className="p-3">Crop / Quantity</th>
                <th className="p-3">Time Slot</th>
                <th className="p-3">Current Status</th>
                <th className="p-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredQueue.map((item, idx) => (
                <tr
                  key={item.token_id}
                  className={`hover:bg-stone-50/80 transition-all ${
                    item.status === 'Serving' ? 'bg-emerald-50/50' : ''
                  }`}
                >
                  <td className="p-3 font-mono font-bold text-stone-500">#{item.position || idx + 1}</td>
                  <td className="p-3 font-mono font-extrabold text-stone-950">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                      {item.token_id}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-stone-900">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.farmer_name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-stone-600">{item.crop_type}</td>
                  <td className="p-3 text-stone-500 font-mono text-[11px]">{item.time_slot}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        item.status === 'Serving'
                          ? 'bg-emerald-600 text-white'
                          : item.status === 'Completed'
                          ? 'bg-stone-100 text-stone-600 border border-stone-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.status !== 'Serving' && item.status !== 'Completed' && (
                        <button
                          onClick={() => handleCallSpecific(item.token_id)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] transition-all flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Call
                        </button>
                      )}

                      {/* Status select */}
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateTokenStatus(item.token_id, e.target.value as any)}
                        className="text-[11px] font-semibold bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="Waiting">Waiting</option>
                        <option value="Serving">Serving</option>
                        <option value="Completed">Completed</option>
                        <option value="Skipped">Skipped</option>
                        <option value="Late">Late / Expired</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WALK-IN / EMERGENCY TOKEN MODAL */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Issue Walk-in / Emergency Mandi Token
              </h3>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Farmer Full Name *</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Balasaheb Shinde"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Crop</label>
                  <select
                    value={walkInCrop}
                    onChange={(e) => setWalkInCrop(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Paddy">Paddy</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Soyabean">Soyabean</option>
                    <option value="Cotton">Cotton</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Estimated Qty (kg)</label>
                  <input
                    type="number"
                    value={walkInKg}
                    onChange={(e) => setWalkInKg(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Vehicle Registration No.</label>
                <input
                  type="text"
                  value={walkInVehicle}
                  onChange={(e) => setWalkInVehicle(e.target.value.toUpperCase())}
                  placeholder="MH-12-XX-0000"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs"
                >
                  Generate & Add to Yard Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
