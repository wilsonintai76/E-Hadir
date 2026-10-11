import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  ScanFace,
  ShieldCheck,
  ShieldAlert,
  X,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Lock,
  Sparkles,
  UserCheck,
  RefreshCw,
  Clock,
  MapPin
} from 'lucide-react';
import { CourseSession, StudentProfile, AuthAccount, DeviceBinding } from '../../types/attendance';
import {
  getEnrolledBiometrics,
  BiometricProfile,
  authenticateWithWebAuthn,
  checkHardwareBiometricSupport
} from '../../utils/biometric';
import { playCheckInChime } from '../../utils/geo';

interface BiometricVerifyModalProps {
  course: CourseSession | null;
  student: StudentProfile;
  currentAccount: AuthAccount;
  deviceBinding: DeviceBinding;
  distance: number;
  geofenceRadius: number;
  onSuccess: (courseId: string) => void;
  onClose: () => void;
  onFlagAnomaly?: (
    reason: 'GPS_DRIFT' | 'EXPIRED_TOTP' | 'DEVICE_MISMATCH' | 'EXTERNAL_EMAIL',
    details: string
  ) => void;
}

export const BiometricVerifyModal: React.FC<BiometricVerifyModalProps> = ({
  course,
  student,
  currentAccount,
  deviceBinding,
  distance,
  geofenceRadius,
  onSuccess,
  onClose,
  onFlagAnomaly,
}) => {
  const [stage, setStage] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face_id'>('fingerprint');
  const [enrollee, setEnrollee] = useState<BiometricProfile | null>(null);
  const [webAuthnStatus, setWebAuthnStatus] = useState<string>('Menunggu pengesahan sensor peranti');

  useEffect(() => {
    // Check hardware type
    checkHardwareBiometricSupport().then((support) => {
      if (support.type === 'face_id') {
        setBiometricType('face_id');
      }
    });

    // Lookup student biometric credential
    const enrollees = getEnrolledBiometrics();
    const found =
      enrollees.find(
        (e) =>
          e.matricOrStaffId.toUpperCase() === student.id.toUpperCase() ||
          e.matricOrStaffId.toUpperCase() === currentAccount.linkedMatric?.toUpperCase()
      ) || enrollees[0];

    setEnrollee(found || null);
  }, [student.id, currentAccount.linkedMatric]);

  if (!course) return null;

  // Anti-Proxy Checks
  const isExternalAccount = !currentAccount.isPoliteknikDomain;
  const isDeviceClash =
    deviceBinding.isLocked &&
    deviceBinding.registeredMatric &&
    currentAccount.linkedMatric &&
    currentAccount.linkedMatric !== deviceBinding.registeredMatric;

  const handleVerify = async () => {
    // 1. Guard against external spam accounts
    if (isExternalAccount) {
      setStage('error');
      setErrorMessage(
        'Akaun luar disekat. Hanya emel rasmi @siswa.poliku.edu.my boleh mengesahkan identiti.'
      );
      onFlagAnomaly?.(
        'EXTERNAL_EMAIL',
        `Percubaan pengesahan identiti biometrik oleh akaun luar: ${currentAccount.email}`
      );
      return;
    }

    // 2. Guard against device buddy punching
    if (isDeviceClash) {
      setStage('error');
      setErrorMessage(
        `Kunci Anti-Proxy Aktif: Peranti ini terikat kepada ${deviceBinding.registeredMatric}. Imbasan bagi pihak rakan dilarang.`
      );
      onFlagAnomaly?.(
        'DEVICE_MISMATCH',
        `Percubaan joki: ${currentAccount.linkedMatric} pada telefon terikat ${deviceBinding.registeredMatric}`
      );
      return;
    }

    setStage('scanning');
    setErrorMessage('');
    setWebAuthnStatus('Memanggil Web Authentication API (navigator.credentials.get)...');

    // Trigger biometric check
    try {
      const matricToVerify = student.id || currentAccount.linkedMatric || '05DKM23F1012';

      setTimeout(async () => {
        setStage('verifying');
        setWebAuthnStatus('Mengesahkan tandatangan kriptografi FIDO2/WebAuthn peranti...');

        const result = await authenticateWithWebAuthn(matricToVerify);

        if (result.success) {
          setStage('success');
          setWebAuthnStatus('Identiti Berjaya Disahkan (Kunci Kriptografi Sah)');
          try {
            playCheckInChime();
          } catch {
            // chime audio ignore
          }

          setTimeout(() => {
            onSuccess(course.id);
          }, 900);
        } else {
          setStage('error');
          setErrorMessage(result.error || 'Pengecaman biometrik gagal. Sila cuba lagi.');
        }
      }, 1100);
    } catch {
      setStage('error');
      setErrorMessage('Ralat komunikasi dengan sensor biometrik perkakasan.');
    }
  };

  const isInRange = distance <= geofenceRadius;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-emerald-900/60 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {biometricType === 'face_id' ? (
                <ScanFace className="w-5 h-5" />
              ) : (
                <Fingerprint className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Anti-Proxy Protection
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                  WebAuthn API
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-white">
                Pengesahan Identiti Pelajar
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Target Course Pill */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-900">
                {course.code} ({course.section})
              </span>
              <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                {course.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-500" />
                <span>{course.startTime} - {course.endTime}</span>
                <span>· {course.contactHoursPerWeek} Jam</span>
              </p>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isInRange
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                }`}
              >
                {distance}m {isInRange ? '(Dalam Zon)' : '(Luar Zon)'}
              </span>
            </div>
          </div>

          {/* Student Identity Card Binding */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 shadow-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-extrabold text-slate-900 dark:text-white truncate text-xs">
                  {student.name}
                </p>
              </div>
              <p className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300">
                Matrik: {student.id} · {student.classGroup}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {enrollee?.deviceName || 'Sensor Biometrik Peranti Pelajar'}
              </p>
            </div>
          </div>

          {/* Biometric Interactive Scanner Orb */}
          <div className="py-4 flex flex-col items-center justify-center text-center">
            <div className="relative mb-3">
              {/* Outer Pulse Circles */}
              {stage === 'scanning' && (
                <>
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                  <div className="absolute -inset-3 rounded-full border-2 border-emerald-500/40 animate-pulse" />
                </>
              )}
              {stage === 'verifying' && (
                <div className="absolute -inset-3 rounded-full border-2 border-indigo-500/60 animate-spin border-t-transparent" />
              )}
              {stage === 'error' && (
                <div className="absolute -inset-2 rounded-full border-2 border-rose-500/50" />
              )}

              {/* Main Sensor Button */}
              <button
                type="button"
                onClick={handleVerify}
                disabled={stage === 'scanning' || stage === 'verifying' || stage === 'success'}
                aria-label="Sahkan Identiti Biometrik"
                className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-lg active:scale-95 ${
                  stage === 'idle'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-600/30 hover:scale-105 ring-4 ring-emerald-500/20 cursor-pointer'
                    : stage === 'scanning'
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white ring-8 ring-emerald-500/30'
                    : stage === 'verifying'
                    ? 'bg-indigo-600 text-white ring-8 ring-indigo-500/30'
                    : stage === 'success'
                    ? 'bg-emerald-600 text-white ring-8 ring-emerald-500/30 scale-105'
                    : 'bg-rose-600 text-white ring-8 ring-rose-500/30 cursor-pointer'
                }`}
              >
                {stage === 'idle' && (
                  <>
                    {biometricType === 'face_id' ? (
                      <ScanFace className="w-10 h-10 animate-bounce" />
                    ) : (
                      <Fingerprint className="w-10 h-10 animate-pulse" />
                    )}
                    <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">
                      Sentuh Sensor
                    </span>
                  </>
                )}

                {stage === 'scanning' && (
                  <>
                    <Fingerprint className="w-11 h-11 animate-pulse" />
                    <span className="text-[9px] font-mono mt-1 font-bold">Imbas...</span>
                  </>
                )}

                {stage === 'verifying' && (
                  <>
                    <RefreshCw className="w-9 h-9 animate-spin" />
                    <span className="text-[9px] font-mono mt-1 font-bold">WebAuthn...</span>
                  </>
                )}

                {stage === 'success' && (
                  <>
                    <CheckCircle2 className="w-11 h-11 stroke-[2.5]" />
                    <span className="text-[9px] font-bold mt-1">SAH!</span>
                  </>
                )}

                {stage === 'error' && (
                  <>
                    <AlertTriangle className="w-10 h-10" />
                    <span className="text-[9px] font-bold mt-1">Gagal</span>
                  </>
                )}
              </button>
            </div>

            {/* Instruction / Status Message */}
            <div className="space-y-1 max-w-xs">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {stage === 'idle' && 'Sentuh Sensor atau Tekan Butang Pengesahan'}
                {stage === 'scanning' && 'Membaca data sensor biometrik perkakasan...'}
                {stage === 'verifying' && 'Mengesahkan kelayakan Web Authentication (FIDO2)...'}
                {stage === 'success' && 'Identiti Sah! Merekod kehadiran sekarang...'}
                {stage === 'error' && 'Pengesahan Biometrik Ditolak'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {stage === 'idle' &&
                  'Pengesahan ini menjamin pelajar sendiri yang berada di bengkel, menghalang kehadiran proksi atau joki.'}
                {stage !== 'idle' && webAuthnStatus}
              </p>
            </div>

            {/* Error Message Box */}
            {stage === 'error' && (
              <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-200 text-left text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Amaran Keselamatan</p>
                  <p className="text-[11px] mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Security Guarantees Checklist */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Perlindungan Joki:</strong> Kunci kriptografi perkakasan disimpan dalam cip Secure Enclave / TPM peranti.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Pengesahan 2-Faktor:</strong> Gabungan koordinat GPS 150m + Sensor Biometrik pelajar.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition active:scale-95"
          >
            Batal
          </button>
          <button
            onClick={handleVerify}
            disabled={stage === 'scanning' || stage === 'verifying' || stage === 'success'}
            className="flex-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Fingerprint className="w-4 h-4" />
            <span>
              {stage === 'idle'
                ? 'Sahkan Identiti (Verify Identity)'
                : stage === 'error'
                ? 'Cuba Lagi'
                : 'Sedang Disahkan...'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
