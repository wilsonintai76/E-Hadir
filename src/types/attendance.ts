export type UserRole = 'student' | 'lecturer';

export interface AuthAccount {
  email: string;
  name: string;
  isPoliteknikDomain: boolean; // true if ends with @poliku.edu.my or @siswa.poliku.edu.my
  domain: string;
  linkedMatric: string;
  role: UserRole;
  avatar: string;
}

export interface DeviceBinding {
  deviceId: string; // e.g. "DEV-JKM-8821F"
  deviceName: string; // e.g. "Chrome Mobile (Galaxy / iPhone)"
  registeredMatric: string; // matric number bound to this device
  boundAt: string;
  isLocked: boolean;
}

export interface AnomalyReport {
  id: string;
  studentName: string;
  matric: string;
  courseCode: string;
  reason: 'GPS_DRIFT' | 'EXPIRED_TOTP' | 'DEVICE_MISMATCH' | 'EXTERNAL_EMAIL' | 'LATE_ARRIVAL';
  details: string;
  timestamp: string;
  distance: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface StudentProfile {
  name: string;
  id: string; // Matric number e.g. 05DKM23F1012
  nric: string;
  department: string; // Jabatan Kejuruteraan Mekanikal (JKM)
  program: string; // Diploma Kejuruteraan Mekanikal (DKM)
  semester: number;
  classGroup: string; // DKM 4A
  academicAdvisor: string;
  advisorEmail: string;
  session: string; // Sesi II 2026/2027
  avatarUrl: string;
  totalClasses: number;
  attendedClasses: number;
  lateClasses: number;
  excusedClasses: number;
  absentClasses: number;
  totalTaughtHours: number; // e.g. 42 contact hours taught so far
  attendedHours: number;    // e.g. 39 contact hours attended
  attendanceRate: number;   // e.g. 92.8%
}

export interface LecturerProfile {
  name: string;
  staffId: string; // PKS-JKM-T042
  title: string; // Ts. Dr.
  department: string;
  office: string;
  email: string;
  phone: string;
  session: string;
  activeSessionsCount: number;
  totalStudentsEnrolled: number;
  avatarUrl: string;
}

export type ClassStatus = 'ongoing' | 'upcoming' | 'completed' | 'cancelled' | 'postponed';

export interface ClassPostponementInfo {
  isPostponed: boolean;
  reasonType: 'cuti_umum' | 'komitmen_pensyarah' | 'cuti_peristiwa' | 'penyelenggaraan_bengkel' | 'lain_lain';
  reasonTitle: string; // e.g. "Cuti Umum: Hari Malaysia" or "Kursus Akreditasi ETAC Pensyarah"
  postponedDate: string; // e.g. "Ahad, 15 Okt 2026"
  actionType: 'replacement_scheduled' | 'waived'; // 'replacement_scheduled' (Ada Kelas Ganti) or 'waived' (Pelepasan Jam - Tiada Penalti)
  replacementDate?: string; // e.g. "Sabtu, 24 Okt 2026"
  replacementStartTime?: string; // e.g. "09:00 AM"
  replacementEndTime?: string; // e.g. "12:00 PM"
  replacementVenue?: string; // e.g. "Bengkel Kimpalan & Fabrikasi JKM"
  notes?: string;
  updatedAt?: string;
}

export interface CourseSession {
  id: string;
  code: string;
  name: string;
  section: string; // DKM 4A, DKM 4B, etc.
  type: 'Amali Bengkel' | 'Kuliah' | 'Tutorial';
  lecturer: string;
  lecturerPhone: string;
  venue: string;
  venueDetail: string;
  day: string;
  startTime: string; // '08:00 AM'
  endTime: string;   // '10:00 AM'
  status: ClassStatus;
  contactHoursPerWeek: number; // e.g. 3 hours / week
  totalSemesterWeeks: number;  // 14 weeks
  currentWeekHoursTaught: number; // e.g. 18 hours
  studentAttendedHours: number;   // e.g. 18 hours
  coords: {
    lat: number;
    lng: number;
    radius: number; // in meters
  };
  checkedIn: boolean;
  checkInTime?: string;
  checkInMethod?: 'geofence' | 'qr_code' | 'passcode' | 'biometric';
  token?: string;
  sessionPasscode?: string; // 4-digit code e.g. "7492"
  totalStudents: number;
  presentCount: number;
  sessionOpen: boolean;
  enrollmentCode: string; // 6-char e.g. "JKM-3009"
  postponementInfo?: ClassPostponementInfo;
}

export interface StudentRosterItem {
  id: string;
  matric: string;
  name: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  time: string;
  dist: number;
  verified: boolean;
  method: string;
  attendedHours: number;
  totalHours: number;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  courseCode: string;
  courseName: string;
  venue: string;
  date: string;
  time: string;
  hours: string; // e.g. '3 Jam Pertemuan'
  distance: string;
  status: 'Hadir Tepat Masa' | 'Hadir Lewat' | 'Cuti Sakit / Bersebab' | 'Tidak Hadir' | string;
  token: string;
  method: string;
}

export interface PresetLocation {
  id: string;
  label: string;
  description: string;
  lat: number;
  lng: number;
  isWithinGeofence: boolean;
}

export interface ExcuseSubmission {
  id: string;
  courseCode: string;
  studentName?: string;
  studentMatric?: string;
  date: string;
  reason: 'Cuti Sakit (MC)' | 'Kecemasan Keluarga' | 'Mewakili Politeknik' | 'Kuarantin / Isolasi' | 'Lain-lain';
  notes: string;
  fileName?: string;
  status: 'Menunggu Kelulusan' | 'Diluluskan PA' | 'Ditolak';
  submittedAt: string;
}
