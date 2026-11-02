import { Modal } from './Modal';
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flame,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';
import type {
  RitualSession,
  DisciplineGoal,
  DisciplineRelapse,
  DisciplineCheckin,
  JournalEntry,
} from '../types';
import { getMonthGrid, formatDateFriendly, formatDateFull, getLocalDateString } from '../utils/date';
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
    <div className="progress-tab space-y-4 pb-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-dawn-gold">
            Growth Records
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white drop-shadow-sm">Progress & Journal</h2>
        </div>
      </div>

      {/* Overview Stats Row */}
      <div className="progress-summary grid grid-cols-2 gap-2.5">
        <div className="glass-card rounded-2xl p-3.5 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-dawn-gold/15 border border-dawn-gold/30 text-dawn-gold flex items-center justify-center shrink-0 shadow-gold-sm">
            <Flame className="w-5 h-5 fill-dawn-gold/20" />
          </div>
          <div>
            <span className="text-[10px] text-dawn-muted uppercase font-bold block">SAVERS Completed</span>
            <span className="text-base font-extrabold text-white font-mono">{totalCompletedDays} Days</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-3.5 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-dawn-muted uppercase font-bold block">Journal Entries</span>
            <span className="text-base font-extrabold text-white font-mono">{journalEntries.length} Saved</span>
          </div>
        </div>
      </div>

      {/* MONTHLY CALENDAR CARD */}
      <div className="calendar-panel glass-card rounded-3xl p-4.5 space-y-3.5 shadow-xl">
        {/* Calendar Mode Switcher */}
        <div className="calendar-controls">
          <div className="flex space-x-1 p-1 bg-white/[0.04] rounded-2xl border border-white/10 text-xs backdrop-blur-md">
            <button
              onClick={() => setCalendarMode('rituals')}
              className={`py-1 px-3 rounded-xl font-bold transition-all ${
                calendarMode === 'rituals'
                  ? 'bg-dawn-gold text-dawn-dark shadow-gold-sm'
                  : 'text-dawn-muted hover:text-white'
              }`}
            >
              Morning Rituals
            </button>
            <button
              onClick={() => setCalendarMode('discipline')}
              className={`py-1 px-3 rounded-xl font-bold transition-all ${
                calendarMode === 'discipline'
                  ? 'bg-dawn-gold text-dawn-dark shadow-gold-sm'
                  : 'text-dawn-muted hover:text-white'
              }`}
            >
              Discipline
            </button>
          </div>

          {calendarMode === 'discipline' && (
            <select
              aria-label="Discipline goal"
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="bg-white/[0.06] border border-white/10 rounded-xl text-xs p-1.5 text-white max-w-[120px] truncate backdrop-blur-md"
            >
              {disciplineGoals.map((g) => (
                <option key={g.id} value={g.id} className="bg-dawn-surface">
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
            className="p-1.5 rounded-full text-dawn-muted hover:text-white bg-white/[0.05] border border-white/10"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white tracking-wide">{monthName}</span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-full text-dawn-muted hover:text-white bg-white/[0.05] border border-white/10"
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
        <div className="calendar-grid grid grid-cols-7 gap-1.5 text-center">
          {monthGrid.flat().map((cell, idx) => {
            const isTodayDate = cell.dateStr === todayStr;

            // Rituals status
            const session = allSessions.find((s) => s.date === cell.dateStr);
            const isRitualDone = session && session.completedRituals.length >= 6;
            const isPartialRitual = session && session.completedRituals.length > 0 && !isRitualDone;

            // Discipline status
            const isRelapse = goalRelapses.some((r) => r.date === cell.dateStr);

            return (
              <button
                key={idx}
                aria-label={formatDateFull(cell.dateStr)}
                onClick={() => setSelectedDateDetails(cell.dateStr)}
                disabled={!cell.isCurrentMonth}
                className={`py-2 rounded-2xl flex flex-col items-center justify-center relative transition-all min-h-[38px] active:scale-95 ${
                  !cell.isCurrentMonth
                    ? 'opacity-20 pointer-events-none'
                    : isTodayDate
                    ? 'bg-dawn-gold/20 border border-dawn-gold/60 text-white font-bold shadow-gold-sm'
                    : 'bg-white/[0.03] border border-white/[0.06] text-slate-300 hover:border-dawn-gold/30 hover:bg-white/[0.06]'
                }`}
              >
                <span className="text-xs">{cell.dayNumber}</span>

                {/* Status Dot */}
                {calendarMode === 'rituals' ? (
                  isRitualDone ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-dawn-gold shadow-gold-sm mt-0.5" />
                  ) : isPartialRitual ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-0.5" />
                  ) : null
                ) : (
                  cell.isCurrentMonth && !cell.isFuture && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isRelapse
                          ? 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                          : 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
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
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-dawn-gold shadow-gold-sm" />
                <span>SAVERS Done</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400/60" />
                <span>Partial</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
                <span>Clean Day</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 shadow-sm" />
                <span>Setback Logged</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SELECTED DATE DETAIL POPUP */}
      {selectedDateDetails && (
        <div className="p-4 glass-card border-dawn-gold/40 rounded-3xl space-y-2 text-xs shadow-xl animate-in fade-in duration-150">
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
      <div className="glass-card rounded-3xl p-4.5 space-y-3.5">
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
          <Search className="w-3.5 h-3.5 text-dawn-muted absolute left-3.5 top-3" />
          <input
            aria-label="Search journal entries"
            type="text"
            placeholder="Search reflections or gratitudes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 backdrop-blur-md focus:outline-none focus:border-dawn-gold/50"
          />
        </div>

        {/* Journal Entries List */}
        <div className="journal-entries space-y-2.5 pr-1">
          {filteredJournals.length > 0 ? (
            filteredJournals.map((entry) => (
              <div
                key={entry.id || entry.date}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 hover:border-dawn-gold/30 transition-all text-xs backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-dawn-gold">
                    {formatDateFriendly(entry.date)}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="p-1.5 text-dawn-muted hover:text-white rounded-full bg-white/[0.05]"
                      title="Edit journal entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteJournal(entry.id)}
                      className="p-1.5 text-dawn-muted hover:text-rose-400 rounded-full bg-white/[0.05]"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3 Gratitudes */}
                {(entry.gratitude1 || entry.gratitude2 || entry.gratitude3) && (
                  <div className="space-y-0.5 text-slate-300 text-[11px] bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
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
            <div className="text-center py-6 text-xs text-dawn-muted bg-white/[0.02] border border-white/5 rounded-2xl">
              No journal entries yet. Complete the Scribing ritual in your morning routine!
            </div>
          )}
        </div>
      </div>

      {/* EDIT ENTRY MODAL */}
      {editingEntry && (
        <Modal label="Edit journal entry" onClose={() => setEditingEntry(null)}>
          <div className="glass-panel rounded-3xl p-5 max-w-sm w-full text-dawn-light space-y-3.5 shadow-2xl">
            <h3 className="text-sm font-bold text-white tracking-tight">
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
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white"
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
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white"
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
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white"
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
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setEditingEntry(null)}
                className="flex-1 py-2.5 text-xs text-dawn-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditEntry}
                className="flex-1 py-2.5 liquid-gold-button text-xs rounded-xl font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
