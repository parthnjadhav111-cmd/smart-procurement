import React from 'react';
import {
  TrendingUp,
  Scale,
  IndianRupee,
  Users,
  CheckCircle2,
  PieChart as PieIcon,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { AdminStats, AdminWeighmentRecord, Language } from '../../types';

interface AdminAnalyticsViewProps {
  stats: AdminStats;
  records: AdminWeighmentRecord[];
  lang: Language;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  stats,
  records,
}) => {
  // Aggregate crops
  const cropBreakdown: Record<string, { weightKg: number; payout: number; count: number }> = {};
  records.forEach((rec) => {
    if (!cropBreakdown[rec.crop_type]) {
      cropBreakdown[rec.crop_type] = { weightKg: 0, payout: 0, count: 0 };
    }
    cropBreakdown[rec.crop_type].weightKg += rec.net_weight_kg;
    cropBreakdown[rec.crop_type].payout += rec.net_payable_inr;
    cropBreakdown[rec.crop_type].count += 1;
  });

  const totalKg = stats.total_procured_kg_today || 1;
  const totalMT = (stats.total_procured_kg_today / 1000).toFixed(2);
  const totalLakhs = (stats.total_payout_inr_today / 100000).toFixed(2);

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Procured Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-stone-900">
              {stats.total_procured_kg_today.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-700">kg ({totalMT} MT)</span>
          </div>
          <div className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>Target daily quota on track</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total MSP DBT Authorized
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-800">
              ₹{totalLakhs}
            </span>
            <span className="text-xs font-bold text-stone-500">Lakhs</span>
          </div>
          <div className="text-[11px] text-stone-500">
            ₹{stats.total_payout_inr_today.toLocaleString('en-IN')} disbursed directly to bank
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Farmers Serviced
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-stone-900">
              {stats.farmers_served_today}
            </span>
            <span className="text-xs text-stone-400">/ {stats.active_in_queue} in queue</span>
          </div>
          <div className="text-[11px] text-stone-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Zero wait-list bottlenecks</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Avg Processing Speed
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-stone-900">
              {stats.average_processing_mins}
            </span>
            <span className="text-xs font-bold text-stone-500">mins / vehicle</span>
          </div>
          <div className="text-[11px] text-stone-500">Across {stats.counters_active} Active Stations</div>
        </div>
      </div>

      {/* Breakdown Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Crop Volume Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-700" />
              <h3 className="font-extrabold text-stone-900 text-base">Crop-Wise Intake Volume</h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">Today's Receipts</span>
          </div>

          <div className="space-y-4 pt-2">
            {Object.keys(cropBreakdown).length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">No weighments recorded yet today.</p>
            ) : (
              Object.entries(cropBreakdown).map(([crop, data]) => {
                const pct = Math.round((data.weightKg / totalKg) * 100);
                return (
                  <div key={crop} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <strong className="text-stone-900">{crop}</strong>
                        <span className="text-stone-400 font-normal">({data.count} loads)</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-stone-700 font-bold">{data.weightKg.toLocaleString('en-IN')} kg</span>
                        <span className="text-emerald-800 font-extrabold">₹{data.payout.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Mandi Compliance & Quality Inspection Status (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-stone-900 text-base">Quality & FAQ Compliance</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex justify-between font-bold text-emerald-950">
                  <span>FAQ Grade A (Full MSP Disbursed):</span>
                  <span>
                    {records.filter((r) => r.quality_grade === 'FAQ Grade A').length} / {records.length} Loads
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Moisture within standard limits (≤14% for Paddy, ≤12% for Wheat).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="flex justify-between font-bold text-amber-950">
                  <span>Sub-Standard (Deduction Applied):</span>
                  <span>
                    {records.filter((r) => r.quality_grade === 'Sub-Standard (Deducted)').length} Loads
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Slight moisture excess; handled via statutory ₹25/qtl deduction without turning farmer away.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="flex justify-between font-bold text-stone-800">
                  <span>Direct Benefit Transfer (DBT) Rate:</span>
                  <span className="text-emerald-800 font-mono font-bold">100% Aadhaar-Linked</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Zero cash handling at mandi gates. Total transparency and farmer account credit.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-400 font-mono text-center">
            System Synchronized with Maharashtra APMC State Portal
          </div>
        </div>
      </div>
    </div>
  );
};
