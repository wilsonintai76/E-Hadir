import React, { useState } from 'react';
import {
  CreditCard,
  Mail,
  UserCheck,
  Calendar,
  Award,
  FilePlus2,
  Clock,
  Sparkles,
  QrCode,
  CheckCircle,
  FileText,
  Calculator,
  Hourglass,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { StudentProfile, ExcuseSubmission, AuthAccount } from '../types/attendance';
import { SEMESTER_PARAMS } from '../data/mockData';

interface ProfileTabProps {
  student: StudentProfile;
  excuses: ExcuseSubmission[];
  onOpenExcuseModal: () => void;
  onLogout?: () => void;
  currentAccount?: AuthAccount;
  onOpenAccountModal?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  student,
  excuses,
  onOpenExcuseModal,
  onLogout,
  currentAccount,
  onOpenAccountModal,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const contactHoursRate = student.totalTaughtHours > 0
    ? ((student.attendedHours / student.totalTaughtHours) * 100).toFixed(1)
    : '100.0';

  const isEligibleForExam = Number(contactHoursRate) >= SEMESTER_PARAMS.minAttendanceThreshold;

  return (
    <div className="space-y-4">
      {/* Interactive Digital Student ID Card (Kad Matrik Pintar) */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer group select-none transition-transform duration-300 active:scale-[0.99]"
      >
        <div className="bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-rose-800/40">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-right">
            <span className="text-8xl font-black font-mono">PKS</span>
          </div>

          {/* Card Top Strip */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600/50 border border-white/20 flex items-center justify-center text-xs font-black font-mono">
                JKM
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider uppercase text-rose-200">
                  Politeknik Kuching Sarawak
                </p>
                <p className="text-[8px] text-white/70">
                  Kementerian Pendidikan Tinggi Malaysia
                </p>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              {student.session}
            </span>
          </div>

          {/* Student Profile Info */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={student.avatarUrl}
                alt={student.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/40 shadow-md bg-slate-800"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-4 bg-amber-400 rounded-sm border border-amber-600 shadow-xs flex items-center justify-center">
                <div className="w-3 h-2 border-t border-b border-amber-800 opacity-60" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug truncate">
                {student.name}
              </h3>
              <p className="font-mono text-xs text-rose-200 font-bold mt-0.5">
                {student.id}
              </p>
              <p className="text-[11px] text-white/80 mt-1 truncate">
                {student.program}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-rose-300 font-mono mt-0.5">
                <span>{student.classGroup}</span>
                <span>·</span>
                <span>Semester {student.semester}</span>
              </div>
            </div>
          </div>

          {/* Barcode / Contact Hours rate at bottom */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="text-[9px] text-rose-300">Penasihat Akademik (PA)</p>
              <p className="font-bold text-[11px] text-white truncate max-w-[190px]">
                {student.academicAdvisor}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-white/60">Kadar Jam Pertemuan</span>
              <p className="text-emerald-400 font-mono font-black text-sm">
                {contactHoursRate}% Hadir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Official SPMP Contact Hours Calculator Card */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-rose-600" />
            <span>Ringkasan Jam Pertemuan (SPMP)</span>
          </h4>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              isEligibleForExam
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}
          >
            {isEligibleForExam ? 'Layak Peperiksaan (>80%)' : 'Amaran Kehadiran (<80%)'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 font-sans block uppercase">Jam Diajar</span>
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {student.totalTaughtHours} Jam
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 font-sans block uppercase">Jam Hadir</span>
            <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
              {student.attendedHours} Jam
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] text-slate-400 font-sans block uppercase">Minggu Kuliah</span>
            <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
              M{SEMESTER_PARAMS.currentAcademicWeek}/{SEMESTER_PARAMS.totalSemesterWeeks}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Pengiraan kehadiran politeknik berpandukan formula jam kredit pertemuan rasmi mengikut Arahan Peperiksaan dan Kaedah Penilaian Politeknik Malaysia.
        </p>
      </div>

      {/* Attendance Class Sessions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Jumlah Sesi</span>
          <p className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
            {student.totalClasses}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Hadir Tepat</span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {student.attendedClasses}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Hadir Lewat</span>
          <p className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            {student.lateClasses}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Cuti / Bersebab</span>
          <p className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
            {student.excusedClasses}
          </p>
        </div>
      </div>

      {/* Self-Service Absence Excuse (e-MC) Section */}
      <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Surat Tunjuk Sebab & e-MC
            </h4>
            <p className="text-[11px] text-slate-500">
              Hantar sijil cuti sakit atau surat rasmi pelepasan kuliah
            </p>
          </div>
          <button
            onClick={onOpenExcuseModal}
            className="py-1.5 px-3 rounded-xl bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition shrink-0"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span>Mohon e-MC</span>
          </button>
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          {excuses.map((exc) => (
            <div
              key={exc.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-rose-800 dark:text-rose-400">
                  {exc.courseCode} · {exc.reason}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {exc.status}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">
                {exc.notes}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                <span>Tarikh: {exc.date}</span>
                <span>Dihantar: {exc.submittedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Advisor Support Card */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Penasihat Akademik (PA)</p>
          <p className="font-bold text-slate-900 dark:text-white">{student.academicAdvisor}</p>
          <p className="text-[11px] text-slate-500 font-mono">{student.advisorEmail}</p>
        </div>
        <a
          href={`mailto:${student.advisorEmail}?subject=Pertanyaan%20Kehadiran%20JKM%2005DKM23F1012`}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition shrink-0"
          title="Emel Penasihat Akademik"
        >
          <Mail className="w-4 h-4 text-rose-700 dark:text-rose-400" />
        </a>
      </div>

      {/* Sesi Akaun & Kawalan Log Keluar */}
      <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Sesi Akaun Pelajar & Keselamatan
            </h4>
          </div>
          {onOpenAccountModal && (
            <button
              onClick={onOpenAccountModal}
              className="text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:underline"
            >
              Ubah Akaun
            </button>
          )}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Emel Siswa Aktif:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {currentAccount?.email || `${student.id.toLowerCase()}@siswa.poliku.edu.my`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Status Sesi:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Aktif (Peranti Terikat)
            </span>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Log Keluar dari Sistem e-Hadir JKM</span>
          </button>
        )}
      </div>
    </div>
  );
};
