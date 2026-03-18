import { Flame, ShieldCheck } from "lucide-react";
import { DashboardCard } from "../DashboardCard";
import type { ConsistencyBeat } from "../../types/dashboard";

type ConsistencyCardProps = {
  beats: ConsistencyBeat[];
};

export function ConsistencyCard({ beats }: ConsistencyCardProps) {
  return (
    <DashboardCard
      accent="violet"
      category="Insights"
      description="A softer way to measure consistency than just counting perfect days."
      eyebrow="Consistency Tracker"
      surface="glass"
      title="Small repeats are becoming reliable"
    >
      <div className="ui-subpanel-glass border-violet-100/80 p-5 dark:border-violet-400/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Current streak
            </p>
            <p className="mt-2 font-display text-4xl text-slate-950 dark:text-white">
              9 days
            </p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-2xl bg-violet-50 p-3 text-violet-700 dark:bg-violet-400/12 dark:text-violet-100">
              <Flame size={18} />
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-100">
              <ShieldCheck size={18} />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {beats.map((beat) => (
            <div key={beat.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  {beat.label}
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {beat.value}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-violet-100 dark:bg-violet-400/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#c8b7ff,#8a73bd)]"
                  style={{ width: `${beat.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
