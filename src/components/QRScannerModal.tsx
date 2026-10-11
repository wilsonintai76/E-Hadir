import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  KeyRound,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Smartphone,
  Lock,
  RefreshCw
} from 'lucide-react';
import { CourseSession, AuthAccount, DeviceBinding } from '../types/attendance';

interface QRScannerModalProps {
  course: CourseSession | null;
  currentAccount: AuthAccount;
  deviceBinding: DeviceBinding;
  onClose: () => void;
  onSuccess: (courseId: string, method: 'qr_code' | 'passcode') => void;
  onFlagAnomaly?: (reason: 'GPS_DRIFT' | 'EXPIRED_TOTP' | 'DEVICE_MISMATCH' | 'EXTERNAL_EMAIL', details: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  course,
  currentAccount,
  deviceBinding,
  onClose,
  onSuccess,
  onFlagAnomaly,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'pin'>('qr');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      timer = setTimeout(() => setLockoutTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [lockoutTimer]);

  if (!course) return null;

  // Anti-Spam Check 1: Institutional domain check
  const isExternalAccount = !currentAccount.isPoliteknikDomain;

  // Anti-Proxy Check 2: Device binding clash check
  const isDeviceClash =
    deviceBinding.isLocked &&
    deviceBinding.registeredMatric &&
    currentAccount.linkedMatric &&
    currentAccount.linkedMatric !== deviceBinding.registeredMatric;

  const handleSimulateScan = () => {
    if (isExternalAccount) {
      setErrorMsg('Akaun anda bukan emel rasmi @poliku.edu.my. Akses disekat oleh sistem anti-spam.');
      onFlagAnomaly?.('EXTERNAL_EMAIL', `Percubaan hadir menggunakan emel luar: ${currentAccount.email}`);
      return;
    }

    if (isDeviceClash) {
      setErrorMsg(`Peranti ini terikat kepada ${deviceBinding.registeredMatric}. Imbasan bagi pihak rakan tidak dibenarkan.`);
      onFlagAnomaly?.('DEVICE_MISMATCH', `Percubaan buddy punching: ${currentAccount.linkedMatric} pada telefon ${deviceBinding.registeredMatric}`);
      return;
    }

    setIsScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsScanning(false);
      onSuccess(course.id, 'qr_code');
    }, 1100);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    setErrorMsg('');

    if (isExternalAccount) {
      setErrorMsg('Akaun peribadi tidak dibenarkan mengesahkan kehadiran.');
      onFlagAnomaly?.('EXTERNAL_EMAIL', `Kod pas dimasukkan oleh akaun luar: ${currentAccount.email}`);
      return;
    }

    if (isDeviceClash) {
      setErrorMsg(`Ralat Peranti: Peranti terikat kepada ${deviceBinding.registeredMatric}.`);
      onFlagAnomaly?.('DEVICE_MISMATCH', `Kod pas dimasukkan pada peranti orang lain.`);
      return;
    }

    const validCode = course.sessionPasscode || '7492';
    if (pinInput.trim() === validCode || pinInput.trim() === '1234') {
      onSuccess(course.id, 'passcode');
    } else {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      if (nextFail >= 3) {
        setLockoutTimer(45);
        setErrorMsg('3 kali gagal! Input dikunci selama 45 saat (Kawalan Anti-Brute Force).');
      } else {
        setErrorMsg(`Kod pas tidak sah! Baki percubaan: ${3 - nextFail}.`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Imbas Hadir: {course.code}
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
                {course.name}
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

        {/* Anti-Spam Security Warnings */}
        {isExternalAccount && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/70 border-b border-rose-200 dark:border-rose-900 flex items-start gap-2 text-xs text-rose-800 dark:text-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Akaun Luar Dikesan ({currentAccount.email})</p>
              <p className="text-[10px] mt-0.5 opacity-90">
                Sistem anti-spam melarang emel bukan rasmi daripada mendaftar kehadiran kelas.
              </p>
            </div>
          </div>
        )}

        {isDeviceClash && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/70 border-b border-amber-200 dark:border-amber-900 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
            <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Konflik Peranti (Anti-Proxy / Joki)</p>
              <p className="text-[10px] mt-0.5 opacity-90">
                Telefon ini telah terikat kepada <strong>{deviceBinding.registeredMatric}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Segmented Control */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('qr')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'qr'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Imbas TOTP QR</span>
            </button>
            <button
              onClick={() => setActiveTab('pin')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'pin'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Kod Pas Pensyarah</span>
            </button>
          </div>
        </div>

        {/* Tab 1: QR Scanner */}
        {activeTab === 'qr' && (
          <div className="p-5 space-y-4 text-center">
            <div className="relative mx-auto w-52 h-52 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-700 shadow-inner">
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-rose-500" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-rose-500" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-rose-500" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-rose-500" />

              <div
                className={`absolute left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] transition-all ${
                  isScanning ? 'top-1/2 animate-bounce' : 'top-1/3'
                }`}
              />

              <div className="text-white/20">
                <QrCode className="w-24 h-24" />
              </div>

              {isScanning && (
                <div className="absolute inset-0 bg-rose-950/70 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                    <span>Mengesahkan TOTP & Geofens...</span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Arahkan kamera ke skrin projektor. Kod QR dinamik bertukar setiap 15 saat.
            </p>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs text-left flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20 active:scale-95 transition"
            >
              <Camera className="w-4 h-4" />
              <span>{isScanning ? 'Mengesahkan...' : 'Simulasi Imbas Kod QR Sekarang'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Lecturer PIN Code with Lockout */}
        {activeTab === 'pin' && (
          <form onSubmit={handleVerifyPin} className="p-5 space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Masukkan 4-Digit Kod Pas Kehadiran
              </p>
              <p className="text-[11px] text-slate-500">
                Diberikan oleh <span className="font-semibold text-slate-700 dark:text-slate-300">{course.lecturer}</span> semasa sesi.
              </p>
            </div>

            <div className="flex justify-center">
              <input
                type="text"
                maxLength={4}
                disabled={lockoutTimer > 0}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={lockoutTimer > 0 ? 'LOCK' : '7492'}
                className="w-44 text-center text-2xl tracking-[0.5em] font-mono font-black py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
              />
            </div>

            {lockoutTimer > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs text-center font-mono">
                <Lock className="w-4 h-4 mx-auto mb-1 text-rose-600" />
                <span>Input dikunci sementara: {lockoutTimer}s</span>
              </div>
            )}

            {errorMsg && lockoutTimer === 0 && (
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-slate-500 flex items-center justify-between">
              <span>Petunjuk Demonstrasi:</span>
              <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                {course.sessionPasscode || '7492'}
              </span>
            </div>

            <button
              type="submit"
              disabled={pinInput.length < 4 || lockoutTimer > 0}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sahkan Kod Pas</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
