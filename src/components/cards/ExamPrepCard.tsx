import { AlarmClockCheck } from "lucide-react";
import { DashboardCard } from "../DashboardCard";
import type { ExamMilestone } from "../../types/dashboard";

type ExamPrepCardProps = {
  milestones: ExamMilestone[];
  showSample: boolean;
};

export function ExamPrepCard({ milestones, showSample }: ExamPrepCardProps) {
  return (
    <DashboardCard
      accent="peach"
      category="Planner"
      description="Review upcoming exams, readiness levels, and the next action to take."
      eyebrow="Exam Prep Snapshot"
      surface="solid"
      title="Know what needs attention before the deadline"
    >
      <div className="space-y-3">
        <p className="ui-demo-label px-1">
          {showSample ? "Sample exam progress" : "Blank exam tracker"}
        </p>
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
                className="h-full rounded-full bg-[linear-gradient(90deg,#f3c294,#df8868)]"
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
