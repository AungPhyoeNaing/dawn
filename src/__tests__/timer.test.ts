import { describe, it, expect } from 'vitest';
import {
  createInitialTimerState,
  startTimer,
  pauseTimer,
  getElapsedSeconds,
  getRemainingSeconds,
  getTimerProgress,
  formatSeconds,
} from '../utils/timer';

describe('Timestamp-based Timer Logic', () => {
  it('initializes timer state with target duration', () => {
    const timer = createInitialTimerState(300); // 5 minutes
    expect(timer.isRunning).toBe(false);
    expect(timer.targetDurationSeconds).toBe(300);
    expect(getElapsedSeconds(timer)).toBe(0);
    expect(getRemainingSeconds(timer)).toBe(300);
  });

  it('accurately computes elapsed time across wall-clock time', () => {
    const t0 = 1000000;
    let timer = createInitialTimerState(60);
    timer = startTimer(timer, t0);

    // After 25 seconds of real time
    const t1 = t0 + 25000;
    expect(getElapsedSeconds(timer, t1)).toBe(25);
    expect(getRemainingSeconds(timer, t1)).toBe(35);
  });

  it('recovers accurately after app suspension / phone lock', () => {
    const t0 = 2000000;
    let timer = createInitialTimerState(300);
    timer = startTimer(timer, t0);

    // Simulate phone being locked or backgrounded for 120 seconds
    const tWakeup = t0 + 120000;
    expect(getElapsedSeconds(timer, tWakeup)).toBe(120);
    expect(getRemainingSeconds(timer, tWakeup)).toBe(180);
    expect(getTimerProgress(timer, tWakeup)).toBe(40);
  });

  it('preserves accumulated time when paused and resumed', () => {
    const t0 = 1000000;
    let timer = createInitialTimerState(100);
    timer = startTimer(timer, t0);

    // Run for 30 seconds then pause
    const tPause = t0 + 30000;
    timer = pauseTimer(timer, tPause);
    expect(timer.isRunning).toBe(false);
    expect(timer.accumulatedMs).toBe(30000);

    // While paused, 2 minutes pass in background: elapsed time should NOT advance
    const tIdle = tPause + 120000;
    expect(getElapsedSeconds(timer, tIdle)).toBe(30);

    // Resume timer
    timer = startTimer(timer, tIdle);
    const tLater = tIdle + 20000; // run for another 20 seconds
    expect(getElapsedSeconds(timer, tLater)).toBe(50);
    expect(getRemainingSeconds(timer, tLater)).toBe(50);
  });

  it('formats seconds into readable MM:SS', () => {
    expect(formatSeconds(0)).toBe('00:00');
    expect(formatSeconds(65)).toBe('01:05');
    expect(formatSeconds(300)).toBe('05:00');
    expect(formatSeconds(3665)).toBe('1:01:05');
  });
});
