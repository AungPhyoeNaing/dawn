/**
 * Timestamp-based Timer Utilities
 * Ensures timers stay accurate even when mobile browsers suspend JavaScript execution.
 */

export interface TimerState {
  startTimestamp: number | null; // Date.now() when last started/resumed
  accumulatedMs: number;          // Total milliseconds accumulated during previous running segments
  isRunning: boolean;
  isCompleted: boolean;
  targetDurationSeconds: number;
}

export function createInitialTimerState(targetDurationSeconds: number): TimerState {
  return {
    startTimestamp: null,
    accumulatedMs: 0,
    isRunning: false,
    isCompleted: false,
    targetDurationSeconds,
  };
}

/**
 * Calculates current total elapsed milliseconds based on wall clock
 */
export function getElapsedMs(timer: TimerState, now: number = Date.now()): number {
  if (!timer.isRunning || timer.startTimestamp === null) {
    return timer.accumulatedMs;
  }
  return timer.accumulatedMs + Math.max(0, now - timer.startTimestamp);
}

/**
 * Calculates elapsed seconds
 */
export function getElapsedSeconds(timer: TimerState, now: number = Date.now()): number {
  return Math.floor(getElapsedMs(timer, now) / 1000);
}

/**
 * Calculates remaining seconds until target duration
 */
export function getRemainingSeconds(timer: TimerState, now: number = Date.now()): number {
  const elapsed = getElapsedSeconds(timer, now);
  return Math.max(0, timer.targetDurationSeconds - elapsed);
}

/**
 * Calculates progress percentage from 0 to 100
 */
export function getTimerProgress(timer: TimerState, now: number = Date.now()): number {
  if (timer.targetDurationSeconds <= 0) return 100;
  const elapsed = getElapsedMs(timer, now) / 1000;
  const pct = (elapsed / timer.targetDurationSeconds) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

/**
 * Starts or resumes timer
 */
export function startTimer(timer: TimerState, now: number = Date.now()): TimerState {
  if (timer.isRunning) return timer;
  return {
    ...timer,
    startTimestamp: now,
    isRunning: true,
  };
}

/**
 * Pauses timer and locks in accumulated wall-clock time
 */
export function pauseTimer(timer: TimerState, now: number = Date.now()): TimerState {
  if (!timer.isRunning || timer.startTimestamp === null) return timer;
  const currentSegment = Math.max(0, now - timer.startTimestamp);
  return {
    ...timer,
    accumulatedMs: timer.accumulatedMs + currentSegment,
    startTimestamp: null,
    isRunning: false,
  };
}

/**
 * Resets timer to zero
 */
export function resetTimer(timer: TimerState, newTargetSeconds?: number): TimerState {
  return createInitialTimerState(newTargetSeconds ?? timer.targetDurationSeconds);
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Offline Mindfulness Singing Bowl chime using Web Audio API
 * Generates an organic harmonic tone without needing external MP3/WAV files.
 */
let audioCtx: AudioContext | null = null;

export function playMindfulBell(options?: { pitch?: number; duration?: number }) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const baseFreq = options?.pitch ?? 432; // 432Hz calming frequency
    const duration = options?.duration ?? 2.8;

    // Harmonic frequencies resembling a meditation singing bowl
    const harmonics = [
      { freq: baseFreq, gain: 0.35, decay: duration },
      { freq: baseFreq * 2.01, gain: 0.18, decay: duration * 0.75 },
      { freq: baseFreq * 3.02, gain: 0.10, decay: duration * 0.5 },
      { freq: baseFreq * 4.76, gain: 0.05, decay: duration * 0.35 },
    ];

    harmonics.forEach(h => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(h.freq, now);

      gainNode.gain.setValueAtTime(0, now);
      // Soft gentle attack
      gainNode.gain.linearRampToValueAtTime(h.gain, now + 0.04);
      // Exponential peaceful decay
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + h.decay);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + h.decay);
    });
  } catch (e) {
    console.warn('Audio playback error (may need user interaction first):', e);
  }
}
