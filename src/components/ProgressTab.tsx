import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Flame,
  Shield,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  RitualSession,
  DisciplineGoal,
  DisciplineRelapse,
  DisciplineCheckin,
  JournalEntry,
} from '../types';
import { getMonthGrid, formatDateFriendly, formatDateFull, getLocalDateString } from '../utils/date';
import { exportBackupFile, importBackupData } from '../utils/backup';
import { db } from '../db/db';

interface ProgressTabProps {
  allSessions: RitualSession[];
  disciplineGoals: DisciplineGoal[];
  disciplineRelapses: DisciplineRelapse[];
  disciplineCheckins: DisciplineCheckin[];
  onRefreshData: () => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  allSessions,
  disciplineGoals,
  disciplineRelapses,
  disciplineCheckins,
  onRefreshData,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [calendarMode, setCalendarMode] = useState<'rituals' | 'discipline'>('rituals');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    disciplineGoals[0]?.id || 'pornography'
  );

  // Journal entries state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Selected date popup/inspection
  const [selectedDateDetails, setSelectedDateDetails] = useState<string | null>(null);

  useEffect(() => {
    const loadJournals = async () => {
      const entries = await db.journalEntries.reverse().toArray();
      setJournalEntries(entries);
    };
    loadJournals();
  }, [allSessions]);

  const monthGrid = getMonthGrid(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Stats calculation
  const totalCompletedDays = allSessions.filter((s) => s.completedRituals.length >= 6).length;
  const totalMorningSeconds = allSessions.reduce((acc, s) => acc + (s.totalSeconds || 0), 0);
  const totalMorningHours = (totalMorningSeconds / 3600).toFixed(1);

  // Clean days for active goal
  const goalRelapses = disciplineRelapses.filter((r) => r.goalId === selectedGoalId);
  const todayStr = getLocalDateString();

  // Save edited journal entry
  const handleSaveEditEntry = async () => {
    if (!editingEntry || !editingEntry.id) return;
    await db.journalEntries.update(editingEntry.id, {
      gratitude1: editingEntry.gratitude1,
      gratitude2: editingEntry.gratitude2,
      gratitude3: editingEntry.gratitude3,
      reflection: editingEntry.reflection,
      updatedAt: new Date().toISOString(),
    });
    setJournalEntries((prev) =>
      prev.map((e) => (e.id === editingEntry.id ? editingEntry : e))
    );
    setEditingEntry(null);
    onRefreshData();
  };

  // Delete journal entry
  const handleDeleteJournal = async (id?: number) => {
    if (!id) return;
    if (confirm('Are you sure you want to delete this journal entry?')) {
      await db.journalEntries.delete(id);
      setJournalEntries((prev) => prev.filter((e) => e.id !== id));
      onRefreshData();
    }
  };

  // Filter journals
  const filteredJournals = journalEntries.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.date.includes(q) ||
      entry.gratitude1?.toLowerCase().includes(q) ||
      entry.gratitude2?.toLowerCase().includes(q) ||
      entry.gratitude3?.toLowerCase().includes(q) ||
      entry.reflection?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-dawn-gold">
            Growth Records
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white">Progress & Journal</h2>
        </div>
      </div>

      {/* Overview Stats Row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-dawn-card border border-dawn-border rounded-2xl p-3 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-dawn-gold/15 text-dawn-gold flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-dawn-gold/20" />
          </div>
          <div>
            <span className="text-[10px] text-dawn-muted uppercase font-bold block">SAVERS Completed</span>
            <span className="text-base font-extrabold text-white font-mono">{totalCompletedDays} Days</span>
          </div>
        </div>

        <div className="bg-dawn-card border border-dawn-border rounded-2xl p-3 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-dawn-muted uppercase font-bold block">Journal Entries</span>
            <span className="text-base font-extrabold text-white font-mono">{journalEntries.length} Saved</span>
          </div>
        </div>
      </div>

      {/* MONTHLY CALENDAR CARD */}
      <div className="bg-dawn-card border border-dawn-border rounded-3xl p-4 shadow-lg space-y-3">
        {/* Calendar Mode Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 p-1 bg-dawn-surface rounded-xl border border-dawn-border text-xs">
            <button
              onClick={() => setCalendarMode('rituals')}
              className={`py-1 px-2.5 rounded-lg font-bold transition-all ${
                calendarMode === 'rituals'
                  ? 'bg-dawn-gold text-dawn-dark'
                  : 'text-dawn-muted hover:text-white'
              }`}
            >
              Morning Rituals
            </button>
            <button
              onClick={() => setCalendarMode('discipline')}
              className={`py-1 px-2.5 rounded-lg font-bold transition-all ${
                calendarMode === 'discipline'
                  ? 'bg-dawn-gold text-dawn-dark'
                  : 'text-dawn-muted hover:text-white'
              }`}
            >
              Discipline
            </button>
          </div>

          {calendarMode === 'discipline' && (
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="bg-dawn-surface border border-dawn-border rounded-lg text-xs p-1 text-white max-w-[120px] truncate"
            >
              {disciplineGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title.replace('-Free', '')}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-full text-dawn-muted hover:text-white bg-dawn-surface"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white tracking-wide">{monthName}</span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-full text-dawn-muted hover:text-white bg-dawn-surface"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-dawn-muted font-bold">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Calendar Matrix */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {monthGrid.flat().map((cell, idx) => {
            const isTodayDate = cell.dateStr === todayStr;

            // Rituals status
            const session = allSessions.find((s) => s.date === cell.dateStr);
            const isRitualDone = session && session.completedRituals.length >= 6;
            const isPartialRitual = session && session.completedRituals.length > 0 && !isRitualDone;

            // Discipline status
            const isRelapse = goalRelapses.some((r) => r.date === cell.dateStr);
            const isClean = !isRelapse && !cell.isFuture && cell.isCurrentMonth;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDateDetails(cell.dateStr)}
                disabled={!cell.isCurrentMonth}
                className={`py-2 rounded-xl flex flex-col items-center justify-center relative transition-all min-h-[38px] ${
                  !cell.isCurrentMonth
                    ? 'opacity-20 pointer-events-none'
                    : isTodayDate
                    ? 'bg-dawn-surface border border-dawn-gold/60 text-white font-bold'
                    : 'bg-dawn-surface/50 border border-dawn-border/40 text-slate-300 hover:border-dawn-gold/30'
                }`}
              >
                <span className="text-xs">{cell.dayNumber}</span>

                {/* Status Dot */}
                {calendarMode === 'rituals' ? (
                  isRitualDone ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-dawn-gold shadow-gold-sm mt-0.5" />
                  ) : isPartialRitual ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-0.5" />
                  ) : null
                ) : (
                  cell.isCurrentMonth && !cell.isFuture && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isRelapse ? 'bg-rose-400' : 'bg-emerald-400 shadow-sm'
                      }`}
                    />
                  )
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 pt-1 text-[10px] text-dawn-muted">
          {calendarMode === 'rituals' ? (
            <>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-dawn-gold" />
                <span>SAVERS Done</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-400/50" />
                <span>Partial</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Clean Day</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Setback Logged</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SELECTED DATE DETAIL POPUP */}
      {selectedDateDetails && (
        <div className="p-3.5 bg-dawn-card border border-dawn-gold/30 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">
              {formatDateFull(selectedDateDetails)}
            </span>
            <button
              onClick={() => setSelectedDateDetails(null)}
              className="text-[10px] text-dawn-gold hover:underline"
            >
              Close
            </button>
          </div>
          {(() => {
            const session = allSessions.find((s) => s.date === selectedDateDetails);
            const relapse = disciplineRelapses.find(
              (r) => r.date === selectedDateDetails && r.goalId === selectedGoalId
            );
            const journal = journalEntries.find((j) => j.date === selectedDateDetails);

            return (
              <div className="space-y-1.5 text-slate-300">
                <p>
                  Morning Rituals:{' '}
                  <strong className="text-white">
                    {session ? `${session.completedRituals.length} / 6 completed` : 'No session logged'}
                  </strong>
                </p>
                <p>
                  Discipline Status:{' '}
                  <strong className={relapse ? 'text-rose-400' : 'text-emerald-400'}>
                    {relapse ? `Setback recorded (${relapse.trigger || 'Logged'})` : 'Clean & sovereign'}
                  </strong>
                </p>
                {journal && (
                  <p className="text-[11px] italic text-dawn-gold">
                    Journal: "{journal.reflection || journal.gratitude1}"
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* SCRIBING / JOURNAL ARCHIVE */}
      <div className="bg-dawn-card border border-dawn-border rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <BookOpen className="w-3.5 h-3.5 text-dawn-gold" />
            <span>Gratitude & Scribing Archive</span>
          </span>
          <span className="text-[10px] text-dawn-muted">
            {filteredJournals.length} entries
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-dawn-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reflections or gratitudes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dawn-surface border border-dawn-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
          />
        </div>

        {/* Journal Entries List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {filteredJournals.length > 0 ? (
            filteredJournals.map((entry) => (
              <div
                key={entry.id || entry.date}
                className="p-3.5 rounded-2xl bg-dawn-surface border border-dawn-border space-y-2 hover:border-dawn-gold/30 transition-all text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-dawn-gold">
                    {formatDateFriendly(entry.date)}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="p-1 text-dawn-muted hover:text-white"
                      title="Edit journal entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteJournal(entry.id)}
                      className="p-1 text-dawn-muted hover:text-rose-400"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3 Gratitudes */}
                {(entry.gratitude1 || entry.gratitude2 || entry.gratitude3) && (
                  <div className="space-y-0.5 text-slate-300 text-[11px] bg-dawn-card/60 p-2 rounded-xl">
                    <p className="font-semibold text-white">Grateful for:</p>
                    {entry.gratitude1 && <p>• {entry.gratitude1}</p>}
                    {entry.gratitude2 && <p>• {entry.gratitude2}</p>}
                    {entry.gratitude3 && <p>• {entry.gratitude3}</p>}
                  </div>
                )}

                {/* Reflection */}
                {entry.reflection && (
                  <p className="text-slate-300 text-[11px] leading-relaxed italic">
                    "{entry.reflection}"
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-dawn-muted bg-dawn-surface/40 rounded-xl">
              No journal entries yet. Complete the Scribing ritual in your morning routine!
            </div>
          )}
        </div>
      </div>

      {/* EDIT ENTRY MODAL */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
          <div className="bg-dawn-card border border-dawn-border rounded-3xl p-5 max-w-sm w-full text-dawn-light space-y-3">
            <h3 className="text-sm font-bold text-white">
              Edit Journal ({formatDateFriendly(editingEntry.date)})
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] text-dawn-muted">Gratitude 1:</label>
              <input
                type="text"
                value={editingEntry.gratitude1}
                onChange={(e) =>
                  setEditingEntry({ ...editingEntry, gratitude1: e.target.value })
                }
                className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-dawn-muted">Gratitude 2:</label>
              <input
                type="text"
                value={editingEntry.gratitude2}
                onChange={(e) =>
                  setEditingEntry({ ...editingEntry, gratitude2: e.target.value })
                }
                className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-dawn-muted">Gratitude 3:</label>
              <input
                type="text"
                value={editingEntry.gratitude3}
                onChange={(e) =>
                  setEditingEntry({ ...editingEntry, gratitude3: e.target.value })
                }
                className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-dawn-muted">Reflection / Intention:</label>
              <textarea
                rows={2}
                value={editingEntry.reflection}
                onChange={(e) =>
                  setEditingEntry({ ...editingEntry, reflection: e.target.value })
                }
                className="w-full bg-dawn-surface border border-dawn-border rounded-lg p-2 text-xs text-white resize-none"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setEditingEntry(null)}
                className="flex-1 py-2 text-xs text-dawn-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditEntry}
                className="flex-1 py-2 bg-dawn-gold text-dawn-dark font-bold text-xs rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
