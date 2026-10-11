import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, Share, PlusSquare, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../utils/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'card' | 'badge';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installState, setInstallState] = useState<'idle' | 'installing' | 'done'>('idle');

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstallState('installing');
      const success = await install();
      if (success) {
        setInstallState('done');
      } else {
        setInstallState('idle');
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Direct instructions for modern desktop/mobile browsers if prompt is already consumed
      alert(
        'Untuk memasang e-Hadir JKM ke skrin utama anda: Tekan menu pelayar (tiga titik di kanan atas) dan pilih "Pasang Aplikasi" atau "Tambah ke Skrin Utama".'
      );
    }
  };

  if (isInstalled) {
    if (variant === 'badge') {
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold ${className}`}>
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          <span>Aplikasi Terpasang (PWA)</span>
        </div>
      );
    }
    return null;
  }

  if (variant === 'card') {
    return (
      <>
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50/70 dark:from-rose-950/40 dark:to-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-3 ${className}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-800 to-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Pasang Aplikasi PWA Rasmi</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
                    Pantas & Luar Talian
                  </span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Akses 1-ketik dari skrin telefon tanpa perlu menaip URL setiap hari. Berfungsi semasa talian lemah di dewan bengkel.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIOS ? 'Cara Pasang di iPhone/iPad' : 'Pasang ke Skrin Utama Peranti'}</span>
          </button>
        </div>

        {/* iOS Safari Guide Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Pasang di iPhone / iPad
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Ketik butang Kongsi (Share)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ikon petak dengan anak panah ke atas di bahagian bawah pelayar Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Pilih "Add to Home Screen"
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tatal senarai ke bawah dan tekan "Tambah ke Skrin Utama".
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Tekan "Add" (Tambah)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ikon e-Hadir JKM akan muncul di skrin utama untuk akses serta-merta!
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition"
              >
                Faham & Tutup
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Compact variant for header or toolbar
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="Pasang e-Hadir JKM ke skrin peranti (PWA)"
        className={`h-8 px-2.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
        <span className="hidden sm:inline">Pasang PWA</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Pasang di iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Ketik butang Kongsi (Share)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ikon petak dengan anak panah ke atas di bahagian bawah pelayar Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Pilih "Add to Home Screen"
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tatal senarai ke bawah dan tekan "Tambah ke Skrin Utama".
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  3
                </span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Tekan "Add" (Tambah)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ikon e-Hadir JKM akan muncul di skrin utama untuk akses serta-merta!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition"
            >
              Faham & Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
