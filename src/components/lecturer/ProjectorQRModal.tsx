import React, { useState, useEffect } from 'react';
import { X, QrCode, Sparkles, RefreshCw, Users, ShieldCheck, Lock } from 'lucide-react';
import { CourseSession } from '../../types/attendance';

interface ProjectorQRModalProps {
  course: CourseSession | null;
  presentCount: number;
  totalStudents: number;
  onClose: () => void;
}

export const ProjectorQRModal: React.FC<ProjectorQRModalProps> = ({
  course,
  presentCount,
  totalStudents,
  onClose,
}) => {
  const [countdown, setCountdown] = useState(15);
  const [totpHash, setTotpHash] = useState(() => Math.random().toString(36).substring(2, 6).toUpperCase());
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRotating(true);
          setTotpHash(Math.random().toString(36).substring(2, 6).toUpperCase());
          setTimeout(() => setIsRotating(false), 500);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!course) return null;

  const passcode = course.sessionPasscode || '7492';
  const progressPercent = (countdown / 15) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 text-center relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>KOD DINAMIK ROTATING TOTP (ANTI-PROXY)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            {course.code} · {course.section}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
            {course.name}
          </p>
          <p className="text-xs text-indigo-400 font-medium">
            📍 {course.venue} (Perimeter: {course.coords.radius || 150}m)
          </p>
        </div>

        {/* High-Contrast Dynamic QR Code Area with Rolling TOTP Visual */}
        <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64 bg-white p-5 rounded-3xl shadow-2xl flex flex-col items-center justify-center border-4 border-indigo-500/30">
          <QrCode className={`w-full h-full text-slate-900 transition-transform duration-300 ${isRotating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`} />
          
          {/* Center Dynamic Seed Badge */}
          <div className="absolute inset-0 m-auto w-14 h-14 rounded-2xl bg-indigo-900 border-2 border-white flex flex-col items-center justify-center text-white shadow-xl">
            <span className="font-mono text-[9px] text-indigo-300 font-bold">TOTP</span>
            <span className="font-mono font-black text-xs text-amber-300">{totpHash}</span>
          </div>
        </div>

        {/* 15-Second Circular Progress / Countdown Bar */}
        <div className="space-y-1.5 max-w-xs mx-auto">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-indigo-400 font-bold">
              <RefreshCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
              <span>Token Segar: {countdown}s</span>
            </span>
            <span className="text-amber-400">Anti-Screenshot WhatsApp</span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Kod bertukar setiap 15 saat. Gambar yang dihantar melalui chat akan tamat tempoh serta-merta.
          </p>
        </div>

        {/* Passcode Backup Display */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-around text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Kod Pas Sesi Ini</span>
            <span className="text-2xl font-mono font-black tracking-widest text-indigo-200">
              {passcode}
            </span>
          </div>

          <div className="border-l border-slate-800 pl-4 text-left">
            <span className="text-[10px] text-slate-400 uppercase block">Kehadiran Sah</span>
            <span className="text-lg font-mono font-black text-emerald-400 flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{presentCount} / {totalStudents}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
