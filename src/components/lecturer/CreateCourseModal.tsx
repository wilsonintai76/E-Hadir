import React, { useState } from 'react';
import { X, BookPlus, MapPin, Clock, ShieldCheck, Check } from 'lucide-react';
import { CourseSession } from '../../types/attendance';

interface CreateCourseModalProps {
  lecturerName: string;
  onSave: (newCourse: CourseSession) => void;
  onClose: () => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  lecturerName,
  onSave,
  onClose,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('DKM 4A');
  const [contactHours, setContactHours] = useState(3);
  const [totalWeeks, setTotalWeeks] = useState(14);
  const [venueKey, setVenueKey] = useState('bengkel_kimpalan');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('11:00');
  const [radius, setRadius] = useState(150);

  const venuePresets: Record<string, { name: string; detail: string; lat: number; lng: number }> = {
    bengkel_kimpalan: {
      name: 'Bengkel Kimpalan & Fabrikasi JKM',
      detail: 'Aras Bawah Blok Bengkel Mekanikal (KM22)',
      lat: 1.63085,
      lng: 110.23321,
    },
    makmal_cad: {
      name: 'Makmal CAD/CAM & Simulasi Komputer',
      detail: 'Aras 2 Blok Kuliah JKM',
      lat: 1.63120,
      lng: 110.23340,
    },
    bengkel_cnc: {
      name: 'Bengkel Pemesinan CNC JKM',
      detail: 'Pusat CNC & Larik, Blok C JKM',
      lat: 1.63085,
      lng: 110.23321,
    },
    makmal_termo: {
      name: 'Makmal Termodinamik & Enjin JKM',
      detail: 'Makmal Enjin & Automotif JKM',
      lat: 1.63095,
      lng: 110.23310,
    },
    dku: {
      name: 'Dewan Kuliah Utama PKS (DKU)',
      detail: 'Dewan Kuliah Utama PKS, Aras 1',
      lat: 1.63180,
      lng: 110.23250,
    },
  };

  const formatAmPm = (tStr: string) => {
    const [h, m] = tStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = (h % 12 || 12).toString().padStart(2, '0');
    return `${formattedH}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    if (!cleanCode || !cleanName) return;

    const chosenVenue = venuePresets[venueKey] || venuePresets.bengkel_kimpalan;
    const enrollCode = `JKM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCourse: CourseSession = {
      id: `${cleanCode}-${Date.now().toString(36).substring(3, 7).toUpperCase()}`,
      code: cleanCode,
      name: cleanName,
      section: section.trim().toUpperCase(),
      type: contactHours >= 3 ? 'Amali Bengkel' : 'Kuliah',
      lecturer: lecturerName,
      lecturerPhone: '+60 19-882 4192',
      venue: chosenVenue.name,
      venueDetail: chosenVenue.detail,
      day: 'Hari Ini',
      startTime: formatAmPm(startTime),
      endTime: formatAmPm(endTime),
      status: 'ongoing',
      contactHoursPerWeek: Number(contactHours),
      totalSemesterWeeks: Number(totalWeeks),
      currentWeekHoursTaught: 6 * Number(contactHours),
      studentAttendedHours: 5 * Number(contactHours),
      coords: {
        lat: chosenVenue.lat,
        lng: chosenVenue.lng,
        radius: Number(radius),
      },
      checkedIn: false,
      sessionPasscode: Math.floor(1000 + Math.random() * 9000).toString(),
      totalStudents: 30,
      presentCount: 0,
      sessionOpen: true,
      enrollmentCode: enrollCode,
    };

    onSave(newCourse);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Tambah Kursus Diajar
              </h3>
              <p className="text-[10px] text-slate-400">Pensyarah: {lecturerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Kod Kursus
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: DJJ40153"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Nama Kursus
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Mechanical Engineering Design"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Kelas
              </label>
              <input
                type="text"
                required
                value={section}
                onChange={(e) => setSection(e.target.value.toUpperCase())}
                placeholder="DKM 4A"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300" title="Jam Pertemuan Seminggu">
                Jam/Mggu
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={contactHours}
                onChange={(e) => setContactHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Minggu
              </label>
              <input
                type="number"
                min={1}
                max={18}
                value={totalWeeks}
                onChange={(e) => setTotalWeeks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Lokasi / Bengkel Mekanikal (PKS)
            </label>
            <select
              value={venueKey}
              onChange={(e) => setVenueKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="bengkel_kimpalan">Bengkel Kimpalan & Fabrikasi JKM (KM22)</option>
              <option value="makmal_cad">Makmal CAD/CAM & Simulasi Komputer</option>
              <option value="bengkel_cnc">Bengkel Pemesinan CNC JKM</option>
              <option value="makmal_termo">Makmal Termodinamik & Enjin JKM</option>
              <option value="dku">Dewan Kuliah Utama PKS (DKU)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Masa Mula
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Masa Tamat
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Radius Geofens Kelas
              </label>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {radius} meter
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={300}
              step={25}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold active:scale-95 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-900/20 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Kursus</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
