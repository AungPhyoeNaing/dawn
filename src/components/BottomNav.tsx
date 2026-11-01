import React from 'react';
import { Sun, Flame, Shield, BarChart2 } from 'lucide-react';

export type TabType = 'home' | 'rituals' | 'focus' | 'progress';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  ritualsProgressPct?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  ritualsProgressPct = 0,
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: Sun,
    },
    {
      id: 'rituals' as TabType,
      label: 'Rituals',
      icon: Flame,
      badgePct: ritualsProgressPct,
    },
    {
      id: 'focus' as TabType,
      label: 'Focus',
      icon: Shield,
    },
    {
      id: 'progress' as TabType,
      label: 'Progress',
      icon: BarChart2,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dawn-surface/75 backdrop-blur-2xl border-t border-white/[0.08] pb-safe transition-all shadow-[0_-8px_32px_0_rgba(0,0,0,0.4)]">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative ${
                isActive ? 'text-dawn-gold' : 'text-dawn-muted hover:text-slate-300'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'scale-100 stroke-[1.8]'
                  }`}
                />
                {tab.id === 'rituals' && ritualsProgressPct > 0 && ritualsProgressPct < 100 && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-dawn-gold shadow-gold-sm animate-pulse" />
                )}
                {tab.id === 'rituals' && ritualsProgressPct === 100 && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight font-medium ${
                  isActive ? 'text-dawn-gold font-bold drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]' : 'text-dawn-muted'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-gradient-to-r from-dawn-gold to-dawn-gold-light shadow-gold-sm" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
