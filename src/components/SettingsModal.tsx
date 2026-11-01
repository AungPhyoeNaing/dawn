import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Clock,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Shield,
  Smartphone,
  Sliders,
} from 'lucide-react';
import type { UserSettings, RitualType } from '../types';
import { exportBackupFile, importBackupData } from '../utils/backup';
import { db } from '../db/db';

interface SettingsModalProps {
  isOpen: boolean;
  settings: UserSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenIOSGuide: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
  onOpenIOSGuide,
}) => {
  const [userName, setUserName] = useState(settings.userName || '');
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled ?? true);
  const [preset, setPreset] = useState(settings.routinePreset || '30min');
  const [customDurations, setCustomDurations] = useState<Record<RitualType, number>>(
    settings.customDurations || {
      silence: 5,
      affirmations: 5,
      visualization: 5,
      exercise: 5,
      reading: 5,
      scribing: 5,
    }
  );
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    const updated: Partial<UserSettings> = {
      userName,
      soundEnabled,
      routinePreset: preset,
      customDurations,
    };
    if (settings.id) {
      await db.userSettings.update(settings.id, updated);
    }
    onUpdateSettings(updated);
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const result = await importBackupData(content, 'merge');
      if (result.success) {
        setImportStatus(result.message);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus(`Error: ${result.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="glass-panel rounded-3xl p-5 max-w-sm w-full text-dawn-light space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="text-sm font-bold text-white tracking-tight">Preferences & Settings</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-dawn-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-dawn-gold" />
            <span>Your Name / Persona:</span>
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Stephen"
            className="w-full bg-white/[0.05] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-dawn-gold"
          />
        </div>

        {/* Routine Preset */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-dawn-gold" />
            <span>Default Morning Routine:</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: '6min', label: '6 Min Express' },
              { id: '30min', label: '30 Min Balanced' },
              { id: '60min', label: '60 Min Deep' },
              { id: 'custom', label: 'Custom Durations' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id as any)}
                className={`py-2 px-2 rounded-2xl text-xs border font-bold transition-all ${
                  preset === p.id
                    ? 'bg-dawn-gold text-dawn-dark border-dawn-gold shadow-gold-sm font-extrabold'
                    : 'bg-white/[0.04] border-white/10 text-dawn-muted hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Durations Editor (if custom selected) */}
        {preset === 'custom' && (
          <div className="p-3.5 bg-white/[0.04] rounded-2xl border border-white/10 space-y-2 backdrop-blur-md">
            <span className="text-[11px] font-bold text-dawn-gold uppercase">
              Minutes Per Ritual:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(Object.keys(customDurations) as RitualType[]).map((rit) => (
                <div key={rit} className="flex items-center justify-between">
                  <span className="capitalize text-slate-300 text-[11px] font-medium">{rit}:</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customDurations[rit]}
                    onChange={(e) =>
                      setCustomDurations({
                        ...customDurations,
                        [rit]: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-14 bg-white/[0.08] border border-white/15 rounded-xl p-1 text-center text-xs text-white font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sound Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-white/[0.04] rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-dawn-gold drop-shadow-sm" />
            ) : (
              <VolumeX className="w-4 h-4 text-dawn-muted" />
            )}
            <span className="text-xs text-slate-300 font-medium">Tibetan Singing Bowl Bell</span>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-11 h-6 rounded-full p-1 transition-colors ${
              soundEnabled ? 'bg-dawn-gold shadow-gold-sm' : 'bg-white/10'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-dawn-dark transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Data Backup & Restore */}
        <div className="space-y-2 pt-1 border-t border-white/10">
          <span className="text-xs font-semibold text-slate-300">Data Management:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={exportBackupFile}
              className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-2xl text-xs font-medium flex items-center justify-center space-x-1.5 text-slate-200 backdrop-blur-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-dawn-gold" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-2xl text-xs font-medium flex items-center justify-center space-x-1.5 text-slate-200 backdrop-blur-md active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-dawn-gold" />
              <span>Import JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {importStatus && (
            <p className="text-[11px] text-emerald-400 text-center font-medium">{importStatus}</p>
          )}
        </div>

        {/* iOS Install Guide Trigger */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenIOSGuide();
          }}
          className="w-full p-2.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 rounded-2xl text-xs text-slate-300 flex items-center justify-center space-x-2 backdrop-blur-md active:scale-98"
        >
          <Smartphone className="w-3.5 h-3.5 text-dawn-gold" />
          <span>iPhone SE PWA Installation Guide</span>
        </button>

        {/* Privacy Note */}
        <div className="p-3.5 bg-white/[0.03] rounded-2xl border border-white/5 text-[10px] text-dawn-muted space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side Privacy</span>
          </div>
          <p>
            DAWN stores all journals, rituals, and discipline records exclusively in your browser's local IndexedDB. No analytics, tracking, or cloud databases.
          </p>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3.5 liquid-gold-button text-xs uppercase tracking-wider rounded-2xl min-h-[44px] active:scale-98"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
