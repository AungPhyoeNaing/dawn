import React, { useState } from 'react';
import {
  Flame,
  Moon,
  Sparkles,
  Eye,
  BookOpen,
  PenTool,
  Play,
  CheckCircle2,
  Clock,
  ChevronRight,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import type { RitualType, RitualSession, UserSettings } from '../types';
import { RITUAL_DEFINITIONS, ROUTINE_PRESETS } from '../data/rituals';

interface RitualsTabProps {
  todaySession: RitualSession | null;
  settings: UserSettings;
  onStartFullRoutine: (presetKey: string) => void;
  onOpenSingleRitual: (ritual: RitualType) => void;
  onResetTodaySession: () => void;
  onOpenSettings: () => void;
}

export const RitualsTab: React.FC<RitualsTabProps> = ({
  todaySession,
  settings,
  onStartFullRoutine,
  onOpenSingleRitual,
  onResetTodaySession,
  onOpenSettings,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(
    settings.routinePreset || '30min'
  );

  const ritualsList: RitualType[] = [
    'silence',
    'affirmations',
    'visualization',
    'exercise',
    'reading',
    'scribing',
  ];

  const completedCount = todaySession?.completedRituals.length ?? 0;
  const isAllComplete = completedCount === 6;

  const getRitualIcon = (iconName: string) => {
    switch (iconName) {
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Eye': return <Eye className="w-5 h-5 text-sky-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-rose-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-400" />;
      case 'PenTool': return <PenTool className="w-5 h-5 text-purple-400" />;
      default: return <Sparkles className="w-5 h-5 text-dawn-gold" />;
    }
  };

  const currentPresetDef = ROUTINE_PRESETS[selectedPreset] || ROUTINE_PRESETS['30min'];

  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-dawn-gold">
            Miracle Morning S.A.V.E.R.S.
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white drop-shadow-sm">Daily Rituals</h2>
        </div>
        {completedCount > 0 && (
          <button
            onClick={onResetTodaySession}
            className="flex items-center space-x-1 text-[11px] text-dawn-muted hover:text-white px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md"
            title="Reset today's ritual progress"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Routine Presets Selector Bar */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-dawn-gold" />
            <span>Select Routine Duration:</span>
          </span>
          <button
            onClick={onOpenSettings}
            className="text-[10px] text-dawn-gold hover:underline flex items-center space-x-1"
          >
            <Sliders className="w-3 h-3" />
            <span>Customize</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {Object.values(ROUTINE_PRESETS).map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={`py-2 px-1 rounded-2xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center active:scale-95 ${
                selectedPreset === preset.id
                  ? 'bg-dawn-gold text-dawn-dark border-dawn-gold shadow-gold-sm font-bold'
                  : 'bg-white/[0.04] border-white/[0.08] text-dawn-muted hover:text-white'
              }`}
            >
              <span>{preset.id === 'custom' ? 'Custom' : `${preset.totalMinutes}m`}</span>
              <span className="text-[9px] opacity-80 font-normal">
                {preset.id === '6min' ? 'Express' : preset.id === '30min' ? 'Classic' : preset.id === '60min' ? 'Deep' : 'Mine'}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => onStartFullRoutine(selectedPreset)}
          className="w-full mt-2 py-3.5 liquid-gold-button rounded-2xl flex items-center justify-center space-x-2 text-xs uppercase tracking-wider min-h-touch active:scale-98"
        >
          <Play className="w-4 h-4 fill-dawn-dark" />
          <span>
            {isAllComplete
              ? 'Repeat Morning Practice'
              : completedCount > 0
              ? `Continue Morning Routine (${6 - completedCount} Left)`
              : `Begin Full ${currentPresetDef.totalMinutes}-Minute Routine`}
          </span>
        </button>
      </div>

      {/* S.A.V.E.R.S. Ritual Cards List */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
          Individual Rituals ({completedCount}/6 Completed)
        </span>

        <div className="grid gap-2">
          {ritualsList.map((ritualKey) => {
            const def = RITUAL_DEFINITIONS[ritualKey];
            const isDone = todaySession?.completedRituals.includes(ritualKey);
            const durationMin = currentPresetDef.durations[ritualKey] || def.defaultMinutes;

            return (
              <div
                key={ritualKey}
                onClick={() => onOpenSingleRitual(ritualKey)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98] ${
                  isDone
                    ? 'glass-card border-dawn-gold/40 shadow-gold-sm'
                    : 'glass-card glass-card-interactive'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-dawn-gold/25 text-dawn-gold border border-dawn-gold/40 shadow-gold-sm'
                        : 'bg-white/[0.05] border border-white/10 text-dawn-muted group-hover:text-white'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-dawn-gold" />
                    ) : (
                      getRitualIcon(def.iconName)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-white tracking-tight">{def.name}</h4>
                      <span className="text-[10px] text-dawn-muted px-1.5 py-0.2 bg-white/[0.06] border border-white/10 rounded-md">
                        {durationMin} min
                      </span>
                    </div>
                    <p className="text-[11px] text-dawn-muted leading-tight mt-0.5 line-clamp-1 max-w-[200px] xs:max-w-[230px]">
                      {def.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                      isDone
                        ? 'bg-dawn-gold/20 text-dawn-gold border-dawn-gold/40 shadow-gold-sm'
                        : 'bg-white/[0.05] text-slate-400 border-white/10'
                    }`}
                  >
                    {isDone ? 'Done ✓' : 'Start'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-dawn-muted group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
