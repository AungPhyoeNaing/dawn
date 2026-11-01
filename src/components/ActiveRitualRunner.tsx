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
  BookOpen,
  PenTool,
  Flame,
  Sparkles,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  RitualType,
  Affirmation,
  VisualizationGoal,
  JournalEntry,
} from '../types';
import { RITUAL_DEFINITIONS } from '../data/rituals';
import {
  TimerState,
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

    // Persist specific ritual logs
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

    // If last step or single ritual, fire confetti!
    if (!isSequence || sequenceStep === totalSequenceSteps) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FCD34D', '#10B981', '#38BDF8'],
        });
      } catch (e) {
        // ignore in non-browser env
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

  // Image upload for vision board (stored as base64 in IndexedDB)
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
    <div className="fixed inset-0 z-50 bg-dawn-dark text-dawn-light flex flex-col pt-safe pb-safe overflow-y-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dawn-border/60 bg-dawn-surface/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-dawn-gold/20 text-dawn-gold flex items-center justify-center font-bold text-sm">
            {definition.shortName}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">{definition.name}</h2>
            {isSequence ? (
              <span className="text-[10px] text-dawn-muted">
                Step {sequenceStep} of {totalSequenceSteps} in Miracle Morning
              </span>
            ) : (
              <span className="text-[10px] text-dawn-muted">{definition.tagline}</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full text-dawn-muted hover:text-white"
            aria-label="Toggle bell sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-dawn-gold" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-dawn-card text-dawn-muted hover:text-white"
            aria-label="Close ritual runner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto w-full space-y-4 flex-1">
        {/* TIMER HERO CIRCLE */}
        <div className="bg-dawn-card border border-dawn-border rounded-3xl p-5 text-center relative overflow-hidden shadow-xl">
          {/* Circular SVG Timer Ring */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-dawn-surface fill-transparent"
                strokeWidth="6"
              />
              {/* Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-dawn-gold fill-transparent transition-all duration-300 ease-linear"
                strokeWidth="6"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progressPct) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Timer Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                {formatSeconds(remainingSeconds)}
              </span>
              <span className="text-[11px] text-dawn-muted mt-0.5">
                {timer.isRunning ? 'In progress' : elapsedSeconds > 0 ? 'Paused' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Quick Timer Controls */}
          <div className="flex items-center justify-center space-x-3 mt-4">
            <button
              onClick={handleReset}
              className="p-2.5 rounded-full bg-dawn-surface text-dawn-muted hover:text-white transition-colors min-h-touch min-w-touch flex items-center justify-center"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-dawn-gold to-dawn-gold-light text-dawn-dark font-bold text-sm flex items-center space-x-2 shadow-gold-sm transition-transform active:scale-95 min-h-touch"
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
              className="px-2.5 py-1.5 rounded-full bg-dawn-surface border border-dawn-border text-xs text-dawn-gold font-medium hover:bg-dawn-card"
              aria-label="Add one minute"
            >
              +1 min
            </button>
          </div>
        </div>

        {/* SPECIFIC RITUAL CONTENT WORKSPACE */}

        {/* 1. SILENCE */}
        {ritualType === 'silence' && (
          <div className="bg-dawn-card border border-dawn-border rounded-2xl p-4 text-center space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-dawn-gold">
                Guided Silence Pacer
              </span>
              <h3 className="text-xs font-semibold text-slate-200">
                {timer.isRunning ? `${silencePacerPhase} (${silencePacerSeconds}s)` : 'Start timer to begin breathing guide'}
              </h3>
            </div>
            <div className="text-xs text-slate-300 bg-dawn-surface/60 rounded-xl p-3 border border-dawn-border text-left space-y-1">
              <p className="font-medium text-white">Mindfulness Focus:</p>
              <p className="text-[11px] text-dawn-muted leading-relaxed">
                Sit comfortably, lower your chin slightly, and observe the natural breath entering and leaving your nostrils.
              </p>
            </div>
          </div>
        )}

        {/* 2. AFFIRMATIONS */}
        {ritualType === 'affirmations' && (
          <div className="bg-dawn-card border border-dawn-border rounded-2xl p-4 space-y-3">
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
              <div className="bg-dawn-surface p-4 rounded-xl border border-dawn-border space-y-3 min-h-[110px] flex flex-col justify-between">
                <p className="text-sm font-medium text-white leading-relaxed italic">
                  "{affirmations[currentAffirmationIndex]?.text}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-dawn-border/50 text-xs">
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-dawn-card text-dawn-muted">
                    {affirmations[currentAffirmationIndex]?.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleFavoriteAffirmation(affirmations[currentAffirmationIndex])}
                      className="p-1 text-dawn-muted hover:text-rose-400"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          affirmations[currentAffirmationIndex]?.isFavorite
                            ? 'fill-rose-500 text-rose-500'
                            : ''
                        }`}
                      />
                    </button>
                    <button
                      disabled={currentAffirmationIndex === 0}
                      onClick={() => setCurrentAffirmationIndex((i) => Math.max(0, i - 1))}
                      className="p-1 text-dawn-muted disabled:opacity-20"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
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
              <div className="p-3 bg-dawn-surface rounded-xl border border-dawn-border space-y-2">
                <input
                  type="text"
                  placeholder="I am capable, grounded, and..."
                  value={newAffirmationText}
                  onChange={(e) => setNewAffirmationText(e.target.value)}
                  className="w-full bg-dawn-dark border border-dawn-border rounded-lg p-2 text-xs text-white"
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
                    className="text-xs px-3 py-1 bg-dawn-gold text-dawn-dark font-semibold rounded-lg"
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
          <div className="bg-dawn-card border border-dawn-border rounded-2xl p-4 space-y-3">
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
              <div className="bg-dawn-surface p-4 rounded-xl border border-dawn-border space-y-3">
                {visualizations[currentVisionIndex]?.imageUrl && (
                  <img
                    src={visualizations[currentVisionIndex].imageUrl}
                    alt={visualizations[currentVisionIndex].title}
                    className="w-full h-32 object-cover rounded-lg border border-dawn-border"
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

                <div className="flex items-center justify-between pt-2 border-t border-dawn-border/50">
                  <span className="text-[10px] text-dawn-muted uppercase">
                    Feel the emotions of already arriving
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={currentVisionIndex === 0}
                      onClick={() => setCurrentVisionIndex((i) => Math.max(0, i - 1))}
                      className="p-1 text-dawn-muted disabled:opacity-20"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
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
              <div className="p-3 bg-dawn-surface rounded-xl border border-dawn-border space-y-2">
                <input
                  type="text"
                  placeholder="Vision Goal Title..."
                  value={newVisionTitle}
                  onChange={(e) => setNewVisionTitle(e.target.value)}
                  className="w-full bg-dawn-dark border border-dawn-border rounded-lg p-2 text-xs text-white"
                />
                <textarea
                  placeholder="Describe your ideal vision vividly..."
                  rows={2}
                  value={newVisionDesc}
                  onChange={(e) => setNewVisionDesc(e.target.value)}
                  className="w-full bg-dawn-dark border border-dawn-border rounded-lg p-2 text-xs text-white"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white"
                  >
                    <Camera className="w-4 h-4 text-dawn-gold" />
                    <span>{newVisionImage ? 'Image Selected' : 'Attach Photo'}</span>
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
                      className="text-xs px-3 py-1 bg-dawn-gold text-dawn-dark font-semibold rounded-lg"
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
          <div className="bg-dawn-card border border-dawn-border rounded-2xl p-4 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-dawn-gold">
              Movement & Vitality Log
            </span>

            <div className="space-y-1.5">
              <label className="text-[11px] text-dawn-muted">Activity Type:</label>
              <select
                value={exerciseActivity}
                onChange={(e) => setExerciseActivity(e.target.value)}
                className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white"
              >
                <option value="Gentle Yoga & Stretching">Gentle Yoga & Stretching</option>
                <option value="Calisthenics (Pushups/Squats)">Calisthenics (Pushups/Squats)</option>
                <option value="Core & Abs Workout">Core & Abs Workout</option>
                <option value="Brisk Morning Walk">Brisk Morning Walk</option>
                <option value="HIIT / Cardio Blast">HIIT / Cardio Blast</option>
                <option value="Free Weight Training">Free Weight Training</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-dawn-muted">Intensity:</span>
              <div className="flex space-x-1">
                {(['gentle', 'moderate', 'intense'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setExerciseIntensity(lvl)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border capitalize ${
                      exerciseIntensity === lvl
                        ? 'bg-dawn-gold/20 border-dawn-gold text-dawn-gold font-medium'
                        : 'bg-dawn-surface border-dawn-border text-dawn-muted'
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
              value={exerciseNotes}
              onChange={(e) => setExerciseNotes(e.target.value)}
              className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white placeholder-slate-500"
            />
          </div>
        )}

        {/* 5. READING */}
        {ritualType === 'reading' && (
          <div className="bg-dawn-card border border-dawn-border rounded-2xl p-4 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-dawn-gold">
              Reading Tracker
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-[11px] text-dawn-muted">Book / Article:</label>
                <input
                  type="text"
                  placeholder="e.g. Atomic Habits"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-dawn-muted">Pages Read:</label>
                <input
                  type="number"
                  min="0"
                  value={pagesRead}
                  onChange={(e) => setPagesRead(Number(e.target.value))}
                  className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-dawn-muted">Key Takeaway / Insight:</label>
              <textarea
                placeholder="What one idea from today's reading will you apply?"
                rows={2}
                value={readingNotes}
                onChange={(e) => setReadingNotes(e.target.value)}
                className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* 6. SCRIBING */}
        {ritualType === 'scribing' && (
          <div className="bg-dawn-card border border-dawn-border rounded-2xl p-4 space-y-3">
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
                value={gratitude1}
                onChange={(e) => setGratitude1(e.target.value)}
                className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="2. The strength in my body to begin again..."
                value={gratitude2}
                onChange={(e) => setGratitude2(e.target.value)}
                className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="3. A warm cup of water / fresh start..."
                value={gratitude3}
                onChange={(e) => setGratitude3(e.target.value)}
                className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Daily Reflection & Primary Intention:
              </label>
              <textarea
                placeholder="Today, my primary focus is..."
                rows={2}
                value={scribingReflection}
                onChange={(e) => setScribingReflection(e.target.value)}
                className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center space-x-2 pt-2">
          {isSequence && (
            <button
              onClick={handleSkip}
              className="flex-1 py-3 bg-dawn-surface hover:bg-dawn-card border border-dawn-border text-dawn-muted hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 min-h-[44px]"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Skip</span>
            </button>
          )}

          <button
            onClick={handleComplete}
            className="flex-[2] py-3 bg-gradient-to-r from-dawn-gold to-dawn-gold-light hover:brightness-105 text-dawn-dark rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-gold-sm transition-transform active:scale-98 min-h-[44px]"
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
    </div>
  );
};
