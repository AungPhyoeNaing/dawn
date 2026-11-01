import { describe, it, expect } from 'vitest';
import {
  getLocalDateString,
  parseLocalDateString,
  daysBetween,
  addDays,
  isToday,
  getMonthGrid,
} from '../utils/date';

describe('Date & Midnight Transition Logic', () => {
  it('formats Date to YYYY-MM-DD correctly', () => {
    const d = new Date(2026, 10, 5); // Month 10 is November (0-indexed)
    expect(getLocalDateString(d)).toBe('2026-11-05');
  });

  it('parses YYYY-MM-DD string into local midnight Date', () => {
    const d = parseLocalDateString('2026-11-05');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(10);
    expect(d.getDate()).toBe(5);
    expect(d.getHours()).toBe(0);
  });

  it('calculates integer days between two dates across month boundaries', () => {
    expect(daysBetween('2026-10-25', '2026-11-02')).toBe(8);
    expect(daysBetween('2026-02-27', '2026-03-01')).toBe(2);
  });

  it('handles midnight transition / day rollover cleanly with addDays', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
  });

  it('correctly detects if date string matches today', () => {
    const todayStr = getLocalDateString();
    expect(isToday(todayStr)).toBe(true);
    expect(isToday('2020-01-01')).toBe(false);
  });

  it('generates a full calendar grid with proper days and weeks', () => {
    // November 2026 (0-indexed: month 10)
    const grid = getMonthGrid(2026, 10);
    expect(grid.length).toBeGreaterThanOrEqual(4);
    expect(grid.length).toBeLessThanOrEqual(6);
    grid.forEach(week => {
      expect(week.length).toBe(7);
    });

    // Check that Nov 1 is present in the grid
    const allCells = grid.flat();
    const nov1 = allCells.find(c => c.dateStr === '2026-11-01');
    expect(nov1).toBeDefined();
    expect(nov1?.isCurrentMonth).toBe(true);
  });
});
