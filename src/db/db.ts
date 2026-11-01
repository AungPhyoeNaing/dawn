import Dexie, { type EntityTable } from 'dexie';
import {
  RitualSession,
  DisciplineGoal,
  DisciplineCheckin,
  DisciplineRelapse,
  Affirmation,
  VisualizationGoal,
  JournalEntry,
  ReadingLog,
  ExerciseLog,
  UserSettings,
  RitualType,
} from '../types';
import { getLocalDateString } from '../utils/date';

export const INITIAL_AFFIRMATIONS: Omit<Affirmation, 'id'>[] = [
  { text: "I am the conscious architect of my attention, my time, and my character.", category: 'discipline', isCustom: false, isFavorite: true, createdAt: new Date().toISOString() },
  { text: "I greet this day with clarity, gratitude, and unshakeable inner peace.", category: 'peace', isCustom: false, isFavorite: true, createdAt: new Date().toISOString() },
  { text: "My impulses do not control me; I pause, breathe, and choose my response.", category: 'strength', isCustom: false, isFavorite: true, createdAt: new Date().toISOString() },
  { text: "Every morning I wake up is a clean slate to become who I respect.", category: 'mindset', isCustom: false, isFavorite: false, createdAt: new Date().toISOString() },
  { text: "Small daily disciplines quietly compound into massive life transformations.", category: 'growth', isCustom: false, isFavorite: false, createdAt: new Date().toISOString() },
  { text: "I nourish my mind with wisdom and my body with purposeful movement.", category: 'growth', isCustom: false, isFavorite: false, createdAt: new Date().toISOString() },
  { text: "I am patient with my progress and compassionate with my stumbling.", category: 'peace', isCustom: false, isFavorite: false, createdAt: new Date().toISOString() },
  { text: "My highest self is forged in the decisions I make when nobody is watching.", category: 'discipline', isCustom: false, isFavorite: true, createdAt: new Date().toISOString() },
  { text: "I release the past with forgiveness and step into the present with resolve.", category: 'strength', isCustom: false, isFavorite: false, createdAt: new Date().toISOString() },
  { text: "Today I choose courage over comfort, and presence over distraction.", category: 'mindset', isCustom: false, isFavorite: true, createdAt: new Date().toISOString() },
];

export const INITIAL_VISUALIZATIONS: Omit<VisualizationGoal, 'id'>[] = [
  {
    title: "Unshakeable Physical Vitality",
    description: "Waking up energized, clear-headed, strong in body, and moving through the day with effortless stamina.",
    category: 'health',
    createdAt: new Date().toISOString()
  },
  {
    title: "Mastery of Focus and Craft",
    description: "Deep flow state where meaningful work is created without digital distractions or restless seeking.",
    category: 'career',
    createdAt: new Date().toISOString()
  },
  {
    title: "Inner Serenity and Self-Respect",
    description: "Living in complete integrity where words, thoughts, and quiet private actions are in pure alignment.",
    category: 'peace',
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_DISCIPLINE_GOALS: DisciplineGoal[] = [
  {
    id: 'pornography',
    title: 'Pornography-Free',
    tagline: 'Reclaiming dopamine, presence, and genuine human connection.',
    enabled: true,
    startDate: getLocalDateString(),
    targetMilestoneDays: 90,
    description: 'Protecting mental clarity and freeing the reward pathway from artificial hyper-stimulation.'
  },
  {
    id: 'masturbation',
    title: 'Masturbation-Free',
    tagline: 'Channeling creative and physical life force into purposeful action.',
    enabled: true,
    startDate: getLocalDateString(),
    targetMilestoneDays: 90,
    description: 'Retaining vital energy, building emotional resilience, and practicing conscious self-control.'
  }
];

export class DawnDatabase extends Dexie {
  ritualSessions!: EntityTable<RitualSession, 'id'>;
  disciplineGoals!: EntityTable<DisciplineGoal, 'id'>;
  disciplineCheckins!: EntityTable<DisciplineCheckin, 'id'>;
  disciplineRelapses!: EntityTable<DisciplineRelapse, 'id'>;
  affirmations!: EntityTable<Affirmation, 'id'>;
  visualizationGoals!: EntityTable<VisualizationGoal, 'id'>;
  journalEntries!: EntityTable<JournalEntry, 'id'>;
  readingLogs!: EntityTable<ReadingLog, 'id'>;
  exerciseLogs!: EntityTable<ExerciseLog, 'id'>;
  userSettings!: EntityTable<UserSettings, 'id'>;

  constructor() {
    super('DawnDatabase');

    this.version(1).stores({
      ritualSessions: '++id, date, routinePreset, updatedAt',
      disciplineGoals: 'id, enabled, startDate',
      disciplineCheckins: '++id, [goalId+date], goalId, date, status, createdAt',
      disciplineRelapses: '++id, goalId, date, streakLengthDaysAtRelapse, createdAt',
      affirmations: '++id, category, isCustom, isFavorite, createdAt',
      visualizationGoals: '++id, category, createdAt',
      journalEntries: '++id, date, mood, createdAt, updatedAt',
      readingLogs: '++id, date, bookTitle, createdAt',
      exerciseLogs: '++id, date, activityType, createdAt',
      userSettings: '++id',
    });
  }
}

export const db = new DawnDatabase();

/**
 * Initializes database with default data if empty
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // 1. Settings
    const settingsCount = await db.userSettings.count();
    if (settingsCount === 0) {
      const defaultDurations: Record<RitualType, number> = {
        silence: 5,
        affirmations: 5,
        visualization: 5,
        exercise: 5,
        reading: 5,
        scribing: 5,
      };

      await db.userSettings.add({
        userName: 'Friend',
        theme: 'dark',
        routinePreset: '30min',
        customDurations: defaultDurations,
        soundEnabled: true,
        hasSeenOnboarding: false,
      });
    }

    // 2. Discipline Goals
    const goalsCount = await db.disciplineGoals.count();
    if (goalsCount === 0) {
      await db.disciplineGoals.bulkAdd(DEFAULT_DISCIPLINE_GOALS);
    }

    // 3. Affirmations
    const affirmationsCount = await db.affirmations.count();
    if (affirmationsCount === 0) {
      await db.affirmations.bulkAdd(INITIAL_AFFIRMATIONS);
    }

    // 4. Visualization Goals
    const visionsCount = await db.visualizationGoals.count();
    if (visionsCount === 0) {
      await db.visualizationGoals.bulkAdd(INITIAL_VISUALIZATIONS);
    }
  } catch (error) {
    console.error('Failed to initialize database seed data:', error);
  }
}
