import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { CourseSession, ClassPostponementInfo } from '../../types/attendance';

interface PostponeClassModalProps {
  course: CourseSession | null;
  onClose: () => void;
  onSavePostponement: (courseId: string, postponement: ClassPostponementInfo | null) => void;
}

export const PostponeClassModal: React.FC<PostponeClassModalProps> = ({
  course,
  onClose,
  onSavePostponement,
}) => {
  if (!course) return null;

  const currentPostponement = course.postponementInfo;

  const [reasonType, setReasonType] = useState<ClassPostponementInfo['reasonType']>(
    currentPostponement?.reasonType || 'cuti_umum'
  );
  const [reasonTitle, setReasonTitle] = useState(
    currentPostponement?.reasonTitle || 'Cuti Umum Persekutuan / Negeri'
  );
  const [postponedDate, setPostponedDate] = useState(
    currentPostponement?.postponedDate || 'Minggu Semasa (Ahad, 18 Okt 2026)'
  );
  const [actionType, setActionType] = useState<'replacement_scheduled' | 'waived'>(
    currentPostponement?.actionType || 'replacement_scheduled'
  );
  const [replacementDate, setReplacementDate] = useState(
    currentPostponement?.replacementDate || 'Sabtu, 24 Okt 2026'
  );
  const [replacementStartTime, setReplacementStartTime] = useState(
    currentPostponement?.replacementStartTime || course.startTime
  );
  const [replacementEndTime, setReplacementEndTime] = useState(
    currentPostponement?.replacementEndTime || course.endTime
  );
  const [replacementVenue, setReplacementVenue] = useState(
    currentPostponement?.replacementVenue || course.venue
  );
  const [notes, setNotes] = useState(
    currentPostponement?.notes ||
      'Sila bawa laporan amali dan pakaian bengkel lengkap PPE pada sesi gantian.'
  );

  const REASON_PRESETS = [
    {
      id: 'cuti_umum',
      label: '🇲🇾 Cuti Umum / Kelepasan Am',
      examples: 'Cth: Maulidur Rasul, Hari Malaysia, Hari Kebangsaan, Deepavali',
      defaultTitle: 'Cuti Umum Persekutuan / Negeri',
    },
    {
      id: 'komitmen_pensyarah',
      label: '🏛️ Komitmen Rasmi Pensyarah',
      examples: 'Cth: Kursus Kompetensi, Mesyuarat Senat, Audit Akreditasi MBOT/ETAC',
      defaultTitle: 'Komitmen Rasmi / Bengkel Akreditasi Jabatan',
    },
    {
      id: 'cuti_peristiwa',
      label: '🎓 Cuti Peristiwa Politeknik',
      examples: 'Cth: Hari Sukan Politeknik, Hari Konvokesyen, Cuti Bencana',
      defaultTitle: 'Cuti Peristiwa Politeknik / Pelepasan Khas',
    },
    {
      id: 'penyelenggaraan_bengkel',
      label: '🛠️ Penyelenggaraan Bengkel',
      examples: 'Cth: Kalibrasi mesin CNC, pembaikan elektrik voltan tinggi',
      defaultTitle: 'Kerja Penyelenggaraan & Keselamatan Bengkel',
    },
  ];

  const handleSelectReasonPreset = (item: (typeof REASON_PRESETS)[0]) => {
    setReasonType(item.id as ClassPostponementInfo['reasonType']);
    setReasonTitle(item.defaultTitle);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const info: ClassPostponementInfo = {
      isPostponed: true,
      reasonType,
      reasonTitle: reasonTitle.trim() || 'Penangguhan Kelas',
      postponedDate,
      actionType,
      replacementDate: actionType === 'replacement_scheduled' ? replacementDate : undefined,
      replacementStartTime:
        actionType === 'replacement_scheduled' ? replacementStartTime : undefined,
      replacementEndTime: actionType === 'replacement_scheduled' ? replacementEndTime : undefined,
      replacementVenue: actionType === 'replacement_scheduled' ? replacementVenue : undefined,
      notes: notes.trim(),
      updatedAt: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
    };

    onSavePostponement(course.id, info);
    onClose();
  };

  const handleRevert = () => {
    onSavePostponement(course.id, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Pengurusan Cuti & Kelas Ganti</span>
                <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded">
                  SPMP SOP
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {course.code} · {course.section} ({course.name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Active Postponement Alert Banner if already postponed */}
          {course.postponementInfo?.isPostponed && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    Sesi Ini Sedang Berstatus Ditangguhkan
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    {course.postponementInfo.reasonTitle} ·{' '}
                    {course.postponementInfo.actionType === 'replacement_scheduled'
                      ? `Sesi Ganti: ${course.postponementInfo.replacementDate}`
                      : 'Pelepasan Jam Kontak (Tiada penalti kehadiran)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRevert}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 text-amber-800 dark:text-amber-200 font-bold text-[11px] border border-amber-300 dark:border-amber-700 flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Batal Tangguh</span>
              </button>
            </div>
          )}

          {/* SPMP Regulatory Notice */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-slate-700 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Panduan Arahan Akademik Politeknik (SPMP)</span>
            </div>
            <p className="text-[11px] text-blue-950 dark:text-blue-200 leading-relaxed">
              Jika minggu perkuliahan jatuh pada cuti umum atau pensyarah bertugas rasmi, pelajar <strong>tidak boleh dikira ponteng</strong>. Pensyarah boleh memilih sama ada mengadakan <strong>Kelas Ganti</strong> atau <strong>Pelepasan Jam Kontak</strong>.
            </p>
          </div>

          {/* 1. Pilih Sebab Penangguhan */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>1. Sebab Penangguhan / Cuti</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REASON_PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectReasonPreset(item)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    reasonType === item.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850'
                  }`}
                >
                  <p className="font-bold text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.examples}</p>
                </button>
              ))}
            </div>

            {/* Custom Reason Title input */}
            <div className="mt-2">
              <input
                type="text"
                value={reasonTitle}
                onChange={(e) => setReasonTitle(e.target.value)}
                placeholder="Tajuk / Butiran Sebab (cth: Cuti Maulidur Rasul)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tarikh Sesi Asal Yang Ditangguhkan */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Tarikh / Minggu Yang Ditangguhkan
            </label>
            <input
              type="text"
              value={postponedDate}
              onChange={(e) => setPostponedDate(e.target.value)}
              placeholder="Cth: Minggu 6 (Ahad, 18 Okt 2026)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 2. Tindakan Jam Kontak & Kelas Ganti */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="font-bold text-slate-800 dark:text-slate-200">
              2. Tindakan Jam Kontak & Gantian (SPMP)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActionType('replacement_scheduled')}
                className={`p-3 rounded-xl border text-left transition ${
                  actionType === 'replacement_scheduled'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <span>Jadualkan Kelas Ganti</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Sesi gantian diadakan pada tarikh lain untuk memenuhi jam kontak silibus.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActionType('waived')}
                className={`p-3 rounded-xl border text-left transition ${
                  actionType === 'waived'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Pelepasan Jam Kontak</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tiada kelas ganti. Jam minggu ini dikecualikan; peratusan 80% pelajar tidak terjejas.
                </p>
              </button>
            </div>
          </div>

          {/* Replacement Session Details if replacement_scheduled */}
          {actionType === 'replacement_scheduled' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Maklumat Sesi Kelas Ganti</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Tarikh Ganti</label>
                  <input
                    type="text"
                    value={replacementDate}
                    onChange={(e) => setReplacementDate(e.target.value)}
                    placeholder="Cth: Sabtu, 24 Okt 2026"
                    className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500">Masa Sesi Ganti</label>
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      value={replacementStartTime}
                      onChange={(e) => setReplacementStartTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-1/2 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="text"
                      value={replacementEndTime}
                      onChange={(e) => setReplacementEndTime(e.target.value)}
                      placeholder="12:00 PM"
                      className="w-1/2 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500">Lokasi / Bengkel Sesi Ganti</label>
                <input
                  type="text"
                  value={replacementVenue}
                  onChange={(e) => setReplacementVenue(e.target.value)}
                  placeholder="Cth: Bengkel Kimpalan & Fabrikasi JKM"
                  className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Notes for students */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Arahan / Nota Kepada Pelajar
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Arahan tugasan persediaan atau peringatan pakaian PPE..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            {course.postponementInfo?.isPostponed && (
              <button
                type="button"
                onClick={handleRevert}
                className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 font-bold active:scale-95 transition"
              >
                Batal Penangguhan
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold active:scale-95 transition"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-indigo-900/20 active:scale-95 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Kemaskini Pelajar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
