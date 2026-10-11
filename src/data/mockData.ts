import {
  CourseSession,
  AttendanceRecord,
  PresetLocation,
  StudentProfile,
  LecturerProfile,
  StudentRosterItem,
  ExcuseSubmission,
  AuthAccount,
  DeviceBinding,
  AnomalyReport
} from '../types/attendance';

export const SEMESTER_PARAMS = {
  currentAcademicWeek: 6, // Minggu ke-6 daripada 14 minggu kuliah
  totalSemesterWeeks: 14, // 14 minggu pengajaran & pembelajaran aktif
  minAttendanceThreshold: 80.0, // 80% syarat menduduki Peperiksaan Akhir PKS
};

export const MOCK_ACCOUNTS: Record<string, AuthAccount> = {
  student_verified: {
    email: "05dkm23f1012@siswa.poliku.edu.my",
    name: "Muhammad Farhan bin Azlan",
    isPoliteknikDomain: true,
    domain: "siswa.poliku.edu.my",
    linkedMatric: "05DKM23F1012",
    role: "student",
    avatar: "/src/assets/images/student_id_photo_1791715503394.jpg"
  },
  student_friend: {
    email: "05dkm23f1004@siswa.poliku.edu.my",
    name: "Nur Aina binti Kamaruddin",
    isPoliteknikDomain: true,
    domain: "siswa.poliku.edu.my",
    linkedMatric: "05DKM23F1004",
    role: "student",
    avatar: "/src/assets/images/student_id_photo_1791715503394.jpg"
  },
  external_spam: {
    email: "mohd_gamer99@gmail.com",
    name: "Pengguna Luar (Gmail Biasa)",
    isPoliteknikDomain: false,
    domain: "gmail.com",
    linkedMatric: "TIADA_MATRIK",
    role: "student",
    avatar: ""
  },
  lecturer_verified: {
    email: "zulkifli@poliku.edu.my",
    name: "Ts. Dr. Zulkifli bin Hashim",
    isPoliteknikDomain: true,
    domain: "poliku.edu.my",
    linkedMatric: "PKS-JKM-T042",
    role: "lecturer",
    avatar: "/src/assets/images/student_id_photo_1791715503394.jpg"
  }
};

export const DEFAULT_DEVICE_BINDING: DeviceBinding = {
  deviceId: "DEV-JKM-8821F",
  deviceName: "Chrome Mobile (Galaxy A54 / Android)",
  registeredMatric: "05DKM23F1012",
  boundAt: "01 Jul 2026, 08:30 AM",
  isLocked: true
};

export const INITIAL_ANOMALIES: AnomalyReport[] = [
  {
    id: "anom-01",
    studentName: "Mohd Danial bin Iskandar",
    matric: "05DKM23F1031",
    courseCode: "DJJ30093",
    reason: "GPS_DRIFT",
    details: "Imbasan dikesan 640m dari Bengkel Mekanikal (Kawasan Kolej Kediaman Siswa). Melebihi radius zon 150m.",
    timestamp: "08:14 AM",
    distance: 640,
    status: "pending"
  },
  {
    id: "anom-02",
    studentName: "Wan Amirul Asyraf bin Wan Salleh",
    matric: "05DKM23F1049",
    courseCode: "DJJ30093",
    reason: "EXPIRED_TOTP",
    details: "Token imbasan lapuk (>45s). Disyaki gambar tangkap layar (screenshot) dihantar dari luar kelas.",
    timestamp: "08:26 AM",
    distance: 1250,
    status: "pending"
  }
];

export const DEFAULT_STUDENT: StudentProfile = {
  name: "Muhammad Farhan bin Azlan",
  id: "05DKM23F1012",
  nric: "040815-13-0941",
  department: "Jabatan Kejuruteraan Mekanikal (JKM)",
  program: "Diploma Kejuruteraan Mekanikal (DKM)",
  semester: 4,
  classGroup: "DKM 4A",
  academicAdvisor: "Ts. Dr. Zulkifli bin Hashim",
  advisorEmail: "zulkifli@poliku.edu.my",
  session: "Sesi II 2026/2027",
  avatarUrl: "/src/assets/images/student_id_photo_1791715503394.jpg",
  totalClasses: 36,
  attendedClasses: 34,
  lateClasses: 1,
  excusedClasses: 1,
  absentClasses: 0,
  totalTaughtHours: 42,
  attendedHours: 39,
  attendanceRate: 92.8,
};

export const DEFAULT_ENROLLED_COURSE_IDS: string[] = ['DJJ30093', 'MPU21032'];

export const DEFAULT_LECTURER: LecturerProfile = {
  name: "Ts. Dr. Zulkifli bin Hashim",
  staffId: "PKS-JKM-T042",
  title: "Ts. Dr.",
  department: "Jabatan Kejuruteraan Mekanikal",
  office: "Bilik Pensyarah Kanan Aras 1, Blok Pentadbiran JKM",
  email: "zulkifli@poliku.edu.my",
  phone: "+60 19-882 4192",
  session: "Sesi II 2026/2027",
  activeSessionsCount: 2,
  totalStudentsEnrolled: 58,
  avatarUrl: "/src/assets/images/student_id_photo_1791715503394.jpg"
};

export const PRESET_LOCATIONS: Record<string, PresetLocation> = {
  bengkel: {
    id: 'bengkel',
    label: 'Bengkel Fabrikasi JKM (Dalam Zon)',
    description: 'Kompleks Bengkel Kimpalan & Fabrikasi Aras Bawah (~15m)',
    lat: 1.63090,
    lng: 110.23315,
    isWithinGeofence: true
  },
  cad: {
    id: 'cad',
    label: 'Makmal CAD/CAM (Dalam Zon)',
    description: 'Aras 2 Blok Kuliah Kejuruteraan Mekanikal (~45m)',
    lat: 1.63120,
    lng: 110.23340,
    isWithinGeofence: true
  },
  asrama: {
    id: 'asrama',
    label: 'Kolej Siswa PKS (Luar Zon)',
    description: 'Kawasan Asrama Pelajar PKS (~620m dari bengkel)',
    lat: 1.63450,
    lng: 110.23710,
    isWithinGeofence: false
  },
  matang: {
    id: 'matang',
    label: 'Matang Jaya (Luar Kampus)',
    description: 'Pusat Komersial Matang Jaya (~10.4km jauh)',
    lat: 1.57500,
    lng: 110.31500,
    isWithinGeofence: false
  }
};

export const INITIAL_COURSES: CourseSession[] = [
  {
    id: 'DJJ30093',
    code: 'DJJ30093',
    name: 'Engineering Mechanics (Statics & Dynamics)',
    section: 'DKM 4A',
    type: 'Amali Bengkel',
    lecturer: 'Ts. Dr. Zulkifli bin Hashim',
    lecturerPhone: '+60 19-882 4192',
    venue: 'Bengkel Kimpalan & Fabrikasi JKM',
    venueDetail: 'Stesen 4, Aras Bawah Blok JKM',
    day: 'Ahad / Hari Ini',
    startTime: '08:00 AM',
    endTime: '11:00 AM',
    status: 'ongoing',
    contactHoursPerWeek: 3,
    totalSemesterWeeks: 14,
    currentWeekHoursTaught: 18,
    studentAttendedHours: 18,
    coords: {
      lat: 1.63085,
      lng: 110.23321,
      radius: 150
    },
    checkedIn: false,
    sessionPasscode: '7492',
    totalStudents: 28,
    presentCount: 23,
    sessionOpen: true,
    enrollmentCode: 'JKM-3009'
  },
  {
    id: 'DJJ30103',
    code: 'DJJ30103',
    name: 'Fluid Mechanics & Hydraulic Machines',
    section: 'DKM 4B',
    type: 'Kuliah',
    lecturer: 'En. Ahmad Faris bin Othman',
    lecturerPhone: '+60 13-810 5530',
    venue: 'Makmal CAD/CAM & Simulasi Komputer',
    venueDetail: 'Makmal 2, Aras 2 Blok JKM',
    day: 'Ahad / Hari Ini',
    startTime: '10:30 AM',
    endTime: '12:30 PM',
    status: 'ongoing',
    contactHoursPerWeek: 2,
    totalSemesterWeeks: 14,
    currentWeekHoursTaught: 12,
    studentAttendedHours: 10,
    coords: {
      lat: 1.63120,
      lng: 110.23340,
      radius: 150
    },
    checkedIn: false,
    sessionPasscode: '5814',
    totalStudents: 30,
    presentCount: 18,
    sessionOpen: true,
    enrollmentCode: 'JKM-3010'
  },
  {
    id: 'DJJ20053',
    code: 'DJJ20053',
    name: 'Workshop Technology & Machine Tools',
    section: 'DKM 2A',
    type: 'Amali Bengkel',
    lecturer: 'Pn. Dayang Norhafizah Awang',
    lecturerPhone: '+60 12-849 0113',
    venue: 'Bengkel Pemesinan CNC JKM',
    venueDetail: 'Pusat CNC & Larik, Blok C JKM',
    day: 'Ahad / Hari Ini',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    status: 'upcoming',
    contactHoursPerWeek: 4,
    totalSemesterWeeks: 14,
    currentWeekHoursTaught: 24,
    studentAttendedHours: 20,
    coords: {
      lat: 1.63085,
      lng: 110.23321,
      radius: 150
    },
    checkedIn: false,
    sessionPasscode: '3391',
    totalStudents: 26,
    presentCount: 0,
    sessionOpen: false,
    enrollmentCode: 'JKM-2005'
  },
  {
    id: 'MPU21032',
    code: 'MPU21032',
    name: 'Penghayatan Etika dan Peradaban',
    section: 'DKM 4A',
    type: 'Kuliah',
    lecturer: 'Ustaz Wan Mohd Firdaus',
    lecturerPhone: '+60 11-209 8812',
    venue: 'Dewan Kuliah Utama PKS (DKU)',
    venueDetail: 'Dewan Kuliah Utama, Aras 1',
    day: 'Ahad / Hari Ini',
    startTime: '07:30 AM',
    endTime: '09:30 AM',
    status: 'completed',
    contactHoursPerWeek: 2,
    totalSemesterWeeks: 14,
    currentWeekHoursTaught: 12,
    studentAttendedHours: 12,
    coords: {
      lat: 1.63180,
      lng: 110.23250,
      radius: 200
    },
    checkedIn: true,
    checkInTime: '07:34 AM',
    checkInMethod: 'geofence',
    token: 'PKS-JKM-9K23P',
    totalStudents: 32,
    presentCount: 31,
    sessionOpen: false,
    enrollmentCode: 'MPU-2103'
  },
  {
    id: 'DJJ40142',
    code: 'DJJ40142',
    name: 'Mechanical Engineering Project 1',
    section: 'DKM 5A',
    type: 'Tutorial',
    lecturer: 'Ts. Dr. Ling Sing Ting',
    lecturerPhone: '+60 14-382 7701',
    venue: 'Bilik Seminar JKM & Bilik R&D',
    venueDetail: 'Aras 3 Blok Pentadbiran JKM',
    day: 'Isnin / Esok',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    status: 'upcoming',
    contactHoursPerWeek: 2,
    totalSemesterWeeks: 14,
    currentWeekHoursTaught: 12,
    studentAttendedHours: 12,
    coords: {
      lat: 1.63110,
      lng: 110.23330,
      radius: 150
    },
    checkedIn: false,
    sessionPasscode: '9021',
    totalStudents: 24,
    presentCount: 0,
    sessionOpen: false,
    enrollmentCode: 'JKM-4014'
  }
];

export const INITIAL_ROSTER: StudentRosterItem[] = [
  {
    id: 'rost-1',
    matric: '05DKM23F1012',
    name: 'Muhammad Farhan bin Azlan',
    status: 'present',
    time: '08:04 AM',
    dist: 14,
    verified: true,
    attendedHours: 18,
    totalHours: 18,
    method: 'Geofens GPS',
  },
  {
    id: 'rost-2',
    matric: '05DKM23F1004',
    name: 'Nur Aina binti Kamaruddin',
    status: 'present',
    time: '08:02 AM',
    dist: 22,
    verified: true,
    attendedHours: 18,
    totalHours: 18,
    method: 'Geofens GPS',
  },
  {
    id: 'rost-3',
    matric: '05DKM23F1019',
    name: 'Brandon Anak Clement',
    status: 'present',
    time: '08:09 AM',
    dist: 45,
    verified: true,
    attendedHours: 15,
    totalHours: 18,
    method: 'Geofens GPS',
  },
  {
    id: 'rost-4',
    matric: '05DKM23F1025',
    name: 'Siti Nurhaliza binti Saperi',
    status: 'present',
    time: '08:12 AM',
    dist: 18,
    verified: true,
    attendedHours: 18,
    totalHours: 18,
    method: 'Geofens GPS',
  },
  {
    id: 'rost-5',
    matric: '05DKM23F1031',
    name: 'Mohd Danial bin Iskandar',
    status: 'absent',
    time: '—',
    dist: 640,
    verified: false,
    attendedHours: 12,
    totalHours: 18,
    method: 'Luar Zon (Kolej Siswa)',
  },
  {
    id: 'rost-6',
    matric: '05DKM23F1038',
    name: 'Alvin Lim Jian Hao',
    status: 'present',
    time: '08:15 AM',
    dist: 31,
    verified: true,
    attendedHours: 15,
    totalHours: 18,
    method: 'Geofens GPS',
  },
  {
    id: 'rost-7',
    matric: '05DKM23F1042',
    name: 'Dayangku Syazwani Awang',
    status: 'excused',
    time: '—',
    dist: 0,
    verified: true,
    attendedHours: 15,
    totalHours: 18,
    method: 'e-MC Diluluskan (Klinik Kesihatan)',
    notes: 'Demam & cuti sakit 1 hari disahkan PA'
  },
  {
    id: 'rost-8',
    matric: '05DKM23F1049',
    name: 'Wan Amirul Asyraf bin Wan Salleh',
    status: 'absent',
    time: '—',
    dist: 1250,
    verified: false,
    attendedHours: 9,
    totalHours: 18,
    method: 'Luar Radius Kampus',
  }
];

export const INITIAL_HISTORY: AttendanceRecord[] = [
  {
    id: 'rec-001',
    courseCode: 'MPU21032',
    courseName: 'Penghayatan Etika dan Peradaban',
    venue: 'Dewan Kuliah Utama PKS (DKU)',
    date: 'Hari Ini, 11 Okt 2026',
    time: '07:34 AM',
    hours: '2 Jam',
    distance: '32 m',
    status: 'Hadir Penuh (2/2 Jam)',
    token: 'PKS-JKM-9K23P',
    method: 'Geofens GPS'
  },
  {
    id: 'rec-002',
    courseCode: 'DJJ40142',
    courseName: 'Mechanical Engineering Project 1',
    venue: 'Bilik Seminar JKM',
    date: '08 Okt 2026',
    time: '09:12 AM',
    hours: '2 Jam',
    distance: '18 m',
    status: 'Hadir Penuh (2/2 Jam)',
    token: 'PKS-JKM-4F11A',
    method: 'Imbasan Kod QR'
  },
  {
    id: 'rec-003',
    courseCode: 'DJJ3122',
    courseName: 'Thermodynamics & Heat Transfer',
    venue: 'Makmal Termodinamik JKM',
    date: '07 Okt 2026',
    time: '02:04 PM',
    hours: '3 Jam',
    distance: '14 m',
    status: 'Hadir Penuh (3/3 Jam)',
    token: 'PKS-JKM-1Z89C',
    method: 'Geofens GPS'
  },
  {
    id: 'rec-004',
    courseCode: 'DJJ30093',
    courseName: 'Engineering Mechanics (Statics & Dynamics)',
    venue: 'Bengkel Kimpalan JKM',
    date: '05 Okt 2026',
    time: '08:14 AM',
    hours: '3 Jam',
    distance: '24 m',
    status: 'Hadir Lewat (3/3 Jam)',
    token: 'PKS-JKM-7Q22W',
    method: 'Kod Pas Pensyarah'
  },
  {
    id: 'rec-005',
    courseCode: 'DJJ30103',
    courseName: 'Fluid Mechanics & Hydraulic Machines',
    venue: 'Makmal CAD/CAM JKM',
    date: '02 Okt 2026',
    time: '10:31 AM',
    hours: '2 Jam',
    distance: '9 m',
    status: 'Hadir Penuh (2/2 Jam)',
    token: 'PKS-JKM-88B1K',
    method: 'Geofens GPS'
  },
  {
    id: 'rec-006',
    courseCode: 'DJJ20053',
    courseName: 'Workshop Technology & Machine Tools',
    venue: 'Bengkel Pemesinan CNC JKM',
    date: '28 Sep 2026',
    time: '02:00 PM',
    hours: '4 Jam',
    distance: '—',
    status: 'Cuti Sakit / Bersebab',
    token: 'PKS-EXC-MC449',
    method: 'e-MC Disahkan PA'
  }
];

export const INITIAL_EXCUSES: ExcuseSubmission[] = [
  {
    id: 'exc-01',
    courseCode: 'DJJ20053',
    studentName: 'Muhammad Farhan bin Azlan',
    studentMatric: '05DKM23F1012',
    date: '28 Sep 2026',
    reason: 'Cuti Sakit (MC)',
    notes: 'Demam panas & rawatan di Klinik Kesihatan Petra Jaya. Sijil sakit 1 hari dilampirkan.',
    fileName: 'sijil_cuti_sakit_kkpj_2809.pdf',
    status: 'Diluluskan PA',
    submittedAt: '28 Sep 2026, 04:15 PM'
  },
  {
    id: 'exc-02',
    courseCode: 'DJJ30093',
    studentName: 'Dayangku Syazwani Awang',
    studentMatric: '05DKM23F1042',
    date: '11 Okt 2026',
    reason: 'Cuti Sakit (MC)',
    notes: 'Rawatan kecemasan migrain di Klinik Kesihatan Matang Jaya. Lampiran MC bertarikh hari ini.',
    fileName: 'mc_klinik_matang_11okt.pdf',
    status: 'Menunggu Kelulusan',
    submittedAt: '11 Okt 2026, 07:45 AM'
  }
];
