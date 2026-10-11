import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Compass, Crosshair, ShieldCheck, CheckCircle2, Sliders, AlertTriangle } from 'lucide-react';
import { PKS_JKM_COORDS } from '../../utils/geo';

interface LecturerGeocontrolTabProps {
  radius: number;
  onUpdateRadius: (newRadius: number) => void;
  allowGracePeriod: boolean;
  onToggleGracePeriod: () => void;
}

export const LecturerGeocontrolTab: React.FC<LecturerGeocontrolTabProps> = ({
  radius,
  onUpdateRadius,
  allowGracePeriod,
  onToggleGracePeriod,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([PKS_JKM_COORDS.lat, PKS_JKM_COORDS.lng], 17);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Workshop Geofence Circle
      const circle = L.circle([PKS_JKM_COORDS.lat, PKS_JKM_COORDS.lng], {
        color: '#4f46e5',
        fillColor: '#6366f1',
        fillOpacity: 0.22,
        radius: radius,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);
      circleRef.current = circle;

      // Workshop Pin
      const workshopIcon = L.divIcon({
        className: 'custom-pin-workshop',
        html: `
          <div class="px-2.5 py-1 bg-indigo-900 text-white rounded-xl text-[10px] font-bold shadow-lg border border-indigo-700 flex items-center gap-1.5 whitespace-nowrap">
            <span>⚙️ Bengkel JKM (Pusat Zon)</span>
          </div>
        `,
        iconSize: [160, 26],
        iconAnchor: [80, 13],
      });
      L.marker([PKS_JKM_COORDS.lat, PKS_JKM_COORDS.lng], { icon: workshopIcon }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.invalidateSize();
      if (circleRef.current) {
        circleRef.current.setRadius(radius);
      }
    }
  }, [radius]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([PKS_JKM_COORDS.lat, PKS_JKM_COORDS.lng], 17, { animate: true });
    }
  };

  return (
    <div className="space-y-4">
      {/* Geofence Calibration Card */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Kawalan Perimeter Geofens Langsung
              </h3>
              <p className="text-[11px] text-slate-500">
                Pusat: Kompleks Bengkel Mekanikal PKS (KM22 Jalan Matang)
              </p>
            </div>
          </div>

          <span className="text-sm font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-900">
            {radius} meter
          </span>
        </div>

        {/* Dynamic Slider */}
        <div className="space-y-2 pt-1">
          <input
            type="range"
            min={50}
            max={350}
            step={25}
            value={radius}
            onChange={(e) => onUpdateRadius(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { r: 50, label: '50m (Ketat Mesin)', desc: 'Stesen Pemesinan' },
              { r: 150, label: '150m (Standard)', desc: 'Kompleks Bengkel' },
              { r: 300, label: '300m (Luas)', desc: 'Seluruh Blok JKM' },
            ].map((preset) => (
              <button
                key={preset.r}
                onClick={() => onUpdateRadius(preset.r)}
                className={`p-2 rounded-xl border text-center transition active:scale-95 ${
                  radius === preset.r
                    ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-400 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200 ring-1 ring-indigo-500'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <p className="font-bold text-[11px] leading-tight">{preset.label}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{preset.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Grace Period Switch */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Kebenaran Masa Tangguh (Grace Period 10 minit)
            </p>
            <p className="text-[11px] text-slate-500">
              Pelajar yang tiba dalam 10 minit pertama tidak ditandai sebagai hadir lewat.
            </p>
          </div>
          <button
            onClick={onToggleGracePeriod}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              allowGracePeriod ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                allowGracePeriod ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Leaflet Radar Map View */}
      <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Peta Radar Geofens JKM (KM22)
            </h4>
            <p className="text-[11px] text-slate-500">
              Bulatan biru memaparkan had sempadan semasa ({radius} meter)
            </p>
          </div>

          <button
            onClick={handleRecenter}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 transition"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Pusatkan Bengkel</span>
          </button>
        </div>

        <div ref={mapContainerRef} className="w-full h-80 sm:h-96 bg-slate-100 dark:bg-slate-900 z-10" />

        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300">
          <span>Pusat: Lat 1.63085, Lng 110.23321</span>
          <span className="font-bold text-indigo-700 dark:text-indigo-400">
            Perimeter: {radius}m
          </span>
        </div>
      </div>
    </div>
  );
};
