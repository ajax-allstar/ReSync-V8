export type CardCategory =
  | "All"
  | "Focus"
  | "Planner"
  | "Mood"
  | "Wellness"
  | "Insights";

export type AccentTone =
  | "sage"
  | "peach"
  | "violet"
  | "sky"
  | "gold";

export type QuickStat = {
  id: string;
  label: string;
  value: string;
  change: string;
  detail: string;
  accent: AccentTone;
};

export type TimerPreset = {
  id: string;
  label: string;
  minutes: number;
  vibe: string;
};

export type Task = {
  id: string;
  title: string;
  subject: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
};

export type MoodOption = {
  id: string;
  label: string;
  emoji: string;
  tone: AccentTone;
};

export type MoodLog = {
  day: string;
  label: string;
  score: number;
};

export type StudyPlanPreview = {
  id: string;
  subject: string;
  duration: string;
  focus: string;
  breaks: string;
  note: string;
};

export type InsightBar = {
  day: string;
  hours: number;
};

export type ScheduleBlock = {
  id: string;
  time: string;
  title: string;
  detail: string;
  intensity: "steady" | "deep" | "light";
};

export type ExamMilestone = {
  id: string;
  title: string;
  date: string;
  readiness: number;
  status: string;
};

export type ConsistencyBeat = {
  label: string;
  value: number;
};
