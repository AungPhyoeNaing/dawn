import React, { useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronRight, Eye, HeartHandshake, Leaf, Moon, PenLine, Play, RotateCw, Shield, Sparkles, Sunrise } from 'lucide-react';
import type { RitualSession, DisciplineGoal, DisciplineCheckin, DisciplineRelapse, RitualType } from '../types';
import { RITUAL_DEFINITIONS } from '../data/rituals';
import { getContextualMotivation, getRandomMotivation } from '../data/motivation';
import { calculateStreakStats } from '../utils/discipline';
import { getLocalDateString, getPastNDays } from '../utils/date';

interface HomeTabProps {
  userName: string;
  todaySession: RitualSession | null;
  allSessions: RitualSession[];
  routineMinutes: number;
  disciplineGoals: DisciplineGoal[];
  disciplineRelapses: DisciplineRelapse[];
  disciplineCheckins: DisciplineCheckin[];
  onStartRitualSequence: () => void;
  onOpenRitual: (ritual: RitualType) => void;
  onOpenSupport: () => void;
  onSwitchTab: (tab: 'rituals' | 'focus' | 'progress') => void;
  onQuickCheckin: (goalId: string, status: 'clean' | 'relapse') => void;
}
const rituals: { key: RitualType; icon: typeof Moon; label: string }[] = [
  { key: 'silence', icon: Moon, label: 'Find stillness' },
  { key: 'affirmations', icon: Sparkles, label: 'Speak kindly' },
  { key: 'visualization', icon: Eye, label: 'See possibility' },
  { key: 'exercise', icon: Leaf, label: 'Move your body' },
  { key: 'reading', icon: BookOpen, label: 'Feed your mind' },
  { key: 'scribing', icon: PenLine, label: 'Make space' },
];

export const HomeTab: React.FC<HomeTabProps> = ({ userName, todaySession, allSessions, routineMinutes, disciplineGoals, disciplineRelapses, disciplineCheckins, onStartRitualSequence, onOpenRitual, onOpenSupport, onSwitchTab, onQuickCheckin }) => {
  const hour = new Date().getHours();
  const greeting = hour >= 17 || hour < 4 ? 'Good evening' : hour >= 12 ? 'Good afternoon' : 'Good morning';
  const completed = todaySession?.completedRituals ?? [];
  const [quote, setQuote] = useState(() => getContextualMotivation({ hour, ritualsCompletedToday: completed.length, totalRituals: 6 }));
  const today = getLocalDateString();
  const next = rituals.find(r => !completed.includes(r.key));
  const days = getPastNDays(7);
  const activeDays = days.filter(date => allSessions.some(s => s.date === date && s.completedRituals.length > 0)).length;

  return <div className="home-dashboard">
    <div className="welcome">
      <p>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      <h2>{greeting}{userName && userName.toLowerCase() !== 'friend' ? `, ${userName}` : ''}.</h2>
      <span>A little time for yourself. A better start.</span>
    </div>
    <div className="home-primary">
      <section className="morning-panel" aria-labelledby="morning-title">
        <div className="sunrise-art" aria-hidden="true"><div className="sun-orbit orbit-outer"/><div className="sun-orbit orbit-inner"/><div className="sun-disc"/><div className="sun-horizon"/></div>
        <div className="morning-copy">
          <span className="routine-meta"><Sunrise size={16}/> Your daily beginning</span>
          <h3 id="morning-title">Make room<br/>for a brighter day.</h3>
          <p>{completed.length === 6 ? 'You showed up for yourself today.' : `Six simple rituals. ${routineMinutes} minutes just for you.`}</p>
        </div>
        <div className="morning-bottom">
          <div className="routine-progress"><span>{completed.length} of 6 rituals complete</span><span>{Math.round(completed.length / 6 * 100)}%</span></div>
          <div className="routine-track" aria-label={`${completed.length} of 6 rituals complete`}>{rituals.map(r => <span key={r.key} className={completed.includes(r.key) ? 'done' : ''}/>)}</div>
          <button className="primary-action" onClick={onStartRitualSequence}><Play size={16} fill="currentColor"/><span>{completed.length === 6 ? 'Practice again' : completed.length ? 'Continue my morning' : 'Begin my morning'}</span><ArrowRight size={18}/></button>
          <p className="next-ritual">{next ? `Up next: ${RITUAL_DEFINITIONS[next.key].name}` : 'Take this feeling into the rest of your day.'}</p>
        </div>
      </section>
      <section className="ritual-shortcuts" aria-labelledby="rituals-title">
        <div className="section-heading"><h3 id="rituals-title">Your daily rituals</h3><button onClick={() => onSwitchTab('rituals')}>Choose routine <ChevronRight size={14}/></button></div>
        <div className="ritual-grid">{rituals.map(({ key, icon: Icon, label }) => <button key={key} className={`ritual-shortcut ${completed.includes(key) ? 'is-done' : ''}`} onClick={() => onOpenRitual(key)}>
          <span className={`ritual-symbol symbol-${key}`}>{completed.includes(key) ? <Check size={19}/> : <Icon size={19}/>}</span>
          <strong>{RITUAL_DEFINITIONS[key].name}</strong><span>{completed.includes(key) ? 'Completed today' : label}</span>
        </button>)}</div>
      </section>
      <section className="daily-note"><div className="section-heading"><h3>A thought to carry</h3><button className="icon-button" onClick={() => setQuote(getRandomMotivation())} aria-label="New motivational message"><RotateCw size={15}/></button></div><blockquote>{quote.text}</blockquote><span>One small step is still a step forward.</span></section>
    </div>
    <div className="home-secondary">
      <section className="week-panel">
        <div className="section-heading"><h3>This week</h3><button onClick={() => onSwitchTab('progress')} aria-label="View progress"><ArrowRight size={17}/></button></div>
        <p><strong>{activeDays}</strong> {activeDays === 1 ? 'day' : 'days'} you made time for yourself</p>
        <div className="week-days">{days.map(date => {
          const session = allSessions.find(s => s.date === date);
          const count = session?.completedRituals.length ?? 0;
          return <div key={date} className={date === today ? 'is-today' : ''} aria-label={`${date}: ${count} rituals completed`}><span>{new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'narrow' })}</span><span className={`day-mark ${count === 6 ? 'complete' : count > 0 ? 'partial' : ''}`}>{count === 6 ? <Check size={14}/> : new Date(date + 'T00:00:00').getDate()}</span></div>;
        })}</div><div className="week-legend"><span><i/>Completed</span><span><i/>In progress</span></div>
      </section>
      <section className="personal-section"><div className="section-heading"><h3>Personal focus</h3><button onClick={() => onSwitchTab('focus')}>View all <ChevronRight size={14}/></button></div>
        <div className="goal-list">{disciplineGoals.length ? disciplineGoals.map(goal => {
          const checkins = disciplineCheckins.filter(c => c.goalId === goal.id);
          const stats = calculateStreakStats({ startDate: goal.startDate, relapses: disciplineRelapses.filter(r => r.goalId === goal.id), checkins });
          const checked = checkins.some(c => c.date === today);
          return <div key={goal.id} className="goal-summary"><div className="goal-top"><Shield size={17}/><button onClick={() => onSwitchTab('focus')}>{goal.title}<ChevronRight size={14}/></button></div><div className="goal-streak"><strong>{stats.currentStreakDays}<small> days</small></strong><span>Personal best: {stats.longestStreakDays} days</span></div><button className={`checkin-button ${checked ? 'checked' : ''}`} disabled={checked} onClick={() => onQuickCheckin(goal.id, 'clean')}>{checked ? <><Check size={15}/>Checked in today</> : 'Check in for today'}</button></div>;
        }) : <button className="focus-empty" onClick={() => onSwitchTab('focus')}>Make space for your personal goals <ChevronRight size={18}/></button>}</div>
      </section>
      <button className="support-link" onClick={onOpenSupport}><span className="support-symbol"><HeartHandshake size={23}/></span><span><strong>A moment to reset</strong><span>Find your breath. Find your footing.</span></span><ChevronRight size={17}/></button>
      <p className="privacy-note"><Shield size={12}/> Your journey stays on this device.</p>
    </div>
  </div>;
};
