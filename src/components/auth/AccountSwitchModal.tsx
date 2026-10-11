import React from 'react';
import { X, ShieldCheck, AlertTriangle, Smartphone, User, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { AuthAccount, DeviceBinding } from '../../types/attendance';
import { MOCK_ACCOUNTS } from '../../data/mockData';

interface AccountSwitchModalProps {
  currentAccount: AuthAccount;
  deviceBinding: DeviceBinding;
  onSelectAccount: (accountKey: string) => void;
  onToggleDeviceLock: () => void;
  onClose: () => void;
}

export const AccountSwitchModal: React.FC<AccountSwitchModalProps> = ({
  currentAccount,
  deviceBinding,
  onSelectAccount,
  onToggleDeviceLock,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-900">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Pengesahan Identiti & Anti-Spam
              </h3>
              <p className="text-[11px] text-slate-500">
                Google Workspace Politeknik Kuching Sarawak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Signed-In Badge */}
        <div
          className={`p-3.5 rounded-2xl border ${
            currentAccount.isPoliteknikDomain
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider">Akaun Semasa Google</span>
            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                currentAccount.isPoliteknikDomain
                  ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
              }`}
            >
              {currentAccount.isPoliteknikDomain ? 'DISAHKAN (@poliku.edu.my)' : 'DOMAIN LUAR / SPAM TERSEKAT'}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-750 flex items-center justify-center font-bold text-xs">
              {currentAccount.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs truncate">{currentAccount.name}</p>
              <p className="text-[11px] font-mono opacity-80 truncate">{currentAccount.email}</p>
            </div>
          </div>

          {!currentAccount.isPoliteknikDomain && (
            <p className="text-[10px] text-rose-700 dark:text-rose-300 mt-2 font-medium">
              ⚠️ Akaun Google peribadi (@gmail.com) dilarang daripada mendaftar kehadiran bagi mengelakkan spam. Sila log masuk menggunakan emel rasmi siswa Politeknik.
            </p>
          )}
        </div>

        {/* Device Binding Status */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>Kawalan Peranti Tunggal (Anti-Proxy)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{deviceBinding.deviceId}</span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Peranti Terikat:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{deviceBinding.deviceName}</span>
            </div>
            <div className="flex justify-between">
              <span>No Matrik Terkunci:</span>
              <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{deviceBinding.registeredMatric}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Kunci Peranti: {deviceBinding.isLocked ? 'Aktif (1 Telefon = 1 Pelajar)' : 'Dimatikan'}</span>
            <button
              onClick={onToggleDeviceLock}
              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800"
            >
              {deviceBinding.isLocked ? 'Uji Tanpa Kunci' : 'Aktifkan Kunci'}
            </button>
          </div>
        </div>

        {/* Account Switcher Options (For Demo/Testing Verification) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Tukar Akaun Ujian (Simulasi Log Masuk Google)
          </label>

          <div className="space-y-1.5">
            {Object.entries(MOCK_ACCOUNTS).map(([key, acc]) => {
              const isSelected = currentAccount.email === acc.email;

              return (
                <button
                  key={key}
                  onClick={() => onSelectAccount(key)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition active:scale-[0.99] flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold truncate">{acc.name}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          acc.isPoliteknikDomain
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {acc.isPoliteknikDomain ? 'Politeknik' : 'Luar (Spam)'}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{acc.email}</p>
                  </div>

                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs active:scale-95 transition"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};
