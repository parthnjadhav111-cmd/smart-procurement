import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Clock,
  Users,
  AlertCircle,
  BellRing,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Info,
  Layers,
  Flame,
  Volume2,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { QueueStatusResponse, Language } from '../types';
import { translations } from '../translations/translations';

interface QueueTrackerViewProps {
  queueData: QueueStatusResponse;
  lang: Language;
  currentStageIndex?: number;
  onConfirmArrival?: () => Promise<void> | void;
  onStepQueue: () => Promise<void>;
  onResetQueue: () => Promise<void>;
  onJoinLateQueue: () => Promise<void>;
  onReschedule: () => void;
  speechEnabled: boolean;
  onAnnounceTurn: (text: string) => void;
}

export const QueueTrackerView: React.FC<QueueTrackerViewProps> = ({
  queueData,
  lang,
  currentStageIndex = 4,
  onConfirmArrival,
  onStepQueue,
  onResetQueue,
  onJoinLateQueue,
  onReschedule,
  speechEnabled,
  onAnnounceTurn,
}) => {
  const t = translations[lang];

  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [simulatedLate, setSimulatedLate] = useState(queueData.is_late);

  const isMyTurn = queueData.farmers_ahead === 0 && queueData.current_token === queueData.user_token;

  // Auto-simulation interval if farmer wants to watch live progression
  useEffect(() => {
    let interval: any = null;
    if (isAutoSimulating && !isMyTurn) {
      interval = setInterval(() => {
        onStepQueue();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoSimulating, isMyTurn, onStepQueue]);

  // Voice announcement when turn arrives
  useEffect(() => {
    if (isMyTurn && speechEnabled) {
      onAnnounceTurn(`Token ${queueData.user_token}, your turn has arrived! Please proceed to procurement counter 1.`);
    }
  }, [isMyTurn, speechEnabled, queueData.user_token, onAnnounceTurn]);

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto px-3 sm:px-4 pt-4">
      {/* Header with Center Context */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
              {queueData.center_id}
            </span>
            <span className="text-xs text-stone-500">Live Counter Tracking</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 mt-0.5">
            {queueData.center_name}
          </h2>
        </div>

        {/* Counter status badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>2 Active Counters</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
            Slot: {queueData.scheduled_slot}
          </span>
        </div>
      </div>

      {/* STAGE 4 MANDI GATE ARRIVAL BANNER */}
      {currentStageIndex === 4 && onConfirmArrival && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-200 text-amber-900 uppercase">
                  Stage 4: Mandatory Gate Check-In
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-sm mt-0.5">
                Have you arrived at the APMC Mandi Gate?
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Confirm your arrival to verify entry, receive your vehicle unloading bay, and transition to weighing.
              </p>
            </div>
          </div>

          <button
            onClick={onConfirmArrival}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm I Have Arrived (Complete Task 4)</span>
          </button>
        </div>
      )}

      {currentStageIndex > 4 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Stage 4 Completed: Gate Entry Verified • Unloading Bay A Assigned</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            Next: Weighbridge Scale
          </span>
        </div>
      )}

      {/* LATE ARRIVAL NOTIFICATION (Section 12 Handling) */}
      {(queueData.is_late || simulatedLate) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-amber-900 text-base">
                {t.late_arrival_warning}
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Scheduled Slot: <strong>{queueData.scheduled_slot}</strong> • 15-Minute Grace Period Expired.
                Your crop registration is safe and not cancelled. To ensure fairness to on-time farmers, you may join the back of the active queue or pick another slot.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200">
            <button
              onClick={async () => {
                await onJoinLateQueue();
                setSimulatedLate(false);
              }}
              className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
            >
              {t.join_current_queue.toUpperCase()}
            </button>
            <button
              onClick={onReschedule}
              className="px-4 py-2 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition-colors"
            >
              {t.reschedule_appointment.toUpperCase()}
            </button>
          </div>
        </div>
      )}

      {/* TURN ARRIVED BIG BANNER (Section 10) */}
      {isMyTurn && (
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 text-white p-5 rounded-3xl shadow-xl border-4 border-emerald-400 animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
              🔔
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
                ACTIVE WEIGHING CALL
              </span>
              <h3 className="text-xl sm:text-2xl font-black">
                {t.turn_arrived_alert}
              </h3>
            </div>
          </div>
          <div className="bg-emerald-900/60 p-3 rounded-2xl border border-emerald-600 text-xs sm:text-sm flex items-center justify-between">
            <span>Counter: <strong>Counter #1 (Weighbridge Bay A)</strong></span>
            <span className="font-mono font-bold text-amber-300 text-base">TOKEN {queueData.user_token}</span>
          </div>
        </div>
      )}

      {/* BIG MAIN QUEUE METRIC DISPLAY (Section 9 UI Example) */}
      <div className="bg-white rounded-3xl border-2 border-emerald-600/30 p-4 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <Ticket className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900">
              🎫 YOUR PROCUREMENT QUEUE
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-800">
              {queueData.queue_status_label}
            </span>
          </div>
        </div>

        {/* 2 Primary Token Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Currently Serving */}
          <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 text-center">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
              {t.currently_serving}
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono text-stone-900 my-1">
              {queueData.current_token}
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Counter 1 (Active)</span>
            </div>
          </div>

          {/* Your Token */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-2 border-emerald-500 rounded-2xl p-4 text-center shadow-xs">
            <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider block mb-1">
              {t.your_token}
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-800 my-1">
              {queueData.user_token}
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              <span>🔵 You (Ramesh Patil)</span>
            </div>
          </div>
        </div>

        {/* 3 Secondary Stats (Ahead, Estimated Wait, Recommended Arrival) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 block">{t.farmers_ahead}</span>
              <strong className="text-xl font-black text-stone-900">
                {queueData.farmers_ahead}
              </strong>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 block">{t.estimated_wait}</span>
              <strong className="text-xl font-black text-emerald-800">
                {queueData.estimated_waiting_mins} min
              </strong>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-amber-900 font-medium block">{t.recommended_arrival}</span>
              <strong className="text-xl font-black font-mono text-amber-950">
                {queueData.recommended_arrival_time}
              </strong>
            </div>
          </div>
        </div>

        {/* SECTION 9 VISUAL QUEUE TRACK (Exact representation from user prompt) */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Live Visual Queue Progression</span>
            </span>
            <span className="text-xs text-stone-400">Position 1 to {queueData.queue_list.length}</span>
          </div>

          {/* Visual Track pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
            {queueData.queue_list.map((item, idx) => {
              const isServing = item.status === 'Serving';
              const isCompleted = item.status === 'Completed';
              const isUser = item.is_current_farmer || item.token_id === queueData.user_token;

              return (
                <React.Fragment key={item.token_id}>
                  <div
                    className={`flex flex-col items-center justify-center min-w-[76px] p-2 rounded-2xl border-2 transition-all ${
                      isServing
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-400/40 scale-105'
                        : isUser
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-extrabold shadow-sm'
                        : isCompleted
                        ? 'border-stone-200 bg-stone-100/70 text-stone-400 opacity-60'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <span className="font-mono text-xs font-black">{item.token_id}</span>
                    <span className="text-[10px] mt-0.5 font-bold">
                      {isServing
                        ? '🟢 Serving'
                        : isUser
                        ? '🔵 YOU'
                        : isCompleted
                        ? '✓ Done'
                        : '🟡 Waiting'}
                    </span>
                  </div>
                  {idx < queueData.queue_list.length - 1 && (
                    <span className="text-stone-300 font-bold shrink-0">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* SECTION 11 & 22: WAITING-TIME FORMULA & AI MODULE */}
        <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="font-bold text-stone-800 hover:text-emerald-800 flex items-center gap-1.5 text-xs"
            >
              <Info className="w-3.5 h-3.5 text-stone-500" />
              <span>Calculation & AI Module Insights</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showFormulaDetails ? 'rotate-90' : ''}`} />
            </button>

            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-bold text-[10px] border border-purple-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-700" />
              <span>AI Waiting Time Ready</span>
            </span>
          </div>

          {showFormulaDetails && (
            <div className="pt-2 border-t border-stone-200 space-y-2.5 text-stone-700">
              {/* Formula */}
              <div className="bg-white p-2.5 rounded-xl border border-stone-200 font-mono text-[11px] leading-relaxed">
                <span className="text-stone-500 block font-sans text-[10px]">Standard Formula (Section 11):</span>
                <strong>Estimated Wait = Farmers Ahead ({queueData.farmers_ahead}) × Avg Processing ({queueData.avg_time_per_farmer} min) ÷ Active Counters ({queueData.active_counters})</strong>
                <div className="text-emerald-800 font-bold mt-1">
                  = {queueData.estimated_waiting_mins} minutes
                </div>
              </div>

              {/* AI Prediction (Section 22) */}
              <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-200 text-purple-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">
                    AI Regressor Prediction: {queueData.ai_predicted_waiting_mins} minutes (94% Confidence)
                  </strong>
                  <p className="text-[11px] text-purple-900/80 mt-0.5">
                    Model accounts for Paddy moisture testing time (12-14%), truck weighing queue variance, and counter throughput.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SIMULATION & DEMO CONTROLS (Section 10 Demo Requirement) */}
      <div className="bg-stone-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-300">
              Prototype Live Queue Simulator (Section 10)
            </h4>
          </div>
          <span className="text-[11px] text-stone-400">
            Click to advance queue step by step
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Step queue button */}
          <button
            id="simulate-officer-completed-btn"
            onClick={onStepQueue}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Officer Finished Next Token</span>
          </button>

          {/* Auto advance toggle */}
          <button
            onClick={() => setIsAutoSimulating(!isAutoSimulating)}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
              isAutoSimulating
                ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>{isAutoSimulating ? 'Pause Auto-Progression' : 'Auto-Advance (5s)'}</span>
          </button>

          {/* Reset Queue */}
          <button
            onClick={onResetQueue}
            className="py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to P-101</span>
          </button>
        </div>
      </div>
    </div>
  );
};
