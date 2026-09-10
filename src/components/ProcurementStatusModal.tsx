import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Scale,
  ShieldCheck,
  CreditCard,
  Building2,
  FileText,
  BadgeCheck,
  Truck,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { ProcurementStageInfo, ProcurementStage, Language } from '../types';
import { translations } from '../translations/translations';

interface ProcurementStatusModalProps {
  onClose: () => void;
  lang: Language;
  userToken: string;
  currentStageIndex: number;
  onConfirmArrival: () => Promise<void> | void;
  onSetStageIndex: (idx: number) => void;
}

export const ProcurementStatusModal: React.FC<ProcurementStatusModalProps> = ({
  onClose,
  lang,
  userToken,
  currentStageIndex = 4,
  onConfirmArrival,
  onSetStageIndex,
}) => {
  const t = translations[lang] || translations.en;

  // 9 Stages Definition
  const stageDefs: {
    index: number;
    stage: ProcurementStage;
    title: string;
    description: string;
    completedDetails: string;
    pendingDetails: string;
    actionLabel?: string;
  }[] = [
    {
      index: 1,
      stage: 'registered',
      title: '1. Registered',
      description: 'Farmer UIDAI and land records verified with APMC portal.',
      completedDetails: '7/12 Land Record MH-PUN-8841 verified.',
      pendingDetails: 'Registration pending verification.',
    },
    {
      index: 2,
      stage: 'scheduled',
      title: '2. Scheduled',
      description: 'Center time slot selected for grain delivery.',
      completedDetails: 'Slot: 10 Sept 2026, 10:00 AM – 11:00 AM',
      pendingDetails: 'Time slot not scheduled.',
    },
    {
      index: 3,
      stage: 'token_generated',
      title: '3. Token Generated',
      description: 'Official verified procurement queue token issued.',
      completedDetails: `Token ID: ${userToken} generated for PC-101.`,
      pendingDetails: 'Token awaiting issuance.',
    },
    {
      index: 4,
      stage: 'farmer_arrived',
      title: '4. Farmer Arrived (Gate Verification)',
      description: 'Vehicle entry verified at APMC Main Gate Security.',
      completedDetails: 'Tractor / Vehicle entry barcode scanned & Bay A Assigned.',
      pendingDetails: 'Awaiting farmer arrival at APMC mandi gate.',
      actionLabel: 'Confirm Farmer Arrived at Gate',
    },
    {
      index: 5,
      stage: 'weighing',
      title: '5. Weighing',
      description: 'Gross & Tare weight measured on calibrated electronic weighbridge.',
      completedDetails: 'Gross: 4,800 kg • Tare: 4,000 kg • Net: 800 kg verified.',
      pendingDetails: 'Counter Bay 1. Estimated 800 kg Paddy.',
      actionLabel: 'Complete Weighbridge Measurement',
    },
    {
      index: 6,
      stage: 'quality_verification',
      title: '6. Quality Verification',
      description: 'Moisture analyzer and foreign matter grading check (<14% moisture).',
      completedDetails: 'Grade A FAQ Certified (13.2% moisture, 0.4% foreign matter).',
      pendingDetails: 'Grade A MSP compliance certification pending.',
      actionLabel: 'Certify Quality Compliance',
    },
    {
      index: 7,
      stage: 'procurement_completed',
      title: '7. Procurement Completed',
      description: 'Official Procurement Receipt (Form J) signed & issued.',
      completedDetails: 'Receipt #GOVT-MSP-PUN-2026-8841 generated.',
      pendingDetails: 'Govt acquisition receipt will be sent via SMS.',
      actionLabel: 'Issue Procurement Receipt',
    },
    {
      index: 8,
      stage: 'payment_processing',
      title: '8. Payment Processing',
      description: 'Direct Benefit Transfer (DBT) sanction initiated to bank account.',
      completedDetails: 'PFMS Govt gateway transaction #PFMS-2026-9921 authorized.',
      pendingDetails: 'PFMS Govt gateway transaction created.',
      actionLabel: 'Authorize DBT Sanction',
    },
    {
      index: 9,
      stage: 'payment_completed',
      title: '9. Payment Completed',
      description: 'MSP proceeds credited directly to Aadhaar-linked Bank Account.',
      completedDetails: '₹18,560 credited to Bank Account ending 8841 via DBT.',
      pendingDetails: '₹2,320/Quintal credited within 48 hours.',
      actionLabel: 'Confirm Bank Deposit',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="procurement-status-modal"
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-black bg-emerald-700 px-2 py-0.5 rounded border border-emerald-500">
                TOKEN {userToken}
              </span>
              <span className="text-xs font-bold text-amber-300">
                {currentStageIndex <= 9
                  ? `Stage ${currentStageIndex} of 9 Active`
                  : 'All 9 Stages Completed'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-1">{t.procurement_status}</h2>
            <p className="text-xs text-emerald-200">
              Transparent 9-Stage Government Procurement Journey (Section 15)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-700/50 hover:bg-emerald-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Callout if Stage 4 is Pending Completion */}
        {currentStageIndex === 4 && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Truck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-black text-amber-950 block">
                  Task 4 Pending: Confirm Farmer Arrival
                </strong>
                <p className="text-[11px] text-amber-900 leading-tight">
                  Click below to confirm that your tractor/vehicle has reached the APMC mandi gate.
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                await onConfirmArrival();
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Arrival</span>
            </button>
          </div>
        )}

        {/* 9 Stages List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {stageDefs.map((st) => {
              const isDone = st.index < currentStageIndex;
              const isCurrent = st.index === currentStageIndex;

              return (
                <div key={st.stage} className="relative group">
                  {/* Step node dot */}
                  <div
                    className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-transform ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-amber-400 border-amber-500 text-stone-900 ring-4 ring-amber-100 animate-pulse'
                        : 'bg-white border-stone-300 text-stone-400'
                    }`}
                  >
                    {isDone ? '✓' : st.index}
                  </div>

                  {/* Step content */}
                  <div
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                        : isDone
                        ? 'bg-stone-50/60 border-stone-200'
                        : 'bg-white border-stone-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-extrabold ${
                            isCurrent
                              ? 'text-amber-950'
                              : isDone
                              ? 'text-stone-900'
                              : 'text-stone-500'
                          }`}
                        >
                          {st.title}
                        </h4>
                        {isDone && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Completed
                          </span>
                        )}
                        {isCurrent && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-400">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {st.description}
                    </p>

                    <div
                      className={`mt-2 text-[11px] font-medium p-2 rounded-xl border ${
                        isDone
                          ? 'text-emerald-800 bg-emerald-50/80 border-emerald-200'
                          : isCurrent
                          ? 'text-amber-900 bg-white/90 border-amber-200'
                          : 'text-stone-500 bg-stone-50 border-stone-200/60'
                      }`}
                    >
                      {isDone ? `✓ ${st.completedDetails}` : isCurrent ? `Current: ${st.completedDetails}` : st.pendingDetails}
                    </div>

                    {/* Stage 4 Interactive Action */}
                    {isCurrent && st.index === 4 && (
                      <div className="mt-3 pt-2 border-t border-amber-200 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-amber-900 font-semibold">
                          Arrived at mandi gate?
                        </span>
                        <button
                          onClick={async () => {
                            await onConfirmArrival();
                          }}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete Task 4 (Arrived)</span>
                        </button>
                      </div>
                    )}

                    {/* Generic Advance Button for Testing subsequent stages */}
                    {isCurrent && st.index !== 4 && (
                      <div className="mt-3 pt-2 border-t border-amber-200 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-amber-900 font-semibold">
                          Proceed to next lifecycle step?
                        </span>
                        <button
                          onClick={() => onSetStageIndex(st.index + 1)}
                          className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                        >
                          <span>{st.actionLabel || 'Complete Step'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Reset Controls */}
        <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
          <button
            onClick={() => onSetStageIndex(4)}
            className="px-3 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Reset to Stage 4 (Farmer Arrived)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Stage 4</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
