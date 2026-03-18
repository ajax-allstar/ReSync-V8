import { useEffect, useState, startTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppHeader } from "./components/AppHeader";
import { FilterBar } from "./components/FilterBar";
import { QuickStatCard } from "./components/QuickStatCard";
import { ConsistencyCard } from "./components/cards/ConsistencyCard";
import { ExamPrepCard } from "./components/cards/ExamPrepCard";
import { FocusTimerCard } from "./components/cards/FocusTimerCard";
import { InsightsCard } from "./components/cards/InsightsCard";
import { MoodTrackerCard } from "./components/cards/MoodTrackerCard";
import { RecoveryCard } from "./components/cards/RecoveryCard";
import { StudyPlanCard } from "./components/cards/StudyPlanCard";
import { TaskPlannerCard } from "./components/cards/TaskPlannerCard";
import { ScheduleSection } from "./components/sections/ScheduleSection";
import {
  consistencyBeats,
  dailySchedule,
  examMilestones,
  filterTabs,
  moodHistory,
  moodOptions,
  quickStats,
  studyPlanPreviews,
  timerPresets,
  todaysTasks,
  weeklyInsights,
} from "./data/dashboard";
import type { CardCategory } from "./types/dashboard";

const themeStorageKey = "resync-theme";

const summaryAccentClasses = {
  sage:
    "bg-[linear-gradient(135deg,rgba(232,244,236,0.8),rgba(255,255,255,0.76))] text-emerald-950 dark:bg-[linear-gradient(135deg,rgba(37,71,56,0.42),rgba(15,23,42,0.72))] dark:text-emerald-50",
  peach:
    "bg-[linear-gradient(135deg,rgba(255,237,222,0.82),rgba(255,255,255,0.76))] text-orange-950 dark:bg-[linear-gradient(135deg,rgba(96,57,38,0.42),rgba(15,23,42,0.72))] dark:text-orange-50",
  violet:
    "bg-[linear-gradient(135deg,rgba(241,234,255,0.82),rgba(255,255,255,0.76))] text-violet-950 dark:bg-[linear-gradient(135deg,rgba(76,56,108,0.42),rgba(15,23,42,0.72))] dark:text-violet-50",
  sky:
    "bg-[linear-gradient(135deg,rgba(231,242,255,0.82),rgba(255,255,255,0.76))] text-sky-950 dark:bg-[linear-gradient(135deg,rgba(43,74,96,0.42),rgba(15,23,42,0.72))] dark:text-sky-50",
  gold:
    "bg-[linear-gradient(135deg,rgba(255,245,216,0.82),rgba(255,255,255,0.76))] text-amber-950 dark:bg-[linear-gradient(135deg,rgba(104,75,18,0.42),rgba(15,23,42,0.72))] dark:text-amber-50",
} as const;

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const storedTheme = window.localStorage.getItem(themeStorageKey);
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    return storedTheme ? storedTheme === "dark" : prefersDark;
  });
  const [activeFilter, setActiveFilter] = useState<CardCategory>("All");

  useEffect(() => {
    async function clearLegacyReSyncCaches() {
      if (typeof window === "undefined") {
        return;
      }

      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map((registration) => registration.unregister()),
          );
        }

        if ("caches" in window) {
          const cacheKeys = await caches.keys();
          await Promise.all(
            cacheKeys
              .filter((key) => key.startsWith("resync-"))
              .map((key) => caches.delete(key)),
          );
        }
      } catch (error) {
        console.warn("ReSync cache cleanup skipped.", error);
      }
    }

    void clearLegacyReSyncCaches();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem(themeStorageKey, isDark ? "dark" : "light");
  }, [isDark]);

  const cards = [
    {
      id: "focus-timer",
      category: "Focus" as const,
      component: <FocusTimerCard presets={timerPresets} />,
    },
    {
      id: "task-planner",
      category: "Planner" as const,
      component: <TaskPlannerCard tasks={todaysTasks} />,
    },
    {
      id: "mood-tracker",
      category: "Mood" as const,
      component: <MoodTrackerCard history={moodHistory} moods={moodOptions} />,
    },
    {
      id: "study-plan",
      category: "Planner" as const,
      component: <StudyPlanCard plans={studyPlanPreviews} />,
    },
    {
      id: "recovery",
      category: "Wellness" as const,
      component: <RecoveryCard />,
    },
    {
      id: "insights",
      category: "Insights" as const,
      component: <InsightsCard bars={weeklyInsights} moods={moodHistory} />,
    },
    {
      id: "exam-prep",
      category: "Planner" as const,
      component: <ExamPrepCard milestones={examMilestones} />,
    },
    {
      id: "consistency",
      category: "Insights" as const,
      component: <ConsistencyCard beats={consistencyBeats} />,
    },
  ];

  const visibleCards =
    activeFilter === "All"
      ? cards
      : cards.filter((card) => card.category === activeFilter);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,231,215,0.86),transparent_24%),radial-gradient(circle_at_top_right,rgba(213,229,219,0.82),transparent_26%),linear-gradient(180deg,#f8f3ec_0%,#f4efe6_36%,#fbf8f4_100%)] text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,rgba(120,80,67,0.32),transparent_20%),radial-gradient(circle_at_top_right,rgba(76,102,96,0.32),transparent_20%),linear-gradient(180deg,#111827_0%,#0f172a_60%,#0b1220_100%)] dark:text-white">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-[6%] top-16 h-40 w-40 rounded-full bg-orange-200/45 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute right-[10%] top-20 h-44 w-44 rounded-full bg-emerald-200/45 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute bottom-24 left-[24%] h-52 w-52 rounded-full bg-violet-200/35 blur-3xl dark:bg-violet-500/10" />
      </div>
      <div className="pointer-events-none fixed inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />

      <AppHeader isDark={isDark} onToggleTheme={() => setIsDark((current) => !current)} />

      <main className="relative mx-auto flex max-w-7xl flex-col gap-9 px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="ui-panel relative isolate overflow-hidden px-6 py-7 sm:px-8 sm:py-8"
          id="dashboard"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
          <div className="pointer-events-none absolute -right-16 top-6 h-44 w-44 rounded-full bg-orange-200/35 blur-3xl dark:bg-orange-400/10" />
          <div className="pointer-events-none absolute bottom-0 left-10 h-32 w-32 rounded-full bg-emerald-100/50 blur-3xl dark:bg-emerald-400/10" />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="relative z-10">
              <div className="ui-chip inline-flex items-center gap-2 px-4 py-2 text-[11px] tracking-[0.26em]">
                ReSync daily overview
              </div>
              <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.02] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                Keep your studies moving without letting stress run the day.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                ReSync blends focus support, planning, mood awareness, and exam
                preparation into one student-first dashboard that feels calm,
                motivating, and easy on the eyes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="ui-button-primary" type="button">
                  Start today softly
                </button>
                <button className="ui-button-secondary" type="button">
                  Review study rhythm
                </button>
              </div>
            </div>

            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="grid gap-4 sm:grid-cols-2"
              initial={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: 0.18, duration: 0.45, ease: "easeOut" }}
            >
              {quickStats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 18 }}
                  transition={{ delay: 0.12 + index * 0.06, duration: 0.35 }}
                >
                  <QuickStatCard stat={stat} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={`${stat.id}-summary`}
              animate={{ opacity: 1, y: 0 }}
              className={`ui-hover-lift relative overflow-hidden rounded-[28px] border border-white/70 p-5 shadow-[0_20px_50px_rgba(110,91,75,0.09)] backdrop-blur-xl dark:border-white/10 ${summaryAccentClasses[stat.accent]}`}
              initial={{ opacity: 0, y: 18 }}
              transition={{ delay: 0.24 + index * 0.06, duration: 0.35 }}
            >
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/25" />
              <p className="ui-kicker">
                {stat.label}
              </p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <p className="font-display text-4xl text-slate-950 dark:text-white">
                  {stat.value}
                </p>
                <p className="rounded-full bg-white/60 px-3 py-1 text-sm text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.56)] dark:bg-white/10 dark:text-slate-200">
                  {stat.change}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {stat.detail}
              </p>
            </motion.div>
          ))}
        </section>

        <section className="space-y-5" id="focus">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="ui-kicker">
                Dashboard Cards
              </p>
              <h2 className="mt-2 font-display text-3xl text-slate-950 dark:text-white">
                Switch between focus, planning, mood, wellness, and insight views
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Filter the dashboard to match what you need right now instead of
              staring at everything at once.
            </p>
          </div>

          <FilterBar
            activeFilter={activeFilter}
            filters={filterTabs}
            onFilterChange={(filter) => {
              startTransition(() => setActiveFilter(filter));
            }}
          />

          <motion.div
            className="grid gap-5 lg:grid-cols-2"
            layout
          >
            <AnimatePresence mode="popLayout">
              {visibleCards.map((card) => (
                <motion.div
                  key={card.id}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full"
                  exit={{ opacity: 0, y: 18 }}
                  initial={{ opacity: 0, y: 18 }}
                  layout
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  {card.component}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <ScheduleSection blocks={dailySchedule} />

          <section
            className="ui-panel space-y-6 p-6"
            id="mood"
          >
            <div>
              <p className="ui-kicker">
                Mood / Wellness Area
              </p>
              <h2 className="mt-3 font-display text-3xl text-slate-950 dark:text-white">
                Gentle support between study blocks
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                A softer layer for student pressure: recovery cues, stress
                signals, and low-friction emotional check-ins.
              </p>
            </div>

            <div className="ui-subpanel-glass bg-[linear-gradient(135deg,rgba(243,235,255,0.84),rgba(255,255,255,0.76))] p-5 dark:bg-[linear-gradient(135deg,rgba(118,88,149,0.22),rgba(255,255,255,0.03))]">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Today&apos;s recovery note
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                You do not need to earn rest before taking a reset. Protecting
                your focus is part of studying well.
              </p>
            </div>

            <div className="grid gap-4">
              {moodHistory.slice(-4).map((entry) => (
                <div
                  key={entry.day}
                  className="ui-subpanel flex items-center justify-between px-4 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {entry.day}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                      {entry.label}
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:bg-white/10 dark:text-white">
                    {entry.score}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section
          className="ui-panel p-6"
          id="insights"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="ui-kicker">
                Insights Section
              </p>
              <h2 className="mt-3 font-display text-3xl text-slate-950 dark:text-white">
                Weekly patterns that help you study with less friction
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Focus hours, emotional rhythm, and schedule quality all stay visible
              in one place so the next adjustment feels obvious.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="ui-subpanel p-5">
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Average session quality
              </p>
              <p className="mt-3 font-display text-5xl text-slate-950 dark:text-white">
                8.4
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Best results happen when study blocks start before energy is fully gone.
              </p>
            </div>
            <div className="ui-subpanel p-5">
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Most effective reset
              </p>
              <p className="mt-3 font-display text-3xl text-slate-950 dark:text-white">
                10-minute walk
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Returns attention faster than scrolling or pushing straight through.
              </p>
            </div>
            <div className="ui-subpanel p-5">
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Recommended tweak
              </p>
              <p className="mt-3 font-display text-3xl text-slate-950 dark:text-white">
                Shorter last block
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Your evening performance rises when the final session stays under 30 minutes.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
