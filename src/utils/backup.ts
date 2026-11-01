import { db } from '../db/db';
import { getLocalDateString } from './date';

export interface DawnBackupData {
  app: 'DAWN';
  version: number;
  exportDate: string;
  tables: {
    ritualSessions: any[];
    disciplineGoals: any[];
    disciplineCheckins: any[];
    disciplineRelapses: any[];
    affirmations: any[];
    visualizationGoals: any[];
    journalEntries: any[];
    readingLogs: any[];
    exerciseLogs: any[];
    userSettings: any[];
  };
}

/**
 * Exports all user data from IndexedDB into a JSON file
 */
export async function exportBackupFile(): Promise<void> {
  const backup: DawnBackupData = {
    app: 'DAWN',
    version: 1,
    exportDate: new Date().toISOString(),
    tables: {
      ritualSessions: await db.ritualSessions.toArray(),
      disciplineGoals: await db.disciplineGoals.toArray(),
      disciplineCheckins: await db.disciplineCheckins.toArray(),
      disciplineRelapses: await db.disciplineRelapses.toArray(),
      affirmations: await db.affirmations.toArray(),
      visualizationGoals: await db.visualizationGoals.toArray(),
      journalEntries: await db.journalEntries.toArray(),
      readingLogs: await db.readingLogs.toArray(),
      exerciseLogs: await db.exerciseLogs.toArray(),
      userSettings: await db.userSettings.toArray(),
    },
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backup, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const filename = `dawn-backup-${getLocalDateString()}.json`;

  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Validates a parsed backup object
 */
export function validateBackup(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'File is not a valid JSON object.' };
  }
  if (data.app !== 'DAWN') {
    return { valid: false, error: 'Invalid backup file: not created by DAWN.' };
  }
  if (!data.tables || typeof data.tables !== 'object') {
    return { valid: false, error: 'Backup is missing tables structure.' };
  }
  return { valid: true };
}

/**
 * Imports backup data into IndexedDB safely with transaction
 */
export async function importBackupData(
  jsonData: string,
  mode: 'merge' | 'replace' = 'merge'
): Promise<{ success: boolean; message: string }> {
  try {
    const parsed = JSON.parse(jsonData);
    const validation = validateBackup(parsed);

    if (!validation.valid) {
      return { success: false, message: validation.error || 'Invalid backup format' };
    }

    const { tables } = parsed as DawnBackupData;

    await db.transaction('rw', [
      db.ritualSessions,
      db.disciplineGoals,
      db.disciplineCheckins,
      db.disciplineRelapses,
      db.affirmations,
      db.visualizationGoals,
      db.journalEntries,
      db.readingLogs,
      db.exerciseLogs,
      db.userSettings,
    ], async () => {
      if (mode === 'replace') {
        await db.ritualSessions.clear();
        await db.disciplineGoals.clear();
        await db.disciplineCheckins.clear();
        await db.disciplineRelapses.clear();
        await db.affirmations.clear();
        await db.visualizationGoals.clear();
        await db.journalEntries.clear();
        await db.readingLogs.clear();
        await db.exerciseLogs.clear();
        await db.userSettings.clear();
      }

      if (tables.ritualSessions?.length) await db.ritualSessions.bulkPut(tables.ritualSessions);
      if (tables.disciplineGoals?.length) await db.disciplineGoals.bulkPut(tables.disciplineGoals);
      if (tables.disciplineCheckins?.length) await db.disciplineCheckins.bulkPut(tables.disciplineCheckins);
      if (tables.disciplineRelapses?.length) await db.disciplineRelapses.bulkPut(tables.disciplineRelapses);
      if (tables.affirmations?.length) await db.affirmations.bulkPut(tables.affirmations);
      if (tables.visualizationGoals?.length) await db.visualizationGoals.bulkPut(tables.visualizationGoals);
      if (tables.journalEntries?.length) await db.journalEntries.bulkPut(tables.journalEntries);
      if (tables.readingLogs?.length) await db.readingLogs.bulkPut(tables.readingLogs);
      if (tables.exerciseLogs?.length) await db.exerciseLogs.bulkPut(tables.exerciseLogs);
      if (tables.userSettings?.length) await db.userSettings.bulkPut(tables.userSettings);
    });

    return {
      success: true,
      message: `Backup successfully ${mode === 'replace' ? 'restored' : 'merged'}!`,
    };
  } catch (error) {
    console.error('Backup import error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to import backup.',
    };
  }
}
