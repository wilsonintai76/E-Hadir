import React, { useState } from 'react';
import { X, FileText, Upload, CheckCircle2, Paperclip } from 'lucide-react';
import { CourseSession, ExcuseSubmission } from '../types/attendance';

interface ExcuseModalProps {
  courses: CourseSession[];
  onClose: () => void;
  onSubmit: (submission: ExcuseSubmission) => void;
}

export const ExcuseModal: React.FC<ExcuseModalProps> = ({
  courses,
  onClose,
  onSubmit,
}) => {
  const [courseCode, setCourseCode] = useState(courses[0]?.code || 'DJJ30093');
  const [reason, setReason] = useState<ExcuseSubmission['reason']>('Cuti Sakit (MC)');
  const [date, setDate] = useState('2026-10-11');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState<string>('salinan_mc_klinik_kesihatan.pdf');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSubmission: ExcuseSubmission = {
      id: `exc-${Date.now()}`,
      courseCode,
      date,
      reason,
      notes: notes || 'Sijil cuti sakit disahkan oleh pegawai perubatan kerajaan/swasta.',
      fileName,
      status: 'Menunggu Kelulusan',
      submittedAt: new Date().toLocaleString('ms-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    onSubmit(newSubmission);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Hantar Surat Tunjuk Sebab / e-MC
              </h3>
              <p className="text-[11px] text-slate-500">
                Pengesahan Ketidakhadiran kepada Penasihat Akademik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kursus Terlibat
            </label>
            <select
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {courses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Alasan
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ExcuseSubmission['reason'])}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Cuti Sakit (MC)">Cuti Sakit (MC)</option>
                <option value="Kecemasan Keluarga">Kecemasan Keluarga</option>
                <option value="Mewakili Politeknik">Mewakili Politeknik</option>
                <option value="Kuarantin / Isolasi">Kuarantin / Isolasi</option>
                <option value="Lain-lain">Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tarikh Ketidakhadiran
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Nama Klinik / Keterangan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Rawatan demam dan rehat sakit di Klinik Kesihatan Jalan Masjid..."
              className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          {/* Lampiran Fail MC */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lampiran Bukti (Sijil Sakit / Surat Rasmi)
            </label>
            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/40 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                <Paperclip className="w-4 h-4 text-rose-600" />
                <span className="font-mono text-xs">{fileName}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                PDF atau Gambar (PNG, JPG) maks 5MB
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Hantar Surat Tunjuk Sebab</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
