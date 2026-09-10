import React, { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  Star,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Navigation,
  CheckCircle2,
  ChevronRight,
  Map as MapIcon,
  ListFilter,
} from 'lucide-react';
import { ProcurementCenter, Language, CropType } from '../types';
import { translations } from '../translations/translations';
import { MapView } from './MapView';

interface CentersViewProps {
  centers: ProcurementCenter[];
  farmerLocation: { latitude: number; longitude: number };
  lang: Language;
  onSelectCenter: (center: ProcurementCenter) => void;
}

export const CentersView: React.FC<CentersViewProps> = ({
  centers,
  farmerLocation,
  lang,
  onSelectCenter,
}) => {
  const t = translations[lang];

  const [selectedDistrict, setSelectedDistrict] = useState<string>('Pune');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [availabilityOnly, setAvailabilityOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'nearest' | 'availability' | 'rating'>('nearest');
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');

  const districts = ['All', 'Pune', 'Nashik', 'Satara', 'Ahmednagar', 'Nagpur'];
  const cropFilters: ('All' | CropType)[] = ['All', 'Paddy', 'Wheat', 'Soyabean', 'Cotton', 'Maize'];

  // Filter and sort logic
  const filteredCenters = useMemo(() => {
    let result = [...centers];

    // District filter (Most important)
    if (selectedDistrict !== 'All') {
      result = result.filter(
        (c) => c.district.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }

    // Crop filter
    if (selectedCrop !== 'All') {
      result = result.filter((c) =>
        c.accepted_crops.includes(selectedCrop as CropType)
      );
    }

    // Availability filter
    if (availabilityOnly) {
      result = result.filter((c) => c.available_slots > 0 && c.status === 'Open');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.center_id.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'nearest') {
        return (a.distance_km || 999) - (b.distance_km || 999);
      }
      if (sortBy === 'availability') {
        return b.available_slots - a.available_slots;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

    return result;
  }, [centers, selectedDistrict, selectedCrop, availabilityOnly, searchQuery, sortBy]);

  return (
    <div className="space-y-4 pb-24 max-w-5xl mx-auto px-3 sm:px-4 pt-4">
      {/* Header & View Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-800" />
            <span>Find Government Procurement Centers</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Locate official APMC & cooperative grain depots by district and book direct slots.
          </p>
        </div>

        {/* View Switch: List vs Map */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'cards'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Card List</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Primary Filter Bar: DISTRICT SELECTOR (Section 4 Mandate) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        {/* District selection row */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.select_district} (Select District)</span>
            </label>
            <span className="text-xs font-semibold text-emerald-800">
              {filteredCenters.length} centers found
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {districts.map((dist) => (
              <button
                key={dist}
                id={`district-btn-${dist.toLowerCase()}`}
                onClick={() => setSelectedDistrict(dist)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDistrict.toLowerCase() === dist.toLowerCase()
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {dist === 'All' ? t.all_districts : dist}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-100">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search center name or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-hidden focus:border-emerald-600 focus:bg-white text-stone-900"
            />
          </div>

          {/* Crop filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 shrink-0">{t.filter_by_crop}:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-semibold focus:outline-hidden focus:border-emerald-600"
            >
              {cropFilters.map((crop) => (
                <option key={crop} value={crop}>
                  {crop === 'All' ? t.all_crops : crop}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 shrink-0">{t.sort_by}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs py-2 px-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-semibold focus:outline-hidden focus:border-emerald-600"
            >
              <option value="nearest">{t.nearest}</option>
              <option value="availability">{t.highest_availability}</option>
              <option value="rating">{t.highest_rating}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content: Map View OR Cards View */}
      {viewMode === 'map' ? (
        <MapView
          centers={filteredCenters}
          farmerLocation={farmerLocation}
          onSelectCenter={onSelectCenter}
          lang={lang}
        />
      ) : (
        <div className="space-y-3">
          {filteredCenters.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 space-y-2">
              <Building2 className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">No centers found matching filters</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try selecting "All Districts" or clearing your crop filter.
              </p>
              <button
                onClick={() => {
                  setSelectedDistrict('All');
                  setSelectedCrop('All');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCenters.map((center) => {
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${farmerLocation.latitude},${farmerLocation.longitude}&destination=${center.latitude},${center.longitude}`;

                return (
                  <div
                    key={center.center_id}
                    id={`center-card-${center.center_id.toLowerCase()}`}
                    className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top status line */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            CENTER {center.center_id}
                          </span>
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                            {center.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{center.rating}</span>
                        </div>
                      </div>

                      {/* Center Name & Distance */}
                      <div className="mb-2">
                        <h3 className="text-base font-extrabold text-stone-900 leading-snug">
                          {center.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-1">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            📍 {center.distance_km || 8.4} km {t.distance_away}
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="text-stone-500 truncate">{center.district}</span>
                        </div>
                      </div>

                      {/* Full Address */}
                      <p className="text-xs text-stone-500 line-clamp-2 mb-3 bg-stone-50/80 p-2 rounded-xl border border-stone-100">
                        <MapPin className="w-3 h-3 text-stone-400 inline mr-1" />
                        {center.address}
                      </p>

                      {/* Center Stats Grid (Section 4 Example) */}
                      <div className="grid grid-cols-3 gap-2 py-2 bg-stone-50 rounded-xl p-2 text-center text-xs mb-3 border border-stone-100">
                        <div className="border-r border-stone-200 pr-1">
                          <span className="block text-stone-500 text-[10px]">Available Slots</span>
                          <strong className="text-amber-800 font-extrabold text-sm">
                            {center.available_slots}
                          </strong>
                        </div>
                        <div className="border-r border-stone-200 pr-1">
                          <span className="block text-stone-500 text-[10px]">Current Queue</span>
                          <strong className="text-stone-900 font-extrabold text-sm">
                            {center.current_queue} Farmers
                          </strong>
                        </div>
                        <div>
                          <span className="block text-stone-500 text-[10px]">Daily Capacity</span>
                          <strong className="text-stone-700 font-extrabold text-sm">
                            {center.capacity}
                          </strong>
                        </div>
                      </div>

                      {/* Accepted Crops & Operating Hours */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-stone-400 font-medium">Accepted:</span>
                          {center.accepted_crops.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-md text-[11px] font-semibold"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>Hours: {center.operating_hours}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectCenter(center)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <span>{t.view_details.toUpperCase()}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>{t.get_directions}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
