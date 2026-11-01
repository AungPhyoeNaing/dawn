import React, { useState } from 'react';
import {
  Shield,
  Award,
  Flame,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  Calendar,
  History,
  Trash2,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  DisciplineGoal,
  DisciplineCheckin,
  DisciplineRelapse,
} from '../types';
import { calculateStreakStats, MILESTONES } from '../utils/discipline';
import { formatDateFriendly, getLocalDateString } from '../utils/date';
import { db } from '../db/db';

interface FocusTabProps {
  goals: DisciplineGoal[];
  relapses: DisciplineRelapse[];
  checkins: DisciplineCheckin[];
  onOpenConstructiveRestart: (goal: DisciplineGoal, currentStreak: number) => void;
  onOpenSupport: () => void;
  onRefreshData: () => void;
}

export const FocusTab: React.FC<FocusTabProps> = ({
  goals,
  relapses,
  checkins,
  onOpenConstructiveRestart,
  onOpenSupport,
  onRefreshData,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    goals[0]?.id || 'pornography'
  );

  const activeGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];
  const todayStr = getLocalDateString();

  // Filter records for selected goal
  const goalRelapses = relapses.filter((r) => r.goalId === selectedGoalId);
  const goalCheckins = checkins.filter((c) => c.goalId === selectedGoalId);

  const stats = calculateStreakStats({
    startDate: activeGoal?.startDate || todayStr,
    relapses: goalRelapses,
    checkins: goalCheckins,
  });

  const todayCheckin = goalCheckins.find((c) => c.date === todayStr);
  const isCheckedInToday = Boolean(todayCheckin);

  // Daily Clean Check-in
  const handleMarkCleanToday = async () => {
    try {
      const existing = await db.disciplineCheckins
        .where('[goalId+date]')
        .equals([selectedGoalId, todayStr])
        .first();

      if (!existing) {
        await db.disciplineCheckins.add({
          goalId: selectedGoalId,
          date: todayStr,
          status: 'clean',
          createdAt: new Date().toISOString(),
        });

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#F59E0B', '#10B981', '#38BDF8'],
          });
        } catch (e) {
          // ignore
        }

        onRefreshData();
      }
    } catch (err) {
      console.error('Error recording clean checkin:', err);
    }
  };

  // Delete an accidental relapse record
  const handleDeleteRelapse = async (id?: number) => {
    if (!id) return;
    if (confirm('Delete this historical record? Your streaks will recalculate accurately.')) {
      await db.disciplineRelapses.delete(id);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-dawn-gold">
            Personal Sovereignty
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white">Focus & Discipline</h2>
        </div>
        <button
          onClick={onOpenSupport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>Support</span>
        </button>
      </div>

      {/* Goal Selector Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-dawn-surface rounded-2xl border border-dawn-border">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => setSelectedGoalId(goal.id)}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all truncate text-center ${
              selectedGoalId === goal.id
                ? 'bg-dawn-gold text-dawn-dark shadow-gold-sm font-extrabold'
                : 'text-dawn-muted hover:text-white'
            }`}
          >
            {goal.title}
          </button>
        ))}
      </div>

      {/* HERO STREAK CARD */}
      <div className="bg-gradient-to-b from-dawn-card to-dawn-surface border border-dawn-border rounded-3xl p-5 text-center relative overflow-hidden shadow-xl">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-dawn-gold">
            Current Sovereign Streak
          </span>
          <div className="flex items-baseline justify-center space-x-2 my-2">
            <span className="text-5xl font-black text-white font-mono tracking-tight drop-shadow-sm">
              {stats.currentStreakDays}
            </span>
            <span className="text-sm font-extrabold text-dawn-gold uppercase tracking-wider">
              {stats.currentStreakDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {stats.currentStreakDays === 0
              ? 'Day 0 — Fresh start today with dignity and clear vision.'
              : `${stats.currentStreakDays} consecutive days lived in conscious integrity.`}
          </p>
        </div>

        {/* Next Milestone Progress Bar */}
        <div className="mt-5 p-3.5 bg-dawn-dark/60 rounded-2xl border border-dawn-border/60 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <span>{stats.nextMilestone.badge}</span>
              <span>Next Milestone: {stats.nextMilestone.title} ({stats.nextMilestone.days}d)</span>
            </span>
            <span className="text-dawn-gold font-semibold">
              {stats.nextMilestoneDaysRemaining}d remaining
            </span>
          </div>

          <div className="w-full bg-dawn-surface rounded-full h-2.5 overflow-hidden border border-dawn-border/50">
            <div
              className="bg-gradient-to-r from-dawn-gold to-dawn-gold-light h-full rounded-full transition-all duration-500 shadow-gold-sm"
              style={{ width: `${stats.nextMilestoneProgressPct}%` }}
            />
          </div>
          <p className="text-[10px] text-dawn-muted italic">
            "{stats.nextMilestone.description}"
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-dawn-border/60 text-center">
          <div className="p-2 bg-dawn-surface/50 rounded-xl">
            <span className="text-[10px] text-dawn-muted uppercase font-bold block">Best Streak</span>
            <span className="text-sm font-bold text-white font-mono">{stats.longestStreakDays}d</span>
          </div>
          <div className="p-2 bg-dawn-surface/50 rounded-xl">
            <span className="text-[10px] text-dawn-muted uppercase font-bold block">Total Clean</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{stats.totalCleanDays}d</span>
          </div>
          <div className="p-2 bg-dawn-surface/50 rounded-xl">
            <span className="text-[10px] text-dawn-muted uppercase font-bold block">Setbacks</span>
            <span className="text-sm font-bold text-slate-300 font-mono">{stats.totalSetbacks}</span>
          </div>
        </div>
      </div>

      {/* TODAY'S CHECK-IN & RESTART BUTTONS */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleMarkCleanToday}
          className={`py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all min-h-touch active:scale-98 ${
            isCheckedInToday
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-gradient-to-r from-dawn-gold to-dawn-gold-light text-dawn-dark border-transparent shadow-gold-sm'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{isCheckedInToday ? 'Checked Clean Today ✓' : 'Mark Clean Today'}</span>
        </button>

        <button
          onClick={() => onOpenConstructiveRestart(activeGoal, stats.currentStreakDays)}
          className="py-3 px-3 rounded-2xl text-xs font-bold bg-dawn-card hover:bg-dawn-surface border border-dawn-border text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 min-h-touch active:scale-98"
        >
          <RotateCcw className="w-4 h-4 text-dawn-gold shrink-0" />
          <span>Constructive Restart</span>
        </button>
      </div>

      {/* MILESTONE BADGES GALLERY */}
      <div className="bg-dawn-card border border-dawn-border rounded-2xl p-4 space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Award className="w-3.5 h-3.5 text-dawn-gold" />
          <span>Milestone Badges ({MILESTONES.filter(m => stats.longestStreakDays >= m.days).length}/{MILESTONES.length})</span>
        </span>

        <div className="grid grid-cols-5 gap-2 pt-1 text-center">
          {MILESTONES.map((m) => {
            const isAchieved = stats.longestStreakDays >= m.days;
            const isCurrent = stats.currentStreakDays >= m.days;

            return (
              <div
                key={m.days}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isAchieved
                    ? 'bg-dawn-surface border-dawn-gold/40 shadow-gold-sm'
                    : 'bg-dawn-surface/30 border-dawn-border/40 opacity-40'
                }`}
                title={`${m.title}: ${m.description}`}
              >
                <span className="text-lg">{m.badge}</span>
                <span className="text-[10px] font-bold text-white mt-1">{m.days}d</span>
                <span className="text-[8px] text-dawn-muted truncate max-w-[45px] leading-tight">
                  {m.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTORICAL SETBACK RECORDS & LESSONS (EDITABLE) */}
      <div className="bg-dawn-card border border-dawn-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <History className="w-3.5 h-3.5 text-dawn-gold" />
            <span>Learning History & Adjustments</span>
          </span>
          <span className="text-[10px] text-dawn-muted">
            {goalRelapses.length} {goalRelapses.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        {goalRelapses.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {goalRelapses
              .slice()
              .reverse()
              .map((r) => (
                <div
                  key={r.id || r.date}
                  className="p-2.5 rounded-xl bg-dawn-surface border border-dawn-border text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {formatDateFriendly(r.date)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-dawn-gold bg-dawn-card px-1.5 py-0.5 rounded">
                        Streak was: {r.streakLengthDaysAtRelapse}d
                      </span>
                      <button
                        onClick={() => handleDeleteRelapse(r.id)}
                        className="text-dawn-muted hover:text-rose-400 p-1"
                        aria-label="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {r.trigger && (
                    <p className="text-[11px] text-rose-300">
                      Trigger: {r.trigger}
                    </p>
                  )}
                  {r.lessonLearned && (
                    <p className="text-[11px] text-slate-300 italic">
                      Adjustment: "{r.lessonLearned}"
                    </p>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-dawn-muted bg-dawn-surface/50 rounded-xl">
            No setbacks recorded. You have stayed steadfast since day one!
          </div>
        )}
      </div>
    </div>
  );
};
