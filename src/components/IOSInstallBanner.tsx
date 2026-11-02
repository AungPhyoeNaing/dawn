import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';

interface IOSInstallBannerProps {
  onDismissForever?: () => void;
}

export const IOSInstallBanner: React.FC<IOSInstallBannerProps> = ({ onDismissForever }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if running in standalone mode (already installed)
    const isInStandalone = 
      ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone) ||
      window.matchMedia('(display-mode: standalone)').matches;

    setIsIOS(isAppleDevice);
    setIsStandalone(isInStandalone);

    // If on iOS and not standalone, and user hasn't dismissed it this session
    const dismissed = sessionStorage.getItem('dawn_ios_install_dismissed');
    if (isAppleDevice && !isInStandalone && !dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('dawn_ios_install_dismissed', 'true');
    if (onDismissForever) {
      onDismissForever();
    }
  };

  if (!isOpen || isStandalone || !isIOS) {
    return null;
  }

  return (
    <div className="ios-install-banner fixed inset-x-3 bottom-20 z-50 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="bg-dawn-card/95 backdrop-blur-xl border border-dawn-gold/30 rounded-2xl p-4 shadow-2xl max-w-sm mx-auto text-dawn-light">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-dawn-gold/20 text-dawn-gold flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight">Install DAWN on your iPhone</h3>
              <p className="text-[11px] text-dawn-muted">Optimal 375px compact experience</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-dawn-muted hover:text-white p-1 rounded-full"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-2 text-xs text-slate-300 bg-dawn-surface/60 rounded-xl p-3 border border-dawn-border/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-5 h-5 rounded bg-dawn-card flex items-center justify-center text-dawn-gold shrink-0">
              <Share className="w-3.5 h-3.5" />
            </div>
            <span>1. Tap the <strong className="text-white">Share</strong> button in Safari's bottom toolbar</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-5 h-5 rounded bg-dawn-card flex items-center justify-center text-dawn-gold shrink-0">
              <PlusSquare className="w-3.5 h-3.5" />
            </div>
            <span>2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong></span>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="w-5 h-5 rounded bg-dawn-card flex items-center justify-center text-dawn-gold shrink-0">
              <span className="text-[10px] font-bold">3</span>
            </div>
            <span>3. Tap <strong className="text-white">Add</strong> in top right corner</span>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="mt-3 w-full py-2 bg-dawn-gold/20 hover:bg-dawn-gold/30 text-dawn-gold text-xs font-medium rounded-xl border border-dawn-gold/30 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
