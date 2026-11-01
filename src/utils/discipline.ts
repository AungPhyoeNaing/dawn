import { Milestone, DisciplineCheckin, DisciplineRelapse } from '../types';
import { daysBetween, getLocalDateString, parseLocalDateString } from './date';

export const MILESTONES: Milestone[] = [
  { days: 1, title: 'First Step', description: '24 hours of conscious choice and integrity.', badge: '🌱' },
  { days: 3, title: 'Grounding', description: 'Navigating initial impulses with steady presence.', badge: '🌿' },
  { days: 7, title: 'One Week', description: 'A complete 7-day cycle lived in alignment.', badge: '⭐' },
  { days: 14, title: 'Fortnight', description: 'Two weeks of reclaiming your time and focus.', badge: '🛡️' },
  { days: 21, title: 'Habit Shift', description: 'Deepening neural pathways toward self-command.', badge: '🔥' },
  { days: 30, title: 'One Month', description: 'A full month of sovereignty and self-respect.', badge: '🌕' },
  { days: 60, title: 'Deep Roots', description: 'Steadfast emotional regulation and internal calm.', badge: '💎' },
  { days: 90, title: 'The Reboot', description: 'A transformative quarter of clarity and renewal.', badge: '👑' },
  { days: 180, title: 'Half Year', description: 'Six months of enduring discipline and dignity.', badge: '🏔️' },
  { days: 365, title: 'One Year', description: 'A full orbit in complete freedom and ownership.', badge: '🌅' },
];

export interface StreakStats {
  currentStreakDays: number;
  longestStreakDays: number;
  startDate: string;
  totalCleanDays: number;
  totalSetbacks: number;
  nextMilestone: Milestone;
  nextMilestoneDaysRemaining: number;
  nextMilestoneProgressPct: number;
  previousMilestone?: Milestone;
}

/**
 * Calculates current streak and longest streak accurately without losing history
 */
export function calculateStreakStats(params: {
  startDate: string;
  relapses: DisciplineRelapse[];
  checkins?: DisciplineCheckin[];
  todayDate?: string;
}): StreakStats {
  const today = params.todayDate || getLocalDateString();
  const relapses = [...params.relapses].sort((a, b) => a.date.localeCompare(b.date));
  const checkins = params.checkins || [];

  // Filter out any future relapses if erroneously recorded
  const validRelapses = relapses.filter(r => r.date <= today);

  // Start date should not be after today
  const effectiveStartDate = params.startDate > today ? today : params.startDate;

  let currentStreak = 0;
  if (validRelapses.length === 0) {
    currentStreak = Math.max(0, daysBetween(effectiveStartDate, today));
  } else {
    const latestRelapse = validRelapses[validRelapses.length - 1];
    currentStreak = Math.max(0, daysBetween(latestRelapse.date, today));
  }

  // Calculate longest streak across history
  let longestStreak = currentStreak;

  // 1. From start date to first relapse
  if (validRelapses.length > 0) {
    const firstInterval = Math.max(0, daysBetween(effectiveStartDate, validRelapses[0].date));
    if (firstInterval > longestStreak) {
      longestStreak = firstInterval;
    }

    // 2. Between consecutive relapses
    for (let i = 0; i < validRelapses.length - 1; i++) {
      const interval = Math.max(0, daysBetween(validRelapses[i].date, validRelapses[i + 1].date));
      if (interval > longestStreak) {
        longestStreak = interval;
      }
    }

    // 3. Stored streakLengthDaysAtRelapse in records
    for (const r of validRelapses) {
      if (r.streakLengthDaysAtRelapse && r.streakLengthDaysAtRelapse > longestStreak) {
        longestStreak = r.streakLengthDaysAtRelapse;
      }
    }
  }

  // Calculate total setbacks
  const totalSetbacks = validRelapses.length;

  // Calculate clean days
  const totalDaysSinceStart = Math.max(0, daysBetween(effectiveStartDate, today));
  const totalCleanDays = Math.max(0, totalDaysSinceStart - totalSetbacks);

  // Next milestone calculation
  let previousMilestone: Milestone | undefined;
  let nextMilestone = MILESTONES[0];

  for (let i = 0; i < MILESTONES.length; i++) {
    if (currentStreak >= MILESTONES[i].days) {
      previousMilestone = MILESTONES[i];
    } else {
      nextMilestone = MILESTONES[i];
      break;
    }
  }

  // If currentStreak >= 365, next milestone remains the highest
  if (currentStreak >= MILESTONES[MILESTONES.length - 1].days) {
    nextMilestone = MILESTONES[MILESTONES.length - 1];
    previousMilestone = MILESTONES[MILESTONES.length - 2];
  }

  const prevDays = previousMilestone ? previousMilestone.days : 0;
  const daysInSegment = Math.max(1, nextMilestone.days - prevDays);
  const daysDoneInSegment = Math.max(0, currentStreak - prevDays);
  const nextMilestoneProgressPct = currentStreak >= nextMilestone.days 
    ? 100 
    : Math.min(100, Math.round((daysDoneInSegment / daysInSegment) * 100));

  const nextMilestoneDaysRemaining = Math.max(0, nextMilestone.days - currentStreak);

  return {
    currentStreakDays: currentStreak,
    longestStreakDays: longestStreak,
    startDate: effectiveStartDate,
    totalCleanDays,
    totalSetbacks,
    nextMilestone,
    nextMilestoneDaysRemaining,
    nextMilestoneProgressPct,
    previousMilestone,
  };
}

/**
 * Determines status of a specific calendar day for discipline visualization:
 * - 'clean': no relapse recorded
 * - 'relapse': setback occurred on this day
 * - 'future': after today
 * - 'before_start': before goal start date
 */
export function getDayDisciplineStatus(params: {
  dateStr: string;
  startDate: string;
  relapses: DisciplineRelapse[];
  checkins?: DisciplineCheckin[];
  todayDate?: string;
}): 'clean' | 'relapse' | 'future' | 'before_start' {
  const today = params.todayDate || getLocalDateString();
  const { dateStr, startDate, relapses, checkins } = params;

  if (dateStr > today) {
    return 'future';
  }
  if (dateStr < startDate) {
    return 'before_start';
  }

  const isRelapse = relapses.some(r => r.date === dateStr);
  if (isRelapse) {
    return 'relapse';
  }

  const checkin = checkins?.find(c => c.date === dateStr);
  if (checkin && checkin.status === 'relapse') {
    return 'relapse';
  }

  return 'clean';
}
