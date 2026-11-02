import { Modal } from './Modal';
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Volume2,
  VolumeX,
  Plus,
  Heart,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type {
  RitualType,
  Affirmation,
  VisualizationGoal,
} from '../types';
import { RITUAL_DEFINITIONS } from '../data/rituals';
import {
  type TimerState,
  createInitialTimerState,
  startTimer,
  pauseTimer,
  resetTimer,
  getElapsedSeconds,
  getRemainingSeconds,
  getTimerProgress,
  formatSeconds,
  playMindfulBell,
} from '../utils/timer';
import { db } from '../db/db';
import { getLocalDateString } from '../utils/date';

interface ActiveRitualRunnerProps {
  ritualType: RitualType;
  durationMinutes: number;
  isSequence?: boolean;
  sequenceStep?: number;
  totalSequenceSteps?: number;
  onCompleteRitual: (ritual: RitualType, timeSpentSeconds: number) => void;
  onSkipRitual?: (ritual: RitualType) => void;
  onClose: () => void;
}

export const ActiveRitualRunner: React.FC<ActiveRitualRunnerProps> = ({
  ritualType,
  durationMinutes,
  isSequence = false,
  sequenceStep = 1,
  totalSequenceSteps = 6,
  onCompleteRitual,
  onSkipRitual,
  onClose,
}) => {
  const definition = RITUAL_DEFINITIONS[ritualType];
  const targetSeconds = durationMinutes * 60;

  // Timer state (timestamp based!)
  const [timer, setTimer] = useState<TimerState>(() => createInitialTimerState(targetSeconds));
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Breathing pacer state for Silence
  const [silencePacerPhase, setSilencePacerPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold'>('Inhale');
  const [silencePacerSeconds, setSilencePacerSeconds] = useState(4);

  // Affirmations state
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [newAffirmationText, setNewAffirmationText] = useState('');
  const [showAddAffirmation, setShowAddAffirmation] = useState(false);

  // Visualization state
  const [visualizations, setVisualizations] = useState<VisualizationGoal[]>([]);
  const [currentVisionIndex, setCurrentVisionIndex] = useState(0);
  const [newVisionTitle, setNewVisionTitle] = useState('');
  const [newVisionDesc, setNewVisionDesc] = useState('');
  const [newVisionImage, setNewVisionImage] = useState<string | undefined>(undefined);
  const [showAddVision, setShowAddVision] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exercise log state
  const [exerciseActivity, setExerciseActivity] = useState('Gentle Yoga & Stretching');
  const [exerciseIntensity, setExerciseIntensity] = useState<'gentle' | 'moderate' | 'intense'>('moderate');
  const [exerciseNotes, setExerciseNotes] = useState('');

  // Reading log state
  const [bookTitle, setBookTitle] = useState('');
  const [pagesRead, setPagesRead] = useState<number>(5);
  const [readingNotes, setReadingNotes] = useState('');

  // Scribing / Journal state
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [scribingReflection, setScribingReflection] = useState('');

  // Sync clock ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, []);

  // Breathing pacer ticker for Silence
  useEffect(() => {
    if (ritualType !== 'silence' || !timer.isRunning) return;
    const interval = setInterval(() => {
      setSilencePacerSeconds((prev) => {
        if (prev <= 1) {
          setSilencePacerPhase((p) => {
            if (p === 'Inhale') return 'Hold';
            if (p === 'Hold' && silencePacerPhase === 'Inhale') return 'Exhale';
            if (p === 'Exhale') return 'Hold';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [ritualType, timer.isRunning, silencePacerPhase]);

  // Load data for specific rituals from Dexie
  useEffect(() => {
    const loadRitualData = async () => {
      if (ritualType === 'affirmations') {
        const affs = await db.affirmations.toArray();
        setAffirmations(affs);
      } else if (ritualType === 'visualization') {
        const visions = await db.visualizationGoals.toArray();
        setVisualizations(visions);
      } else if (ritualType === 'scribing') {
        const today = getLocalDateString();
        const existingEntry = await db.journalEntries.where('date').equals(today).first();
        if (existingEntry) {
          setGratitude1(existingEntry.gratitude1 || '');
          setGratitude2(existingEntry.gratitude2 || '');
          setGratitude3(existingEntry.gratitude3 || '');
          setScribingReflection(existingEntry.reflection || '');
        }
      }
    };
    loadRitualData();
  }, [ritualType]);

  const elapsedSeconds = getElapsedSeconds(timer, currentTime);
  const remainingSeconds = getRemainingSeconds(timer, currentTime);
  const progressPct = getTimerProgress(timer, currentTime);

  // Handle play / pause
  const handleTogglePlay = () => {
    if (timer.isRunning) {
      setTimer((prev) => pauseTimer(prev, Date.now()));
    } else {
      if (soundEnabled) {
        playMindfulBell({ pitch: 432, duration: 2.5 });
      }
      setTimer((prev) => startTimer(prev, Date.now()));
    }
  };

  const handleAddOneMinute = () => {
    setTimer((prev) => ({
      ...prev,
      targetDurationSeconds: prev.targetDurationSeconds + 60,
    }));
  };

  const handleReset = () => {
    setTimer(resetTimer(timer));
  };

  // Completion handler
  const handleComplete = async () => {
    if (soundEnabled) {
      playMindfulBell({ pitch: 528, duration: 3.5 });
    }

    const timeSpent = Math.max(1, elapsedSeconds);
    const today = getLocalDateString();

    try {
      if (ritualType === 'reading' && (bookTitle || readingNotes)) {
        await db.readingLogs.add({
          date: today,
          bookTitle: bookTitle || 'Personal Growth',
          pagesRead: Number(pagesRead) || 0,
          timeSpentSeconds: timeSpent,
          notes: readingNotes,
          createdAt: new Date().toISOString(),
        });
      } else if (ritualType === 'exercise') {
        await db.exerciseLogs.add({
          date: today,
          activityType: exerciseActivity,
          durationSeconds: timeSpent,
          intensity: exerciseIntensity,
          notes: exerciseNotes,
          createdAt: new Date().toISOString(),
        });
      } else if (ritualType === 'scribing' && (gratitude1 || gratitude2 || gratitude3 || scribingReflection)) {
        const existing = await db.journalEntries.where('date').equals(today).first();
        if (existing && existing.id) {
          await db.journalEntries.update(existing.id, {
            gratitude1,
            gratitude2,
            gratitude3,
            reflection: scribingReflection,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await db.journalEntries.add({
            date: today,
            gratitude1,
            gratitude2,
            gratitude3,
            reflection: scribingReflection,
            mood: 'peaceful',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error('Error saving ritual details:', err);
    }

    if (!isSequence || sequenceStep === totalSequenceSteps) {
      try {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FCD34D', '#10B981', '#38BDF8'],
        });
      } catch (e) {
        // ignore
      }
    }

    onCompleteRitual(ritualType, timeSpent);
  };

  const handleSkip = () => {
    if (onSkipRitual) {
      onSkipRitual(ritualType);
    } else {
      onClose();
    }
  };

  // Toggle favorite affirmation
  const handleToggleFavoriteAffirmation = async (aff: Affirmation) => {
    if (!aff.id) return;
    const updated = !aff.isFavorite;
    await db.affirmations.update(aff.id, { isFavorite: updated });
    setAffirmations((prev) =>
      prev.map((a) => (a.id === aff.id ? { ...a, isFavorite: updated } : a))
    );
  };

  // Add custom affirmation
  const handleSaveCustomAffirmation = async () => {
    if (!newAffirmationText.trim()) return;
    const newAff: Omit<Affirmation, 'id'> = {
      text: newAffirmationText.trim(),
      category: 'custom',
      isCustom: true,
      isFavorite: true,
      createdAt: new Date().toISOString(),
    };
    const id = await db.affirmations.add(newAff as Affirmation);
    setAffirmations((prev) => [...prev, { ...newAff, id }]);
    setNewAffirmationText('');
    setShowAddAffirmation(false);
  };

  // Image upload for vision board
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVisionImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveVisionGoal = async () => {
    if (!newVisionTitle.trim()) return;
    const newGoal: Omit<VisualizationGoal, 'id'> = {
      title: newVisionTitle.trim(),
      description: newVisionDesc.trim() || 'Visualizing my highest self.',
      category: 'vision',
      imageUrl: newVisionImage,
      createdAt: new Date().toISOString(),
    };
    const id = await db.visualizationGoals.add(newGoal as VisualizationGoal);
    setVisualizations((prev) => [...prev, { ...newGoal, id }]);
    setNewVisionTitle('');
    setNewVisionDesc('');
    setNewVisionImage(undefined);
    setShowAddVision(false);
  };

  return (
    <Modal label="Ritual practice" onClose={onClose} fullScreen>
      {/* Liquid background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-dawn-gold/15 blur-[90px]" />
        <div className="absolute bottom-1/4 -left-24 w-80 h-80 rounded-full bg-sky-500/10 blur-[90px]" />
      </div>

      {/* Top Header */}
      <div className="runner-header relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-dawn-dark/60 backdrop-blur-2xl sticky top-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-dawn-gold/25 border border-dawn-gold/40 text-dawn-gold flex items-center justify-center font-bold text-sm shadow-gold-sm">
            {definition.shortName}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">{definition.name}</h2>
            {isSequence ? (
              <span className="text-[10px] text-dawn-muted">
                Step {sequenceStep} of {totalSequenceSteps} in Miracle Morning
              </span>
            ) : (
              <span className="runner-tagline text-[10px] text-dawn-muted">{definition.tagline}</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full text-dawn-muted hover:text-white bg-white/[0.05] border border-white/10"
            aria-label="Toggle bell sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-dawn-gold" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.07] border border-white/10 text-dawn-muted hover:text-white"
            aria-label="Close ritual runner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 p-4 max-w-md mx-auto w-full space-y-4 flex-1">
        {/* TIMER HERO LIQUID GLASS CIRCLE */}
        <div className="glass-card rounded-3xl p-5 text-center relative overflow-hidden shadow-2xl">
          {/* Circular SVG Timer Ring with Specular Glow */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-white/[0.08] fill-transparent"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-dawn-gold fill-transparent transition-all duration-300 ease-linear drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                strokeWidth="6"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progressPct) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Timer Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tight text-white font-mono drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                {formatSeconds(remainingSeconds)}
              </span>
              <span className="text-[11px] text-dawn-muted mt-0.5">
                {timer.isRunning ? 'In progress' : elapsedSeconds > 0 ? 'Paused' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Quick Timer Controls */}
          <div className="timer-controls flex items-center justify-center space-x-3 mt-4">
            <button
              onClick={handleReset}
              className="p-3 rounded-full bg-white/[0.06] border border-white/10 text-dawn-muted hover:text-white transition-colors min-h-touch min-w-touch flex items-center justify-center active:scale-95"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="px-7 py-3 rounded-2xl liquid-gold-button text-sm flex items-center space-x-2 min-h-touch active:scale-95"
            >
              {timer.isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-dawn-dark" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-dawn-dark ml-0.5" />
                  <span>{elapsedSeconds > 0 ? 'Resume' : 'Begin'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleAddOneMinute}
              className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-dawn-gold font-bold hover:bg-white/[0.1] active:scale-95"
              aria-label="Add one minute"
            >
              +1m
            </button>
          </div>
        </div>

        {/* SPECIFIC RITUAL CONTENT WORKSPACE */}

        {/* 1. SILENCE */}
        {ritualType === 'silence' && (
          <div className="glass-card rounded-3xl p-4.5 text-center space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-dawn-gold">
                Guided Silence Pacer
              </span>
              <h3 className="text-xs font-semibold text-slate-200">
                {timer.isRunning ? `${silencePacerPhase} (${silencePacerSeconds}s)` : 'Start timer to begin breathing guide'}
              </h3>
            </div>
            <div className="text-xs text-slate-300 bg-white/[0.03] rounded-2xl p-3.5 border border-white/10 text-left space-y-1">
              <p className="font-semibold text-white">Mindfulness Focus:</p>
              <p className="text-[11px] text-dawn-muted leading-relaxed">
                Sit comfortably, lower your chin slightly, and observe the natural breath entering and leaving your nostrils.
              </p>
            </div>
          </div>
        )}

        {/* 2. AFFIRMATIONS */}
        {ritualType === 'affirmations' && (
          <div className="glass-card rounded-3xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-dawn-gold">
                Daily Affirmations ({currentAffirmationIndex + 1}/{Math.max(1, affirmations.length)})
              </span>
              <button
                onClick={() => setShowAddAffirmation(true)}
                className="text-[11px] text-dawn-gold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom</span>
              </button>
            </div>

            {affirmations.length > 0 ? (
              <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 space-y-3 min-h-[110px] flex flex-col justify-between backdrop-blur-md">
                <p className="text-sm font-medium text-white leading-relaxed italic">
                  "{affirmations[currentAffirmationIndex]?.text}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/[0.08] text-dawn-muted">
                    {affirmations[currentAffirmationIndex]?.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      aria-label="Toggle favorite affirmation"
                      onClick={() => handleToggleFavoriteAffirmation(affirmations[currentAffirmationIndex])}
                      className="p-1.5 text-dawn-muted hover:text-rose-400"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          affirmations[currentAffirmationIndex]?.isFavorite
                            ? 'fill-rose-500 text-rose-500 shadow-sm'
                            : ''
                        }`}
                      />
                    </button>
                    <button
                      disabled={currentAffirmationIndex === 0}
                      onClick={() => setCurrentAffirmationIndex((i) => Math.max(0, i - 1))}
                      className="p-1 text-dawn-muted disabled:opacity-20" aria-label="Previous affirmation"
                    >
                      <ChevronLeft aria-hidden="true" className="w-4 h-4" />
                    </button>
                    <button
                      aria-label="Next affirmation"
                      disabled={currentAffirmationIndex >= affirmations.length - 1}
                      onClick={() => setCurrentAffirmationIndex((i) => Math.min(affirmations.length - 1, i + 1))}
                      className="p-1 text-dawn-muted disabled:opacity-20"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-dawn-muted">Loading affirmations...</p>
            )}

            {showAddAffirmation && (
              <div className="p-3 bg-white/[0.05] rounded-2xl border border-white/10 space-y-2">
                <input
                  type="text"
                  placeholder="I am capable, grounded, and..."
                  aria-label="New affirmation"
                value={newAffirmationText}
                  onChange={(e) => setNewAffirmationText(e.target.value)}
                  className="w-full bg-dawn-dark border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddAffirmation(false)}
                    className="text-xs px-2.5 py-1 text-dawn-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomAffirmation}
                    className="text-xs px-3 py-1 liquid-gold-button rounded-xl"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. VISUALIZATION */}
        {ritualType === 'visualization' && (
          <div className="glass-card rounded-3xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-dawn-gold">
                Vision Board ({currentVisionIndex + 1}/{Math.max(1, visualizations.length)})
              </span>
              <button
                onClick={() => setShowAddVision(true)}
                className="text-[11px] text-dawn-gold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Goal</span>
              </button>
            </div>

            {visualizations.length > 0 ? (
              <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 space-y-3 backdrop-blur-md">
                {visualizations[currentVisionIndex]?.imageUrl && (
                  <img
                    src={visualizations[currentVisionIndex].imageUrl}
                    alt={visualizations[currentVisionIndex].title}
                    className="w-full h-32 object-cover rounded-xl border border-white/10 shadow-md"
                  />
                )}
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {visualizations[currentVisionIndex]?.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {visualizations[currentVisionIndex]?.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-[10px] text-dawn-muted uppercase">
                    Feel the emotions of already arriving
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      aria-label="Previous visualization"
                      disabled={currentVisionIndex === 0}
                      onClick={() => setCurrentVisionIndex((i) => Math.max(0, i - 1))}
                      className="p-1 text-dawn-muted disabled:opacity-20"
                    >
                      <ChevronLeft aria-hidden="true" className="w-4 h-4" />
                    </button>
                    <button
                      aria-label="Next visualization"
                      disabled={currentVisionIndex >= visualizations.length - 1}
                      onClick={() => setCurrentVisionIndex((i) => Math.min(visualizations.length - 1, i + 1))}
                      className="p-1 text-dawn-muted disabled:opacity-20"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-dawn-muted">Loading visualization goals...</p>
            )}

            {showAddVision && (
              <div className="p-3 bg-white/[0.05] rounded-2xl border border-white/10 space-y-2">
                <input
                  type="text"
                  placeholder="Vision Goal Title..."
                  aria-label="Visualization title"
                value={newVisionTitle}
                  onChange={(e) => setNewVisionTitle(e.target.value)}
                  className="w-full bg-dawn-dark border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
                <textarea
                  placeholder="Describe your ideal vision vividly..."
                  rows={2}
                  aria-label="Visualization description"
                  value={newVisionDesc}
                  onChange={(e) => setNewVisionDesc(e.target.value)}
                  className="w-full bg-dawn-dark border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white"
                  >
                    <Camera className="w-4 h-4 text-dawn-gold" />
                    <span>{newVisionImage ? 'Image Attached' : 'Attach Photo'}</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowAddVision(false)}
                      className="text-xs px-2 py-1 text-dawn-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveVisionGoal}
                      className="text-xs px-3 py-1 liquid-gold-button rounded-xl"
                    >
                      Save Goal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. EXERCISE */}
        {ritualType === 'exercise' && (
          <div className="glass-card rounded-3xl p-4.5 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-dawn-gold">
              Movement & Vitality Log
            </span>

            <div className="space-y-1.5">
              <label htmlFor="exercise-activity" className="text-[11px] text-dawn-muted">Activity Type:</label>
              <select
                id="exercise-activity"
                value={exerciseActivity}
                onChange={(e) => setExerciseActivity(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="Gentle Yoga & Stretching" className="bg-dawn-surface">Gentle Yoga & Stretching</option>
                <option value="Calisthenics (Pushups/Squats)" className="bg-dawn-surface">Calisthenics (Pushups/Squats)</option>
                <option value="Core & Abs Workout" className="bg-dawn-surface">Core & Abs Workout</option>
                <option value="Brisk Morning Walk" className="bg-dawn-surface">Brisk Morning Walk</option>
                <option value="HIIT / Cardio Blast" className="bg-dawn-surface">HIIT / Cardio Blast</option>
                <option value="Free Weight Training" className="bg-dawn-surface">Free Weight Training</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-dawn-muted">Intensity:</span>
              <div className="flex space-x-1.5">
                {(['gentle', 'moderate', 'intense'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setExerciseIntensity(lvl)}
                    className={`text-[11px] px-2.5 py-1 rounded-xl border capitalize transition-all ${
                      exerciseIntensity === lvl
                        ? 'bg-dawn-gold/25 border-dawn-gold text-dawn-gold font-bold shadow-gold-sm'
                        : 'bg-white/[0.04] border-white/10 text-dawn-muted'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Notes (e.g. 30 pushups, 20 air squats)..."
              aria-label="Exercise notes"
                value={exerciseNotes}
              onChange={(e) => setExerciseNotes(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
            />
          </div>
        )}

        {/* 5. READING */}
        {ritualType === 'reading' && (
          <div className="glass-card rounded-3xl p-4.5 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-dawn-gold">
              Reading Tracker
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label htmlFor="reading-title" className="text-[11px] text-dawn-muted">Book / Article:</label>
                <input
                id="reading-title"
                  type="text"
                  placeholder="e.g. Atomic Habits"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="reading-pages" className="text-[11px] text-dawn-muted">Pages Read:</label>
                <input
                id="reading-pages"
                  type="number"
                  min="0"
                  value={pagesRead}
                  onChange={(e) => setPagesRead(Number(e.target.value))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white text-center"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="reading-insight" className="text-[11px] text-dawn-muted">Key Takeaway / Insight:</label>
              <textarea
                id="reading-insight"
                placeholder="What one idea from today's reading will you apply?"
                rows={2}
                value={readingNotes}
                onChange={(e) => setReadingNotes(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* 6. SCRIBING */}
        {ritualType === 'scribing' && (
          <div className="glass-card rounded-3xl p-4.5 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-dawn-gold">
              Gratitude & Reflection Journal
            </span>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-300">
                3 Things I Am Deeply Grateful For:
              </label>
              <input
                type="text"
                placeholder="1. The peaceful silence of this morning..."
                aria-label="First gratitude"
                value={gratitude1}
                onChange={(e) => setGratitude1(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="2. The strength in my body to begin again..."
                aria-label="Second gratitude"
                value={gratitude2}
                onChange={(e) => setGratitude2(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="3. A fresh start today..."
                aria-label="Third gratitude"
                value={gratitude3}
                onChange={(e) => setGratitude3(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Daily Reflection & Primary Intention:
              </label>
              <textarea
                placeholder="Today, my primary focus is..."
                rows={2}
                aria-label="Daily reflection"
                value={scribingReflection}
                onChange={(e) => setScribingReflection(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center space-x-2 pt-2">
          {isSequence && (
            <button
              onClick={handleSkip}
              className="flex-1 py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-dawn-muted hover:text-white rounded-2xl text-xs font-semibold flex items-center justify-center space-x-1 min-h-[44px] active:scale-95"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip</span>
            </button>
          )}

          <button
            onClick={handleComplete}
            className="flex-[2] py-3.5 liquid-gold-button rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 min-h-[44px] active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 fill-dawn-dark text-dawn-gold-light" />
            <span>
              {isSequence && sequenceStep < totalSequenceSteps
                ? 'Complete & Next'
                : 'Complete Ritual'}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
