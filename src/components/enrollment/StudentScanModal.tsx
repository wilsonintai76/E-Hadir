import React, { useState } from 'react';
import { X, Camera, QrCode, ShieldCheck, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import { CourseSession } from '../../types/attendance';

interface StudentScanModalProps {
  courses: CourseSession[];
  enrolledCourseIds: string[];
  userDistance: number;
  geofenceRadius: number;
  onEnroll: (course: CourseSession) => void;
  onClose: () => void;
}

export const StudentScanModal: React.FC<StudentScanModalProps> = ({
  courses,
  enrolledCourseIds,
  userDistance,
  geofenceRadius,
  onEnroll,
  onClose,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Available courses not yet enrolled by student
  const availableCourses = courses.filter((c) => !enrolledCourseIds.includes(c.id));
  const sampleCandidate = availableCourses[0] || courses[1] || courses[0];

  const handleSimulateScan = (targetCourse: CourseSession) => {
    setIsScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsScanning(false);
      onEnroll(targetCourse);
    }, 1000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const code = manualCode.trim().toUpperCase();
    if (!code) {
      setErrorMsg('Sila masukkan kod pendaftaran 6-aksara kursus.');
      return;
    }

    const matched = courses.find(
      (c) =>
        (c.enrollmentCode && c.enrollmentCode.toUpperCase() === code) ||
        c.code.toUpperCase() === code
    );

    if (!matched) {
      setErrorMsg(`Kod tidak sah. Petunjuk kod contoh: ${sampleCandidate?.enrollmentCode || 'JKM-3010'}`);
      return;
    }

    onEnroll(matched);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Daftar Kursus Baharu (Sesi 1)
              </h3>
              <p className="text-[11px] text-slate-500">
                Pendaftaran Hari Pertama Melalui Kod QR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder Simulation */}
        <div className="relative w-full h-48 bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-800 text-white">
          <div className="absolute inset-4 border-2 border-rose-500/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <span className="w-4 h-4 border-t-2 border-l-2 border-rose-400" />
              <span className="w-4 h-4 border-t-2 border-r-2 border-rose-400" />
            </div>
            {/* Animated Laser scan line */}
            <div
              className={`w-full h-0.5 bg-rose-500 shadow-md shadow-rose-500/70 ${
                isScanning ? 'animate-bounce' : 'animate-pulse'
              }`}
            />
            <div className="flex justify-between">
              <span className="w-4 h-4 border-b-2 border-l-2 border-rose-400" />
              <span className="w-4 h-4 border-b-2 border-r-2 border-rose-400" />
            </div>
          </div>

          <Camera className="w-7 h-7 text-slate-400 mb-1" />
          <p className="text-xs font-bold text-slate-200">
            {isScanning ? 'Mengesahkan Pendaftaran...' : 'Halakan Kamera ke Kod QR Pensyarah'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Geofens Bengkel PKS Aktif ({geofenceRadius}m)
          </p>

          {/* Quick 1-Tap Simulation Button */}
          {sampleCandidate && (
            <button
              onClick={() => handleSimulateScan(sampleCandidate)}
              disabled={isScanning}
              className="absolute bottom-2.5 px-3 py-1.5 rounded-xl bg-rose-700/90 hover:bg-rose-600 text-white text-[11px] font-bold shadow active:scale-95 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulasi Imbas ({sampleCandidate.code} - {sampleCandidate.section})</span>
            </button>
          )}
        </div>

        {/* Manual Code Form */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="block font-bold text-xs text-slate-700 dark:text-slate-300">
            Atau Masukkan Kod Akses 6-Aksara
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder={sampleCandidate?.enrollmentCode || 'JKM-3010'}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1 active:scale-95 transition"
            >
              <span>Daftar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>

        {/* Geofence Notice */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Perlindungan Integriti SPMP:</strong> Pelajar mesti berada di dalam zon bengkel ({userDistance}m / had {geofenceRadius}m) semasa pendaftaran bagi mengesahkan kehadiran fizikal.
          </span>
        </div>
      </div>
    </div>
  );
};
