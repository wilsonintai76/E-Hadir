import React, { useState } from 'react';
import {
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';
import { AttendanceRecord, StudentProfile } from '../types/attendance';
import { exportToCSV } from '../utils/geo';

interface HistoryTabProps {
  history: AttendanceRecord[];
  student: StudentProfile;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ history, student }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const attendancePercentage = ((student.attendedClasses / student.totalClasses) * 100).toFixed(1);
  const isEligibleForExam = Number(attendancePercentage) >= 80;

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      item.courseName.toLowerCase().includes(search.toLowerCase()) ||
      item.venue.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'ontime' && item.status === 'Hadir Tepat Masa') ||
      (statusFilter === 'late' && item.status === 'Hadir Lewat') ||
      (statusFilter === 'excused' && item.status === 'Cuti Sakit / Bersebab');

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const rows = history.map((h) => ({
      'Kod Kursus': h.courseCode,
      'Nama Kursus': h.courseName,
      'Lokasi': h.venue,
      'Tarikh': h.date,
      'Masa': h.time,
      'Status': h.status,
      'Kaedah': h.method,
      'Token Pengesahan': h.token,
    }));
    exportToCSV(`eHadir_JKM_${student.id}_rekod.csv`, rows);
  };

  return (
    <div className="space-y-4">
      {/* SPMP Exam Compliance Bar (80% Rule) */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 text-white rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-rose-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-rose-200">
              Syarat Kelayakan Peperiksaan Akhir (SPMP)
            </span>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              isEligibleForExam
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-rose-950 text-rose-300 border border-rose-700'
            }`}
          >
            {isEligibleForExam ? 'Layak Peperiksaan' : 'Amaran Kehadiran Rendah'}
          </span>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs text-slate-300">
              Kadar Keseluruhan: <span className="font-bold text-white">{student.attendedClasses}/{student.totalClasses} sesi</span>
            </span>
            <span className="text-lg font-black font-mono text-emerald-400">
              {attendancePercentage}%
            </span>
          </div>

          {/* Progress bar with 80% marker line */}
          <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isEligibleForExam ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Number(attendancePercentage))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0%</span>
            <span className="text-amber-400 font-bold">Ambang Wajib: 80%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Search & Export Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kursus atau bengkel..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <button
          onClick={handleExport}
          title="Muat Turun Laporan CSV"
          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition active:scale-95 shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Eksport CSV</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
        {[
          { id: 'all', label: `Semua (${history.length})` },
          { id: 'ontime', label: 'Tepat Masa' },
          { id: 'late', label: 'Hadir Lewat' },
          { id: 'excused', label: 'Cuti / MC' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setStatusFilter(item.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              statusFilter === item.id
                ? 'bg-rose-800 text-white shadow-sm font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* History Records List */}
      <div className="space-y-2.5">
        {filteredHistory.map((item) => {
          const isOntime = item.status === 'Hadir Tepat Masa';
          const isLate = item.status === 'Hadir Lewat';
          const isExcused = item.status === 'Cuti Sakit / Bersebab';

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-black text-rose-800 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                  {item.courseCode}
                </span>

                <span
                  className={`text-[11px] font-bold flex items-center gap-1 ${
                    isOntime
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : isLate
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {isOntime && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isLate && <Clock className="w-3.5 h-3.5" />}
                  {isExcused && <FileText className="w-3.5 h-3.5" />}
                  <span>{item.status}</span>
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {item.courseName}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {item.venue}
                </p>
              </div>

              {/* Clean unboxed metadata footer with separators */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
                <div className="flex items-center gap-2">
                  <span>{item.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.time}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.method}</span>
                </div>
                <span className="text-[10px] text-rose-800 dark:text-rose-400 font-bold">
                  {item.token}
                </span>
              </div>
            </div>
          );
        })}

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-xs text-slate-500">
              Tiada rekod kehadiran yang sepadan dengan carian ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
