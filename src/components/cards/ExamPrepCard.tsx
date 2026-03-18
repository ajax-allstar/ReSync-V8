import { AlarmClockCheck } from "lucide-react";
import { DashboardCard } from "../DashboardCard";
import type { ExamMilestone } from "../../types/dashboard";

type ExamPrepCardProps = {
  milestones: ExamMilestone[];
};

export function ExamPrepCard({ milestones }: ExamPrepCardProps) {
  return (
    <DashboardCard
      accent="peach"
      category="Planner"
      description="A grounded snapshot of where upcoming exams stand right now."
      eyebrow="Exam Prep Snapshot"
      surface="solid"
      title="Know what needs care before panic starts"
    >
      <div className="space-y-3">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="ui-subpanel p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <AlarmClockCheck size={16} className="text-orange-500 dark:text-orange-300" />
                  <p className="font-medium text-slate-900 dark:text-white">
                    {milestone.title}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  {milestone.date}
                </p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700 dark:bg-orange-400/12 dark:text-orange-100">
                {milestone.readiness}%
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-orange-100 dark:bg-orange-400/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#f3b883,#e07a5f)]"
                style={{ width: `${milestone.readiness}%` }}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {milestone.status}
            </p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
