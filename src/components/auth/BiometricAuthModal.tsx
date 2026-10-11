import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  ScanFace,
  ShieldCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Sparkles,
  Lock,
  UserCheck
} from 'lucide-react';
import { AuthAccount, UserRole } from '../../types/attendance';
import { MOCK_ACCOUNTS } from '../../data/mockData';
import {
  getEnrolledBiometrics,
  BiometricProfile,
  authenticateWithWebAuthn,
  checkHardwareBiometricSupport
} from '../../utils/biometric';
import { playCheckInChime } from '../../utils/geo';

interface BiometricAuthModalProps {
  onSuccess: (account: AuthAccount, role: UserRole) => void;
  onClose: () => void;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  onSuccess,
  onClose,
}) => {
  const [enrollees, setEnrollees] = useState<BiometricProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string>('05DKM23F1012');
  const [authStage, setAuthStage] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face_id'>('fingerprint');

  useEffect(() => {
    const list = getEnrolledBiometrics();
    setEnrollees(list);
    if (list.length > 0) {
      setSelectedId(list[0].matricOrStaffId);
      setBiometricType(list[0].type);
    }

    checkHardwareBiometricSupport().then((res) => {
      if (res.type === 'face_id') {
        setBiometricType('face_id');
      }
    });
  }, []);

  const handleStartScan = async () => {
    setAuthStage('scanning');
    setErrorMessage('');

    try {
      // Simulate/trigger WebAuthn
      const currentSelected = enrollees.find((e) => e.matricOrStaffId === selectedId) || enrollees[0];

      // Give 1.2s sensor animation
      setTimeout(async () => {
        setAuthStage('verifying');

        const result = await authenticateWithWebAuthn(selectedId);

        if (result.success && currentSelected) {
          setAuthStage('success');
          try {
            playCheckInChime();
          } catch {
            // Audio ignore
          }

          setTimeout(() => {
            if (currentSelected.role === 'lecturer') {
              onSuccess(MOCK_ACCOUNTS.lecturer_verified, 'lecturer');
            } else {
              const matchedAcc: AuthAccount = {
                ...MOCK_ACCOUNTS.student_verified,
                linkedMatric: currentSelected.matricOrStaffId,
                name: currentSelected.name,
              };
              onSuccess(matchedAcc, 'student');
            }
          }, 800);
        } else {
          setAuthStage('error');
          setErrorMessage(result.error || 'Pengesahan cap jari gagal. Sila cuba lagi.');
        }
      }, 1200);
    } catch {
      setAuthStage('error');
      setErrorMessage('Ralat sambungan perkakasan biometrik.');
    }
  };

  const selectedProfile = enrollees.find((e) => e.matricOrStaffId === selectedId) || enrollees[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-800 to-amber-600 flex items-center justify-center text-white shadow-xs">
              {biometricType === 'fingerprint' ? (
                <Fingerprint className="w-4 h-4" />
              ) : (
                <ScanFace className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Log Masuk Biometrik
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                WebAuthn / Touch ID / Face ID
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Persona Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Pilih Kunci Biometrik Terdaftar:</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {enrollees.length} Kunci Aktif
              </span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {enrollees.map((item) => {
                const isSelected = selectedId === item.matricOrStaffId;
                return (
                  <button
                    key={item.matricOrStaffId}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.matricOrStaffId);
                      setBiometricType(item.type);
                      setAuthStage('idle');
                      setErrorMessage('');
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? item.role === 'lecturer'
                          ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 shadow-xs'
                          : 'border-rose-600 bg-rose-50/80 dark:bg-rose-950/60 dark:border-rose-700 text-rose-950 dark:text-rose-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {item.role === 'lecturer' ? 'Pensyarah' : 'Pelajar'}
                      </span>
                      {item.type === 'fingerprint' ? (
                        <Fingerprint className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ScanFace className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="font-bold text-xs truncate">{item.name}</p>
                      <p className="text-[10px] font-mono opacity-80 mt-0.5">
                        {item.matricOrStaffId}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sensor Visual Area */}
          <div className="relative py-6 px-4 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Animated Laser Scan Bar */}
            {authStage === 'scanning' && (
              <div className="absolute inset-x-8 top-12 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-bounce" />
            )}

            {/* Central Icon Sensor */}
            <div
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                authStage === 'success'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 border-4 border-emerald-500 shadow-lg shadow-emerald-500/20 scale-105'
                  : authStage === 'scanning' || authStage === 'verifying'
                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 border-4 border-rose-500 animate-pulse shadow-lg shadow-rose-500/20'
                  : authStage === 'error'
                  ? 'bg-red-100 dark:bg-red-950/80 text-red-600 border-4 border-red-500'
                  : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-300 dark:border-slate-700 shadow-xs'
              }`}
            >
              {authStage === 'success' ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-scaleIn" />
              ) : biometricType === 'fingerprint' ? (
                <Fingerprint className="w-12 h-12" />
              ) : (
                <ScanFace className="w-12 h-12" />
              )}
            </div>

            {/* Status Text */}
            <div className="mt-4 space-y-1">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {authStage === 'idle' && 'Sentuh Sensor Biometrik'}
                {authStage === 'scanning' && 'Mengimbas Cap Jari / Wajah...'}
                {authStage === 'verifying' && 'Mengesahkan Token Kriptografi FIDO2...'}
                {authStage === 'success' && 'Pengesahan Berjaya!'}
                {authStage === 'error' && 'Gagal Mengesahkan'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                {authStage === 'idle' &&
                  `Letakkan jari pada pengimbas peranti atau hadapkan kamera muka (${selectedProfile?.deviceName || 'Peranti Anda'}).`}
                {authStage === 'scanning' && 'Membaca garisan papilar cap jari perkakasan...'}
                {authStage === 'verifying' && 'Menyemak padanan integriti kunci keselamatan...'}
                {authStage === 'success' && `Selamat kembali, ${selectedProfile?.name}! Log masuk disahkan.`}
                {authStage === 'error' && errorMessage}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div>
            {authStage === 'idle' || authStage === 'error' ? (
              <button
                type="button"
                onClick={handleStartScan}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-900 via-rose-800 to-amber-700 hover:from-rose-850 hover:to-amber-650 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/25 active:scale-98 transition"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Mulakan Imbasan Biometrik</span>
              </button>
            ) : authStage === 'scanning' || authStage === 'verifying' ? (
              <div className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span>Memproses Pengesahan Biometrik...</span>
              </div>
            ) : (
              <div className="w-full py-3 px-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mengalihkan ke Papan Pemuka...</span>
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>WebAuthn FIDO2 Standard</span>
            </span>
            <span className="font-mono">PKS-JKM-BIO-2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
