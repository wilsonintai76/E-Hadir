import React from 'react';
import { MapPin, AlertTriangle, CheckCircle2, Navigation2, Radio } from 'lucide-react';
import { PRESET_LOCATIONS } from '../data/mockData';
import { CourseSession, UserRole } from '../types/attendance';

interface GeofenceBannerProps {
  role: UserRole;
  activeCourse?: CourseSession;
  isInRange: boolean;
  distance: number;
  radius: number;
  gpsMode: 'live' | 'simulation';
  currentPresetId: string;
  onSelectPreset: (presetId: string) => void;
  accuracy: number;
}

export const GeofenceBanner: React.FC<GeofenceBannerProps> = ({
  role,
  activeCourse,
  isInRange,
  distance,
  radius,
  gpsMode,
  currentPresetId,
  onSelectPreset,
  accuracy,
}) => {
  if (role === 'lecturer' && activeCourse) {
    const presentPct = Math.round(
      (activeCourse.presentCount / Math.max(1, activeCourse.totalStudents)) * 100
    );

    return (
      <div className="space-y-2">
        <div className="rounded-2xl p-4 border transition-all bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border-indigo-700/60 text-white shadow-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
                Sesi Kehadiran Aktif: {activeCourse.code} ({activeCourse.section})
              </span>
            </div>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Radius: {radius}m
            </span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-indigo-800/60 text-xs">
            <span className="text-indigo-200 truncate font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{activeCourse.venue}</span>
            </span>
            <span className="text-emerald-400 font-mono font-bold shrink-0 ml-2">
              {activeCourse.presentCount}/{activeCourse.totalStudents} Hadir ({presentPct}%)
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Geofence Status Strip */}
      <div
        className={`rounded-2xl p-3.5 border transition-all ${
          isInRange
            ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 shadow-sm'
            : 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg ${
                isInRange
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
              }`}
            >
              {isInRange ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isInRange ? 'Dalam Geofens Bengkel JKM' : 'Di Luar Geofens Hadir'}
                </span>
                <span className="text-[10px] opacity-75 font-mono">
                  (±{accuracy}m)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                {isInRange
                  ? 'Lokasi peranti disahkan sah. Anda layak membuat pengesahan kehadiran.'
                  : 'Sila masuk ke dalam lingkungan Bengkel Mekanikal PKS untuk daftar kehadiran.'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                isInRange
                  ? 'bg-emerald-100 dark:bg-emerald-900/90 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-100 dark:bg-rose-900/90 text-rose-800 dark:text-rose-200'
              }`}
            >
              {distance}m / {radius}m
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Quick Toggles */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 px-1 font-semibold text-[10px] shrink-0">
          <Navigation2 className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          <span>Uji Lokasi:</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {Object.values(PRESET_LOCATIONS).map((loc) => {
            const isSelected = gpsMode === 'simulation' && currentPresetId === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => onSelectPreset(loc.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition active:scale-95 whitespace-nowrap ${
                  isSelected
                    ? 'bg-rose-700 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {loc.label.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
