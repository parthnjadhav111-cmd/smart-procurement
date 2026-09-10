import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle, ShieldCheck, ArrowRight, Sprout } from 'lucide-react';
import { CropType, HarvestStatus, ProcurementCenter, Language } from '../types';
import { translations } from '../translations/translations';

interface CropRegistrationModalProps {
  onClose: () => void;
  onSaveAndContinue: (cropData: {
    crop_type: CropType;
    quantity: number;
    unit: 'kg' | 'Quintal' | 'Tons';
    harvest_status: HarvestStatus;
    preferred_center_id: string;
  }) => void;
  centers: ProcurementCenter[];
  lang: Language;
  defaultCenterId?: string;
}

export const CropRegistrationModal: React.FC<CropRegistrationModalProps> = ({
  onClose,
  onSaveAndContinue,
  centers,
  lang,
  defaultCenterId,
}) => {
  const t = translations[lang];

  const [cropType, setCropType] = useState<CropType>('Paddy');
  const [quantity, setQuantity] = useState<number>(800);
  const [unit, setUnit] = useState<'kg' | 'Quintal' | 'Tons'>('kg');
  const [harvestStatus, setHarvestStatus] = useState<HarvestStatus>('Ready for Procurement');
  const [preferredCenterId, setPreferredCenterId] = useState<string>(defaultCenterId || centers[0]?.center_id || 'PC-101');

  const cropOptions: CropType[] = ['Paddy', 'Wheat', 'Soyabean', 'Cotton', 'Maize', 'Gram (Chana)'];
  const harvestOptions: HarvestStatus[] = [
    'Ready for Procurement',
    'Harvested & Stored',
    'Harvesting in Progress',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAndContinue({
      crop_type: cropType,
      quantity,
      unit,
      harvest_status: harvestStatus,
      preferred_center_id: preferredCenterId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="crop-registration-modal"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center font-bold text-xl">
              🌾
            </div>
            <div>
              <h2 className="text-lg font-black">{t.register_crop}</h2>
              <p className="text-xs text-emerald-200">
                Government MSP Grain Registration (Section 6)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-700/50 hover:bg-emerald-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Crop Type */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {t.crop_type} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cropOptions.map((crop) => (
                <button
                  type="button"
                  key={crop}
                  onClick={() => setCropType(crop)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-bold text-left transition-all ${
                    cropType === crop
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-stone-200 bg-stone-50/60 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  🌾 {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t.estimated_quantity} *
              </label>
              <input
                type="number"
                min="10"
                max="50000"
                step="10"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Quantity Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden text-sm"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="Quintal">Quintals (100 kg)</option>
                <option value="Tons">Metric Tons</option>
              </select>
            </div>
          </div>

          {/* Harvest Status */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {t.harvest_status} *
            </label>
            <div className="space-y-1.5">
              {harvestOptions.map((status) => (
                <label
                  key={status}
                  className={`flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                    harvestStatus === status
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="harvestStatus"
                      checked={harvestStatus === status}
                      onChange={() => setHarvestStatus(status)}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="text-xs">{status}</span>
                  </div>
                  {harvestStatus === status && (
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Procurement Center */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Preferred Procurement Center *
            </label>
            <select
              value={preferredCenterId}
              onChange={(e) => setPreferredCenterId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-semibold text-stone-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden text-xs sm:text-sm"
            >
              {centers.map((c) => (
                <option key={c.center_id} value={c.center_id}>
                  {c.center_id} — {c.name} ({c.district})
                </option>
              ))}
            </select>
          </div>

          {/* Info Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              Registering this crop will generate a unique Crop ID (e.g. <strong>CR-2026-1027</strong>) for seamless procurement counter verification.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              id="continue-to-schedule-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black flex items-center gap-1.5 shadow-md"
            >
              <span>CONTINUE TO SCHEDULE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
