import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Search,
  RotateCw,
  Check,
  X,
  Tv,
  MapPin,
  ShieldCheck,
  UserPlus,
  UserMinus,
  QrCode,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { CourseSession, StudentRosterItem, AnomalyReport } from '../../types/attendance';
import { exportToCSV } from '../../utils/geo';
import { SEMESTER_PARAMS } from '../../data/mockData';

interface LecturerLiveRosterTabProps {
  course: CourseSession;
  roster: StudentRosterItem[];
  anomalies: AnomalyReport[];
  geofenceRadius: number;
  onVerifyManually: (studentId: string) => void;
  onToggleStudentStatus: (studentId: string) => void;
  onApproveAnomaly: (anomalyId: string) => void;
  onRejectAnomaly: (anomalyId: string) => void;
  onOpenProjectorQR: (course: CourseSession) => void;
  onOpenClassQR: (course: CourseSession) => void;
  onOpenAddStudentModal: () => void;
  onRemoveStudent: (studentId: string) => void;
  onRefreshRoster: () => void;
}

export const LecturerLiveRosterTab: React.FC<LecturerLiveRosterTabProps> = ({
  course,
  roster,
  anomalies,
  geofenceRadius,
  onVerifyManually,
  onToggleStudentStatus,
  onApproveAnomaly,
  onRejectAnomaly,
  onOpenProjectorQR,
  onOpenClassQR,
  onOpenAddStudentModal,
  onRemoveStudent,
  onRefreshRoster,
}) => {
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'excused' | 'anomalies'>('all');
  const [search, setSearch] = useState('');

  const presentCount = roster.filter((r) => r.status === 'present').length;
  const absentCount = roster.filter((r) => r.status === 'absent').length;
  const excusedCount = roster.filter((r) => r.status === 'excused').length;
  const pendingAnomalies = anomalies.filter((a) => a.status === 'pending');
  const totalSemHrs = course.contactHoursPerWeek * (course.totalSemesterWeeks || 14);

  const filteredRoster = roster.filter((item) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'present' && item.status === 'present') ||
      (filter === 'absent' && item.status === 'absent') ||
      (filter === 'excused' && item.status === 'excused');

    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.matric.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleExportSPMP = () => {
    const rows = roster.map((r) => {
      const studentRate = ((r.attendedHours / (r.totalHours || 18)) * 100).toFixed(1);
      return {
        'No Matrik': r.matric,
        'Nama Pelajar': r.name,
        'Kursus': course.code,
        'Seksyen': course.section,
        'Status Sesi': r.status === 'present' ? 'HADIR' : r.status === 'excused' ? 'BERSEBAB (MC)' : 'TIDAK HADIR',
        'Jam Hadir': `${r.attendedHours} / ${r.totalHours || 18} Jam`,
        'Peratus Kehadiran': `${studentRate}%`,
        'Kelayakan Peperiksaan': Number(studentRate) >= 80 ? 'LAYAK' : 'BARRED (AMARAN)',
        'Masa Disahkan': r.time,
        'Jarak GPS': `${r.dist} m`,
        'Kaedah': r.method,
      };
    });
    exportToCSV(`SPMP_${course.code}_${course.section}_ContactHours.csv`, rows);
  };

  return (
    <div className="space-y-4">
      {/* Active Class Header Card */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
                {course.code} ({course.section})
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                {course.contactHoursPerWeek} Jam/Minggu · {totalSemHrs} Jam Semester
              </span>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
              {course.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{course.venue}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenAddStudentModal}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-900 transition active:scale-95"
              title="Tambah Pelajar Manual ke Kelas"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenClassQR(course)}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-900 transition active:scale-95"
              title="Papar Kod QR Pendaftaran Kelas"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenProjectorQR(course)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition active:scale-95"
              title="Pancar Kod Projektor TOTP"
            >
              <Tv className="w-4 h-4" />
            </button>
            <button
              onClick={onRefreshRoster}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition active:scale-95"
              title="Muat Semula Status Roster"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 KPI Summary Cards */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center font-mono">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-sans font-bold uppercase">
              Hadir Sah
            </span>
            <p className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300">
              {presentCount}
            </p>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60">
            <span className="text-[10px] text-rose-800 dark:text-rose-300 font-sans font-bold uppercase">
              Belum Hadir
            </span>
            <p className="text-base sm:text-lg font-black text-rose-700 dark:text-rose-300">
              {absentCount}
            </p>
          </div>

          <div className={`p-2.5 rounded-xl border font-mono ${
            pendingAnomalies.length > 0
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-200'
          }`}>
            <span className="text-[10px] font-sans font-bold uppercase block">
              {pendingAnomalies.length > 0 ? 'Anomali / Bendera' : 'Perimeter'}
            </span>
            <p className="text-base sm:text-lg font-black">
              {pendingAnomalies.length > 0 ? `${pendingAnomalies.length} Kes` : `${geofenceRadius}m`}
            </p>
          </div>
        </div>
      </div>

      {/* Anti-Spam & Anomaly Security Drawer */}
      {pendingAnomalies.length > 0 && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Pusat Keselamatan & Anomali Imbasan ({pendingAnomalies.length})
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Imbasan mencurigakan di luar radius atau token lapuk (Anti-Proxy)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
              Perlu Semakan
            </span>
          </div>

          <div className="space-y-2">
            {pendingAnomalies.map((anom) => (
              <div
                key={anom.id}
                className="bg-white dark:bg-slate-850 p-3 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-1.5 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{anom.studentName}</span>
                    <span className="text-[11px] font-mono text-slate-500 ml-1.5">({anom.matric})</span>
                  </div>
                  <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    {anom.reason} · {anom.distance}m
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {anom.details}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
                  <span>Masa: {anom.timestamp}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApproveAnomaly(anom.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold active:scale-95 transition"
                    >
                      Luluskan Pengecualian
                    </button>
                    <button
                      onClick={() => onRejectAnomaly(anom.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900 active:scale-95 transition"
                    >
                      Tolak (Sekat)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar: Search, Filters & CSV Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pelajar atau no matrik..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleExportSPMP}
          className="h-9 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Eksport SPMP (CSV)</span>
        </button>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
        {[
          { id: 'all', label: `Semua (${roster.length})` },
          { id: 'present', label: `Hadir (${presentCount})` },
          { id: 'absent', label: `Belum Hadir (${absentCount})` },
          { id: 'excused', label: `Cuti / MC (${excusedCount})` },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as typeof filter)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              filter === item.id
                ? 'bg-indigo-700 text-white font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Student Roll Call Items */}
      <div className="space-y-2.5">
        {filteredRoster.map((student) => {
          const isPresent = student.status === 'present';
          const isExcused = student.status === 'excused';
          const totalTaughtHrs = student.totalHours || 18;
          const studentRate = ((student.attendedHours / totalTaughtHrs) * 100).toFixed(0);
          const isBarred = Number(studentRate) < SEMESTER_PARAMS.minAttendanceThreshold;

          return (
            <div
              key={student.id}
              className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3 transition"
            >
              {/* Left Student Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isPresent
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : isExcused
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {student.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {student.name}
                    </h4>
                    {isBarred && (
                      <span className="text-[10px]" title="Risiko Barred Peperiksaan (<80%)">
                        ⚠️
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 truncate">
                    {student.matric} · {student.attendedHours}/{totalTaughtHrs} Jam ({studentRate}%) · {student.method}
                  </p>
                  {student.notes && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 truncate mt-0.5">
                      {student.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Status & Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {isPresent ? (
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                      {student.time}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {student.dist}m
                    </span>
                  </div>
                ) : isExcused ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    e-MC Sah
                  </span>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold block">
                      Luar Zon ({student.dist}m)
                    </span>
                  </div>
                )}

                {/* Manual Override Action Button */}
                {isPresent ? (
                  <button
                    onClick={() => onToggleStudentStatus(student.id)}
                    title="Batal status hadir"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </button>
                ) : (
                  <button
                    onClick={() => onVerifyManually(student.id)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Sahkan Manual</span>
                  </button>
                )}

                {/* Drop Student from Roster */}
                <button
                  onClick={() => onRemoveStudent(student.id)}
                  title="Gugurkan pelajar dari kelas"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 transition"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredRoster.length === 0 && (
          <div className="text-center py-8 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-xs text-slate-500">
              Tiada pelajar ditemui bagi kriteria carian ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
