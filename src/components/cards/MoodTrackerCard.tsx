import { HeartHandshake, Sparkles } from "lucide-react";
import { useState } from "react";
import { DashboardCard } from "../DashboardCard";
import type { MoodLog, MoodOption } from "../../types/dashboard";

type MoodTrackerCardProps = {
  moods: MoodOption[];
  history: MoodLog[];
};

export function MoodTrackerCard({ moods, history }: MoodTrackerCardProps) {
  const [selectedMood, setSelectedMood] = useState(moods[0]);

  return (
    <DashboardCard
      accent="violet"
      category="Mood"
      description="Small emotional check-ins make the rest of the dashboard feel more human."
      eyebrow="Mood Tracker"
      surface="glass"
      title="Notice how your brain is arriving"
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {moods.map((mood) => {
            const isSelected = mood.id === selectedMood.id;

            return (
              <button
                key={mood.id}
                className={`rounded-[24px] border px-4 py-4 text-left transition duration-300 ${
                  isSelected
                    ? "border-violet-200 bg-[linear-gradient(135deg,rgba(245,239,255,0.96),rgba(255,255,255,0.82))] shadow-[0_16px_30px_rgba(132,110,171,0.16)] dark:border-violet-400/20 dark:bg-violet-400/12"
                    : "border-white/80 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:border-white/10 dark:bg-white/5"
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
                Try one shorter block, softer expectations, and a tiny win before
                you judge the whole day.
              </p>
            </div>
          </div>
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
        </div>
      </div>
    </DashboardCard>
  );
}
