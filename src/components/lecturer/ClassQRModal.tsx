import React, { useState } from 'react';
import { X, Copy, Check, QrCode, ShieldCheck, MapPin, Users } from 'lucide-react';
import { CourseSession } from '../../types/attendance';

interface ClassQRModalProps {
  course: CourseSession | null;
  onClose: () => void;
}

export const ClassQRModal: React.FC<ClassQRModalProps> = ({ course, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!course) return null;

  const joinCode = course.enrollmentCode || 'JKM-3009';

  const handleCopy = () => {
    navigator.clipboard?.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 text-left">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Pendaftaran Sesi 1 & Hari Pertama
            </span>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {course.code} · {course.section}
            </h3>
            <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
              {course.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-Tech Realistic SVG QR Code Display */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-inner inline-block mx-auto">
          <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Corner Finders */}
            <rect x="5" y="5" width="26" height="26" rx="4" fill="#0F172A" />
            <rect x="9" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
            <rect x="13" y="13" width="10" height="10" rx="1" fill="#4338CA" />

            <rect x="69" y="5" width="26" height="26" rx="4" fill="#0F172A" />
            <rect x="73" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
            <rect x="77" y="13" width="10" height="10" rx="1" fill="#4338CA" />

            <rect x="5" y="69" width="26" height="26" rx="4" fill="#0F172A" />
            <rect x="9" y="73" width="18" height="18" rx="2" fill="#FFFFFF" />
            <rect x="13" y="77" width="10" height="10" rx="1" fill="#4338CA" />

            {/* Pattern Dots */}
            <rect x="36" y="8" width="6" height="6" rx="1" fill="#0F172A" />
            <rect x="46" y="8" width="6" height="6" rx="1" fill="#0F172A" />
            <rect x="56" y="8" width="6" height="6" rx="1" fill="#0F172A" />
            <rect x="36" y="18" width="6" height="6" rx="1" fill="#4338CA" />
            <rect x="46" y="24" width="6" height="6" rx="1" fill="#0F172A" />
            <rect x="56" y="18" width="6" height="6" rx="1" fill="#0F172A" />

            <rect x="8" y="36" width="6" height="6" rx="1" fill="#0F172A" />
            <rect x="18" y="44" width="6" height="6" rx="1" fill="#4338CA" />
            <rect x="26" y="36" width="6" height="6" rx="1" fill="#0F172A" />

            {/* Center JKM Badge */}
            <rect x="36" y="36" width="28" height="28" rx="6" fill="#4338CA" />
            <path d="M44 48L49 53L56 43" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

            <rect x="69" y="36" width="6" height="6" rx="1" fill="#0F172A" />
            <rect x="79" y="44" width="6" height="6" rx="1" fill="#0F172A" />
            <rect x="89" y="36" width="6" height="6" rx="1" fill="#4338CA" />
            <rect x="69" y="52" width="6" height="6" rx="1" fill="#0F172A" />

            <rect x="36" y="69" width="6" height="6" rx="1" fill="#0F172A" />
            <rect x="46" y="77" width="6" height="6" rx="1" fill="#0F172A" />
            <rect x="56" y="69" width="6" height="6" rx="1" fill="#0F172A" />
            <rect x="69" y="69" width="6" height="6" rx="1" fill="#4338CA" />
            <rect x="79" y="77" width="6" height="6" rx="1" fill="#0F172A" />
          </svg>
          <p className="text-[10px] text-slate-500 font-mono mt-1 font-semibold">
            KOD PENDAFTARAN KELAS JKM
          </p>
        </div>

        {/* Join Code Box */}
        <div className="bg-indigo-50 dark:bg-indigo-950/60 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-1">
          <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold uppercase">
            Kod Akses Pendaftaran Pelajar
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-2xl font-black tracking-widest text-indigo-900 dark:text-indigo-200">
              {joinCode}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm active:scale-95 transition"
              title="Salin Kod"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            {course.contactHoursPerWeek} Jam/Minggu · {course.totalSemesterWeeks || 14} Minggu Kuliah ({course.contactHoursPerWeek * (course.totalSemesterWeeks || 14)} Jam Total)
          </p>
        </div>

        {/* Geofence Rule Notice */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>{course.venue}</span>
          </span>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
            Radius: {course.coords.radius || 150}m
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs active:scale-95 transition"
        >
          Tutup Paparan Kod
        </button>
      </div>
    </div>
  );
};
