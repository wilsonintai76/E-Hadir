import React, { useState } from 'react';
import {
  BookMarked,
  Users,
  MapPin,
  Clock,
  Lock,
  Unlock,
  QrCode,
  PlusCircle,
  Search,
  Trash2,
  Tv,
  Hourglass
} from 'lucide-react';
import { CourseSession } from '../../types/attendance';

interface LecturerClassesTabProps {
  courses: CourseSession[];
  selectedClassId: string;
  lecturerName: string;
  onSelectClass: (classId: string) => void;
  onToggleSessionState: (classId: string) => void;
  onOpenProjectorQR: (course: CourseSession) => void;
  onOpenClassQR: (course: CourseSession) => void;
  onOpenCreateCourse: () => void;
  onDeleteCourse: (courseId: string) => void;
  onSwitchToLiveRoster: (classId: string) => void;
}

export const LecturerClassesTab: React.FC<LecturerClassesTabProps> = ({
  courses,
  selectedClassId,
  lecturerName,
  onSelectClass,
  onToggleSessionState,
  onOpenProjectorQR,
  onOpenClassQR,
  onOpenCreateCourse,
  onDeleteCourse,
  onSwitchToLiveRoster,
}) => {
  const [scope, setScope] = useState<'my_courses' | 'all_courses'>('my_courses');
  const [search, setSearch] = useState('');

  const myCourses = courses.filter((c) => c.lecturer === lecturerName);
  const baseList = scope === 'my_courses' ? myCourses : courses;

  const filtered = baseList.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.section.toLowerCase().includes(search.toLowerCase()) ||
      c.venue.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Header with Add Course Button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pengurusan Kursus Pensyarah
          </h3>
          <p className="text-[11px] text-slate-400">
            Daftar kursus diajar, pancar kod QR & pantau geofens
          </p>
        </div>
        <button
          onClick={onOpenCreateCourse}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-900/20 active:scale-95 transition shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Tambah Kursus</span>
        </button>
      </div>

      {/* Scope Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setScope('my_courses')}
          className={`flex-1 py-1.5 rounded-lg transition whitespace-nowrap text-center ${
            scope === 'my_courses'
              ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Kursus Saya ({myCourses.length})
        </button>
        <button
          onClick={() => setScope('all_courses')}
          className={`flex-1 py-1.5 rounded-lg transition whitespace-nowrap text-center ${
            scope === 'all_courses'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Semua Kursus JKM ({courses.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kod kursus, seksyen atau bengkel..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        {filtered.map((course) => {
          const isSelected = selectedClassId === course.id;
          const isMyCourse = course.lecturer === lecturerName;
          const attendancePct =
            course.totalStudents > 0
              ? Math.round((course.presentCount / course.totalStudents) * 100)
              : 0;

          return (
            <div
              key={course.id}
              className={`bg-white dark:bg-slate-850 border rounded-2xl p-4 shadow-sm transition space-y-3 ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-500'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
                    {course.code}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {course.section}
                  </span>
                  {isMyCourse && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Diajar Anda
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    course.sessionOpen
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      course.sessionOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{course.sessionOpen ? 'Sesi Buka' : 'Ditutup'}</span>
                </span>
              </div>

              {/* Title & Info */}
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                  {course.name}
                </h3>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">{course.venue}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    Radius: {course.coords.radius || 150}m
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-mono text-[11px]">{course.startTime} - {course.endTime}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {course.contactHoursPerWeek} Jam/Minggu · {course.totalSemesterWeeks || 14} Minggu
                  </span>
                </div>
              </div>

              {/* Live Attendance Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-500 font-medium">Kehadiran Semasa:</span>
                  <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">
                    {course.presentCount} / {course.totalStudents} ({attendancePct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${attendancePct}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    onSelectClass(course.id);
                    onSwitchToLiveRoster(course.id);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition ${
                    isSelected
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Sedang Dipantau' : 'Pantau Pelajar'}</span>
                </button>

                {/* Day-1 QR Code button */}
                <button
                  onClick={() => onOpenClassQR(course)}
                  title="Papar Kod QR Pendaftaran Kelas Hari Pertama"
                  className="py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1 border border-indigo-200 dark:border-indigo-900 active:scale-95 transition shrink-0"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Daftar</span>
                </button>

                {/* Projector View button */}
                <button
                  onClick={() => onOpenProjectorQR(course)}
                  title="Mod Projektor Dewan Kuliah"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 active:scale-95 transition shrink-0"
                >
                  <Tv className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </button>

                {/* Session Lock/Unlock Toggle */}
                <button
                  onClick={() => onToggleSessionState(course.id)}
                  title={course.sessionOpen ? 'Kunci sesi (tutup daftar)' : 'Buka sesi (terima daftar)'}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold active:scale-95 transition flex items-center gap-1.5 shrink-0 ${
                    course.sessionOpen
                      ? 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                      : 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  {course.sessionOpen ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Kunci Sesi</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Buka Sesi</span>
                    </>
                  )}
                </button>

                {/* Delete course button (for courses taught by this lecturer) */}
                {isMyCourse && (
                  <button
                    onClick={() => onDeleteCourse(course.id)}
                    title="Padam Kursus Ini"
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 active:scale-95 transition shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
