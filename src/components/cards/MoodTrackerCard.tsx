import { HeartHandshake, Sparkles } from "lucide-react";
import { useState } from "react";
import { DashboardCard } from "../DashboardCard";
import { Button } from "../ui/Button";
import type { MoodLog, MoodOption } from "../../types/dashboard";

type MoodTrackerCardProps = {
  moods: MoodOption[];
  history: MoodLog[];
  isAuthenticated: boolean;
  isSaving: boolean;
  onSaveMood: (mood: MoodOption) => void;
  showSample: boolean;
};

export function MoodTrackerCard({
  moods,
  history,
  isAuthenticated,
  isSaving,
  onSaveMood,
  showSample,
}: MoodTrackerCardProps) {
  const [selectedMood, setSelectedMood] = useState(moods[0]);

  return (
    <DashboardCard
      accent="violet"
      category="Mood"
      description="Log how you feel and review recent patterns without leaving the dashboard."
      eyebrow="Mood Tracker"
      surface="glass"
      title="Check in before your next study block"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="ui-demo-label">
            {showSample ? "Sample mood options" : "Blank mood tracker"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Pick the closest feeling, then save it as a quick daily check-in.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {moods.map((mood) => {
            const isSelected = mood.id === selectedMood.id;

            return (
              <button
                key={mood.id}
                className={`rounded-[22px] border px-4 py-4 text-left transition duration-200 ${
                  isSelected
                    ? "border-violet-200 bg-[linear-gradient(135deg,rgba(245,239,255,0.92),rgba(255,255,255,0.88))] shadow-[0_10px_22px_rgba(132,110,171,0.12)] dark:border-violet-400/20 dark:bg-[linear-gradient(135deg,rgba(62,45,92,0.78),rgba(15,23,42,0.96))] dark:text-violet-50 dark:shadow-[0_10px_22px_rgba(7,12,26,0.30)]"
                    : "border-white/80 bg-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-white/10 dark:bg-white/6"
                }`}
                onClick={() => setSelectedMood(mood)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl">{mood.emoji}</p>
                    <p className="mt-2 font-medium text-slate-900 dark:text-white">
                      {mood.label}
                    </p>
                  </div>
                  <Sparkles
                    className="text-slate-300 dark:text-slate-500"
                    size={16}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="ui-subpanel-glass border-violet-100/90 p-5 dark:border-violet-400/10">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-400/12 dark:text-violet-100">
              <HeartHandshake size={20} />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {selectedMood.label} is enough information for now.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Try one shorter block, softer expectations, and one clear next step
                before you judge the whole day.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            loading={isSaving}
            onClick={() => onSaveMood(selectedMood)}
            variant="primary"
          >
            {isAuthenticated ? "Save check-in" : "Sign in to save check-in"}
          </Button>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            {showSample
              ? `Latest sample rhythm: ${history.at(-1)?.label ?? "No entries yet"}.`
              : `Latest check-in: ${history.at(-1)?.label ?? "No entries yet"}.`}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {history.slice(-3).map((entry) => (
            <div
              key={entry.day}
              className="ui-subpanel p-4"
            >
              <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                {entry.day}
              </p>
              <p className="mt-3 font-medium text-slate-900 dark:text-white">
                {entry.label}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                Support score {entry.score}
              </p>
            </div>
          ))}
          {history.length === 0 ? (
            <div className="ui-subpanel sm:col-span-3 p-4 text-sm leading-6 text-slate-500 dark:text-slate-300">
              Blank view is active. Mood history will stay empty until you log your own check-ins.
            </div>
          ) : null}
        </div>
      </div>
    </DashboardCard>
  );
}
