import React from 'react';
import {
  ShieldCheck,
  Mail,
  Phone,
  FileCheck2,
  AlertTriangle,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  LogOut
} from 'lucide-react';
import { LecturerProfile, ExcuseSubmission, AuthAccount } from '../../types/attendance';

interface LecturerProfileTabProps {
  lecturer: LecturerProfile;
  excuses: ExcuseSubmission[];
  onApproveExcuse: (excuseId: string) => void;
  onRejectExcuse: (excuseId: string) => void;
  onLogout?: () => void;
  currentAccount?: AuthAccount;
}

export const LecturerProfileTab: React.FC<LecturerProfileTabProps> = ({
  lecturer,
  excuses,
  onApproveExcuse,
  onRejectExcuse,
  onLogout,
  currentAccount,
}) => {
  const pendingExcuses = excuses.filter((e) => e.status === 'Menunggu Kelulusan');

  return (
    <div className="space-y-4">
      {/* Digital Academic Staff ID Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-indigo-800/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/50 border border-white/20 flex items-center justify-center text-xs font-black font-mono">
              STAF
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider uppercase text-indigo-200">
                Kad Pengenalan Staf Akademik PKS
              </p>
              <p className="text-[8px] text-white/70">
                Politeknik Kuching Sarawak · JKM
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
            {lecturer.session}
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/40 flex items-center justify-center font-extrabold text-xl text-indigo-300 shadow-inner">
            ZH
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug truncate">
              {lecturer.name}
            </h3>
            <p className="font-mono text-xs text-indigo-300 font-bold mt-0.5">
              {lecturer.staffId}
            </p>
            <p className="text-[11px] text-white/80 mt-1 truncate">
              {lecturer.department}
            </p>
            <p className="text-[10px] text-indigo-300 font-mono mt-0.5 truncate">
              {lecturer.office}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <div>
            <p className="text-[9px] text-indigo-300">Emel Rasmi PKS</p>
            <p className="font-bold text-[11px] text-white">{lecturer.email}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-indigo-300">Status Sesi</p>
            <span className="text-emerald-400 font-mono font-black text-xs">
              ● AKTIF MENGAJAR
            </span>
          </div>
        </div>
      </div>

      {/* Analytics KPI strip */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Jumlah Pelajar</span>
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
            {lecturer.totalStudentsEnrolled} Orang
          </p>
        </div>
        <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Purata Hadir</span>
          <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            91.2%
          </p>
        </div>
        <div className="bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Permohonan MC</span>
          <p className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
            {pendingExcuses.length} Menunggu
          </p>
        </div>
      </div>

      {/* Pending e-MC Approval Queue */}
      <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Kelulusan Surat Tunjuk Sebab & e-MC
            </h4>
            <p className="text-[11px] text-slate-500">
              Pengesahan sijil cuti sakit pelajar di bawah seliaan anda
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
            {pendingExcuses.length} Sedia Disemak
          </span>
        </div>

        <div className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          {excuses.map((exc) => {
            const isPending = exc.status === 'Menunggu Kelulusan';
            const isApproved = exc.status === 'Diluluskan PA';

            return (
              <div
                key={exc.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {exc.studentName || 'Pelajar JKM'}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1">
                      ({exc.studentMatric || exc.courseCode})
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isApproved
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : isPending
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {exc.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  <strong>{exc.reason}:</strong> {exc.notes}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>Tarikh: {exc.date} · {exc.courseCode}</span>
                  <span>{exc.fileName || 'Dokumen disahkan'}</span>
                </div>

                {/* Approve / Reject buttons for pending excuses */}
                {isPending && (
                  <div className="flex gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => onApproveExcuse(exc.id)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Luluskan e-MC</span>
                    </button>
                    <button
                      onClick={() => onRejectExcuse(exc.id)}
                      className="py-1.5 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900 active:scale-95 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Polytechnic Examination Barring SOP */}
      <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>SOP Barring Peperiksaan Akhir Politeknik</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Selaras dengan Arahan Peperiksaan dan Penilaian Politeknik Malaysia, pelajar yang tidak mencapai peratus kehadiran minimum 80% tanpa kelulusan sah Penasihat Akademik hendaklah disenaraihitamkan daripada menduduki peperiksaan akhir bagi kursus berkenaan.
        </p>
      </div>

      {/* Sesi Pensyarah & Log Keluar */}
      <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Sesi Pensyarah & Keselamatan Portal
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
            Akses Staf Aktif
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Akaun Staf:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {currentAccount?.email || lecturer.email}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Jabatan:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {lecturer.department} · {lecturer.staffId}
            </span>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Log Keluar dari Portal Pensyarah</span>
          </button>
        )}
      </div>
    </div>
  );
};
