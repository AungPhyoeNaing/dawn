import React, { useState } from 'react';
import { X, Heart, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { TRIGGER_OPTIONS } from '../data/support';
import { DisciplineGoal } from '../types';

interface ConstructiveRestartModalProps {
  isOpen: boolean;
  goal: DisciplineGoal;
  currentStreakDays: number;
  onClose: () => void;
  onConfirmRestart: (data: {
    trigger?: string;
    reflection?: string;
    lessonLearned?: string;
  }) => void;
}

export const ConstructiveRestartModal: React.FC<ConstructiveRestartModalProps> = ({
  isOpen,
  goal,
  currentStreakDays,
  onClose,
  onConfirmRestart,
}) => {
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [reflection, setReflection] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmRestart({
      trigger: selectedTrigger,
      reflection,
      lessonLearned,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-dawn-card border border-dawn-border rounded-3xl p-5 max-w-sm w-full text-dawn-light space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-dawn-gold/20 text-dawn-gold flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Constructive Restart</h3>
              <p className="text-[11px] text-dawn-muted">{goal.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-dawn-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compassionate Statement */}
        <div className="p-3.5 bg-dawn-surface rounded-2xl border border-dawn-border text-xs space-y-2">
          <div className="flex items-center space-x-2 text-dawn-gold font-semibold">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
            <span>Zero shame. Pure data.</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Your previous streak of <strong className="text-white">{currentStreakDays} days</strong> is not erased—it is permanently woven into your neural rewiring. Stumbling is how the brain learns boundaries.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Trigger Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              What was the primary trigger or context?
            </label>
            <div className="flex flex-wrap gap-1">
              {TRIGGER_OPTIONS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setSelectedTrigger(t)}
                  className={`text-[11px] px-2 py-1 rounded-lg border transition-all ${
                    selectedTrigger === t
                      ? 'bg-dawn-gold/25 border-dawn-gold text-dawn-gold font-medium'
                      : 'bg-dawn-surface border-dawn-border text-dawn-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Lesson Learned */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              What will you adjust to protect yourself next time?
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Leave phone charging in the living room at night..."
              value={lessonLearned}
              onChange={(e) => setLessonLearned(e.target.value)}
              className="w-full bg-dawn-surface border border-dawn-border rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-dawn-gold resize-none"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-dawn-gold to-dawn-gold-light text-dawn-dark font-bold text-xs uppercase tracking-wider rounded-xl shadow-gold-sm transition-transform active:scale-98 min-h-[44px]"
            >
              Reset Counter & Begin New Streak
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-dawn-muted hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
