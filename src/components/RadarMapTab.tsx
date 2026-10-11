import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Crosshair, MapPin, Navigation, Radio, ShieldCheck, AlertCircle } from 'lucide-react';
import { PKS_JKM_COORDS, formatDistance } from '../utils/geo';
import { PRESET_LOCATIONS } from '../data/mockData';

interface RadarMapTabProps {
  userLat: number;
  userLng: number;
  isInRange: boolean;
  distance: number;
  gpsMode: 'live' | 'simulation';
  currentPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onRecalibrateGps: () => void;
}

export const RadarMapTab: React.FC<RadarMapTabProps> = ({
  userLat,
  userLng,
  isInRange,
  distance,
  gpsMode,
  currentPresetId,
  onSelectPreset,
  onRecalibrateGps,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map instance
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([PKS_JKM_COORDS.lat, PKS_JKM_COORDS.lng], 17);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Geofence circle boundary (150m)
      const circle = L.circle([PKS_JKM_COORDS.lat, PKS_JKM_COORDS.lng], {
        color: '#be123c',
        fillColor: '#f43f5e',
        fillOpacity: 0.16,
        radius: PKS_JKM_COORDS.radius,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);
      circle.bindPopup(`<b>${PKS_JKM_COORDS.name}</b><br>Zon Geofens Kehadiran (150m)`);
      geofenceCircleRef.current = circle;

      // Landmark pins
      const workshopIcon = L.divIcon({
        className: 'custom-pin-workshop',
        html: `
          <div class="px-2 py-1 bg-rose-900 text-white rounded-lg text-[10px] font-bold shadow-md border border-rose-700 flex items-center gap-1">
            <span>⚙️ Bengkel JKM</span>
          </div>
        `,
        iconSize: [110, 26],
        iconAnchor: [55, 13],
      });
      L.marker([PKS_JKM_COORDS.lat, PKS_JKM_COORDS.lng], { icon: workshopIcon }).addTo(map);

      const dkuIcon = L.divIcon({
        className: 'custom-pin-dku',
        html: `
          <div class="px-2 py-1 bg-slate-800 text-white rounded-lg text-[10px] font-medium shadow border border-slate-700">
            <span>🏛️ DKU PKS</span>
          </div>
        `,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });
      L.marker([1.63180, 110.23250], { icon: dkuIcon }).addTo(map);

      // Student Location Pin
      const studentPin = L.divIcon({
        className: 'custom-pin-student',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-extrabold z-10">
              MF
            </div>
            <div class="absolute w-12 h-12 rounded-full bg-blue-500/40 animate-ping"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([userLat, userLng], { icon: studentPin }).addTo(map);
      marker.bindPopup(`<b>Muhammad Farhan</b><br>05DKM23F1012<br>Jarak: ${distance}m`);
      userMarkerRef.current = marker;

      mapInstanceRef.current = map;
    } else {
      // Update existing marker position
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLat, userLng]);
        userMarkerRef.current.setPopupContent(`<b>Muhammad Farhan</b><br>05DKM23F1012<br>Jarak: ${distance}m`);
      }
    }

    // Auto fit bounds to show both user and workshop
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds([
        [PKS_JKM_COORDS.lat, PKS_JKM_COORDS.lng],
        [userLat, userLng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
      mapInstanceRef.current.invalidateSize();
    }
  }, [userLat, userLng, distance]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLat, userLng], 18, { animate: true });
    }
  };

  return (
    <div className="space-y-4">
      {/* Simulation Preset Quick Switcher */}
      <div className="bg-white dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Radio className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Pilihan Lokasi Ujian (Simulasi Kampus)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {gpsMode === 'live' ? 'GPS Peranti Aktif' : 'Mod Simulasi'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(PRESET_LOCATIONS).map((loc) => {
            const isSelected = gpsMode === 'simulation' && currentPresetId === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => onSelectPreset(loc.id)}
                className={`text-left p-2.5 rounded-xl border text-xs transition active:scale-[0.98] ${
                  isSelected
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold truncate">{loc.label}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      loc.isWithinGeofence
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {loc.isWithinGeofence ? 'SAH' : 'LUAR'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {loc.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-0">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Radar Geofens PKS Matang (KM22)
            </h3>
            <p className="text-[11px] text-slate-500">
              Bulatan putus-putus merah menandakan jejari 150m Bengkel JKM
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRecenter}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 transition"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Lokasi Saya</span>
            </button>
          </div>
        </div>

        {/* Leaflet Render Canvas */}
        <div ref={mapContainerRef} className="w-full h-80 sm:h-96 bg-slate-100 dark:bg-slate-900 z-10" />

        {/* Footer Coordinate strip */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <span>Lat: {userLat.toFixed(5)}</span>
            <span>Lng: {userLng.toFixed(5)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Jarak ke Bengkel:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                isInRange
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
              }`}
            >
              {formatDistance(distance)} (Had: 150m)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
