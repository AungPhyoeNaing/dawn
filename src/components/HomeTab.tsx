import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Shield,
  ArrowRight,
  ShieldAlert,
  RotateCw,
  CheckCircle2,
  Calendar,
  HeartHandshake,
} from 'lucide-react';
import {
  RitualSession,
  DisciplineGoal,
  DisciplineCheckin,
  DisciplineRelapse,
  RitualType,
} from '../types';
import { RITUAL_DEFINITIONS } from '../data/rituals';
import { getContextualMotivation, getRandomMotivation } from '../data/motivation';
import { calculateStreakStats } from '../utils/discipline';
import { formatDateFriendly, getLocalDateString, getPastNDays } from '../utils/date';

interface HomeTabProps {
  userName: string;
  todaySession: RitualSession | null;
  disciplineGoals: DisciplineGoal[];
  disciplineRelapses: DisciplineRelapse[];
  disciplineCheckins: DisciplineCheckin[];
  onStartRitualSequence: () => void;
  onOpenRitual: (ritual: RitualType) => void;
  onOpenSupport: () => void;
  onSwitchTab: (tab: 'rituals' | 'focus' | 'progress') => void;
  onQuickCheckin: (goalId: string, status: 'clean' | 'relapse') => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  userName,
  todaySession,
  disciplineGoals,
  disciplineRelapses,
  disciplineCheckins,
  onStartRitualSequence,
  onOpenRitual,
  onOpenSupport,
  onSwitchTab,
  onQuickCheckin,
}) => {
  const currentHour = new Date().getHours();
  const completedCount = todaySession?.completedRituals.length ?? 0;
  const totalRituals = 6;
  const isMorningComplete = completedCount >= totalRituals;

  // Dynamic greeting
  let greetingTime = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) {
    greetingTime = 'Good Afternoon';
  } else if (currentHour >= 17 || currentHour < 4) {
    greetingTime = 'Good Evening';
  }

  // Motivational quote state
  const [quote, setQuote] = useState(() =>
    getContextualMotivation({
      hour: currentHour,
      ritualsCompletedToday: completedCount,
      totalRituals,
    })
  );

  const handleShuffleQuote = () => {
    setQuote(getRandomMotivation());
  };

  // Next ritual to complete
  const allRituals: RitualType[] = ['silence', 'affirmations', 'visualization', 'exercise', 'reading', 'scribing'];
  const nextRitual = allRituals.find((r) => !todaySession?.completedRituals.includes(r)) || 'silence';

  // Last 7 days for consistency strip
  const past7Days = getPastNDays(7);
  const todayStr = getLocalDateString();

  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-200">
      {/* 1. GREETING & DATE HEADER */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-dawn-gold">
            {formatDateFriendly(todayStr)}
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-white leading-tight">
            {greetingTime}, {userName || 'Friend'}
          </h2>
        </div>
        <button
          onClick={onOpenSupport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold shadow-sm active:scale-95"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>I Need Support</span>
        </button>
      </div>

      {/* 2. DYNAMIC MOTIVATIONAL CARD */}
      <div className="relative bg-gradient-to-br from-dawn-card via-dawn-card to-dawn-surface border border-dawn-border rounded-2xl p-4 shadow-lg overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-dawn-gold/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-dawn-gold/20 flex items-center justify-center text-dawn-gold">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-dawn-gold">
              Daily Guidance
            </span>
          </div>
          <button
            onClick={handleShuffleQuote}
            className="text-dawn-muted hover:text-white p-1 rounded-full transition-colors active:rotate-180 duration-300"
            aria-label="New motivational message"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-200 mt-2.5 leading-relaxed italic">
          "{quote.text}"
        </p>
      </div>

      {/* 3. MIRACLE MORNING S.A.V.E.R.S. PROGRESS CARD */}
      <div className="bg-dawn-card border border-dawn-border rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-dawn-gold/15 text-dawn-gold flex items-center justify-center">
              <Flame className="w-4 h-4 fill-dawn-gold/20" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight">Today's S.A.V.E.R.S.</h3>
              <p className="text-[10px] text-dawn-muted">Miracle Morning Rituals</p>
            </div>
          </div>
          <span className="text-xs font-bold text-dawn-gold px-2 py-0.5 rounded-full bg-dawn-gold/15 border border-dawn-gold/25">
            {completedCount} / {totalRituals}
          </span>
        </div>

        {/* 6 Ritual Chips / Indicators */}
        <div className="grid grid-cols-6 gap-1.5 py-1">
          {allRituals.map((rKey) => {
            const def = RITUAL_DEFINITIONS[rKey];
            const isDone = todaySession?.completedRituals.includes(rKey);

            return (
              <button
                key={rKey}
                onClick={() => onOpenRitual(rKey)}
                className={`py-2 flex flex-col items-center justify-center rounded-xl border transition-all ${
                  isDone
                    ? 'bg-dawn-gold/20 border-dawn-gold text-dawn-gold font-bold shadow-gold-sm'
                    : 'bg-dawn-surface border-dawn-border text-slate-400 hover:border-dawn-gold/40'
                }`}
                title={def.name}
              >
                <span className="text-xs font-extrabold">{def.shortName}</span>
                <span className="text-[9px] mt-0.5 capitalize truncate max-w-[42px] hidden xs:block">
                  {def.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Button: Begin or Continue Morning */}
        <button
          onClick={onStartRitualSequence}
          className="w-full py-2.5 bg-gradient-to-r from-dawn-gold to-dawn-gold-light hover:brightness-105 text-dawn-dark font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 shadow-gold-sm active:scale-98 transition-all min-h-touch"
        >
          {isMorningComplete ? (
            <>
              <CheckCircle2 className="w-4 h-4 fill-dawn-dark text-dawn-gold-light" />
              <span>Morning Rituals Complete — Well Done!</span>
            </>
          ) : completedCount > 0 ? (
            <>
              <span>Continue Morning ({RITUAL_DEFINITIONS[nextRitual].name})</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Flame className="w-4 h-4 fill-dawn-dark" />
              <span>Begin Miracle Morning</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* 4. PERSONAL DISCIPLINE SUMMARY CARDS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-dawn-gold" />
            <span>Personal Discipline</span>
          </span>
          <button
            onClick={() => onSwitchTab('focus')}
            className="text-[11px] text-dawn-gold hover:underline font-medium"
          >
            View Details
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {disciplineGoals.map((goal) => {
            const goalRelapses = disciplineRelapses.filter((r) => r.goalId === goal.id);
            const goalCheckins = disciplineCheckins.filter((c) => c.goalId === goal.id);
            const stats = calculateStreakStats({
              startDate: goal.startDate,
              relapses: goalRelapses,
              checkins: goalCheckins,
            });

            const hasCheckedInToday = goalCheckins.some((c) => c.date === todayStr);

            return (
              <div
                key={goal.id}
                className="bg-dawn-card border border-dawn-border rounded-2xl p-3 flex flex-col justify-between space-y-2 hover:border-dawn-gold/30 transition-all cursor-pointer"
                onClick={() => onSwitchTab('focus')}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white truncate max-w-[100px]">
                      {goal.title.replace('-Free', '')}
                    </span>
                    <span className="text-xs">{stats.nextMilestone.badge}</span>
                  </div>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-2xl font-black text-dawn-gold font-mono">
                      {stats.currentStreakDays}
                    </span>
                    <span className="text-[10px] text-dawn-muted font-semibold uppercase">
                      Days
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                    Best: {stats.longestStreakDays}d • Next: {stats.nextMilestone.days}d
                  </p>
                </div>

                <div className="pt-1 border-t border-dawn-border/60 flex items-center justify-between">
                  <span className="text-[9px] text-dawn-muted">Today:</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                      hasCheckedInToday
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-dawn-surface text-dawn-gold'
                    }`}
                  >
                    {hasCheckedInToday ? 'Clean ✓' : 'Active'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. 7-DAY CONSISTENCY STRIP */}
      <div className="bg-dawn-card border border-dawn-border rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-dawn-gold" />
            <span>Past 7 Days Consistency</span>
          </span>
          <button
            onClick={() => onSwitchTab('progress')}
            className="text-[11px] text-dawn-gold hover:underline"
          >
            Calendar
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center pt-1">
          {past7Days.map((dStr) => {
            const d = new Date(dStr + 'T00:00:00');
            const dayLetter = d.toLocaleDateString(undefined, { weekday: 'narrow' });
            const isTodayDate = dStr === todayStr;

            // Check if user completed morning or has a setback
            const hadRelapse = disciplineRelapses.some((r) => r.date === dStr);
            const isClean = !hadRelapse && dStr <= todayStr;

            return (
              <div
                key={dStr}
                className={`py-1.5 rounded-xl border flex flex-col items-center justify-center ${
                  isTodayDate
                    ? 'border-dawn-gold/60 bg-dawn-gold/10'
                    : 'border-dawn-border/50 bg-dawn-surface/50'
                }`}
              >
                <span className="text-[9px] text-dawn-muted font-bold">{dayLetter}</span>
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1 ${
                    hadRelapse
                      ? 'bg-rose-400'
                      : isClean
                      ? 'bg-dawn-gold shadow-gold-sm'
                      : 'bg-dawn-border'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
