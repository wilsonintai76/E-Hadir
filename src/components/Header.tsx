import React from 'react';
import {
  SlidersHorizontal,
  Satellite,
  Sun,
  Moon,
  RefreshCw,
  Smartphone,
  Monitor,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import { UserRole, AuthAccount } from '../types/attendance';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface HeaderProps {
  role: UserRole;
  currentAccount: AuthAccount;
  onToggleRole: () => void;
  onOpenAccountModal: () => void;
  onLogout: () => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  gpsMode: 'live' | 'simulation';
  onToggleGpsMode: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onResetData: () => void;
  isDesktopView: boolean;
  onToggleDeviceView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  currentAccount,
  onToggleRole,
  onOpenAccountModal,
  onLogout,
  currentTab,
  onTabChange,
  gpsMode,
  onToggleGpsMode,
  theme,
  onToggleTheme,
  onResetData,
  isDesktopView,
  onToggleDeviceView,
}) => {
  const isLecturer = role === 'lecturer';

  const studentTabs = [
    { id: 'courses', label: 'Jadual Kelas' },
    { id: 'radar', label: 'Radar Kampus' },
    { id: 'history', label: 'Log Kehadiran' },
    { id: 'profile', label: 'Kad Matrik' },
  ];

  const lecturerTabs = [
    { id: 'classes', label: 'Senarai Kelas' },
    { id: 'live', label: 'Live Roll Call' },
    { id: 'geocontrol', label: 'Kawalan Geofens' },
    { id: 'stats', label: 'Profil Staf' },
  ];

  const activeTabs = isLecturer ? lecturerTabs : studentTabs;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-all ${
              isLecturer
                ? 'bg-gradient-to-tr from-indigo-900 via-indigo-800 to-indigo-700 shadow-indigo-950/20'
                : 'bg-gradient-to-tr from-rose-900 via-rose-800 to-rose-700 shadow-rose-950/20'
            }`}
          >
            {isLecturer ? (
              <GraduationCap className="w-5 h-5" />
            ) : (
              <span className="font-extrabold text-sm tracking-tight font-mono">JKM</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-base tracking-tight text-slate-900 dark:text-white">
                e-Hadir JKM
              </span>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded font-mono ${
                  isLecturer
                    ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {isLecturer ? 'PENSYARAH' : 'PELAJAR'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Politeknik Kuching Sarawak · Kejuruteraan Mekanikal
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {activeTabs.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  active
                    ? isLecturer
                      ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 font-bold'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Zone: Google Account Badge, Role Switcher, GPS Mode, Theme, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Institutional Google Account Badge */}
          <button
            onClick={onOpenAccountModal}
            title="Akaun Google & Status Pengesahan Anti-Spam"
            className={`h-8 px-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition active:scale-95 ${
              currentAccount.isPoliteknikDomain
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {currentAccount.isPoliteknikDomain ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span className="hidden xl:inline font-mono truncate max-w-[130px]">
              {currentAccount.email.split('@')[0]}
            </span>
            <span className="xl:hidden font-mono text-[10px]">
              {currentAccount.isPoliteknikDomain ? 'PKS' : 'Spam'}
            </span>
          </button>

          {/* Quick Role Switcher Button */}
          <button
            onClick={onToggleRole}
            title={isLecturer ? 'Tukar ke Mod Pelajar' : 'Tukar ke Mod Pensyarah'}
            className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition active:scale-95 ${
              isLecturer
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">
              {isLecturer ? 'Pensyarah' : 'Pelajar'}
            </span>
          </button>

          {/* GPS Live / Simulation Toggle Button */}
          <button
            onClick={onToggleGpsMode}
            title={gpsMode === 'live' ? 'Beralih ke Simulasi' : 'Beralih ke GPS Sebenar'}
            className="h-8 px-2 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
          >
            {gpsMode === 'live' ? (
              <Satellite className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            )}
            <span className="hidden lg:inline">{gpsMode === 'live' ? 'GPS' : 'Simulasi'}</span>
          </button>

          {/* Device Frame View Toggle on Desktop */}
          <button
            onClick={onToggleDeviceView}
            title={isDesktopView ? "Tukar ke mod bingkai mudah alih" : "Tukar ke paparan papan pemuka penuh"}
            className="h-8 w-8 hidden lg:flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
          >
            {isDesktopView ? (
              <Smartphone className="w-3.5 h-3.5" />
            ) : (
              <Monitor className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            title="Set Semula Data Contoh"
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Mod Cerah' : 'Mod Gelap'}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton variant="compact" />

          {/* Log Keluar (Logout) to return to Landing Page */}
          <button
            onClick={onLogout}
            title="Log Keluar ke Laman Utama"
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
