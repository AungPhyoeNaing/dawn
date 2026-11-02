import { Modal } from './components/Modal';
import React, { useState, useEffect, useCallback } from 'react';
import type {
  RitualType,
  RitualSession,
  DisciplineGoal,
  DisciplineCheckin,
  DisciplineRelapse,
  UserSettings,
} from './types';
import { db, initializeDatabase } from './db/db';
import { getLocalDateString } from './utils/date';
import { ROUTINE_PRESETS } from './data/rituals';
import { Header } from './components/Header';
import { BottomNav, type TabType } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { RitualsTab } from './components/RitualsTab';
import { FocusTab } from './components/FocusTab';
import { ProgressTab } from './components/ProgressTab';
import { ActiveRitualRunner } from './components/ActiveRitualRunner';
import { SupportModal } from './components/SupportModal';
import { ConstructiveRestartModal } from './components/ConstructiveRestartModal';
import { SettingsModal } from './components/SettingsModal';
import { IOSInstallBanner } from './components/IOSInstallBanner';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const [settings, setSettings] = useState<UserSettings>({
    userName: 'Friend',
    theme: 'dark',
    routinePreset: '30min',
    customDurations: {
      silence: 5,
      affirmations: 5,
      visualization: 5,
      exercise: 5,
      reading: 5,
      scribing: 5,
    },
    soundEnabled: true,
    hasSeenOnboarding: false,
  });

  const [todaySession, setTodaySession] = useState<RitualSession | null>(null);
  const [allSessions, setAllSessions] = useState<RitualSession[]>([]);
  const [disciplineGoals, setDisciplineGoals] = useState<DisciplineGoal[]>([]);
  const [disciplineRelapses, setDisciplineRelapses] = useState<DisciplineRelapse[]>([]);
  const [disciplineCheckins, setDisciplineCheckins] = useState<DisciplineCheckin[]>([]);

  // Modals state
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [restartModalGoal, setRestartModalGoal] = useState<{
    goal: DisciplineGoal;
    streak: number;
  } | null>(null);

  // Active Ritual Runner state
  const [activeRunner, setActiveRunner] = useState<{
    ritual: RitualType;
    durationMinutes: number;
    isSequence: boolean;
    sequenceStep: number;
    totalSequenceSteps: number;
  } | null>(null);

  // Load state from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      await initializeDatabase();

      // Load Settings
      const savedSettings = await db.userSettings.toArray();
      if (savedSettings.length > 0) {
        setSettings(savedSettings[0]);
      }

      // Load Today's Session
      const todayStr = getLocalDateString();
      const session = await db.ritualSessions.where('date').equals(todayStr).first();
      setTodaySession(session || null);

      // Load All Sessions
      const sessions = await db.ritualSessions.toArray();
      setAllSessions(sessions);

      // Load Discipline Goals
      const goals = await db.disciplineGoals.toArray();
      setDisciplineGoals(goals);

      // Load Relapses and Checkins
      const relapses = await db.disciplineRelapses.toArray();
      setDisciplineRelapses(relapses);

      const checkins = await db.disciplineCheckins.toArray();
      setDisciplineCheckins(checkins);
    } catch (error) {
      console.error('Failed to load database records:', error);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Sequence Ritual List
  const ritualOrder: RitualType[] = [
    'silence',
    'affirmations',
    'visualization',
    'exercise',
    'reading',
    'scribing',
  ];

  // Start Full Miracle Morning Sequence
  const handleStartFullRoutine = (presetKey: string) => {
    const preset = ROUTINE_PRESETS[presetKey] || ROUTINE_PRESETS['30min'];
    const completed = todaySession?.completedRituals || [];

    // Find the next incomplete ritual in sequence
    const nextRitualIndex = ritualOrder.findIndex((r) => !completed.includes(r));
    const firstRitual = nextRitualIndex !== -1 ? ritualOrder[nextRitualIndex] : ritualOrder[0];
    const duration = preset.durations[firstRitual] || 5;

    setActiveRunner({
      ritual: firstRitual,
      durationMinutes: duration,
      isSequence: true,
      sequenceStep: (nextRitualIndex !== -1 ? nextRitualIndex : 0) + 1,
      totalSequenceSteps: 6,
    });
  };

  // Start a single ritual runner
  const handleOpenSingleRitual = (ritual: RitualType) => {
    const preset = ROUTINE_PRESETS[settings.routinePreset || '30min'];
    const duration = preset?.durations[ritual] || 5;

    setActiveRunner({
      ritual,
      durationMinutes: duration,
      isSequence: false,
      sequenceStep: 1,
      totalSequenceSteps: 1,
    });
  };

  // On Complete Ritual
  const handleCompleteRitual = async (ritual: RitualType, timeSpentSeconds: number) => {
    const todayStr = getLocalDateString();
    let currentCompleted = todaySession?.completedRituals || [];
    if (!currentCompleted.includes(ritual)) {
      currentCompleted = [...currentCompleted, ritual];
    }

    const updatedTotalSeconds = (todaySession?.totalSeconds || 0) + timeSpentSeconds;

    if (todaySession && todaySession.id) {
      await db.ritualSessions.update(todaySession.id, {
        completedRituals: currentCompleted,
        totalSeconds: updatedTotalSeconds,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await db.ritualSessions.add({
        date: todayStr,
        completedRituals: currentCompleted,
        routinePreset: settings.routinePreset || '30min',
        totalSeconds: updatedTotalSeconds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await refreshData();

    // If part of sequence, advance to next incomplete ritual
    if (activeRunner && activeRunner.isSequence) {
      const nextIndex = ritualOrder.findIndex((r) => !currentCompleted.includes(r));
      if (nextIndex !== -1) {
        const nextRitual = ritualOrder[nextIndex];
        const preset = ROUTINE_PRESETS[settings.routinePreset || '30min'];
        const duration = preset?.durations[nextRitual] || 5;

        setActiveRunner({
          ritual: nextRitual,
          durationMinutes: duration,
          isSequence: true,
          sequenceStep: nextIndex + 1,
          totalSequenceSteps: 6,
        });
        return;
      }
    }

    setActiveRunner(null);
  };

  // Skip Ritual in sequence
  const handleSkipRitual = (ritual: RitualType) => {
    if (activeRunner && activeRunner.isSequence) {
      const currentIndex = ritualOrder.indexOf(ritual);
      const nextIndex = currentIndex + 1;
      if (nextIndex < ritualOrder.length) {
        const nextRitual = ritualOrder[nextIndex];
        const preset = ROUTINE_PRESETS[settings.routinePreset || '30min'];
        const duration = preset?.durations[nextRitual] || 5;

        setActiveRunner({
          ritual: nextRitual,
          durationMinutes: duration,
          isSequence: true,
          sequenceStep: nextIndex + 1,
          totalSequenceSteps: 6,
        });
        return;
      }
    }
    setActiveRunner(null);
  };

  // Reset today's session
  const handleResetTodaySession = async () => {
    if (todaySession && todaySession.id) {
      if (confirm("Reset today's ritual progress? You can start fresh.")) {
        await db.ritualSessions.delete(todaySession.id);
        await refreshData();
      }
    }
  };

  // Constructive Restart Confirmation
  const handleConfirmRestart = async (data: {
    trigger?: string;
    reflection?: string;
    lessonLearned?: string;
  }) => {
    if (!restartModalGoal) return;
    const todayStr = getLocalDateString();

    await db.disciplineRelapses.add({
      goalId: restartModalGoal.goal.id,
      date: todayStr,
      streakLengthDaysAtRelapse: restartModalGoal.streak,
      trigger: data.trigger,
      reflection: data.reflection,
      lessonLearned: data.lessonLearned,
      createdAt: new Date().toISOString(),
    });

    setRestartModalGoal(null);
    await refreshData();
  };

  // Quick Check-in from Home
  const handleQuickCheckin = async (goalId: string, status: 'clean' | 'relapse') => {
    const todayStr = getLocalDateString();
    const existing = await db.disciplineCheckins
      .where('[goalId+date]')
      .equals([goalId, todayStr])
      .first();

    if (!existing) {
      await db.disciplineCheckins.add({
        goalId,
        date: todayStr,
        status,
        createdAt: new Date().toISOString(),
      });
      await refreshData();
    }
  };

  const ritualsProgressPct = Math.round(
    ((todaySession?.completedRituals.length || 0) / 6) * 100
  );

  return (
    <div className="app-shell">
      {/* Sticky Header with SOS and Settings */}
      <Header
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        title="DAWN"
        subtitle="Rise. Focus. Become."
      />

      {/* Main Content Area — Mobile First (375px primary, responsive up to tablet/desktop) */}
      <main className="app-main">
        {activeTab === 'home' && (
          <HomeTab
            allSessions={allSessions}
            routineMinutes={settings.routinePreset === 'custom' ? Object.values(settings.customDurations).reduce((a, b) => a + b, 0) : (ROUTINE_PRESETS[settings.routinePreset]?.totalMinutes ?? 30)}
            userName={settings.userName}
            todaySession={todaySession}
            disciplineGoals={disciplineGoals}
            disciplineRelapses={disciplineRelapses}
            disciplineCheckins={disciplineCheckins}
            onStartRitualSequence={() => handleStartFullRoutine(settings.routinePreset || '30min')}
            onOpenRitual={handleOpenSingleRitual}
            onOpenSupport={() => setIsSupportOpen(true)}
            onSwitchTab={switchTab}
            onQuickCheckin={handleQuickCheckin}
          />
        )}

        {activeTab === 'rituals' && (
          <RitualsTab
            todaySession={todaySession}
            settings={settings}
            onStartFullRoutine={handleStartFullRoutine}
            onOpenSingleRitual={handleOpenSingleRitual}
            onResetTodaySession={handleResetTodaySession}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'focus' && (
          <FocusTab
            goals={disciplineGoals}
            relapses={disciplineRelapses}
            checkins={disciplineCheckins}
            onOpenConstructiveRestart={(goal, currentStreak) =>
              setRestartModalGoal({ goal, streak: currentStreak })
            }
            onOpenSupport={() => setIsSupportOpen(true)}
            onRefreshData={refreshData}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            allSessions={allSessions}
            disciplineGoals={disciplineGoals}
            disciplineRelapses={disciplineRelapses}
            disciplineCheckins={disciplineCheckins}
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar with Safe Area Inset & Liquid Glass Frosted Sheen */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={switchTab}
        ritualsProgressPct={ritualsProgressPct}
      />

      {/* Active Ritual Runner Overlay */}
      {activeRunner && (
        <ActiveRitualRunner
          ritualType={activeRunner.ritual}
          durationMinutes={activeRunner.durationMinutes}
          isSequence={activeRunner.isSequence}
          sequenceStep={activeRunner.sequenceStep}
          totalSequenceSteps={activeRunner.totalSequenceSteps}
          onCompleteRitual={handleCompleteRitual}
          onSkipRitual={handleSkipRitual}
          onClose={() => setActiveRunner(null)}
        />
      )}

      {/* Support Mode Sanctuary Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        onLogTrigger={async (trigger, notes) => {
          if (disciplineGoals.length > 0) {
            await db.disciplineCheckins.add({
              goalId: disciplineGoals[0].id,
              date: getLocalDateString(),
              status: 'clean',
              trigger,
              reflection: notes,
              createdAt: new Date().toISOString(),
            });
            await refreshData();
          }
        }}
      />

      {/* Constructive Restart Modal */}
      {restartModalGoal && (
        <ConstructiveRestartModal
          isOpen={true}
          goal={restartModalGoal.goal}
          currentStreakDays={restartModalGoal.streak}
          onClose={() => setRestartModalGoal(null)}
          onConfirmRestart={handleConfirmRestart}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={(newSettings) => {
          setSettings((prev) => ({ ...prev, ...newSettings }));
          refreshData();
        }}
        onOpenIOSGuide={() => setShowIOSGuide(true)}
      />

      {/* iOS Add to Home Screen Instructions */}
      <IOSInstallBanner />

      {/* Explicit iOS Guide Modal if triggered from settings */}
      {showIOSGuide && (
        <Modal label="Install on iPhone" onClose={() => setShowIOSGuide(false)}>
          <div className="glass-panel rounded-3xl p-5 max-w-sm w-full text-dawn-light space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white tracking-tight">How to Install on iPhone SE</h3>
            <div className="space-y-2 text-xs text-slate-300 bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <p>1. Open Safari and navigate to this app URL.</p>
              <p>2. Tap the <strong>Share</strong> button (square with arrow) at the bottom.</p>
              <p>3. Scroll down and select <strong>Add to Home Screen</strong>.</p>
              <p>4. Tap <strong>Add</strong> in the top-right corner.</p>
              <p className="text-[11px] text-dawn-gold mt-1 font-medium">
                The app will launch in full standalone fullscreen without browser address bars!
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 liquid-gold-button text-xs rounded-xl"
            >
              Close Guide
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
