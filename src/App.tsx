import { useDeferredValue, useEffect, useState, startTransition } from "react";
import type { Session } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import { AccountModal } from "./components/AccountModal";
import { AppHeader } from "./components/AppHeader";
import { AuthModal } from "./components/AuthModal";
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
import { Button } from "./components/ui/Button";
import { Toast } from "./components/ui/Toast";
import {
  consistencyBeats,
  dailySchedule,
  examMilestones,
  filterTabs,
  moodHistory,
  moodOptions,
  studyPlanPreviews,
  timerPresets,
  todaysTasks,
  weeklyInsights,
} from "./data/dashboard";
import {
  ensureProfile,
  getAvatarUrl,
  getDisplayName,
  getSupabaseClient,
  isSupabaseConfigured,
  loadSession,
  saveProfile,
  type ProfileRecord,
} from "./lib/supabase";
import type {
  CardCategory,
  MoodLog,
  MoodOption,
  QuickStat,
  Task,
} from "./types/dashboard";

const themeStorageKey = "resync-theme";
const calmModeStorageKey = "resync-calm-mode";

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

const sectionFilters: Record<HeaderSection, CardCategory> = {
  dashboard: "All",
  planner: "Planner",
  focus: "Focus",
  mood: "Mood",
  insights: "Insights",
};

const sectionIds = [
  "dashboard",
  "planner",
  "focus",
  "mood",
  "insights",
] as const;

const moodScoreMap: Record<MoodOption["id"], number> = {
  grounded: 78,
  foggy: 58,
  stressed: 49,
  motivated: 84,
};

type HeaderSection = (typeof sectionIds)[number];
type AuthMode = "signin" | "signup";
type AccountView = "profile" | "settings";
type ToastTone = "success" | "error" | "info";
type PersistedDashboardState = {
  moodLogs: MoodLog[];
  tasks: Task[];
};

function readStoredTheme() {
  if (typeof window === "undefined") {
    return false;
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return storedTheme ? storedTheme === "dark" : prefersDark;
}

function readStoredCalmMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(calmModeStorageKey) === "true";
}

function getDashboardStorageKey(userId?: string) {
  return `resync-dashboard-state:${userId ?? "guest"}`;
}

function isHeaderSection(value: string): value is HeaderSection {
  return sectionIds.includes(value as HeaderSection);
}

function getMoodLabel(average: number) {
  if (average >= 75) {
    return "Steady";
  }

  if (average >= 60) {
    return "Mixed";
  }

  return "Needs care";
}

function getSectionForFilter(filter: CardCategory): HeaderSection {
  switch (filter) {
    case "Planner":
      return "planner";
    case "Mood":
    case "Wellness":
      return "mood";
    case "Insights":
      return "insights";
    case "Focus":
      return "focus";
    default:
      return "dashboard";
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function formatTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(new Date())
    .split("/")
    .reverse()
    .join("-");
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(new Date());
}

function readStoredDashboardState(storageKey: string): PersistedDashboardState {
  if (typeof window === "undefined") {
    return {
      moodLogs: moodHistory,
      tasks: todaysTasks,
    };
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return {
        moodLogs: moodHistory,
        tasks: todaysTasks,
      };
    }

    const parsedValue = JSON.parse(storedValue) as Partial<PersistedDashboardState>;

    return {
      moodLogs:
        Array.isArray(parsedValue.moodLogs) && parsedValue.moodLogs.length > 0
          ? parsedValue.moodLogs
          : moodHistory,
      tasks:
        Array.isArray(parsedValue.tasks) && parsedValue.tasks.length > 0
          ? parsedValue.tasks
          : todaysTasks,
    };
  } catch {
    return {
      moodLogs: moodHistory,
      tasks: todaysTasks,
    };
  }
}

function scrollToSection(section: HeaderSection) {
  window.requestAnimationFrame(() => {
    document
      .getElementById(section)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export default function App() {
  const supabase = getSupabaseClient();
  const isAuthConfigured = isSupabaseConfigured();

  const [isDark, setIsDark] = useState(readStoredTheme);
  const [isCalmMode, setIsCalmMode] = useState(readStoredCalmMode);
  const [activeSection, setActiveSection] = useState<HeaderSection>("dashboard");
  const [activeFilter, setActiveFilter] = useState<CardCategory>("All");
  const deferredFilter = useDeferredValue(activeFilter);

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(supabase));
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isMoodSaving, setIsMoodSaving] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [accountView, setAccountView] = useState<AccountView>("profile");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(todaysTasks);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(moodHistory);
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    tone: ToastTone;
  }>({
    isVisible: false,
    message: "",
    tone: "info",
  });

  const userId = session?.user.id;
  const dashboardStorageKey = getDashboardStorageKey(userId);
  const completedTaskCount = tasks.filter((task) => task.completed).length;
  const moodAverage = Math.round(
    moodLogs.reduce((sum, item) => sum + item.score, 0) / moodLogs.length,
  );
  const focusHours = weeklyInsights.reduce((sum, item) => sum + item.hours, 0);
  const quickStats: QuickStat[] = [
    {
      accent: "sage",
      change: `+${weeklyInsights.at(-1)?.hours.toFixed(1) ?? "0.0"}h`,
      detail: "tap to jump into a focus sprint",
      id: "focus-hours",
      label: "Focus hours",
      value: `${focusHours.toFixed(1)}h`,
    },
    {
      accent: "peach",
      change: `${Math.round((completedTaskCount / tasks.length) * 100)}%`,
      detail:
        completedTaskCount === tasks.length
          ? "all study actions checked off"
          : `${tasks.length - completedTaskCount} task${
              tasks.length - completedTaskCount === 1 ? "" : "s"
            } left`,
      id: "tasks",
      label: "Tasks completed",
      value: `${completedTaskCount}/${tasks.length}`,
    },
    {
      accent: "violet",
      change: `${moodAverage}%`,
      detail: "tap to review mood support",
      id: "mood",
      label: "Mood average",
      value: getMoodLabel(moodAverage),
    },
    {
      accent: "sky",
      change: "+3",
      detail: "tap to review weekly momentum",
      id: "streak",
      label: "Consistency streak",
      value: "9 days",
    },
  ];
  const isAuthenticated = Boolean(session?.user);
  const displayName = getDisplayName(session?.user ?? null, profile);
  const avatarUrl = getAvatarUrl(session?.user ?? null, profile);

  function showToast(message: string, tone: ToastTone = "info") {
    setToast({
      isVisible: true,
      message,
      tone,
    });
  }

  function handleNavigate(section: HeaderSection, updateHistory = true) {
    setActiveSection(section);
    startTransition(() => setActiveFilter(sectionFilters[section]));
    scrollToSection(section);

    if (updateHistory) {
      window.history.replaceState(null, "", `#${section}`);
    }
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }

  function openAccount(view: AccountView) {
    if (!isAuthenticated) {
      openAuth("signin");
      showToast("Sign in to access your profile and settings.", "info");
      return;
    }

    setAccountView(view);
    setIsAccountModalOpen(true);
  }

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

  useEffect(() => {
    document.documentElement.classList.toggle("calm-mode", isCalmMode);
    window.localStorage.setItem(calmModeStorageKey, String(isCalmMode));
  }, [isCalmMode]);

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return undefined;
    }

    let isMounted = true;

    void loadSession(supabase)
      .then((loadedSession) => {
        if (!isMounted) {
          return;
        }

        setSession(loadedSession);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        showToast(getErrorMessage(error), "error");
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      startTransition(() => {
        setSession(nextSession);
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfile(null);
      return;
    }

    let isMounted = true;

    void ensureProfile(supabase, session.user)
      .then((loadedProfile) => {
        if (isMounted) {
          setProfile(loadedProfile);
        }
      })
      .catch((error) => {
        if (isMounted) {
          showToast(getErrorMessage(error), "error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session?.user, supabase]);

  useEffect(() => {
    if (!toast.isVisible) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast((current) => ({
        ...current,
        isVisible: false,
      }));
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [toast.isVisible, toast.message]);

  useEffect(() => {
    const nextState = readStoredDashboardState(dashboardStorageKey);
    setTasks(nextState.tasks);
    setMoodLogs(nextState.moodLogs);
  }, [dashboardStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      dashboardStorageKey,
      JSON.stringify({
        moodLogs,
        tasks,
      } satisfies PersistedDashboardState),
    );
  }, [dashboardStorageKey, moodLogs, tasks]);

  useEffect(() => {
    const hashValue = window.location.hash.replace("#", "");

    if (isHeaderSection(hashValue)) {
      handleNavigate(hashValue, false);
    }
  }, []);

  async function handleAuthSubmit(values: {
    email: string;
    fullName: string;
    password: string;
  }) {
    if (!supabase) {
      setAuthError("Auth is not configured for this build.");
      return;
    }

    setIsAuthSubmitting(true);
    setAuthError(null);

    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          throw error;
        }

        setIsAuthModalOpen(false);
        showToast("Signed in successfully.", "success");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const nextProfile = await ensureProfile(supabase, data.user, {
          full_name: values.fullName,
        });
        setProfile(nextProfile);
      }

      setIsAuthModalOpen(false);
      showToast(
        data.session
          ? "Account created and signed in."
          : "Account created. Check your email to confirm sign-in.",
        "success",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      setAuthError(message);
      showToast(message, "error");
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setIsAccountModalOpen(false);
      setProfile(null);
      showToast("Signed out.", "info");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  }

  async function handleSaveProfile(
    values: Pick<
      ProfileRecord,
      | "avatar_url"
      | "education_stage"
      | "full_name"
      | "notifications_enabled"
      | "preferred_study_duration"
      | "timezone"
    >,
  ) {
    if (!supabase || !session?.user) {
      openAuth("signin");
      return;
    }

    setIsProfileSaving(true);

    try {
      const savedProfile = await saveProfile(supabase, session.user, values);
      setProfile(savedProfile);
      setIsAccountModalOpen(false);
      showToast("Profile updated.", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setIsProfileSaving(false);
    }
  }

  function handleToggleTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    );
  }

  function handleResetTasks() {
    setTasks(todaysTasks);
    showToast("Task checklist reset.", "info");
  }

  async function handleSaveMood(mood: MoodOption) {
    const nextEntry: MoodLog = {
      day: formatTodayLabel(),
      label: mood.label,
      score: moodScoreMap[mood.id],
    };

    setMoodLogs((currentLogs) => {
      const withoutToday = currentLogs.filter((entry) => entry.day !== nextEntry.day);
      return [...withoutToday, nextEntry].slice(-7);
    });

    if (!supabase || !session?.user) {
      openAuth("signin");
      showToast("Sign in to sync mood check-ins across devices.", "info");
      return;
    }

    setIsMoodSaving(true);

    try {
      const { error } = await supabase.from("mood_entries").upsert(
        {
          level: Math.max(1, Math.min(5, Math.round(moodScoreMap[mood.id] / 20))),
          logged_for: formatTodayKey(),
          note: mood.label,
          user_id: session.user.id,
        },
        {
          onConflict: "user_id,logged_for",
        },
      );

      if (error) {
        throw error;
      }

      showToast("Mood check-in saved.", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setIsMoodSaving(false);
    }
  }

  function handleApplyPlan(plan: (typeof studyPlanPreviews)[number]) {
    handleNavigate("planner");
    showToast(`Plan ready: ${plan.subject}.`, "success");
  }

  function handleHeroPrimaryAction() {
    if (isAuthenticated) {
      handleNavigate("focus");
      return;
    }

    openAuth("signup");
  }

  function handleHeroSecondaryAction() {
    handleNavigate("insights");
  }

  function handleQuickStatAction(statId: QuickStat["id"]) {
    if (statId === "focus-hours") {
      handleNavigate("focus");
      return;
    }

    if (statId === "tasks") {
      handleNavigate("planner");
      return;
    }

    if (statId === "mood") {
      handleNavigate("mood");
      return;
    }

    handleNavigate("insights");
  }

  function isQuickStatActive(statId: QuickStat["id"]) {
    return (
      (statId === "focus-hours" && activeSection === "focus") ||
      (statId === "tasks" && activeSection === "planner") ||
      (statId === "mood" && activeSection === "mood") ||
      (statId === "streak" && activeSection === "insights")
    );
  }

  const cards = [
    {
      category: "Focus" as const,
      component: <FocusTimerCard presets={timerPresets} />,
      id: "focus-timer",
    },
    {
      category: "Planner" as const,
      component: (
        <TaskPlannerCard
          onResetTasks={handleResetTasks}
          onToggleTask={handleToggleTask}
          tasks={tasks}
        />
      ),
      id: "task-planner",
    },
    {
      category: "Mood" as const,
      component: (
        <MoodTrackerCard
          history={moodLogs}
          isAuthenticated={isAuthenticated}
          isSaving={isMoodSaving}
          moods={moodOptions}
          onSaveMood={handleSaveMood}
        />
      ),
      id: "mood-tracker",
    },
    {
      category: "Planner" as const,
      component: (
        <StudyPlanCard
          onApplyPlan={handleApplyPlan}
          plans={studyPlanPreviews}
        />
      ),
      id: "study-plan",
    },
    {
      category: "Wellness" as const,
      component: <RecoveryCard />,
      id: "recovery",
    },
    {
      category: "Insights" as const,
      component: <InsightsCard bars={weeklyInsights} moods={moodLogs} />,
      id: "insights-card",
    },
    {
      category: "Planner" as const,
      component: <ExamPrepCard milestones={examMilestones} />,
      id: "exam-prep",
    },
    {
      category: "Insights" as const,
      component: <ConsistencyCard beats={consistencyBeats} />,
      id: "consistency",
    },
  ];

  const visibleCards =
    deferredFilter === "All"
      ? cards
      : cards.filter((card) => card.category === deferredFilter);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,231,215,0.86),transparent_24%),radial-gradient(circle_at_top_right,rgba(213,229,219,0.82),transparent_26%),linear-gradient(180deg,#f8f3ec_0%,#f4efe6_36%,#fbf8f4_100%)] text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,rgba(120,80,67,0.32),transparent_20%),radial-gradient(circle_at_top_right,rgba(76,102,96,0.32),transparent_20%),linear-gradient(180deg,#111827_0%,#0f172a_60%,#0b1220_100%)] dark:text-white">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute left-[6%] top-16 h-40 w-40 rounded-full bg-orange-200/45 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute right-[10%] top-20 h-44 w-44 rounded-full bg-emerald-200/45 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute bottom-24 left-[24%] h-52 w-52 rounded-full bg-violet-200/35 blur-3xl dark:bg-violet-500/10" />
      </div>
      <div className="pointer-events-none fixed inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />

      <AppHeader
        activeSection={activeSection}
        avatarUrl={avatarUrl}
        displayName={displayName}
        email={session?.user.email}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
        isCalmMode={isCalmMode}
        isDark={isDark}
        onNavigate={handleNavigate}
        onOpenAccount={openAccount}
        onOpenAuth={openAuth}
        onSignOut={handleSignOut}
        onToggleCalmMode={() => setIsCalmMode((current) => !current)}
        onToggleTheme={() => setIsDark((current) => !current)}
      />

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
                {isAuthenticated ? (
                  <>
                    <UserRound size={14} />
                    Signed in as {displayName}
                  </>
                ) : (
                  <>
                    <LockKeyhole size={14} />
                    Guest preview mode
                  </>
                )}
              </div>
              <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.02] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                Keep your studies moving without letting stress run the day.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                ReSync blends focus support, planning, mood awareness, and exam
                preparation into one student-first dashboard that feels calm,
                motivating, and ready for real daily use.
              </p>
              {!isAuthenticated ? (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-300">
                  Sign in to sync your avatar, profile controls, and saved
                  account preferences across sessions.
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  onClick={handleHeroPrimaryAction}
                  trailingIcon={<ArrowRight size={16} />}
                  variant="primary"
                >
                  {isAuthenticated ? "Start today softly" : "Get started"}
                </Button>
                <Button
                  onClick={handleHeroSecondaryAction}
                  variant="secondary"
                >
                  Review study rhythm
                </Button>
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
                  <QuickStatCard
                    isActive={isQuickStatActive(stat.id)}
                    onClick={() => handleQuickStatAction(stat.id)}
                    stat={stat}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-4">
          {quickStats.map((stat, index) => (
            <motion.button
              key={`${stat.id}-summary`}
              animate={{ opacity: 1, y: 0 }}
              className={`ui-hover-lift relative overflow-hidden rounded-[28px] border border-white/70 p-5 text-left shadow-[0_20px_50px_rgba(110,91,75,0.09)] backdrop-blur-xl dark:border-white/10 ${summaryAccentClasses[stat.accent]}`}
              initial={{ opacity: 0, y: 18 }}
              onClick={() => handleQuickStatAction(stat.id)}
              transition={{ delay: 0.24 + index * 0.06, duration: 0.35 }}
              type="button"
            >
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/25" />
              <p className="ui-kicker">{stat.label}</p>
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
            </motion.button>
          ))}
        </section>

        <section
          className="space-y-5"
          id="focus"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="ui-kicker">Dashboard Cards</p>
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
              setActiveSection(getSectionForFilter(filter));
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
              <p className="ui-kicker">Mood / Wellness Area</p>
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
              {moodLogs.slice(-4).map((entry) => (
                <div
                  className="ui-subpanel flex items-center justify-between px-4 py-4"
                  key={entry.day}
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
              <p className="ui-kicker">Insights Section</p>
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

      <AuthModal
        authError={authError}
        isConfigured={isAuthConfigured}
        isOpen={isAuthModalOpen}
        isSubmitting={isAuthSubmitting}
        mode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onModeChange={setAuthMode}
        onSubmit={handleAuthSubmit}
      />

      <AccountModal
        activeView={accountView}
        email={session?.user.email ?? ""}
        isCalmMode={isCalmMode}
        isDark={isDark}
        isOpen={isAccountModalOpen}
        isSaving={isProfileSaving}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveProfile}
        onSignOut={handleSignOut}
        onToggleCalmMode={() => setIsCalmMode((current) => !current)}
        onToggleTheme={() => setIsDark((current) => !current)}
        onViewChange={setAccountView}
        profile={profile}
      />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        tone={toast.tone}
      />
    </div>
  );
}
