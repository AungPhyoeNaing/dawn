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
    <header className="sticky top-0 z-30 bg-dawn-dark/65 backdrop-blur-2xl border-b border-white/[0.08] pt-safe px-4 pb-2.5 transition-all shadow-[0_4px_24px_0_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-dawn-amber via-dawn-gold to-dawn-gold-light flex items-center justify-center shadow-gold-sm border border-white/30">
            <Sparkles className="w-4 h-4 text-dawn-dark stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 drop-shadow-sm">
              {title || 'DAWN'}
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-white/[0.08] text-dawn-gold border border-white/10 backdrop-blur-md">
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
          {/* Liquid Glass SOS Support Shortcut */}
          <button
            onClick={onOpenSupport}
            aria-label="I Need Support"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/30 transition-all text-xs font-semibold shadow-[0_2px_12px_rgba(244,63,94,0.2)] active:scale-95 min-h-[36px] backdrop-blur-md"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px] tracking-wide">Support</span>
          </button>

          {/* Liquid Glass Settings */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-9 h-9 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-dawn-muted hover:text-white transition-all active:scale-95 shadow-sm backdrop-blur-md"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
