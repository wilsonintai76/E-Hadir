/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { GeofenceBanner } from './components/GeofenceBanner';
import { CoursesTab } from './components/CoursesTab';
import { RadarMapTab } from './components/RadarMapTab';
import { HistoryTab } from './components/HistoryTab';
import { ProfileTab } from './components/ProfileTab';
import { BottomNav } from './components/BottomNav';
import { CheckInModal } from './components/CheckInModal';
import { QRScannerModal } from './components/QRScannerModal';
import { ExcuseModal } from './components/ExcuseModal';
import { Toast, ToastMessage } from './components/Toast';

// Auth & Anti-Spam Modal
import { AccountSwitchModal } from './components/auth/AccountSwitchModal';
import { LandingLoginPage } from './components/auth/LandingLoginPage';
import { BiometricVerifyModal } from './components/auth/BiometricVerifyModal';

// Lecturer Components & Modals
import { LecturerClassesTab } from './components/lecturer/LecturerClassesTab';
import { LecturerLiveRosterTab } from './components/lecturer/LecturerLiveRosterTab';
import { LecturerGeocontrolTab } from './components/lecturer/LecturerGeocontrolTab';
import { LecturerProfileTab } from './components/lecturer/LecturerProfileTab';
import { ProjectorQRModal } from './components/lecturer/ProjectorQRModal';
import { ClassQRModal } from './components/lecturer/ClassQRModal';
import { CreateCourseModal } from './components/lecturer/CreateCourseModal';
import { AddStudentModal } from './components/lecturer/AddStudentModal';
import { PostponeClassModal } from './components/lecturer/PostponeClassModal';

// Enrollment Modal
import { StudentScanModal } from './components/enrollment/StudentScanModal';

import {
  DEFAULT_STUDENT,
  DEFAULT_LECTURER,
  DEFAULT_ENROLLED_COURSE_IDS,
  SEMESTER_PARAMS,
  PRESET_LOCATIONS,
  INITIAL_COURSES,
  INITIAL_HISTORY,
  INITIAL_ROSTER,
  INITIAL_EXCUSES,
  MOCK_ACCOUNTS,
  DEFAULT_DEVICE_BINDING,
  INITIAL_ANOMALIES,
} from './data/mockData';
import {
  PKS_JKM_COORDS,
  calculateHaversineDistance,
  generateVerificationToken,
  playCheckInChime,
} from './utils/geo';
import {
  CourseSession,
  StudentProfile,
  LecturerProfile,
  StudentRosterItem,
  AttendanceRecord,
  ExcuseSubmission,
  UserRole,
  AuthAccount,
  DeviceBinding,
  AnomalyReport,
  ClassPostponementInfo,
} from './types/attendance';
import {
  Radar,
  Tv,
  Hourglass,
  ScanLine,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('ehadir_theme') as 'light' | 'dark') || 'light';
  });

  // User Authentication State: Landing Page Portal vs Authenticated Dashboard
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('ehadir_logged_in') === 'true';
  });

  // User Role: 'student' or 'lecturer'
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('ehadir_role') as UserRole) || 'student';
  });

  // Active Signed-in Google Account (Simulated Institutional Identity)
  const [currentAccount, setCurrentAccount] = useState<AuthAccount>(() => {
    const saved = localStorage.getItem('ehadir_account');
    return saved ? JSON.parse(saved) : MOCK_ACCOUNTS.student_verified;
  });

  // Device Binding State (Anti-Proxy Buddy Punching)
  const [deviceBinding, setDeviceBinding] = useState<DeviceBinding>(() => {
    const saved = localStorage.getItem('ehadir_device_binding');
    return saved ? JSON.parse(saved) : DEFAULT_DEVICE_BINDING;
  });

  // Anomaly Reports Queue (Anti-Spam & Flagged Stream)
  const [anomalies, setAnomalies] = useState<AnomalyReport[]>(() => {
    const saved = localStorage.getItem('ehadir_anomalies');
    return saved ? JSON.parse(saved) : INITIAL_ANOMALIES;
  });

  // Device Layout toggle for desktop testing
  const [isDesktopMultiColumn, setIsDesktopMultiColumn] = useState<boolean>(true);

  // Active Tab
  const [currentTab, setCurrentTab] = useState<string>(() => {
    return role === 'lecturer' ? 'classes' : 'courses';
  });

  // GPS & Location state
  const [gpsMode, setGpsMode] = useState<'simulation' | 'live'>('simulation');
  const [currentPresetId, setCurrentPresetId] = useState<string>('bengkel');
  const [userLat, setUserLat] = useState<number>(PRESET_LOCATIONS.bengkel.lat);
  const [userLng, setUserLng] = useState<number>(PRESET_LOCATIONS.bengkel.lng);
  const [accuracy, setAccuracy] = useState<number>(4);

  // Lecturer Geofence & Session Controls
  const [lecturerGeofenceRadius, setLecturerGeofenceRadius] = useState<number>(() => {
    const saved = localStorage.getItem('ehadir_geofence_radius');
    return saved ? Number(saved) : 150;
  });
  const [allowGracePeriod, setAllowGracePeriod] = useState<boolean>(true);
  const [selectedClassId, setSelectedClassId] = useState<string>('DJJ30093');

  // Student Enrolled Course IDs
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ehadir_enrolled_courses');
    return saved ? JSON.parse(saved) : DEFAULT_ENROLLED_COURSE_IDS;
  });

  // Core Data states
  const [student, setStudent] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('ehadir_student');
    return saved ? JSON.parse(saved) : DEFAULT_STUDENT;
  });

  const [lecturer] = useState<LecturerProfile>(() => {
    return DEFAULT_LECTURER;
  });

  const [courses, setCourses] = useState<CourseSession[]>(() => {
    const saved = localStorage.getItem('ehadir_courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [roster, setRoster] = useState<StudentRosterItem[]>(() => {
    const saved = localStorage.getItem('ehadir_roster');
    return saved ? JSON.parse(saved) : INITIAL_ROSTER;
  });

  const [history, setHistory] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('ehadir_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  const [excuses, setExcuses] = useState<ExcuseSubmission[]>(() => {
    const saved = localStorage.getItem('ehadir_excuses');
    return saved ? JSON.parse(saved) : INITIAL_EXCUSES;
  });

  // Modal states
  const [activeSlipCourse, setActiveSlipCourse] = useState<CourseSession | null>(null);
  const [activeQRCourse, setActiveQRCourse] = useState<CourseSession | null>(null);
  const [activeBiometricCourse, setActiveBiometricCourse] = useState<CourseSession | null>(null);
  const [projectorCourse, setProjectorCourse] = useState<CourseSession | null>(null);
  const [classQRCourse, setClassQRCourse] = useState<CourseSession | null>(null);
  const [postponeCourse, setPostponeCourse] = useState<CourseSession | null>(null);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [showStudentScanModal, setShowStudentScanModal] = useState<boolean>(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState<boolean>(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [showExcuseModal, setShowExcuseModal] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ehadir_theme', theme);
  }, [theme]);

  // Persist states
  useEffect(() => {
    localStorage.setItem('ehadir_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('ehadir_account', JSON.stringify(currentAccount));
  }, [currentAccount]);

  useEffect(() => {
    localStorage.setItem('ehadir_device_binding', JSON.stringify(deviceBinding));
  }, [deviceBinding]);

  useEffect(() => {
    localStorage.setItem('ehadir_anomalies', JSON.stringify(anomalies));
  }, [anomalies]);

  useEffect(() => {
    localStorage.setItem('ehadir_geofence_radius', String(lecturerGeofenceRadius));
  }, [lecturerGeofenceRadius]);

  useEffect(() => {
    localStorage.setItem('ehadir_enrolled_courses', JSON.stringify(enrolledCourseIds));
  }, [enrolledCourseIds]);

  useEffect(() => {
    localStorage.setItem('ehadir_student', JSON.stringify(student));
  }, [student]);

  useEffect(() => {
    localStorage.setItem('ehadir_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('ehadir_roster', JSON.stringify(roster));
  }, [roster]);

  useEffect(() => {
    localStorage.setItem('ehadir_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('ehadir_excuses', JSON.stringify(excuses));
  }, [excuses]);

  // Toast Helper
  const addToast = (title: string, description: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      description,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Compute live geofence distance to PKS Mechanical Workshop
  const distanceToCenter = useMemo(() => {
    return calculateHaversineDistance(
      userLat,
      userLng,
      PKS_JKM_COORDS.lat,
      PKS_JKM_COORDS.lng
    );
  }, [userLat, userLng]);

  const activeRadiusThreshold = lecturerGeofenceRadius;
  const isInRange = distanceToCenter <= activeRadiusThreshold;

  const activeLecturerCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedClassId) || courses[0];
  }, [courses, selectedClassId]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = (account: AuthAccount, newRole: UserRole) => {
    setCurrentAccount(account);
    setRole(newRole);
    setIsLoggedIn(true);
    localStorage.setItem('ehadir_logged_in', 'true');
    localStorage.setItem('ehadir_account', JSON.stringify(account));
    localStorage.setItem('ehadir_role', newRole);

    if (newRole === 'student') {
      if (account.linkedMatric) {
        setStudent((prev) => ({
          ...prev,
          id: account.linkedMatric || prev.id,
          name: account.name,
        }));
      }
      setCurrentTab('courses');
    } else {
      setCurrentTab('classes');
    }

    addToast(
      'Log Masuk Berjaya',
      `Selamat datang, ${account.name}! Sesi portal ${newRole === 'lecturer' ? 'Pensyarah' : 'Pelajar'} disahkan.`,
      'success'
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('ehadir_logged_in');
    addToast(
      'Log Keluar Berjaya',
      'Anda telah kembali ke Laman Utama Portal Log Masuk e-Hadir JKM.',
      'info'
    );
  };

  const handleToggleRole = () => {
    const nextRole: UserRole = role === 'student' ? 'lecturer' : 'student';
    setRole(nextRole);
    setCurrentTab(nextRole === 'lecturer' ? 'classes' : 'courses');
    addToast(
      nextRole === 'lecturer' ? 'Mod Pensyarah Aktif' : 'Mod Pelajar Aktif',
      nextRole === 'lecturer'
        ? 'Papan pemuka pensyarah & pusat keselamatan anomali.'
        : 'Kembali ke paparan jadual dan kad matrik pelajar.',
      'info'
    );
  };

  // Account Switcher Handler
  const handleSelectAccount = (accountKey: string) => {
    const target = MOCK_ACCOUNTS[accountKey];
    if (!target) return;
    setCurrentAccount(target);

    // If external domain, show anti-spam warning immediately
    if (!target.isPoliteknikDomain) {
      addToast(
        'Akaun Luar Dikesan!',
        'Sistem anti-spam menyekat pendaftaran kehadiran bagi emel bukan rasmi (@gmail.com).',
        'error'
      );
    } else {
      addToast(
        'Akaun Disahkan',
        `Log masuk sebagai ${target.name} (${target.domain}).`,
        'success'
      );
    }
  };

  const handleToggleDeviceLock = () => {
    setDeviceBinding((prev) => {
      const nextLocked = !prev.isLocked;
      addToast(
        nextLocked ? 'Kunci Peranti Aktif' : 'Kunci Peranti Dimatikan',
        nextLocked
          ? 'Peranti kini terikat kepada no matrik tunggal (Anti-Proxy).'
          : 'Kunci dimatikan untuk tujuan demonstrasi pelbagai peranti.',
        'info'
      );
      return { ...prev, isLocked: nextLocked };
    });
  };

  // Anomaly Review Handlers
  const handleApproveAnomaly = (anomalyId: string) => {
    const anom = anomalies.find((a) => a.id === anomalyId);
    if (!anom) return;

    setAnomalies((prev) =>
      prev.map((a) => (a.id === anomalyId ? { ...a, status: 'approved' as const } : a))
    );

    // Update student in roster to present
    setRoster((prev) =>
      prev.map((s) =>
        s.matric === anom.matric
          ? {
              ...s,
              status: 'present' as const,
              time: anom.timestamp,
              verified: true,
              method: 'Pengecualian Pensyarah',
            }
          : s
      )
    );

    playCheckInChime();
    addToast('Pengecualian Diluluskan', `${anom.studentName} telah disahkan hadir secara manual.`, 'success');
  };

  const handleRejectAnomaly = (anomalyId: string) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === anomalyId ? { ...a, status: 'rejected' as const } : a))
    );
    addToast('Imbasan Ditolak', 'Imbasan anomali / spam telah disekat.', 'info');
  };

  const handleFlagAnomaly = (reason: 'GPS_DRIFT' | 'EXPIRED_TOTP' | 'DEVICE_MISMATCH' | 'EXTERNAL_EMAIL', details: string) => {
    const newAnom: AnomalyReport = {
      id: `anom-${Date.now()}`,
      studentName: currentAccount.name,
      matric: currentAccount.linkedMatric,
      courseCode: activeLecturerCourse.code,
      reason,
      details,
      timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
      distance: distanceToCenter,
      status: 'pending',
    };
    setAnomalies((prev) => [newAnom, ...prev]);
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_LOCATIONS[presetId];
    if (!preset) return;
    setGpsMode('simulation');
    setCurrentPresetId(presetId);
    setUserLat(preset.lat);
    setUserLng(preset.lng);
    setAccuracy(4);
    addToast('Lokasi Disimulasi', preset.description, 'info');
  };

  const handleToggleGpsMode = () => {
    if (gpsMode === 'simulation') {
      if (!navigator.geolocation) {
        addToast('GPS Tidak Disokong', 'Pelayar anda tidak menyokong Geolocation API.', 'error');
        return;
      }

      addToast('Mencari GPS...', 'Menghubungkan satelit lokasi peranti...', 'info');

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsMode('live');
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          setAccuracy(Math.round(pos.coords.accuracy));
          addToast(
            'GPS Sebenar Aktif',
            `Lokasi dikesan dengan ketepatan ±${Math.round(pos.coords.accuracy)} meter.`,
            'success'
          );
        },
        () => {
          addToast(
            'Kebenaran GPS Ditolak',
            'Sila dayakan kebenaran lokasi pada pelayar anda untuk mod langsung.',
            'error'
          );
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      handleSelectPreset('bengkel');
    }
  };

  const handleResetData = () => {
    localStorage.removeItem('ehadir_student');
    localStorage.removeItem('ehadir_courses');
    localStorage.removeItem('ehadir_roster');
    localStorage.removeItem('ehadir_history');
    localStorage.removeItem('ehadir_excuses');
    localStorage.removeItem('ehadir_enrolled_courses');
    localStorage.removeItem('ehadir_geofence_radius');
    localStorage.removeItem('ehadir_account');
    localStorage.removeItem('ehadir_device_binding');
    localStorage.removeItem('ehadir_anomalies');
    setStudent(DEFAULT_STUDENT);
    setCourses(INITIAL_COURSES);
    setRoster(INITIAL_ROSTER);
    setHistory(INITIAL_HISTORY);
    setExcuses(INITIAL_EXCUSES);
    setEnrolledCourseIds(DEFAULT_ENROLLED_COURSE_IDS);
    setLecturerGeofenceRadius(150);
    setCurrentAccount(MOCK_ACCOUNTS.student_verified);
    setDeviceBinding(DEFAULT_DEVICE_BINDING);
    setAnomalies(INITIAL_ANOMALIES);
    handleSelectPreset('bengkel');
    addToast('Data Ditetapkan Semula', 'Semua data kembali kepada nilai contoh lalai.', 'success');
  };

  // Student Check-In with Multi-Layer Anti-Spam Validation
  const handleCheckIn = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    // Layer 1: Anti-Spam Domain check
    if (!currentAccount.isPoliteknikDomain) {
      addToast(
        'Pendaftaran Disekat (Anti-Spam)',
        `Akaun luar (${currentAccount.email}) tidak dibenarkan hadir. Sila guna emel @poliku.edu.my.`,
        'error'
      );
      handleFlagAnomaly('EXTERNAL_EMAIL', `Percubaan hadir oleh emel bukan rasmi: ${currentAccount.email}`);
      return;
    }

    // Layer 2: Device binding check
    if (
      deviceBinding.isLocked &&
      deviceBinding.registeredMatric &&
      currentAccount.linkedMatric &&
      currentAccount.linkedMatric !== deviceBinding.registeredMatric
    ) {
      addToast(
        'Konflik Peranti (Anti-Proxy)',
        `Telefon ini terikat kepada ${deviceBinding.registeredMatric}. Anda tidak boleh hadir bagi pihak rakan.`,
        'error'
      );
      handleFlagAnomaly('DEVICE_MISMATCH', `Percubaan joki: ${currentAccount.linkedMatric} pada telefon ${deviceBinding.registeredMatric}`);
      return;
    }

    if (!course.sessionOpen) {
      addToast('Sesi Ditutup', 'Pensyarah telah mengunci penerimaan kehadiran bagi sesi ini.', 'error');
      return;
    }

    const dist = calculateHaversineDistance(
      userLat,
      userLng,
      course.coords.lat,
      course.coords.lng
    );

    // Layer 3: Geofence radius check
    if (dist > activeRadiusThreshold) {
      addToast(
        'Luar Lingkungan Geofens!',
        `Jarak anda ${dist}m ke bengkel (Had zon: ${activeRadiusThreshold}m). Gunakan Kod QR atau Kod Pas jika berada dalam kelas.`,
        'error'
      );
      handleFlagAnomaly('GPS_DRIFT', `Percubaan geofens pada jarak ${dist}m melebihi had ${activeRadiusThreshold}m`);
      setActiveQRCourse(course);
      return;
    }

    // Anti-Proxy Check: Trigger Biometric Verification (Web Authentication API)
    // before finalizing the attendance check-in process!
    setActiveBiometricCourse(course);
  };

  // Finalize Attendance Check-In after Web Authentication API (Biometric Check) succeeds
  const finalizeCheckInWithBiometric = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    setActiveBiometricCourse(null);

    const dist = calculateHaversineDistance(
      userLat,
      userLng,
      course.coords.lat,
      course.coords.lng
    );

    const token = generateVerificationToken(course.code);
    const timeStr = new Date().toLocaleTimeString('ms-MY', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateStr = `Hari Ini, ${new Date().toLocaleDateString('ms-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}`;

    const addedHours = course.contactHoursPerWeek || 3;

    const updatedCourses = courses.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          checkedIn: true,
          checkInTime: timeStr,
          checkInMethod: 'biometric' as const,
          token,
          presentCount: c.presentCount + 1,
          studentAttendedHours: c.studentAttendedHours + addedHours,
        };
      }
      return c;
    });

    const newRecord: AttendanceRecord = {
      id: `rec-${Date.now()}`,
      courseCode: course.code,
      courseName: course.name,
      venue: course.venue,
      date: dateStr,
      time: timeStr,
      hours: `${addedHours} Jam Pertemuan`,
      distance: `${dist} m`,
      status: `Hadir Penuh (${addedHours}/${addedHours} Jam)`,
      token,
      method: 'Biometrik WebAuthn (Anti-Proxy)',
    };

    setRoster((prev) =>
      prev.map((r) =>
        r.matric === student.id
          ? {
              ...r,
              status: 'present' as const,
              time: timeStr,
              dist,
              verified: true,
              attendedHours: r.attendedHours + addedHours,
              method: 'Biometrik WebAuthn Disahkan',
            }
          : r
      )
    );

    setCourses(updatedCourses);
    setHistory([newRecord, ...history]);

    setStudent((prev) => {
      const nextAttendedHours = prev.attendedHours + addedHours;
      return {
        ...prev,
        attendedClasses: prev.attendedClasses + 1,
        attendedHours: nextAttendedHours,
        attendanceRate: Number(((nextAttendedHours / prev.totalTaughtHours) * 100).toFixed(1)),
      };
    });

    playCheckInChime();
    const updatedCourse = updatedCourses.find((c) => c.id === courseId) || null;
    setActiveSlipCourse(updatedCourse);
    addToast(
      'Kehadiran Disahkan (Biometrik Sah)!',
      `${course.code}: Identiti pelajar disahkan melalui WebAuthn API (+${addedHours} jam).`,
      'success'
    );
  };

  // Student Verify with QR / PIN
  const handleVerifyQRorPin = (courseId: string, method: 'qr_code' | 'passcode') => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    setActiveQRCourse(null);

    const token = generateVerificationToken(course.code);
    const timeStr = new Date().toLocaleTimeString('ms-MY', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateStr = `Hari Ini, ${new Date().toLocaleDateString('ms-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}`;

    const addedHours = course.contactHoursPerWeek || 3;

    const updatedCourses = courses.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          checkedIn: true,
          checkInTime: timeStr,
          checkInMethod: method,
          token,
          presentCount: c.presentCount + 1,
          studentAttendedHours: c.studentAttendedHours + addedHours,
        };
      }
      return c;
    });

    const newRecord: AttendanceRecord = {
      id: `rec-${Date.now()}`,
      courseCode: course.code,
      courseName: course.name,
      venue: course.venue,
      date: dateStr,
      time: timeStr,
      hours: `${addedHours} Jam Pertemuan`,
      distance: `${distanceToCenter} m`,
      status: `Hadir Penuh (${addedHours}/${addedHours} Jam)`,
      token,
      method: method === 'qr_code' ? 'Imbasan TOTP QR' : 'Kod Pas Pensyarah',
    };

    setRoster((prev) =>
      prev.map((r) =>
        r.matric === student.id
          ? {
              ...r,
              status: 'present' as const,
              time: timeStr,
              dist: distanceToCenter,
              verified: true,
              attendedHours: r.attendedHours + addedHours,
              method: method === 'qr_code' ? 'Imbasan TOTP QR' : 'Kod Pas Pensyarah',
            }
          : r
      )
    );

    setCourses(updatedCourses);
    setHistory([newRecord, ...history]);

    setStudent((prev) => {
      const nextAttendedHours = prev.attendedHours + addedHours;
      return {
        ...prev,
        attendedClasses: prev.attendedClasses + 1,
        attendedHours: nextAttendedHours,
        attendanceRate: Number(((nextAttendedHours / prev.totalTaughtHours) * 100).toFixed(1)),
      };
    });

    playCheckInChime();
    const updatedCourse = updatedCourses.find((c) => c.id === courseId) || null;
    setActiveSlipCourse(updatedCourse);
    addToast(
      'Kehadiran Disahkan!',
      `${course.code}: +${addedHours} jam pertemuan disahkan melalui ${
        method === 'qr_code' ? 'Kod TOTP QR' : 'Kod Pas Pensyarah'
      }.`,
      'success'
    );
  };

  // Day 1 Course Enrollment
  const handleEnrollCourse = (course: CourseSession) => {
    if (!currentAccount.isPoliteknikDomain) {
      addToast('Akaun Disekat', 'Hanya emel rasmi @poliku.edu.my dibenarkan mendaftar kursus.', 'error');
      return;
    }

    const dist = calculateHaversineDistance(
      userLat,
      userLng,
      course.coords.lat,
      course.coords.lng
    );

    if (dist > (course.coords.radius || activeRadiusThreshold)) {
      addToast(
        'Pendaftaran Ditolak!',
        `Anda berada ${dist}m dari bengkel. Sila imbas QR di dalam kawasan bengkel.`,
        'error'
      );
      handleFlagAnomaly('GPS_DRIFT', `Percubaan pendaftaran kursus dari luar zon (${dist}m)`);
      return;
    }

    if (!enrolledCourseIds.includes(course.id)) {
      setEnrolledCourseIds((prev) => [...prev, course.id]);
    }

    const inRoster = roster.some((r) => r.matric === student.id);
    if (!inRoster) {
      const newRosterItem: StudentRosterItem = {
        id: `rost-${Date.now()}`,
        matric: student.id,
        name: student.name,
        status: 'present',
        time: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
        dist,
        verified: true,
        attendedHours: course.contactHoursPerWeek,
        totalHours: course.contactHoursPerWeek,
        method: 'Imbasan QR Hari Pertama',
      };
      setRoster((prev) => [newRosterItem, ...prev]);
    }

    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id
          ? { ...c, totalStudents: c.totalStudents + 1, presentCount: c.presentCount + 1 }
          : c
      )
    );

    setShowStudentScanModal(false);
    playCheckInChime();
    addToast(
      'Pendaftaran Berjaya!',
      `Anda telah didaftarkan ke dalam ${course.code} (${course.section}).`,
      'success'
    );
  };

  // Lecturer Course Creation
  const handleCreateCourse = (newCourse: CourseSession) => {
    setCourses((prev) => [newCourse, ...prev]);
    setSelectedClassId(newCourse.id);
    setShowCreateCourseModal(false);
    playCheckInChime();
    addToast(
      'Kursus Didaftarkan!',
      `${newCourse.code} (${newCourse.contactHoursPerWeek} jam/mggu) berjaya ditambah.`,
      'success'
    );
  };

  // Lecturer Course Deletion
  const handleDeleteCourse = (courseId: string) => {
    const target = courses.find((c) => c.id === courseId);
    if (!target) return;
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    if (selectedClassId === courseId) {
      const remaining = courses.filter((c) => c.id !== courseId);
      if (remaining.length > 0) setSelectedClassId(remaining[0].id);
    }
    addToast('Kursus Dipadam', `Kursus ${target.code} telah dikeluarkan daripada senarai.`, 'info');
  };

  // Lecturer Add Student to Roster
  const handleAddStudentToRoster = (matric: string, name: string) => {
    const newStudent: StudentRosterItem = {
      id: `rost-${Date.now()}`,
      matric,
      name,
      status: 'absent',
      time: '—',
      dist: 0,
      verified: true,
      attendedHours: 0,
      totalHours: activeLecturerCourse.currentWeekHoursTaught || 18,
      method: 'Didaftar Pensyarah',
    };
    setRoster((prev) => [newStudent, ...prev]);
    setCourses((prev) =>
      prev.map((c) =>
        c.id === selectedClassId ? { ...c, totalStudents: c.totalStudents + 1 } : c
      )
    );
    setShowAddStudentModal(false);
    playCheckInChime();
    addToast('Pelajar Didaftarkan', `${name} (${matric}) telah ditambah ke senarai kelas.`, 'success');
  };

  const handleRemoveStudentFromRoster = (studentId: string) => {
    const studentItem = roster.find((s) => s.id === studentId);
    if (!studentItem) return;
    setRoster((prev) => prev.filter((s) => s.id !== studentId));
    setCourses((prev) =>
      prev.map((c) =>
        c.id === selectedClassId
          ? {
              ...c,
              totalStudents: Math.max(0, c.totalStudents - 1),
              presentCount:
                studentItem.status === 'present'
                  ? Math.max(0, c.presentCount - 1)
                  : c.presentCount,
            }
          : c
      )
    );
    addToast('Pelajar Digugurkan', `${studentItem.name} telah digugurkan dari kelas.`, 'info');
  };

  const handleToggleSessionState = (classId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, sessionOpen: !c.sessionOpen } : c))
    );
    const target = courses.find((c) => c.id === classId);
    if (target) {
      addToast(
        target.sessionOpen ? 'Sesi Ditutup' : 'Sesi Dibuka',
        `Penerimaan kehadiran bagi ${target.code} kini ${
          !target.sessionOpen ? 'Aktif' : 'Telah Dikunci'
        }.`,
        !target.sessionOpen ? 'success' : 'info'
      );
    }
  };

  const handleSavePostponement = (
    courseId: string,
    postponement: ClassPostponementInfo | null
  ) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        if (!postponement) {
          // Revert back to active session
          return {
            ...c,
            status: 'ongoing',
            sessionOpen: true,
            postponementInfo: undefined,
          };
        }
        return {
          ...c,
          status: 'postponed',
          sessionOpen: false,
          postponementInfo: postponement,
        };
      })
    );

    const target = courses.find((c) => c.id === courseId);
    if (target) {
      if (postponement) {
        addToast(
          'Kelas Ditangguhkan!',
          `${target.code} (${target.section}): ${postponement.reasonTitle}. ${
            postponement.actionType === 'replacement_scheduled'
              ? `Kelas Ganti: ${postponement.replacementDate}`
              : 'Pelepasan jam SPMP.'
          }`,
          'info'
        );
      } else {
        addToast(
          'Penangguhan Dibatalkan',
          `${target.code} (${target.section}) dikembalikan ke jadual biasa.`,
          'info'
        );
      }
    }
  };

  const handleVerifyManually = (studentId: string) => {
    const studentItem = roster.find((s) => s.id === studentId);
    if (!studentItem) return;

    const timeStr = new Date().toLocaleTimeString('ms-MY', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const addedHours = activeLecturerCourse.contactHoursPerWeek || 3;

    setRoster((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: 'present' as const,
              time: timeStr,
              verified: true,
              attendedHours: Math.min(s.totalHours, s.attendedHours + addedHours),
              method: 'Manual Pensyarah',
            }
          : s
      )
    );

    setCourses((prev) =>
      prev.map((c) =>
        c.id === selectedClassId
          ? { ...c, presentCount: Math.min(c.totalStudents, c.presentCount + 1) }
          : c
      )
    );

    playCheckInChime();
    addToast(
      'Pengesahan Manual Selesai',
      `${studentItem.name} ditandai Hadir oleh Pensyarah.`,
      'success'
    );
  };

  const handleToggleStudentStatus = (studentId: string) => {
    const studentItem = roster.find((s) => s.id === studentId);
    if (!studentItem) return;

    if (studentItem.status === 'present') {
      setRoster((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                status: 'absent' as const,
                method: 'Dibatalkan Pensyarah',
              }
            : s
        )
      );
      setCourses((prev) =>
        prev.map((c) =>
          c.id === selectedClassId
            ? { ...c, presentCount: Math.max(0, c.presentCount - 1) }
            : c
        )
      );
      addToast('Status Dikemaskini', `Kehadiran bagi ${studentItem.name} dibatalkan.`, 'info');
    } else {
      handleVerifyManually(studentId);
    }
  };

  const handleApproveExcuse = (excuseId: string) => {
    setExcuses((prev) =>
      prev.map((e) => (e.id === excuseId ? { ...e, status: 'Diluluskan PA' as const } : e))
    );
    const targetExcuse = excuses.find((e) => e.id === excuseId);
    if (targetExcuse && targetExcuse.studentMatric) {
      setRoster((prev) =>
        prev.map((s) =>
          s.matric === targetExcuse.studentMatric
            ? { ...s, status: 'excused' as const, method: 'e-MC Diluluskan' }
            : s
        )
      );
    }
    addToast('e-MC Diluluskan', 'Permohonan cuti sakit telah diluluskan.', 'success');
  };

  const handleRejectExcuse = (excuseId: string) => {
    setExcuses((prev) =>
      prev.map((e) => (e.id === excuseId ? { ...e, status: 'Ditolak' as const } : e))
    );
    addToast('e-MC Ditolak', 'Permohonan telah ditolak oleh Penasihat Akademik.', 'info');
  };

  const handleSubmitExcuse = (submission: ExcuseSubmission) => {
    setExcuses([submission, ...excuses]);
    setShowExcuseModal(false);
    addToast(
      'Permohonan Dihantar!',
      `Surat tunjuk sebab bagi ${submission.courseCode} telah dihantar kepada Penasihat Akademik.`,
      'success'
    );
  };

  const pendingCount =
    role === 'student'
      ? courses.filter(
          (c) => enrolledCourseIds.includes(c.id) && c.status === 'ongoing' && !c.checkedIn
        ).length
      : roster.filter((r) => r.status === 'present').length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Toast toasts={toasts} onDismiss={dismissToast} />
        <LandingLoginPage
          onLogin={handleLogin}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Top Application Header */}
      <Header
        role={role}
        currentAccount={currentAccount}
        onToggleRole={handleToggleRole}
        onOpenAccountModal={() => setShowAccountModal(true)}
        onLogout={handleLogout}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        gpsMode={gpsMode}
        onToggleGpsMode={handleToggleGpsMode}
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetData={handleResetData}
        isDesktopView={isDesktopMultiColumn}
        onToggleDeviceView={() => setIsDesktopMultiColumn((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-8">
        {isDesktopMultiColumn ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Interactive Column */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <GeofenceBanner
                role={role}
                activeCourse={activeLecturerCourse}
                isInRange={isInRange}
                distance={distanceToCenter}
                radius={activeRadiusThreshold}
                gpsMode={gpsMode}
                currentPresetId={currentPresetId}
                onSelectPreset={handleSelectPreset}
                accuracy={accuracy}
              />

              {/* Student Role Tabs */}
              {role === 'student' && (
                <>
                  {currentTab === 'courses' && (
                    <CoursesTab
                      courses={courses}
                      enrolledCourseIds={enrolledCourseIds}
                      userLat={userLat}
                      userLng={userLng}
                      onCheckIn={handleCheckIn}
                      onViewSlip={setActiveSlipCourse}
                      onOpenQR={setActiveQRCourse}
                      onOpenStudentScanModal={() => setShowStudentScanModal(true)}
                    />
                  )}

                  {currentTab === 'radar' && (
                    <RadarMapTab
                      userLat={userLat}
                      userLng={userLng}
                      isInRange={isInRange}
                      distance={distanceToCenter}
                      gpsMode={gpsMode}
                      currentPresetId={currentPresetId}
                      onSelectPreset={handleSelectPreset}
                      onRecalibrateGps={handleToggleGpsMode}
                    />
                  )}

                  {currentTab === 'history' && (
                    <HistoryTab history={history} student={student} />
                  )}

                  {currentTab === 'profile' && (
                    <ProfileTab
                      student={student}
                      excuses={excuses}
                      onOpenExcuseModal={() => setShowExcuseModal(true)}
                    />
                  )}
                </>
              )}

              {/* Lecturer Role Tabs */}
              {role === 'lecturer' && (
                <>
                  {currentTab === 'classes' && (
                    <LecturerClassesTab
                      courses={courses}
                      selectedClassId={selectedClassId}
                      lecturerName={lecturer.name}
                      onSelectClass={setSelectedClassId}
                      onToggleSessionState={handleToggleSessionState}
                      onOpenProjectorQR={setProjectorCourse}
                      onOpenClassQR={setClassQRCourse}
                      onOpenCreateCourse={() => setShowCreateCourseModal(true)}
                      onDeleteCourse={handleDeleteCourse}
                      onOpenPostponeModal={setPostponeCourse}
                      onSwitchToLiveRoster={(cId) => {
                        setSelectedClassId(cId);
                        setCurrentTab('live');
                      }}
                    />
                  )}

                  {currentTab === 'live' && (
                    <LecturerLiveRosterTab
                      course={activeLecturerCourse}
                      roster={roster}
                      anomalies={anomalies}
                      geofenceRadius={activeRadiusThreshold}
                      onVerifyManually={handleVerifyManually}
                      onToggleStudentStatus={handleToggleStudentStatus}
                      onApproveAnomaly={handleApproveAnomaly}
                      onRejectAnomaly={handleRejectAnomaly}
                      onOpenProjectorQR={setProjectorCourse}
                      onOpenClassQR={setClassQRCourse}
                      onOpenAddStudentModal={() => setShowAddStudentModal(true)}
                      onRemoveStudent={handleRemoveStudentFromRoster}
                      onRefreshRoster={() =>
                        addToast('Status Disemak', 'Senarai roll call telah dikemaskini.', 'info')
                      }
                    />
                  )}

                  {currentTab === 'geocontrol' && (
                    <LecturerGeocontrolTab
                      radius={lecturerGeofenceRadius}
                      onUpdateRadius={setLecturerGeofenceRadius}
                      allowGracePeriod={allowGracePeriod}
                      onToggleGracePeriod={() => setAllowGracePeriod(!allowGracePeriod)}
                    />
                  )}

                  {currentTab === 'stats' && (
                    <LecturerProfileTab
                      lecturer={lecturer}
                      excuses={excuses}
                      onApproveExcuse={handleApproveExcuse}
                      onRejectExcuse={handleRejectExcuse}
                    />
                  )}
                </>
              )}
            </div>

            {/* Desktop Side Widget Column */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4 space-y-4 sticky top-20">
              {role === 'student' ? (
                <>
                  {currentTab !== 'radar' && (
                    <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Radar className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                            Radar Kampus PKS
                          </h3>
                        </div>
                        <button
                          onClick={() => setCurrentTab('radar')}
                          className="text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:underline"
                        >
                          Buka Peta Penuh
                        </button>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Zon Sasaran:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Bengkel JKM
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Jarak Semasa:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {distanceToCenter} meter
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Had Perimeter:</span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {activeRadiusThreshold} meter
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Anti-Spam Security Status Card */}
                  <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {currentAccount.isPoliteknikDomain ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                        )}
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          Status Integriti & Anti-Spam
                        </h4>
                      </div>
                      <button
                        onClick={() => setShowAccountModal(true)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Ubah Akaun
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Emel Siswa:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                          {currentAccount.email}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Peranti Terikat:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {deviceBinding.deviceId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Kunci Anti-Proxy:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {deviceBinding.isLocked ? 'Aktif (1 Telefon)' : 'Bebas'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Hours Summary Widget */}
                  <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hourglass className="w-4 h-4 text-rose-600" />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          Status Peperiksaan SPMP
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Minggu {SEMESTER_PARAMS.currentAcademicWeek}/14
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-sans">Jam Diajar:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {student.totalTaughtHours} Jam
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-sans">Jam Hadir:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {student.attendedHours} Jam
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 font-sans">Peratus Kehadiran:</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {student.attendanceRate}%
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowStudentScanModal(true)}
                      className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900 transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <ScanLine className="w-3.5 h-3.5" />
                      <span>Daftar Kursus Hari Pertama (QR)</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Anomaly Watch Widget for Lecturer */}
                  <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          Anomali & Anti-Spam
                        </h4>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        anomalies.filter(a => a.status === 'pending').length > 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {anomalies.filter(a => a.status === 'pending').length} Menunggu
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Sistem mengesan tangkap layar WhatsApp dan pelanggaran perimeter geofens secara automatik.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tv className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          Pancaran Projektor Dewan
                        </h4>
                      </div>
                      <button
                        onClick={() => setProjectorCourse(activeLecturerCourse)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Buka Skrin Penuh
                      </button>
                    </div>
                    <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900 space-y-1.5 text-xs">
                      <p className="font-bold text-indigo-950 dark:text-indigo-200">
                        {activeLecturerCourse.code} · {activeLecturerCourse.section}
                      </p>
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span>Kod Pas Semasa:</span>
                        <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                          {activeLecturerCourse.sessionPasscode || '7492'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span>Kod Akses Pelajar:</span>
                        <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                          {activeLecturerCourse.enrollmentCode || 'JKM-3009'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Perimeter Geofens Bengkel
                      </span>
                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {lecturerGeofenceRadius}m
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={350}
                      step={25}
                      value={lecturerGeofenceRadius}
                      onChange={(e) => setLecturerGeofenceRadius(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>50m</span>
                      <span>150m (Lalai)</span>
                      <span>350m</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Phone-frame centered view */
          <div className="max-w-md mx-auto space-y-4">
            <GeofenceBanner
              role={role}
              activeCourse={activeLecturerCourse}
              isInRange={isInRange}
              distance={distanceToCenter}
              radius={activeRadiusThreshold}
              gpsMode={gpsMode}
              currentPresetId={currentPresetId}
              onSelectPreset={handleSelectPreset}
              accuracy={accuracy}
            />

            {role === 'student' ? (
              <>
                {currentTab === 'courses' && (
                  <CoursesTab
                    courses={courses}
                    enrolledCourseIds={enrolledCourseIds}
                    userLat={userLat}
                    userLng={userLng}
                    onCheckIn={handleCheckIn}
                    onViewSlip={setActiveSlipCourse}
                    onOpenQR={setActiveQRCourse}
                    onOpenStudentScanModal={() => setShowStudentScanModal(true)}
                  />
                )}

                {currentTab === 'radar' && (
                  <RadarMapTab
                    userLat={userLat}
                    userLng={userLng}
                    isInRange={isInRange}
                    distance={distanceToCenter}
                    gpsMode={gpsMode}
                    currentPresetId={currentPresetId}
                    onSelectPreset={handleSelectPreset}
                    onRecalibrateGps={handleToggleGpsMode}
                  />
                )}

                {currentTab === 'history' && (
                  <HistoryTab history={history} student={student} />
                )}

                {currentTab === 'profile' && (
                  <ProfileTab
                    student={student}
                    excuses={excuses}
                    onOpenExcuseModal={() => setShowExcuseModal(true)}
                  />
                )}
              </>
            ) : (
              <>
                {currentTab === 'classes' && (
                  <LecturerClassesTab
                    courses={courses}
                    selectedClassId={selectedClassId}
                    lecturerName={lecturer.name}
                    onSelectClass={setSelectedClassId}
                    onToggleSessionState={handleToggleSessionState}
                    onOpenProjectorQR={setProjectorCourse}
                    onOpenClassQR={setClassQRCourse}
                    onOpenCreateCourse={() => setShowCreateCourseModal(true)}
                    onDeleteCourse={handleDeleteCourse}
                    onOpenPostponeModal={setPostponeCourse}
                    onSwitchToLiveRoster={(cId) => {
                      setSelectedClassId(cId);
                      setCurrentTab('live');
                    }}
                  />
                )}

                {currentTab === 'live' && (
                  <LecturerLiveRosterTab
                    course={activeLecturerCourse}
                    roster={roster}
                    anomalies={anomalies}
                    geofenceRadius={activeRadiusThreshold}
                    onVerifyManually={handleVerifyManually}
                    onToggleStudentStatus={handleToggleStudentStatus}
                    onApproveAnomaly={handleApproveAnomaly}
                    onRejectAnomaly={handleRejectAnomaly}
                    onOpenProjectorQR={setProjectorCourse}
                    onOpenClassQR={setClassQRCourse}
                    onOpenAddStudentModal={() => setShowAddStudentModal(true)}
                    onRemoveStudent={handleRemoveStudentFromRoster}
                    onRefreshRoster={() =>
                      addToast('Status Disemak', 'Senarai roll call telah dikemaskini.', 'info')
                    }
                  />
                )}

                {currentTab === 'geocontrol' && (
                  <LecturerGeocontrolTab
                    radius={lecturerGeofenceRadius}
                    onUpdateRadius={setLecturerGeofenceRadius}
                    allowGracePeriod={allowGracePeriod}
                    onToggleGracePeriod={() => setAllowGracePeriod(!allowGracePeriod)}
                  />
                )}

                {currentTab === 'stats' && (
                  <LecturerProfileTab
                    lecturer={lecturer}
                    excuses={excuses}
                    onApproveExcuse={handleApproveExcuse}
                    onRejectExcuse={handleRejectExcuse}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav on Mobile */}
      <BottomNav
        role={role}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingCount={pendingCount}
      />

      {/* Modals */}
      <CheckInModal
        course={activeSlipCourse}
        student={student}
        onClose={() => setActiveSlipCourse(null)}
      />

      <QRScannerModal
        course={activeQRCourse}
        currentAccount={currentAccount}
        deviceBinding={deviceBinding}
        onClose={() => setActiveQRCourse(null)}
        onSuccess={handleVerifyQRorPin}
        onFlagAnomaly={handleFlagAnomaly}
      />

      <BiometricVerifyModal
        course={activeBiometricCourse}
        student={student}
        currentAccount={currentAccount}
        deviceBinding={deviceBinding}
        distance={distanceToCenter}
        geofenceRadius={activeRadiusThreshold}
        onSuccess={finalizeCheckInWithBiometric}
        onClose={() => setActiveBiometricCourse(null)}
        onFlagAnomaly={handleFlagAnomaly}
      />

      {showExcuseModal && (
        <ExcuseModal
          courses={courses}
          onClose={() => setShowExcuseModal(false)}
          onSubmit={handleSubmitExcuse}
        />
      )}

      {showStudentScanModal && (
        <StudentScanModal
          courses={courses}
          enrolledCourseIds={enrolledCourseIds}
          userDistance={distanceToCenter}
          geofenceRadius={activeRadiusThreshold}
          onEnroll={handleEnrollCourse}
          onClose={() => setShowStudentScanModal(false)}
        />
      )}

      {classQRCourse && (
        <ClassQRModal
          course={classQRCourse}
          onClose={() => setClassQRCourse(null)}
        />
      )}

      {showCreateCourseModal && (
        <CreateCourseModal
          lecturerName={lecturer.name}
          onSave={handleCreateCourse}
          onClose={() => setShowCreateCourseModal(false)}
        />
      )}

      {showAddStudentModal && (
        <AddStudentModal
          onAddStudent={handleAddStudentToRoster}
          onClose={() => setShowAddStudentModal(false)}
        />
      )}

      {projectorCourse && (
        <ProjectorQRModal
          course={projectorCourse}
          presentCount={projectorCourse.presentCount}
          totalStudents={projectorCourse.totalStudents}
          onClose={() => setProjectorCourse(null)}
        />
      )}

      {postponeCourse && (
        <PostponeClassModal
          course={postponeCourse}
          onClose={() => setPostponeCourse(null)}
          onSavePostponement={handleSavePostponement}
        />
      )}

      {showAccountModal && (
        <AccountSwitchModal
          currentAccount={currentAccount}
          deviceBinding={deviceBinding}
          onSelectAccount={handleSelectAccount}
          onToggleDeviceLock={handleToggleDeviceLock}
          onClose={() => setShowAccountModal(false)}
        />
      )}
    </div>
  );
}
