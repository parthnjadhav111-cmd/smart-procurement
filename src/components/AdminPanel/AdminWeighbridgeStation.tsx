import React, { useState } from 'react';
import {
  Scale,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Search,
  IndianRupee,
  Truck,
  ShieldCheck,
  User,
  X,
  Sparkles,
} from 'lucide-react';
import {
  AdminWeighmentRecord,
  CropType,
  QueueItem,
  Appointment,
  Language,
} from '../../types';
import { MSP_RATES } from '../../data/mockData';

interface AdminWeighbridgeStationProps {
  records: AdminWeighmentRecord[];
  queueList: QueueItem[];
  appointments: Appointment[];
  onSubmitWeighment: (data: {
    token_id: string;
    farmer_name: string;
    farmer_id: string;
    crop_type: CropType;
    vehicle_number: string;
    gross_weight_kg: number;
    tare_weight_kg: number;
    moisture_pct: number;
    foreign_matter_pct: number;
  }) => Promise<AdminWeighmentRecord>;
  lang: Language;
}

export const AdminWeighbridgeStation: React.FC<AdminWeighbridgeStationProps> = ({
  records,
  queueList,
  appointments,
  onSubmitWeighment,
}) => {
  // Form State
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmerId, setFarmerId] = useState<string>('');
  const [cropType, setCropType] = useState<CropType>('Paddy');
  const [vehicleNumber, setVehicleNumber] = useState<string>('MH-12-TR-4421');
  const [grossWeight, setGrossWeight] = useState<number>(4500);
  const [tareWeight, setTareWeight] = useState<number>(2800);
  const [moisturePct, setMoisturePct] = useState<number>(13.2);
  const [foreignMatterPct, setForeignMatterPct] = useState<number>(0.8);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<AdminWeighmentRecord | null>(null);

  // Quick select from queue
  const handleSelectFromQueue = (item: QueueItem) => {
    setSelectedTokenId(item.token_id);
    const cleanName = (item.farmer_name || 'Farmer').replace(' (You)', '');
    setFarmerName(cleanName);

    // Find appointment if available
    const apt = appointments.find((a) => a.token_id === item.token_id);
    if (apt) {
      setFarmerId(apt.farmer_id);
      setCropType(apt.crop_type);
    } else {
      setFarmerId(`MH-PUN-${item.token_id}`);
      if (item.crop_type?.includes('Wheat')) setCropType('Wheat');
      else if (item.crop_type?.includes('Soyabean')) setCropType('Soyabean');
      else setCropType('Paddy');
    }
  };

  // Calculations
  const netWeightKg = Math.max(0, grossWeight - tareWeight);
  const netQuintals = netWeightKg / 100;
  const mspInfo = MSP_RATES[cropType] || MSP_RATES.Paddy;
  const mspRate = mspInfo.msp_per_quintal;
  const baseAmount = Math.round(netQuintals * mspRate);

  // Moisture quality check
  const isMoistureStandard = moisturePct <= mspInfo.standard_moisture_max;
  const isMoistureDryingTolerated =
    moisturePct > mspInfo.standard_moisture_max && moisturePct <= mspInfo.drying_tolerance_max;
  const isMoistureRejected = moisturePct > mspInfo.drying_tolerance_max;

  const moistureExcess = Math.max(0, moisturePct - mspInfo.standard_moisture_max);
  // Deduction rate: ₹25 per quintal per 1% excess moisture
  const qualityDeduction = isMoistureDryingTolerated ? Math.round(moistureExcess * 25 * netQuintals) : 0;
  const netPayable = Math.max(0, baseAmount - qualityDeduction);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTokenId) return;

    setIsSubmitting(true);
    try {
      const newRec = await onSubmitWeighment({
        token_id: selectedTokenId,
        farmer_name: farmerName || 'Farmer',
        farmer_id: farmerId || 'MH-PUN-2026-FARM',
        crop_type: cropType,
        vehicle_number: vehicleNumber || 'MH-12-TR-9900',
        gross_weight_kg: grossWeight,
        tare_weight_kg: tareWeight,
        moisture_pct: moisturePct,
        foreign_matter_pct: foreignMatterPct,
      });

      setActiveReceipt(newRec);
      // Reset
      setSelectedTokenId('');
      setFarmerName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white p-5 rounded-2xl shadow-md border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight">Electronic Weighbridge & Moisture Inspection Desk</h2>
          </div>
          <p className="text-xs text-stone-300 mt-1 max-w-2xl">
            Certified automated weighing system under Maharashtra APMC Mandi Regulation 1963. Gross - Tare calculation with automated Government Minimum Support Price (MSP) disbursement.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/80 px-3.5 py-2 rounded-xl border border-emerald-700/50">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div className="text-xs">
            <span className="text-stone-400 block">Weighbridge Calibration</span>
            <strong className="text-emerald-200">Certified by Weights & Measures (Valid 2026)</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Weighbridge Entry Form; Right = Live Queue Quick Picker & Completed Slips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h3 className="font-bold text-stone-900 text-base">New Crop Weighment Entry</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
              Station: Scale-1 (50-Tonne Pitless)
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Token & Farmer Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Procurement Token ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={selectedTokenId}
                    onChange={(e) => setSelectedTokenId(e.target.value.toUpperCase())}
                    placeholder="e.g. P-101 or P-105"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Farmer Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Crop Variety</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value as CropType)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Paddy">Paddy (Common / Grade A)</option>
                  <option value="Wheat">Wheat (Milling Quality)</option>
                  <option value="Soyabean">Soyabean (Yellow Grade 1)</option>
                  <option value="Cotton">Cotton (Medium Staple)</option>
                  <option value="Maize">Maize (Kharif Standard)</option>
                  <option value="Gram (Chana)">Gram (Chana / Desi Whole)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Vehicle / Tractor Reg No.</label>
                <div className="relative">
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. MH-12-BG-4421"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <Truck className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Step 2: Digital Scale Weights */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  Weighbridge Load Cells Readout (kg)
                </span>
                <span className="text-[11px] text-stone-500">Auto-synced from weigh scale sensor</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Gross Weight (Loaded)</label>
                  <input
                    type="number"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Tare Weight (Empty)</label>
                  <input
                    type="number"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-emerald-800 block mb-1">Net Crop Weight</label>
                  <div className="px-3 py-2 bg-emerald-100 border border-emerald-300 rounded-lg text-sm font-mono font-extrabold text-emerald-950">
                    {netWeightKg} kg
                  </div>
                </div>
              </div>

              <div className="text-xs text-stone-600 flex items-center justify-between pt-1 border-t border-stone-200">
                <span>Calculated Volume:</span>
                <strong className="text-emerald-900 font-bold">{netQuintals.toFixed(2)} Quintals ({ (netWeightKg / 1000).toFixed(3) } MT)</strong>
              </div>
            </div>

            {/* Step 3: Moisture Meter & Quality Inspection */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-amber-700" />
                  Digital Moisture Meter & Quality Check
                </span>
                <span className="text-[11px] text-amber-800">Govt FAQ Limit: ≤ {mspInfo.standard_moisture_max}%</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-700">Moisture Content:</span>
                    <span className="font-mono font-bold text-stone-900 text-sm">{moisturePct}%</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="22"
                    step="0.1"
                    value={moisturePct}
                    onChange={(e) => setMoisturePct(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-0.5 font-mono">
                    <span>8% (Dry)</span>
                    <span className="text-emerald-700 font-bold">{mspInfo.standard_moisture_max}% FAQ</span>
                    <span className="text-red-600 font-bold">{mspInfo.drying_tolerance_max}% Max</span>
                    <span>22%</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Foreign Matter / Inerts (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={foreignMatterPct}
                    onChange={(e) => setForeignMatterPct(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">Acceptable limit: &lt; 2.0%</p>
                </div>
              </div>

              {/* Moisture status indicator */}
              <div className="pt-2">
                {isMoistureStandard && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-3 py-2 rounded-lg border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>FAQ Standard Compliant: Moisture is within optimal limit. Eligible for 100% full MSP.</span>
                  </div>
                )}
                {isMoistureDryingTolerated && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-100 px-3 py-2 rounded-lg border border-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Moisture Exceeds FAQ Limit ({moisturePct}% vs {mspInfo.standard_moisture_max}%). Standard deduction of ₹25/quintal per excess percent will apply.
                    </span>
                  </div>
                )}
                {isMoistureRejected && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-900 bg-red-100 px-3 py-2 rounded-lg border border-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                    <span>
                      Excessive Moisture (&gt; {mspInfo.drying_tolerance_max}%). Grain exceeds Mandi intake limit. Recommended: divert to Mandi Sun-Drying Yard before re-weighing.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: MSP Payment Calculation Box */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-900">
                <span className="font-semibold">Official Govt MSP Rate ({cropType}):</span>
                <span className="font-mono font-bold">₹{mspRate.toLocaleString('en-IN')} / Quintal</span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-700">
                <span>Base Crop Value ({netQuintals.toFixed(2)} Qtl × ₹{mspRate}):</span>
                <span className="font-mono font-medium">₹{baseAmount.toLocaleString('en-IN')}</span>
              </div>
              {qualityDeduction > 0 && (
                <div className="flex items-center justify-between text-xs text-amber-800">
                  <span>Moisture Deduction ({moistureExcess.toFixed(1)}% excess):</span>
                  <span className="font-mono font-medium">- ₹{qualityDeduction.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-stone-900">
                <span className="text-sm font-extrabold flex items-center gap-1 text-emerald-950">
                  <IndianRupee className="w-4 h-4 text-emerald-700" />
                  Net Payable to Farmer Bank Account:
                </span>
                <span className="text-lg sm:text-xl font-mono font-black text-emerald-800">
                  ₹{netPayable.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 text-right">
                Direct Benefit Transfer (DBT) to Farmer Aadhaar-linked Bank A/c within 48 hours
              </p>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedTokenId || netWeightKg <= 0}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Generating Government Voucher...</span>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Authorize & Generate Official Weighment Slip</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Queue Quick Picker & Completed Records (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Select from Active Queue */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Active Queue Load (Select to Weigh)
              </h3>
              <span className="text-xs text-stone-500 font-mono">{queueList.length} in yard</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {queueList.filter((q) => q.status !== 'Completed').map((item) => (
                <div
                  key={item.token_id}
                  onClick={() => handleSelectFromQueue(item)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedTokenId === item.token_id
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-600/20'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {item.token_id}
                    </span>
                    <div>
                      <strong className="text-stone-900 block font-semibold truncate max-w-[140px]">
                        {item.farmer_name}
                      </strong>
                      <span className="text-[11px] text-stone-500">{item.crop_type}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'Serving'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Completed Weighment Vouchers */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                Completed Mandi Vouchers Today
              </h3>
              <span className="text-xs text-emerald-800 font-bold">{records.length} Issued</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {records.map((rec) => (
                <div
                  key={rec.weighment_id}
                  className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-white transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {rec.token_id}
                      </span>
                      <strong className="text-xs text-stone-900">{rec.farmer_name}</strong>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-800">
                      ₹{rec.net_payable_inr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-600 flex items-center justify-between">
                    <span>
                      {rec.crop_type} • {rec.net_weight_kg} kg ({(rec.net_weight_kg / 100).toFixed(1)} Qtl)
                    </span>
                    <span className="text-stone-400">Moisture: {rec.moisture_pct}%</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[11px]">
                    <span className="text-stone-500 font-mono text-[10px] truncate max-w-[150px]">
                      {rec.receipt_number}
                    </span>
                    <button
                      onClick={() => setActiveReceipt(rec)}
                      className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-[10px] flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      View Slip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* OFFICIAL GOVERNMENT PROCUREMENT SLIP MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-300 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            {/* Modal Actions */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Voucher Generated & Stored in Registry
              </span>
              <button
                onClick={() => setActiveReceipt(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Voucher Content (Official Govt Template) */}
            <div id="mandi-weighment-voucher" className="p-5 border-2 border-stone-800 rounded-xl bg-white space-y-4 font-serif">
              {/* Header */}
              <div className="text-center border-b-2 border-stone-800 pb-3">
                <p className="text-[11px] uppercase tracking-widest font-sans font-bold text-stone-600">
                  Government of Maharashtra • Department of Agriculture & APMC
                </p>
                <h3 className="text-base font-extrabold tracking-tight text-stone-950 font-sans">
                  OFFICIAL MANDI PROCUREMENT & WEIGHMENT SLIP
                </h3>
                <p className="text-[11px] font-sans text-stone-500">
                  Pune District APMC Yard, Swargate Link Road • License No: MAH-PUN-0911
                </p>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <div>
                  <span className="text-stone-500 block">Voucher No:</span>
                  <strong className="font-mono text-stone-900">{activeReceipt.receipt_number}</strong>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 block">Date & Time:</span>
                  <strong className="font-mono text-stone-900">
                    {new Date(activeReceipt.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                </div>

                <div>
                  <span className="text-stone-500 block">Farmer Name & ID:</span>
                  <strong className="text-stone-950">{activeReceipt.farmer_name}</strong>
                  <p className="text-[10px] font-mono text-stone-600">{activeReceipt.farmer_id}</p>
                </div>

                <div className="text-right">
                  <span className="text-stone-500 block">Token & Vehicle:</span>
                  <strong className="font-mono text-emerald-800 font-bold">{activeReceipt.token_id}</strong>
                  <p className="text-[10px] font-mono text-stone-600">{activeReceipt.vehicle_number}</p>
                </div>
              </div>

              {/* Weight Breakdown Table */}
              <div className="border border-stone-300 rounded-lg overflow-hidden font-sans text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-300">
                    <tr>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Measurement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    <tr>
                      <td className="p-2 text-stone-600">Gross Loaded Weight</td>
                      <td className="p-2 text-right font-mono font-medium">{activeReceipt.gross_weight_kg} kg</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-stone-600">Tare (Empty Vehicle)</td>
                      <td className="p-2 text-right font-mono font-medium">{activeReceipt.tare_weight_kg} kg</td>
                    </tr>
                    <tr className="bg-stone-50 font-bold">
                      <td className="p-2 text-stone-900">Net Grain Weight (Quintals)</td>
                      <td className="p-2 text-right font-mono text-emerald-900">
                        {activeReceipt.net_weight_kg} kg ({(activeReceipt.net_weight_kg / 100).toFixed(2)} Qtl)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-stone-600">Moisture Content</td>
                      <td className="p-2 text-right font-mono">{activeReceipt.moisture_pct}% ({activeReceipt.quality_grade})</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-stone-600">Official MSP Rate</td>
                      <td className="p-2 text-right font-mono">₹{activeReceipt.msp_rate_per_quintal} / Qtl</td>
                    </tr>
                    {activeReceipt.quality_deduction_inr > 0 && (
                      <tr className="text-amber-900">
                        <td className="p-2">Moisture Excess Deduction</td>
                        <td className="p-2 text-right font-mono">- ₹{activeReceipt.quality_deduction_inr}</td>
                      </tr>
                    )}
                    <tr className="bg-emerald-50 text-emerald-950 font-extrabold text-sm border-t-2 border-emerald-300">
                      <td className="p-2.5">Total Payable (DBT)</td>
                      <td className="p-2.5 text-right font-mono">
                        ₹{activeReceipt.net_payable_inr.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Barcode representation */}
              <div className="flex flex-col items-center justify-center pt-2 font-mono">
                <div className="flex items-center gap-1 tracking-widest text-xs text-stone-800">
                  ||||| | |||| || |||||| | ||||| ||||||| | |||||
                </div>
                <span className="text-[10px] text-stone-400 mt-0.5">{activeReceipt.receipt_number}</span>
              </div>

              {/* Officer Stamp & Signatures */}
              <div className="flex items-end justify-between pt-3 border-t border-dashed border-stone-400 text-xs font-sans text-stone-600">
                <div>
                  <p className="text-[10px] text-stone-400">Payment Routing:</p>
                  <strong className="text-emerald-800 text-[11px]">DBT to A/c ending in •••• {activeReceipt.bank_account_last4 || '8841'}</strong>
                </div>
                <div className="text-right">
                  <div className="w-24 h-6 border-b border-stone-700 mx-auto" />
                  <span className="text-[10px] block mt-1 font-bold">{activeReceipt.officer_name}</span>
                  <span className="text-[9px] text-stone-400">Procurement Inspector (APMC)</span>
                </div>
              </div>
            </div>

            {/* Print & Close Controls */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-100 font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Official Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
