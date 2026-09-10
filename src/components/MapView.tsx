import React, { useEffect, useRef } from 'react';
import { ProcurementCenter, Language } from '../types';
import { translations } from '../translations/translations';
import { MapPin, Navigation, Building2, Phone } from 'lucide-react';
import L from 'leaflet';

interface MapViewProps {
  centers: ProcurementCenter[];
  farmerLocation: { latitude: number; longitude: number };
  onSelectCenter: (center: ProcurementCenter) => void;
  lang: Language;
}

export const MapView: React.FC<MapViewProps> = ({
  centers,
  farmerLocation,
  onSelectCenter,
  lang,
}) => {
  const t = translations[lang];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix default marker icon issues in Leaflet with bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(
        [farmerLocation.latitude, farmerLocation.longitude],
        11
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Custom Icon for Farmer Location
    const farmerIcon = L.divIcon({
      className: 'custom-farmer-pin',
      html: `
        <div style="background-color: #047857; color: white; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px;">
          👨🌾
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    // Add Farmer Marker
    const farmerMarker = L.marker([farmerLocation.latitude, farmerLocation.longitude], {
      icon: farmerIcon,
    }).addTo(map);

    farmerMarker.bindPopup(`
      <div style="font-family: inherit; padding: 4px;">
        <strong style="color: #047857; font-size: 14px;">📍 Your Farm Location</strong>
        <p style="margin: 4px 0 0; font-size: 12px; color: #44403c;">GPS: ${farmerLocation.latitude.toFixed(4)}, ${farmerLocation.longitude.toFixed(4)}</p>
      </div>
    `);

    // Radius circle around farmer
    L.circle([farmerLocation.latitude, farmerLocation.longitude], {
      color: '#047857',
      fillColor: '#10b981',
      fillOpacity: 0.1,
      radius: 15000, // 15 km
    }).addTo(map);

    // Custom Icon for Centers
    const centerIcon = L.divIcon({
      className: 'custom-center-pin',
      html: `
        <div style="background-color: #b45309; color: white; width: 34px; height: 34px; border-radius: 10px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">
          🏢
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    // Add Center Markers
    centers.forEach((center) => {
      const marker = L.marker([center.latitude, center.longitude], {
        icon: centerIcon,
      }).addTo(map);

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${farmerLocation.latitude},${farmerLocation.longitude}&destination=${center.latitude},${center.longitude}`;

      marker.bindPopup(`
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px;">${center.center_id}</span>
            <span style="font-size: 11px; font-weight: bold; color: #047857;">${center.status}</span>
          </div>
          <strong style="display: block; font-size: 13px; color: #1c1917; margin-bottom: 2px;">${center.name}</strong>
          <p style="font-size: 11px; color: #57534e; margin: 0 0 6px;">${center.address}</p>
          <div style="font-size: 11px; margin-bottom: 8px; color: #047857; font-weight: bold;">
            📍 ${center.distance_km || 8.4} km away • ${center.available_slots} slots available
          </div>
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #047857; color: white; text-decoration: none; padding: 6px 10px; border-radius: 8px; font-size: 11px; font-weight: bold;">
            Get Directions ↗
          </a>
        </div>
      `);
    });

    // Adjust bounds if multiple centers
    if (centers.length > 0) {
      const bounds = L.latLngBounds([
        [farmerLocation.latitude, farmerLocation.longitude],
        ...centers.map((c) => [c.latitude, c.longitude] as [number, number]),
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [centers, farmerLocation]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [farmerLocation.latitude, farmerLocation.longitude],
        12,
        { animate: true }
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs relative">
      {/* Map Control Bar */}
      <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <span>👨🌾</span>
            <span>Your Farm</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <span>🏢</span>
            <span>Procurement Centers ({centers.length})</span>
          </div>
        </div>
        <button
          onClick={handleRecenter}
          className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg font-bold text-stone-700 hover:bg-stone-100 flex items-center gap-1 shadow-2xs"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
          <span>My Location</span>
        </button>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[460px] z-10"
        style={{ minHeight: '420px' }}
      />
    </div>
  );
};
