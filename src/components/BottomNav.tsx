import React from 'react';
import {
  BookOpen,
  Radar,
  History,
  User,
  BookMarked,
  UserCheck,
  Compass,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../types/attendance';

interface BottomNavProps {
  role: UserRole;
  currentTab: string;
  onTabChange: (tab: string) => void;
  pendingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  role,
  currentTab,
  onTabChange,
  pendingCount,
}) => {
  const isLecturer = role === 'lecturer';

  const studentTabs = [
    { id: 'courses', label: 'Jadual', icon: BookOpen, badge: pendingCount },
    { id: 'radar', label: 'Radar GPS', icon: Radar, badge: 0 },
    { id: 'history', label: 'Log Hadir', icon: History, badge: 0 },
    { id: 'profile', label: 'Kad Matrik', icon: User, badge: 0 },
  ];

  const lecturerTabs = [
    { id: 'classes', label: 'Kelas', icon: BookMarked, badge: 0 },
    { id: 'live', label: 'Live Hadir', icon: UserCheck, badge: pendingCount },
    { id: 'geocontrol', label: 'Geofens', icon: Compass, badge: 0 },
    { id: 'stats', label: 'Profil Staf', icon: ShieldCheck, badge: 0 },
  ];

  const tabs = isLecturer ? lecturerTabs : studentTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 safe-bottom md:hidden transition-colors shadow-lg">
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
                isActive
                  ? isLecturer
                    ? 'text-indigo-700 dark:text-indigo-400 font-bold'
                    : 'text-rose-800 dark:text-rose-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-white font-mono text-[9px] font-bold ${
                      isLecturer ? 'bg-indigo-600' : 'bg-rose-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
