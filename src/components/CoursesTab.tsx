import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  User,
  Check,
  Fingerprint,
  QrCode,
  FileCheck,
  Lock,
  Hourglass,
  AlertTriangle,
  ScanLine,
  Info,
  Calendar
} from 'lucide-react';
import { CourseSession } from '../types/attendance';
import { calculateHaversineDistance, formatDistance } from '../utils/geo';
import { SEMESTER_PARAMS } from '../data/mockData';

interface CoursesTabProps {
  courses: CourseSession[];
  enrolledCourseIds: string[];
  userLat: number;
  userLng: number;
  onCheckIn: (courseId: string) => void;
  onViewSlip: (course: CourseSession) => void;
  onOpenQR: (course: CourseSession) => void;
  onOpenStudentScanModal: () => void;
}

export const CoursesTab: React.FC<CoursesTabProps> = ({
  courses,
  enrolledCourseIds,
  userLat,
  userLng,
  onCheckIn,
  onViewSlip,
  onOpenQR,
  onOpenStudentScanModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'postponed'>('all');

  // Filter courses by enrolled courses for student
  let displayedCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));

  if (filter === 'active') {
    displayedCourses = displayedCourses.filter((c) => c.status === 'ongoing' && !c.postponementInfo?.isPostponed);
  } else if (filter === 'completed') {
    displayedCourses = displayedCourses.filter((c) => c.checkedIn);
  } else if (filter === 'postponed') {
    displayedCourses = displayedCourses.filter((c) => c.postponementInfo?.isPostponed);
  }

  return (
    <div className="space-y-4">
      {/* Politeknik Academic Session & SPMP Policy Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 rounded-2xl p-4 text-white flex items-center justify-between shadow-md border border-rose-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 font-mono">
              Minggu {SEMESTER_PARAMS.currentAcademicWeek} / {SEMESTER_PARAMS.totalSemesterWeeks}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold">
              Syarat Min: 80%
            </span>
          </div>
          <h4 className="font-extrabold text-xs sm:text-sm text-white mt-0.5">
            Pengiraan Jam Pertemuan (SPMP)
          </h4>
          <p className="text-[11px] text-slate-300">
            Kehadiran dikira berasaskan contact hours rasmi JKM
          </p>
        </div>

        <button
          onClick={onOpenStudentScanModal}
          className="px-3 py-2 rounded-xl bg-white text-slate-900 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition shrink-0"
        >
          <QrCode className="w-4 h-4 text-rose-700" />
          <span>Daftar Kursus</span>
        </button>
      </div>

      {/* Interactive Filter Segmented Control */}
      <div className="flex items-center justify-between gap-1 p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
        {[
          { id: 'all', label: `Semua (${enrolledCourseIds.length})` },
          { id: 'active', label: 'Sedang Berjalan' },
          { id: 'completed', label: 'Telah Hadir' },
          { id: 'postponed', label: 'Cuti / Ganti' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as typeof filter)}
            className={`flex-1 py-1.5 rounded-lg transition-colors whitespace-nowrap text-center ${
              filter === item.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        {displayedCourses.length === 0 ? (
          <div className="bg-white dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Belum Mendaftar Kursus Baharu
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Imbas Kod QR yang dipaparkan oleh pensyarah dalam bengkel untuk mendaftar kelas kali pertama.
              </p>
            </div>
            <button
              onClick={onOpenStudentScanModal}
              className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>Imbas QR / Masuk Kod Akses</span>
            </button>
          </div>
        ) : (
          displayedCourses.map((course) => {
            const distToVenue = calculateHaversineDistance(
              userLat,
              userLng,
              course.coords.lat,
              course.coords.lng
            );
            const inVenueRange = distToVenue <= course.coords.radius;

            // Contact hours metrics
            const totalSemHours = course.contactHoursPerWeek * (course.totalSemesterWeeks || 14);
            const taughtHours = course.currentWeekHoursTaught || (SEMESTER_PARAMS.currentAcademicWeek * course.contactHoursPerWeek);
            const attendedHrs = course.checkedIn
              ? course.studentAttendedHours + course.contactHoursPerWeek
              : course.studentAttendedHours;
            const currentPct = taughtHours > 0 ? ((attendedHrs / taughtHours) * 100).toFixed(1) : '100.0';
            const isBarredRisk = Number(currentPct) < SEMESTER_PARAMS.minAttendanceThreshold;

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-rose-800 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                      {course.code}
                    </span>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {course.section}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                      {course.type}
                    </span>
                  </div>

                  {course.postponementInfo?.isPostponed ? (
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {course.postponementInfo.actionType === 'replacement_scheduled'
                          ? 'Ditangguhkan (Ada Ganti)'
                          : 'Pelepasan Cuti (SPMP)'}
                      </span>
                    </span>
                  ) : course.checkedIn ? (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Hadir ({course.checkInTime})</span>
                    </span>
                  ) : course.status === 'ongoing' ? (
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Sedang Berjalan</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">
                      {course.day}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                    {course.name}
                  </h3>
                </div>

                {/* Postponement & Replacement Notice Card */}
                {course.postponementInfo?.isPostponed && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/70 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-2 truncate">
                        <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="truncate">{course.postponementInfo.reasonTitle}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold shrink-0">
                        SPMP Terlindung
                      </span>
                    </div>

                    <div className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                      {course.postponementInfo.actionType === 'replacement_scheduled' ? (
                        <div className="space-y-1.5">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            Jadual Kelas Gantian Rasmi:
                          </p>
                          <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200 dark:border-amber-900 text-slate-800 dark:text-slate-200 space-y-0.5">
                            <div className="font-bold flex items-center gap-1.5">
                              <span>📅 {course.postponementInfo.replacementDate}</span>
                              <span>·</span>
                              <span>⏰ {course.postponementInfo.replacementStartTime} - {course.postponementInfo.replacementEndTime}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              📍 Lokasi Bengkel: {course.postponementInfo.replacementVenue}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
                          🛡️ <strong>Pelepasan Jam Rasmi (SPMP)</strong>: Jam pertemuan minggu ini dikecualikan secara rasmi. Ia <strong>TIDAK DIKIRA</strong> sebagai ketidakhadiran, maka syarat 80% menduduki peperiksaan akhir anda kekal terlindung tanpa sebarang penalti.
                        </div>
                      )}
                    </div>

                    {course.postponementInfo.notes && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-white/60 dark:bg-slate-850/60 p-2 rounded-xl border border-amber-100 dark:border-amber-900/50">
                        Nota Pensyarah: "{course.postponementInfo.notes}"
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Hours & SPMP Progress Bar */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Hourglass className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Jam Pertemuan</span>
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isBarredRisk
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {attendedHrs}/{taughtHours} Jam ({currentPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isBarredRisk ? 'bg-rose-500' : 'bg-emerald-500'
                      } rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(Number(currentPct), 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
                    <span>
                      {course.contactHoursPerWeek} jam/minggu · {totalSemHours} jam semester
                    </span>
                    <span>
                      {isBarredRisk ? '⚠️ Risiko Surat Amaran' : '✓ Layak Peperiksaan (>80%)'}
                    </span>
                  </div>
                </div>

                {/* Venue, Time, Lecturer */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="truncate">{course.venue}</span>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold shrink-0 ${
                        inVenueRange
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatDistance(distToVenue)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="font-mono text-[11px]">
                        {course.startTime} - {course.endTime}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">
                      {course.lecturer}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-1 flex items-center gap-2">
                  {course.postponementInfo?.isPostponed ? (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>
                        {course.postponementInfo.actionType === 'replacement_scheduled'
                          ? `Pendaftaran Dibuka Semasa Sesi Ganti (${course.postponementInfo.replacementDate})`
                          : 'Sesi Dikecualikan Rasmi · Tiada Pendaftaran Diperlukan'}
                      </span>
                    </div>
                  ) : course.checkedIn ? (
                    <button
                      onClick={() => onViewSlip(course)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 active:scale-95 transition"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Papar Slip Rasmi ({course.contactHoursPerWeek} Jam)</span>
                    </button>
                  ) : course.status === 'ongoing' ? (
                    <>
                      {inVenueRange ? (
                        <button
                          onClick={() => onCheckIn(course.id)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/25 active:scale-95 transition group"
                        >
                          <Fingerprint className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition" />
                          <div className="flex items-center gap-1.5">
                            <span>Sahkan Identiti & Hadir</span>
                            <span className="text-[10px] bg-emerald-950/60 text-emerald-200 px-1.5 py-0.2 rounded font-mono">
                              Biometrik
                            </span>
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={() => onCheckIn(course.id)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 active:scale-95 transition"
                        >
                          <Lock className="w-3.5 h-3.5 text-rose-500" />
                          <span>Luar Zon ({distToVenue}m dari bengkel)</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenQR(course)}
                        title="Imbas Kod QR Pensyarah atau Kod Pas"
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 active:scale-95 transition shrink-0"
                      >
                        <QrCode className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-slate-800">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Sesi dibuka jam {course.startTime}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
