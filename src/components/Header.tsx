import React from 'react';
import { ShieldAlert, Settings, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenSupport: () => void;
  onOpenSettings: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSupport,
  onOpenSettings,
  title,
  subtitle,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-dawn-dark/95 backdrop-blur-md border-b border-dawn-border/60 pt-safe px-4 pb-2.5 transition-colors">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-dawn-amber to-dawn-gold-light flex items-center justify-center shadow-gold-sm">
            <Sparkles className="w-4 h-4 text-dawn-dark stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              {title || 'DAWN'}
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-dawn-card text-dawn-gold border border-dawn-gold/20">
                PWA
              </span>
            </h1>
            {subtitle ? (
              <p className="text-[11px] text-dawn-muted leading-tight truncate max-w-[170px]">{subtitle}</p>
            ) : (
              <p className="text-[11px] text-dawn-muted leading-tight">Rise. Focus. Become.</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick SOS Support Shortcut */}
          <button
            onClick={onOpenSupport}
            aria-label="I Need Support"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-dawn-rose/15 hover:bg-dawn-rose/25 text-rose-300 border border-dawn-rose/30 transition-all text-xs font-medium active:scale-95 min-h-[36px]"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px] font-semibold tracking-wide">Support</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-9 h-9 rounded-full bg-dawn-surface hover:bg-dawn-card border border-dawn-border flex items-center justify-center text-dawn-muted hover:text-white transition-colors active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
