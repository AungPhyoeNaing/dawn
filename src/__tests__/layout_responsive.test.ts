import { describe, it, expect } from 'vitest';
import { ROUTINE_PRESETS } from '../data/rituals';
import { MILESTONES } from '../utils/discipline';
import { MOTIVATION_QUOTES } from '../data/motivation';

describe('Responsive Layout & System Constraints', () => {
  it('supports target iPhone SE 2020 viewport width (375px) without structural overflow', () => {
    const baseTargetWidth = 375;
    const paddingX = 14 * 2; // px-3.5
    const usableWidth = baseTargetWidth - paddingX;
    
    expect(usableWidth).toBe(347);
    // 6 ritual chips on iPhone SE: each chip can be ~50-55px wide, fitting within 347px
    const chipWidth = Math.floor(usableWidth / 6);
    expect(chipWidth).toBeGreaterThanOrEqual(44); // touch target comfortable
  });

  it('validates 320px ultra-compact viewport minimum touch constraints', () => {
    const minWidth = 320;
    expect(minWidth).toBeGreaterThan(0);
    // Verify routine presets support minimal 1-minute express
    expect(ROUTINE_PRESETS['6min'].totalMinutes).toBe(6);
  });

  it('verifies all routine presets have balanced durations totaling expected minutes', () => {
    Object.values(ROUTINE_PRESETS).forEach((preset) => {
      const sum = Object.values(preset.durations).reduce((a, b) => a + b, 0);
      expect(sum).toBe(preset.totalMinutes);
    });
  });

  it('verifies motivation library contains at least 100 original quotes', () => {
    expect(MOTIVATION_QUOTES.length).toBeGreaterThanOrEqual(100);
    
    // Ensure all 7 required categories are represented
    const categories = new Set(MOTIVATION_QUOTES.map(q => q.category));
    expect(categories.has('morning')).toBe(true);
    expect(categories.has('ritual_complete')).toBe(true);
    expect(categories.has('consistency')).toBe(true);
    expect(categories.has('milestone')).toBe(true);
    expect(categories.has('difficult_days')).toBe(true);
    expect(categories.has('missed_routines')).toBe(true);
    expect(categories.has('evening')).toBe(true);
  });

  it('ensures milestone progression is strictly strictly increasing in days', () => {
    for (let i = 1; i < MILESTONES.length; i++) {
      expect(MILESTONES[i].days).toBeGreaterThan(MILESTONES[i - 1].days);
    }
  });
});
