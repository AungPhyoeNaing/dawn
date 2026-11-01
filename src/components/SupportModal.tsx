import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Droplet,
  Activity,
  Sun,
  Sparkles,
  MessageCircle,
  PenTool,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { SUPPORT_ALTERNATIVES, GROUNDING_STEPS, TRIGGER_OPTIONS } from '../data/support';
import { playMindfulBell } from '../utils/timer';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogTrigger?: (trigger: string, note?: string) => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  onLogTrigger,
}) => {
  const [activeSection, setActiveSection] = useState<'breathe' | 'ground' | 'alternatives' | 'trigger'>('breathe');
  const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breatheSeconds, setBreatheSeconds] = useState(4);
  const [currentGroundingIndex, setCurrentGroundingIndex] = useState(0);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [triggerNotes, setTriggerNotes] = useState('');
  const [isLogged, setIsLogged] = useState(false);

  // Breathing cycle timer: 4s Inhale, 4s Hold, 4s Exhale, 4s Rest
  useEffect(() => {
    if (!isOpen || activeSection !== 'breathe') return;

    const interval = setInterval(() => {
      setBreatheSeconds((prev) => {
        if (prev <= 1) {
          setBreathePhase((phase) => {
            if (phase === 'Inhale') return 'Hold';
            if (phase === 'Hold') return 'Exhale';
            if (phase === 'Exhale') return 'Rest';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeSection]);

  if (!isOpen) return null;

  const handleSaveTrigger = () => {
    if (selectedTrigger && onLogTrigger) {
      onLogTrigger(selectedTrigger, triggerNotes);
      setIsLogged(true);
    }
  };

  const getAlternativeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplet': return <Droplet className="w-5 h-5 text-sky-400" />;
      case 'Activity': return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'Sun': return <Sun className="w-5 h-5 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-violet-400" />;
      case 'MessageCircle': return <MessageCircle className="w-5 h-5 text-blue-400" />;
      case 'PenTool': return <PenTool className="w-5 h-5 text-rose-400" />;
      default: return <Heart className="w-5 h-5 text-dawn-gold" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-dawn-dark/95 backdrop-blur-3xl text-dawn-light overflow-y-auto pt-safe pb-safe animate-in fade-in duration-200">
      {/* Liquid background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-rose-500/15 blur-[90px]" />
        <div className="absolute bottom-1/3 -left-20 w-80 h-80 rounded-full bg-dawn-gold/15 blur-[90px]" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-dawn-dark/60 backdrop-blur-2xl sticky top-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-400 flex items-center justify-center shadow-sm">
            <Heart className="w-4 h-4 fill-rose-500/30" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Sanctuary & Support</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-white/[0.06] border border-white/10 text-dawn-muted hover:text-white transition-colors min-h-touch min-w-touch flex items-center justify-center"
          aria-label="Close support modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 p-4 max-w-md mx-auto w-full space-y-4 flex-1">
        {/* Reassurance Banner */}
        <div className="glass-card rounded-3xl p-4.5 text-center space-y-1.5 shadow-xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-dawn-gold">
            You are safe & in control
          </p>
          <h2 className="text-base font-extrabold text-white leading-snug drop-shadow-sm">
            Urges are temporary waves.
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            You don't need to fight this feeling with force. Simply observe it without acting. It will naturally crest and dissolve.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-white/[0.04] rounded-2xl border border-white/10 text-xs backdrop-blur-md">
          <button
            onClick={() => {
              setActiveSection('breathe');
              playMindfulBell({ pitch: 360, duration: 2.0 });
            }}
            className={`py-2 px-1 rounded-xl font-bold transition-all text-center active:scale-95 ${
              activeSection === 'breathe'
                ? 'bg-dawn-gold text-dawn-dark shadow-gold-sm'
                : 'text-dawn-muted hover:text-white'
            }`}
          >
            Breathe
          </button>
          <button
            onClick={() => setActiveSection('ground')}
            className={`py-2 px-1 rounded-xl font-bold transition-all text-center active:scale-95 ${
              activeSection === 'ground'
                ? 'bg-dawn-gold text-dawn-dark shadow-gold-sm'
                : 'text-dawn-muted hover:text-white'
            }`}
          >
            5-4-3-2-1
          </button>
          <button
            onClick={() => setActiveSection('alternatives')}
            className={`py-2 px-1 rounded-xl font-bold transition-all text-center active:scale-95 ${
              activeSection === 'alternatives'
                ? 'bg-dawn-gold text-dawn-dark shadow-gold-sm'
                : 'text-dawn-muted hover:text-white'
            }`}
          >
            Actions
          </button>
          <button
            onClick={() => setActiveSection('trigger')}
            className={`py-2 px-1 rounded-xl font-bold transition-all text-center active:scale-95 ${
              activeSection === 'trigger'
                ? 'bg-dawn-gold text-dawn-dark shadow-gold-sm'
                : 'text-dawn-muted hover:text-white'
            }`}
          >
            Reflect
          </button>
        </div>

        {/* SECTION 1: BREATHING */}
        {activeSection === 'breathe' && (
          <div className="glass-card rounded-3xl p-6 text-center space-y-6 shadow-2xl">
            <div className="space-y-1">
              <span className="text-xs text-dawn-muted uppercase font-bold tracking-wider">
                Box Breathing Technique
              </span>
              <h3 className="text-sm font-semibold text-slate-200">
                Regulate your autonomic nervous system
              </h3>
            </div>

            {/* Breathing Circle Visualizer with Liquid Expansion */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-2 border-dawn-gold/40 transition-all duration-1000 ${
                  breathePhase === 'Inhale'
                    ? 'scale-110 bg-dawn-gold/20 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                    : breathePhase === 'Hold'
                    ? 'scale-110 bg-dawn-gold/30 shadow-[0_0_40px_rgba(245,158,11,0.4)]'
                    : breathePhase === 'Exhale'
                    ? 'scale-75 bg-dawn-gold/10 shadow-none'
                    : 'scale-75 bg-transparent'
                }`}
              />
              <div className="relative z-10 space-y-1">
                <p className="text-2xl font-black tracking-tight text-white drop-shadow-md">{breathePhase}</p>
                <p className="text-xs font-extrabold text-dawn-gold">{breatheSeconds}s</p>
              </div>
            </div>

            <p className="text-xs text-dawn-muted max-w-xs mx-auto">
              Follow the rhythm gently. Each slow exhalation signals your nervous system that you are completely safe.
            </p>
          </div>
        )}

        {/* SECTION 2: 5-4-3-2-1 GROUNDING */}
        {activeSection === 'ground' && (
          <div className="glass-card rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-dawn-gold tracking-wider">
                  Sensory Grounding
                </span>
                <h3 className="text-sm font-extrabold text-white">5-4-3-2-1 Technique</h3>
              </div>
              <span className="text-xs text-dawn-muted font-medium">
                Step {currentGroundingIndex + 1} of 5
              </span>
            </div>

            <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 space-y-3 backdrop-blur-md">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-dawn-gold/25 border border-dawn-gold/40 text-dawn-gold flex items-center justify-center font-black text-lg shadow-gold-sm">
                  {GROUNDING_STEPS[currentGroundingIndex].count}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {GROUNDING_STEPS[currentGroundingIndex].sense}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {GROUNDING_STEPS[currentGroundingIndex].prompt}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentGroundingIndex === 0}
                onClick={() => setCurrentGroundingIndex((i) => Math.max(0, i - 1))}
                className="px-3.5 py-2 text-xs text-dawn-muted disabled:opacity-30 hover:text-white"
              >
                Previous
              </button>

              {currentGroundingIndex < GROUNDING_STEPS.length - 1 ? (
                <button
                  onClick={() => setCurrentGroundingIndex((i) => Math.min(GROUNDING_STEPS.length - 1, i + 1))}
                  className="px-4 py-2.5 liquid-gold-button font-bold text-xs rounded-xl flex items-center space-x-1"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Grounding Complete</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: ALTERNATIVE ACTIONS */}
        {activeSection === 'alternatives' && (
          <div className="space-y-2.5">
            <div className="px-1">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Instant State Changers
              </h3>
              <p className="text-[11px] text-dawn-muted">
                Urges are excess energy seeking expression. Redirect it purposefully:
              </p>
            </div>

            <div className="grid gap-2.5">
              {SUPPORT_ALTERNATIVES.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3.5 glass-card glass-card-interactive rounded-2xl flex items-start space-x-3.5"
                >
                  <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 shrink-0">
                    {getAlternativeIcon(alt.icon)}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">{alt.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-snug">{alt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: TRIGGER REFLECTION */}
        {activeSection === 'trigger' && (
          <div className="glass-card rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-dawn-gold">
                Curious Self-Reflection
              </h3>
              <p className="text-xs text-slate-300">
                Urges almost always conceal a deeper emotional or physiological need. What is present right now?
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TRIGGER_OPTIONS.map((trig) => (
                <button
                  key={trig}
                  onClick={() => setSelectedTrigger(trig)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    selectedTrigger === trig
                      ? 'bg-dawn-gold/25 border-dawn-gold text-dawn-gold font-bold shadow-gold-sm'
                      : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {trig}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-dawn-muted">Additional notes or feelings (optional):</label>
              <textarea
                value={triggerNotes}
                onChange={(e) => setTriggerNotes(e.target.value)}
                rows={2}
                placeholder="I noticed I was procrastinating on my report..."
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-dawn-gold resize-none"
              />
            </div>

            {isLogged ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Reflection noted with compassion. You are back in control.</span>
              </div>
            ) : (
              <button
                disabled={!selectedTrigger}
                onClick={handleSaveTrigger}
                className="w-full py-3 liquid-gold-button disabled:opacity-40 text-xs rounded-2xl transition-all"
              >
                Log Reflection & Reset
              </button>
            )}
          </div>
        )}

        {/* Positive Closing Reassurance */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center space-x-3 backdrop-blur-md">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-[11px] text-slate-300 leading-snug">
            By taking these conscious minutes, you have already broken the automatic loop. Take pride in your awareness.
          </p>
        </div>

        {/* Bottom Exit */}
        <button
          onClick={onClose}
          className="w-full py-3.5 liquid-gold-button text-xs uppercase tracking-wider rounded-2xl min-h-[44px] active:scale-98"
        >
          Return to My Day, Grounded & Centered
        </button>
      </div>
    </div>
  );
};
