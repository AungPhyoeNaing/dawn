// Type definitions for DAWN

export type RitualType = 'silence' | 'affirmations' | 'visualization' | 'exercise' | 'reading' | 'scribing';

export interface RitualDefinition {
  id: RitualType;
  name: string;
  shortName: string;
  tagline: string;
  iconName: string;
  defaultMinutes: number; // in standard 30-min routine
  description: string;
  guidance: string[];
}

export interface RoutinePreset {
  id: '6min' | '30min' | '60min' | 'custom';
  name: string;
  description: string;
  totalMinutes: number;
  durations: Record<RitualType, number>; // in minutes
}

export interface RitualSession {
  id?: number;
  date: string; // YYYY-MM-DD
  completedRituals: RitualType[];
  skippedRituals?: RitualType[];
  routinePreset: string;
  totalSeconds: number;
  notes?: string;
  completedAt?: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface DisciplineGoal {
  id: 'pornography' | 'masturbation' | string;
  title: string;
  tagline: string;
  enabled: boolean;
  startDate: string; // YYYY-MM-DD or ISO
  targetMilestoneDays?: number;
  description?: string;
}

export type CheckinStatus = 'clean' | 'relapse';

export interface DisciplineCheckin {
  id?: number;
  goalId: string;
  date: string; // YYYY-MM-DD
  status: CheckinStatus;
  reflection?: string;
  trigger?: string;
  urgesManaged?: number; // 0-5 scale
  createdAt: string;
}

export interface DisciplineRelapse {
  id?: number;
  goalId: string;
  date: string; // YYYY-MM-DD
  time?: string;
  streakLengthDaysAtRelapse: number;
  trigger?: string;
  reflection?: string;
  lessonLearned?: string;
  createdAt: string;
}

export interface Milestone {
  days: number;
  title: string;
  description: string;
  badge: string; // emoji or icon key
}

export interface Affirmation {
  id?: number;
  text: string;
  category: 'strength' | 'mindset' | 'growth' | 'peace' | 'discipline' | 'custom';
  isCustom: boolean;
  isFavorite: boolean;
  createdAt: string;
}

export interface VisualizationGoal {
  id?: number;
  title: string;
  description: string;
  category: 'vision' | 'health' | 'career' | 'peace' | 'character';
  imageUrl?: string; // base64 or object URL
  targetDate?: string;
  createdAt: string;
}

export interface JournalEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  prompt?: string;
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
  reflection: string;
  mood?: 'radiant' | 'peaceful' | 'neutral' | 'struggling' | 'determined';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReadingLog {
  id?: number;
  date: string; // YYYY-MM-DD
  bookTitle: string;
  pagesRead: number;
  timeSpentSeconds: number;
  notes: string;
  createdAt: string;
}

export interface ExerciseLog {
  id?: number;
  date: string; // YYYY-MM-DD
  activityType: string;
  durationSeconds: number;
  intensity: 'gentle' | 'moderate' | 'intense';
  notes: string;
  createdAt: string;
}

export interface UserSettings {
  id?: number;
  userName: string;
  theme: 'dark' | 'light';
  routinePreset: '6min' | '30min' | '60min' | 'custom';
  customDurations: Record<RitualType, number>; // in minutes
  soundEnabled: boolean;
  hasSeenOnboarding: boolean;
  installedPwaPromptDismissed?: boolean;
}

export type MotivationCategory = 
  | 'morning' 
  | 'ritual_complete' 
  | 'consistency' 
  | 'milestone' 
  | 'difficult_days' 
  | 'missed_routines' 
  | 'evening';

export interface MotivationQuote {
  id: string;
  text: string;
  category: MotivationCategory;
  author?: string;
}
