import { describe, it, expect } from 'vitest';
import { calculateStreakStats, getDayDisciplineStatus, MILESTONES } from '../utils/discipline';
import { DisciplineRelapse } from '../types';

describe('Discipline Streak Calculations', () => {
  it('calculates current streak correctly with no relapses', () => {
    const stats = calculateStreakStats({
      startDate: '2026-10-01',
      relapses: [],
      todayDate: '2026-10-15',
    });

    expect(stats.currentStreakDays).toBe(14);
    expect(stats.longestStreakDays).toBe(14);
    expect(stats.totalCleanDays).toBe(14);
    expect(stats.totalSetbacks).toBe(0);
  });

  it('calculates current streak correctly after a relapse 5 days ago', () => {
    const relapses: DisciplineRelapse[] = [
      {
        goalId: 'pornography',
        date: '2026-10-10',
        streakLengthDaysAtRelapse: 9,
        createdAt: '2026-10-10T10:00:00Z',
      },
    ];

    const stats = calculateStreakStats({
      startDate: '2026-10-01',
      relapses,
      todayDate: '2026-10-15',
    });

    // From 2026-10-10 to 2026-10-15 is 5 days
    expect(stats.currentStreakDays).toBe(5);
    // Longest streak was 9 days (from start 10-01 to 10-10)
    expect(stats.longestStreakDays).toBe(9);
    expect(stats.totalSetbacks).toBe(1);
    expect(stats.totalCleanDays).toBe(13); // 14 total days minus 1 setback
  });

  it('resets current streak to 0 if a relapse occurred today', () => {
    const relapses: DisciplineRelapse[] = [
      {
        goalId: 'pornography',
        date: '2026-10-15',
        streakLengthDaysAtRelapse: 14,
        createdAt: '2026-10-15T09:00:00Z',
      },
    ];

    const stats = calculateStreakStats({
      startDate: '2026-10-01',
      relapses,
      todayDate: '2026-10-15',
    });

    expect(stats.currentStreakDays).toBe(0);
    expect(stats.longestStreakDays).toBe(14); // preserved!
    expect(stats.totalSetbacks).toBe(1);
  });

  it('preserves the longest streak across multiple relapses', () => {
    const relapses: DisciplineRelapse[] = [
      {
        goalId: 'pornography',
        date: '2026-08-01',
        streakLengthDaysAtRelapse: 30, // 30 day streak
        createdAt: '2026-08-01T12:00:00Z',
      },
      {
        goalId: 'pornography',
        date: '2026-08-10',
        streakLengthDaysAtRelapse: 9, // 9 day streak
        createdAt: '2026-08-10T12:00:00Z',
      },
      {
        goalId: 'pornography',
        date: '2026-09-01',
        streakLengthDaysAtRelapse: 22, // 22 day streak
        createdAt: '2026-09-01T12:00:00Z',
      },
    ];

    const stats = calculateStreakStats({
      startDate: '2026-07-01',
      relapses,
      todayDate: '2026-09-04',
    });

    expect(stats.currentStreakDays).toBe(3); // from 09-01 to 09-04
    expect(stats.longestStreakDays).toBe(31); // 07-01 to 08-01 is 31 days
    expect(stats.totalSetbacks).toBe(3);
  });

  it('calculates milestone targets and progress correctly', () => {
    // 5 days streak: next milestone is 7 days (One Week)
    const stats = calculateStreakStats({
      startDate: '2026-10-10',
      relapses: [],
      todayDate: '2026-10-15',
    });

    expect(stats.currentStreakDays).toBe(5);
    expect(stats.nextMilestone.days).toBe(7);
    expect(stats.nextMilestoneDaysRemaining).toBe(2);
    expect(stats.previousMilestone?.days).toBe(3);
    // Segment from 3 to 7: 4 days total; 5 is 2 days in => 50%
    expect(stats.nextMilestoneProgressPct).toBe(50);
  });

  it('evaluates calendar day status correctly', () => {
    const relapses: DisciplineRelapse[] = [
      { goalId: 'pornography', date: '2026-10-05', streakLengthDaysAtRelapse: 4, createdAt: '' },
    ];

    expect(getDayDisciplineStatus({
      dateStr: '2026-09-30',
      startDate: '2026-10-01',
      relapses,
      todayDate: '2026-10-10',
    })).toBe('before_start');

    expect(getDayDisciplineStatus({
      dateStr: '2026-10-05',
      startDate: '2026-10-01',
      relapses,
      todayDate: '2026-10-10',
    })).toBe('relapse');

    expect(getDayDisciplineStatus({
      dateStr: '2026-10-06',
      startDate: '2026-10-01',
      relapses,
      todayDate: '2026-10-10',
    })).toBe('clean');

    expect(getDayDisciplineStatus({
      dateStr: '2026-10-12',
      startDate: '2026-10-01',
      relapses,
      todayDate: '2026-10-10',
    })).toBe('future');
  });
});
