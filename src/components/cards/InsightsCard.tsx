import { ChartNoAxesColumn, TrendingUp } from "lucide-react";
import { DashboardCard } from "../DashboardCard";
import type { InsightBar, MoodLog } from "../../types/dashboard";

type InsightsCardProps = {
  bars: InsightBar[];
  moods: MoodLog[];
};

export function InsightsCard({ bars, moods }: InsightsCardProps) {
  const totalHours = bars.reduce((sum, item) => sum + item.hours, 0);
  const focusAverage = (totalHours / bars.length).toFixed(1);
  const moodAverage = Math.round(
    moods.reduce((sum, item) => sum + item.score, 0) / moods.length,
  );

  return (
    <DashboardCard
      accent="sage"
      category="Insights"
      description="Clear progress signals without turning your week into a guilt machine."
      eyebrow="Weekly Insights"
      surface="solid"
      title="Your effort is starting to look stable"
    >
      <div className="ui-subpanel border-emerald-100/80 p-5 dark:border-emerald-400/10">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-emerald-100/70 bg-emerald-50/85 p-4 dark:border-emerald-400/10 dark:bg-emerald-400/10">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Consistency score
            </p>
            <p className="mt-2 font-display text-4xl text-slate-950 dark:text-white">
              84
            </p>
          </div>
          <div className="rounded-[24px] border border-white/80 bg-white/85 p-4 dark:border-white/10 dark:bg-slate-950/50">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Focus hours
            </p>
            <p className="mt-2 font-display text-4xl text-slate-950 dark:text-white">
              {totalHours.toFixed(1)}h
            </p>
          </div>
          <div className="rounded-[24px] border border-violet-100/70 bg-violet-50/85 p-4 dark:border-violet-400/10 dark:bg-violet-400/10">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Mood trend
            </p>
            <p className="mt-2 font-display text-4xl text-slate-950 dark:text-white">
              {moodAverage}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="ui-subpanel p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
                Study momentum
              </p>
              <ChartNoAxesColumn size={18} className="text-slate-400" />
            </div>
            <div className="mt-5 flex h-44 items-end gap-3">
              {bars.map((bar) => (
                <div key={bar.day} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-full w-full items-end rounded-full bg-slate-100 p-1 dark:bg-white/5">
                    <div
                      className="w-full rounded-full bg-[linear-gradient(180deg,#94b89f,#537766)]"
                      style={{ height: `${(bar.hours / 4.5) * 100}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
                      {bar.day}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {bar.hours}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="ui-subpanel p-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-300" />
                <p className="font-medium text-slate-900 dark:text-white">
                  Best rhythm
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Average focus block length rose to {focusAverage} hours daily
                when you planned breaks before starting.
              </p>
            </div>
            <div className="ui-subpanel p-4">
              <p className="font-medium text-slate-900 dark:text-white">
                Trend summary
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Mood dipped midweek, then recovered once your schedule shifted
                toward shorter sprints and earlier wrap-ups.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
