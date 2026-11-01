import { describe, it, expect } from 'vitest';
import { validateBackup } from '../utils/backup';

describe('Backup Validation & Integrity', () => {
  it('rejects null or non-object payloads', () => {
    expect(validateBackup(null).valid).toBe(false);
    expect(validateBackup('invalid string').valid).toBe(false);
  });

  it('rejects foreign JSON not created by DAWN', () => {
    const foreign = {
      app: 'OTHER_APP',
      version: 1,
      tables: {},
    };
    const result = validateBackup(foreign);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not created by DAWN');
  });

  it('rejects backup missing tables structure', () => {
    const invalid = {
      app: 'DAWN',
      version: 1,
    };
    const result = validateBackup(invalid);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('missing tables structure');
  });

  it('accepts valid DAWN backup object', () => {
    const valid = {
      app: 'DAWN',
      version: 1,
      exportDate: '2026-11-01T20:00:00Z',
      tables: {
        ritualSessions: [],
        disciplineGoals: [],
        disciplineCheckins: [],
        disciplineRelapses: [],
        affirmations: [],
        visualizationGoals: [],
        journalEntries: [],
        readingLogs: [],
        exerciseLogs: [],
        userSettings: [],
      },
    };
    expect(validateBackup(valid).valid).toBe(true);
  });
});
