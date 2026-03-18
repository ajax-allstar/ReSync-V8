import type {
  ConsistencyBeat,
  ExamMilestone,
  InsightBar,
  MoodLog,
  MoodOption,
  QuickStat,
  ScheduleBlock,
  StudyPlanPreview,
  Task,
  TimerPreset,
} from "../types/dashboard";

export const filterTabs = [
  "All",
  "Focus",
  "Planner",
  "Mood",
  "Wellness",
  "Insights",
] as const;

export const quickStats: QuickStat[] = [
  {
    id: "focus-hours",
    label: "Focus hours",
    value: "12.5h",
    change: "+2.1h",
    detail: "calmer than last week",
    accent: "sage",
  },
  {
    id: "tasks",
    label: "Tasks completed",
    value: "18/24",
    change: "75%",
    detail: "2 deep-work blocks left",
    accent: "peach",
  },
  {
    id: "mood",
    label: "Mood average",
    value: "Steady",
    change: "+14%",
    detail: "better recovery after breaks",
    accent: "violet",
  },
  {
    id: "streak",
    label: "Consistency streak",
    value: "9 days",
    change: "+3",
    detail: "micro wins are compounding",
    accent: "sky",
  },
];

export const timerPresets: TimerPreset[] = [
  { id: "reset", label: "Starter Sprint", minutes: 15, vibe: "gentle comeback" },
  { id: "pomodoro", label: "Pomodoro", minutes: 25, vibe: "classic focus" },
  { id: "deep", label: "Deep Study", minutes: 45, vibe: "exam prep mode" },
  { id: "flow", label: "Flow Hour", minutes: 60, vibe: "project momentum" },
];

export const todaysTasks: Task[] = [
  {
    id: "task-1",
    title: "Revise electrochemistry notes",
    subject: "Chemistry",
    due: "Due in 2h",
    priority: "High",
    completed: true,
  },
  {
    id: "task-2",
    title: "Solve 12 calculus differentiation problems",
    subject: "Mathematics",
    due: "Due today",
    priority: "High",
    completed: false,
  },
  {
    id: "task-3",
    title: "Create flashcards for World War I timeline",
    subject: "History",
    due: "Due tonight",
    priority: "Medium",
    completed: false,
  },
  {
    id: "task-4",
    title: "Upload CS lab reflection",
    subject: "Computer Science",
    due: "Tomorrow 8:00 AM",
    priority: "Low",
    completed: false,
  },
];

export const moodOptions: MoodOption[] = [
  { id: "grounded", label: "Grounded", emoji: "🙂", tone: "sage" },
  { id: "foggy", label: "Foggy", emoji: "😶", tone: "sky" },
  { id: "stressed", label: "Stressed", emoji: "😣", tone: "peach" },
  { id: "motivated", label: "Motivated", emoji: "🤩", tone: "gold" },
];

export const moodHistory: MoodLog[] = [
  { day: "Mon", label: "Grounded", score: 74 },
  { day: "Tue", label: "Motivated", score: 82 },
  { day: "Wed", label: "Foggy", score: 58 },
  { day: "Thu", label: "Grounded", score: 76 },
  { day: "Fri", label: "Stressed", score: 49 },
  { day: "Sat", label: "Grounded", score: 79 },
];

export const studyPlanPreviews: StudyPlanPreview[] = [
  {
    id: "plan-1",
    subject: "Physics: Modern optics",
    duration: "2 x 35 min",
    focus: "Concept recap + 8 problems",
    breaks: "8-minute stretch and water reset",
    note: "Keep the second block lighter if energy dips.",
  },
  {
    id: "plan-2",
    subject: "Biology: Genetics",
    duration: "45 min + 20 min recall",
    focus: "Diagram review and active recall",
    breaks: "5-minute eye break after each recall lap",
    note: "Finish with a confidence check instead of more input.",
  },
  {
    id: "plan-3",
    subject: "Literature: Comparative essay",
    duration: "25 min plan + 40 min write",
    focus: "Outline thesis and draft body paragraphs",
    breaks: "3-minute breathing reset before writing",
    note: "Use the first draft to lower pressure, not chase polish.",
  },
];

export const weeklyInsights: InsightBar[] = [
  { day: "Mon", hours: 2.4 },
  { day: "Tue", hours: 3.1 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 3.8 },
  { day: "Fri", hours: 2.6 },
  { day: "Sat", hours: 4.2 },
  { day: "Sun", hours: 2.9 },
];

export const dailySchedule: ScheduleBlock[] = [
  {
    id: "block-1",
    time: "7:30 AM",
    title: "Gentle start and review",
    detail: "Scan your planner, preview formulas, keep it low-pressure.",
    intensity: "light",
  },
  {
    id: "block-2",
    time: "9:00 AM",
    title: "Deep work: Mathematics set",
    detail: "High-focus problem solving while your energy is strongest.",
    intensity: "deep",
  },
  {
    id: "block-3",
    time: "1:30 PM",
    title: "Past paper sprint",
    detail: "Timed chemistry questions with a short reset after.",
    intensity: "steady",
  },
  {
    id: "block-4",
    time: "7:00 PM",
    title: "Light recall and reflection",
    detail: "Flashcards, quick wins, and tomorrow setup.",
    intensity: "light",
  },
];

export const examMilestones: ExamMilestone[] = [
  {
    id: "milestone-1",
    title: "Chemistry mock",
    date: "Mar 22",
    readiness: 82,
    status: "Strong recall, practice calculations next.",
  },
  {
    id: "milestone-2",
    title: "Maths internal",
    date: "Mar 25",
    readiness: 68,
    status: "Needs one more full-length set with review.",
  },
  {
    id: "milestone-3",
    title: "History viva",
    date: "Apr 01",
    readiness: 74,
    status: "Confidence rising after flashcards and summaries.",
  },
];

export const consistencyBeats: ConsistencyBeat[] = [
  { label: "Morning starts", value: 86 },
  { label: "Planned breaks", value: 72 },
  { label: "Task carry-over", value: 24 },
  { label: "Focus return rate", value: 91 },
];
