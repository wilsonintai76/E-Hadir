import React, { useState } from 'react';
import { CheckCheck, X, Copy, Check, Download, ShieldCheck, MapPin, Clock, User, QrCode } from 'lucide-react';
import { CourseSession, StudentProfile } from '../types/attendance';

interface CheckInModalProps {
  course: CourseSession | null;
  student: StudentProfile;
  onClose: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  course,
  student,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!course) return null;

  const token = course.token || 'PKS-JKM-VERIFIED';

  const handleCopy = () => {
    navigator.clipboard?.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-0">
        {/* Top header badge */}
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 p-4 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2 text-emerald-400 shadow-inner">
            <CheckCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-rose-300 font-bold uppercase">
            Sistem Kehadiran Digital Rasmi
          </span>
          <h2 className="text-base font-bold text-white mt-0.5">
            Slip Pengesahan Kehadiran
          </h2>
          <p className="text-[11px] text-white/70">
            Jabatan Kejuruteraan Mekanikal · PKS
          </p>
        </div>

        {/* Slip Body Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Status Kehadiran Sah</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-200/80 dark:bg-emerald-900 px-2 py-0.5 rounded text-emerald-900 dark:text-emerald-200">
              {course.checkInMethod === 'biometric'
                ? 'Biometrik Sah (Anti-Proxy)'
                : course.checkInMethod === 'qr_code'
                ? 'Imbasan QR'
                : course.checkInMethod === 'passcode'
                ? 'Kod Pas Pensyarah'
                : 'Geofens Sah'}
            </span>
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex justify-between items-start pb-2 border-b border-slate-200 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400">Kursus:</span>
              <div className="text-right">
                <p className="font-extrabold text-slate-900 dark:text-white font-mono">{course.code}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{course.name}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400">Nama Pelajar:</span>
              <span className="font-bold text-slate-900 dark:text-white text-right">{student.name}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400">No. Pendaftaran:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{student.id} ({student.classGroup})</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400">Masa Disahkan:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {course.checkInTime || 'Tepat Pada Waktu'}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400">Lokasi / Bengkel:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 text-right truncate max-w-[190px]">
                {course.venue}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Pensyarah:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 text-right truncate max-w-[190px]">
                {course.lecturer}
              </span>
            </div>
          </div>

          {/* Cryptographic Token Bar */}
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] text-rose-800 dark:text-rose-300 font-semibold uppercase">Token Pengesahan Digital</p>
              <p className="font-mono font-bold text-xs sm:text-sm text-rose-950 dark:text-rose-100 tracking-wider">
                {token}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900 transition active:scale-95 flex items-center gap-1 text-[11px] font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Disalin' : 'Salin'}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Bukti</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <span>Selesai</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
