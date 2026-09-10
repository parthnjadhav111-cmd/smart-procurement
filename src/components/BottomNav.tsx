import React from 'react';
import { Home, Building2, CalendarDays, Ticket, User } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations/translations';

export type TabType = 'home' | 'centers' | 'schedule' | 'queue' | 'profile' | 'admin';

interface BottomNavProps {
  currentTab?: TabType;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  onChangeTab?: (tab: TabType) => void;
  lang: Language;
  hasActiveQueue?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  activeTab,
  onTabChange,
  onChangeTab,
  lang,
  hasActiveQueue = true,
}) => {
  const t = translations[lang] || translations.en;
  const activeCurrentTab = currentTab || activeTab || 'home';
  const handleTabChange = onTabChange || onChangeTab || (() => {});

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: boolean }[] = [
    { id: 'home', label: t.home, icon: <Home className="w-5 h-5" /> },
    { id: 'centers', label: t.centers, icon: <Building2 className="w-5 h-5" /> },
    { id: 'schedule', label: t.schedule, icon: <CalendarDays className="w-5 h-5" /> },
    {
      id: 'queue',
      label: t.queue,
      icon: <Ticket className="w-5 h-5" />,
      badge: hasActiveQueue,
    },
    { id: 'profile', label: t.profile, icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav
      id="farmer-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-stone-200 shadow-lg px-2 py-1 safe-area-bottom"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = activeCurrentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => handleTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-800 font-bold bg-emerald-50'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50 font-medium'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.id === 'queue' && (
                  <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight truncate max-w-full">
                {item.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 bg-emerald-700 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
