import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Compass,
  Hourglass,
  QrCode,
  Smartphone,
  GraduationCap,
  Wrench,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  Clock,
  ChevronRight,
  Fingerprint,
  ScanFace,
  Download,
  Lock,
  Sparkles
} from 'lucide-react';
import { AuthAccount, UserRole } from '../../types/attendance';
import { MOCK_ACCOUNTS } from '../../data/mockData';
import { BiometricAuthModal } from './BiometricAuthModal';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  getEnrolledBiometrics,
  BiometricProfile,
  authenticateWithWebAuthn,
  checkHardwareBiometricSupport
} from '../../utils/biometric';
import { usePWAInstall } from '../../utils/usePWAInstall';
import { playCheckInChime } from '../../utils/geo';

interface LandingLoginPageProps {
  onLogin: (account: AuthAccount, role: UserRole) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LandingLoginPage: React.FC<LandingLoginPageProps> = ({
  onLogin,
  theme,
  onToggleTheme,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [activeTab, setActiveTab] = useState<'sso' | 'matric' | 'biometric'>('sso');
  const [matricInput, setMatricInput] = useState('');

  // Biometric states
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricProfiles, setBiometricProfiles] = useState<BiometricProfile[]>([]);
  const [selectedBioMatric, setSelectedBioMatric] = useState('05DKM23F1012');
  const [bioScanState, setBioScanState] = useState<'idle' | 'scanning' | 'success'>('idle');

  // PWA detection
  const { isInstalled } = usePWAInstall();

  useEffect(() => {
    const list = getEnrolledBiometrics();
    setBiometricProfiles(list);
    if (list.length > 0) {
      setSelectedBioMatric(list[0].matricOrStaffId);
    }
  }, []);

  const handleQuickLogin = (accountKey: string) => {
    setEmailError('');
    const acc = MOCK_ACCOUNTS[accountKey];
    if (!acc) return;

    if (!acc.isPoliteknikDomain) {
      setEmailError(
        `Akaun Luar Ditolak: "${acc.email}" bukan emel rasmi @poliku.edu.my. Sistem anti-spam menyekat domain awam (Gmail/Yahoo).`
      );
      return;
    }

    onLogin(acc, acc.role);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    const email = customEmail.trim().toLowerCase();

    if (!email) {
      setEmailError('Sila masukkan alamat emel institusi anda.');
      return;
    }

    const isPoliteknik =
      email.endsWith('@poliku.edu.my') || email.endsWith('@siswa.poliku.edu.my');

    if (!isPoliteknik) {
      setEmailError(
        'Akses Ditolak: Hanya emel berdomain @poliku.edu.my atau @siswa.poliku.edu.my dibenarkan untuk log masuk ke sistem e-Hadir JKM.'
      );
      return;
    }

    const isLecturer = !email.includes('siswa');
    const matchedAccount: AuthAccount = {
      email,
      name: isLecturer ? 'Pensyarah JKM' : 'Pelajar DKM PKS',
      isPoliteknikDomain: true,
      domain: email.split('@')[1],
      linkedMatric: isLecturer ? 'PKS-JKM-STAFF' : '05DKM23F1012',
      role: isLecturer ? 'lecturer' : 'student',
      avatar: '/src/assets/images/student_id_photo_1791715503394.jpg',
    };

    onLogin(matchedAccount, matchedAccount.role);
  };

  const handleMatricLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    const matric = matricInput.trim().toUpperCase();

    if (!matric) {
      setEmailError('Sila masukkan No. Matrik Pendaftaran (cth: 05DKM23F1012).');
      return;
    }

    const simulatedEmail = `${matric.toLowerCase()}@siswa.poliku.edu.my`;
    const studentAcc: AuthAccount = {
      email: simulatedEmail,
      name: 'Muhammad Farhan bin Azlan',
      isPoliteknikDomain: true,
      domain: 'siswa.poliku.edu.my',
      linkedMatric: matric,
      role: 'student',
      avatar: '/src/assets/images/student_id_photo_1791715503394.jpg',
    };

    onLogin(studentAcc, 'student');
  };

  const handleTriggerInlineBiometric = async (matricId: string) => {
    setBioScanState('scanning');
    setEmailError('');

    try {
      setTimeout(async () => {
        const res = await authenticateWithWebAuthn(matricId);
        if (res.success && res.profile) {
          setBioScanState('success');
          try {
            playCheckInChime();
          } catch {
            // Audio ignore
          }

          setTimeout(() => {
            if (res.profile?.role === 'lecturer') {
              onLogin(MOCK_ACCOUNTS.lecturer_verified, 'lecturer');
            } else {
              const studentAcc: AuthAccount = {
                ...MOCK_ACCOUNTS.student_verified,
                linkedMatric: res.profile?.matricOrStaffId || '05DKM23F1012',
                name: res.profile?.name || 'Muhammad Farhan bin Azlan',
              };
              onLogin(studentAcc, 'student');
            }
          }, 600);
        } else {
          setBioScanState('idle');
          setEmailError(res.error || 'Pengesahan biometrik gagal.');
        }
      }, 900);
    } catch {
      setBioScanState('idle');
      setEmailError('Ralat peranti biometrik.');
    }
  };

  const activeBioProfile =
    biometricProfiles.find((b) => b.matricOrStaffId === selectedBioMatric) ||
    biometricProfiles[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-rose-600 selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-950 via-rose-900 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-950/20">
              <span className="font-extrabold text-sm tracking-tight font-mono">JKM</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  e-Hadir JKM
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-mono">
                  PKS
                </span>
                {isInstalled && (
                  <span className="hidden sm:inline-flex text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    PWA STANDALONE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Jabatan Kejuruteraan Mekanikal · Politeknik Kuching Sarawak
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* PWA Compact Install Trigger */}
            <PWAInstallButton variant="compact" />

            {/* Quick Biometric trigger */}
            <button
              onClick={() => setShowBiometricModal(true)}
              className="h-8 px-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition"
              title="Log Masuk Pantas Biometrik"
            >
              <Fingerprint className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">Biometrik</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:scale-95 transition"
              title={theme === 'dark' ? 'Mod Cerah' : 'Mod Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Login Container */}
      <main className="flex-1 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Campus Information & Trust Metrics */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>Sesi II 2026/2027 · Sistem Kehadiran Rasmi Kampus</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.15]">
                Pengesanan Kehadiran Pintar{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-800 via-rose-700 to-amber-600">
                  Kejuruteraan Mekanikal
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Sistem pengesahan kehadiran berasaskan geofens 150-meter di Kompleks Bengkel Mekanikal (KM22 Jalan Matang), pengesahan biometrik cap jari/wajah WebAuthn, dan sokongan aplikasi PWA luar talian.
              </p>
            </div>

            {/* Campus Workshop Banner & Ground Truth Info */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
              <img
                src="/src/assets/images/pks_workshop_banner_1791715516039.jpg"
                alt="Bengkel Mekanikal Politeknik Kuching Sarawak"
                className="w-full h-44 sm:h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-4">
                <div className="flex items-center gap-2 text-white">
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-[10px] font-bold font-mono tracking-wide shadow-sm">
                    GEOFENS 150M AKTIF
                  </span>
                  <span className="text-xs font-semibold text-slate-100 truncate">
                    Kompleks Bengkel & Makmal CAD/CNC JKM PKS
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-1 font-mono">
                  KM22 Jalan Matang, 93050 Kuching · 1.63085° U, 110.23321° T
                </p>
              </div>
            </div>

            {/* Feature Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-xs text-slate-900 dark:text-white">Biometrik & WebAuthn</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pengesahan identiti peranti tanpa kata laluan menggunakan cap jari & pengecaman wajah FIDO2.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-xs text-slate-900 dark:text-white">Geofens Kampus (150m)</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pengesahan radius automatik di Bengkel Fabrikasi, Makmal CAD & CNC PKS.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-xs text-slate-900 dark:text-white">Aplikasi PWA Luar Talian</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pasang ke skrin utama peranti. Kekal berfungsi walaupun talian data lemah di dalam dewan bengkel.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 shrink-0">
                  <Hourglass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-xs text-slate-900 dark:text-white">Kadar 80% Min SPMP</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pengiraan contact hours mingguan untuk kelayakan menduduki Peperiksaan Akhir.
                  </p>
                </div>
              </div>
            </div>

            {/* Campus Landmark Footer */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Kompleks Bengkel Mekanikal, KM22 Jalan Matang, 93050 Kuching</span>
            </div>
          </div>

          {/* Right Column: Portal Log Masuk Multi-Option (Google SSO, No Matrik, Biometrik, PWA) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/90 dark:border-slate-800 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    Portal Rasmi PKS
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Sistem Aktif
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  Log Masuk e-Hadir
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih kaedah pengesahan rasmi: Google SSO, No. Matrik, atau Biometrik peranti.
                </p>
              </div>

              {/* 3 Segmented Tabs: Google SSO, No Matrik, Biometrik */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('sso');
                    setEmailError('');
                  }}
                  className={`py-2 px-1 rounded-lg transition text-center truncate ${
                    activeTab === 'sso'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Emel PKS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('matric');
                    setEmailError('');
                  }}
                  className={`py-2 px-1 rounded-lg transition text-center truncate ${
                    activeTab === 'matric'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  No. Matrik
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('biometric');
                    setEmailError('');
                  }}
                  className={`py-2 px-1 rounded-lg transition text-center truncate flex items-center justify-center gap-1 ${
                    activeTab === 'biometric'
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-extrabold'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Biometrik</span>
                </button>
              </div>

              {/* TAB 1: Google SSO & Instant Demo Access */}
              {activeTab === 'sso' && (
                <div className="space-y-4">
                  <form onSubmit={handleCustomLogin} className="space-y-2.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Alamat Emel Google Workspace PKS
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="cth: 05dkm23f1012@siswa.poliku.edu.my"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-sm"
                    >
                      <span>Sahkan Log Masuk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* 1-Tap Quick Demo Logins & Biometric Quick Trigger */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Atau Akses Pantas (Pilihan Demonstrasi):
                    </p>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('student_verified')}
                      className="w-full text-left p-2.5 sm:p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950 transition active:scale-[0.99] flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                          <span className="font-extrabold text-xs text-rose-950 dark:text-rose-200">
                            Log Masuk Pelajar
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                          Muhammad Farhan · 05DKM23F1012 (DKM 4A)
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('lecturer_verified')}
                      className="w-full text-left p-2.5 sm:p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950 transition active:scale-[0.99] flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
                          <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
                            Log Masuk Pensyarah
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                          Ts. Dr. Zulkifli · PKS-JKM-T042
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0" />
                    </button>

                    {/* Biometric Trigger Card */}
                    <button
                      type="button"
                      onClick={() => setShowBiometricModal(true)}
                      className="w-full text-left p-2.5 sm:p-3 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100 transition active:scale-[0.99] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Fingerprint className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                            Log Masuk Biometrik (Cap Jari / Face ID)
                          </span>
                          <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
                            1-Ketik imbasan sensor tanpa taip emel
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                    </button>

                    {/* Anti-Spam Demo Tester */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('external_spam')}
                      className="w-full text-left p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-[11px] text-slate-600 dark:text-slate-400 transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        <span>Uji Sekatan Anti-Spam (Akaun Gmail Luar)</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">@gmail.com</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Matric Number Quick Access */}
              {activeTab === 'matric' && (
                <form onSubmit={handleMatricLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      No. Pendaftaran Pelajar (No. Matrik)
                    </label>
                    <input
                      type="text"
                      value={matricInput}
                      onChange={(e) => setMatricInput(e.target.value.toUpperCase())}
                      placeholder="05DKM23F1012"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <p className="text-[10px] text-slate-500">
                      Format standard Politeknik: Kod Program + Sesi + Angka Giliran (cth: 05DKM23F1012)
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-sm"
                  >
                    <span>Masuk sebagai Pelajar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* TAB 3: BIOMETRIK SIGN-IN OPTION */}
              {activeTab === 'biometric' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Kunci Peranti Terdaftar:
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        WebAuthn / FIDO2
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {biometricProfiles.map((p) => {
                        const isSelected = selectedBioMatric === p.matricOrStaffId;
                        return (
                          <button
                            key={p.matricOrStaffId}
                            type="button"
                            onClick={() => setSelectedBioMatric(p.matricOrStaffId)}
                            className={`p-2.5 rounded-xl border text-left transition ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold font-mono px-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                {p.role === 'lecturer' ? 'PENSYARAH' : 'PELAJAR'}
                              </span>
                              {p.type === 'fingerprint' ? (
                                <Fingerprint className="w-3.5 h-3.5 text-amber-600" />
                              ) : (
                                <ScanFace className="w-3.5 h-3.5 text-amber-600" />
                              )}
                            </div>
                            <p className="font-bold text-xs truncate mt-1.5">{p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}</p>
                            <p className="text-[10px] font-mono opacity-75">{p.matricOrStaffId}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Sensor Pad */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-amber-50/40 dark:from-slate-800/80 dark:to-slate-900 border border-amber-200/80 dark:border-amber-900/50 flex flex-col items-center justify-center text-center space-y-3">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        bioScanState === 'scanning'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 border-2 border-amber-500 animate-pulse scale-105'
                          : bioScanState === 'success'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 border-2 border-emerald-500 scale-105'
                          : 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 shadow-xs'
                      }`}
                    >
                      {bioScanState === 'success' ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                      ) : (
                        <Fingerprint className="w-8 h-8" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {bioScanState === 'scanning'
                          ? 'Mengimbas Cap Jari Peranti...'
                          : bioScanState === 'success'
                          ? 'Biometrik Disahkan!'
                          : `Sedia Mengimbas: ${activeBioProfile?.name}`}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {activeBioProfile?.deviceName}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={bioScanState !== 'idle'}
                      onClick={() => handleTriggerInlineBiometric(selectedBioMatric)}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
                    >
                      <Fingerprint className="w-4 h-4" />
                      <span>
                        {bioScanState === 'idle'
                          ? 'Sentuh Sensor untuk Masuk'
                          : 'Memproses Identiti...'}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBiometricModal(true)}
                    className="w-full py-2 text-center text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    Buka Pengimbas Biometrik Skrin Penuh
                  </button>
                </div>
              )}

              {/* Error Box */}
              {emailError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">{emailError}</p>
                </div>
              )}

              {/* Trust Badge Note */}
              <div className="pt-2 text-[10px] text-slate-400 dark:text-slate-500 text-center space-y-1">
                <p>Dilindungi oleh Dasar Keselamatan Siber Politeknik Kuching Sarawak</p>
                <p className="font-mono">PKS-JKM-AUTH-SECURE v2.4 · WebAuthn FIDO2</p>
              </div>
            </div>

            {/* PWA INSTALL OPTION CARD */}
            <PWAInstallButton variant="card" />
          </div>
        </div>
      </main>

      {/* Biometric Full Screen Modal */}
      {showBiometricModal && (
        <BiometricAuthModal
          onSuccess={(account, role) => {
            setShowBiometricModal(false);
            onLogin(account, role);
          }}
          onClose={() => setShowBiometricModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Jabatan Kejuruteraan Mekanikal, Politeknik Kuching Sarawak.</p>
          <p className="font-mono text-[11px] text-slate-400">
            Kementerian Pendidikan Tinggi Malaysia (KPT)
          </p>
        </div>
      </footer>
    </div>
  );
};
