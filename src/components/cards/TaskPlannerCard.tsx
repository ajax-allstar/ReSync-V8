import {
  CheckCircle2,
  Circle,
  Flag,
  NotebookPen,
  RotateCcw,
} from "lucide-react";
import { DashboardCard } from "../DashboardCard";
import { Button } from "../ui/Button";
import type { Task } from "../../types/dashboard";

type TaskPlannerCardProps = {
  onResetTasks: () => void;
  onToggleTask: (taskId: string) => void;
  showSample: boolean;
  tasks: Task[];
};

const priorityStyles: Record<Task["priority"], string> = {
  High: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-100",
  Medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-100",
  Low: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-100",
};

export function TaskPlannerCard({
  onResetTasks,
  onToggleTask,
  showSample,
  tasks,
}: TaskPlannerCardProps) {
  const visibleTasks = showSample ? tasks : [];
  const completedTasks = visibleTasks.filter((task) => task.completed).length;
  const progress = visibleTasks.length > 0
    ? Math.round((completedTasks / visibleTasks.length) * 100)
    : 0;

  return (
    <DashboardCard
      accent="peach"
      category="Planner"
      description="Track today’s priorities with a simple checklist and clear progress."
      eyebrow="Task Planner"
      surface="solid"
      title="Keep today’s plan clear and manageable"
    >
      <div className="ui-subpanel border-orange-100/80 p-5 dark:border-orange-400/10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="ui-demo-label">
              {showSample ? "Sample checklist" : "Blank checklist"}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
              Daily progress
            </p>
            <p className="mt-2 font-display text-4xl text-slate-950 dark:text-white">
              {progress}%
            </p>
          </div>
          <div className="rounded-2xl bg-orange-50 p-3 text-orange-700 dark:bg-orange-400/10 dark:text-orange-100">
            <NotebookPen size={22} />
          </div>
        </div>

        <div className="mt-5 h-3 rounded-full bg-orange-100/80 dark:bg-orange-400/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#f3c29c,#e29579)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-6 space-y-3">
          {visibleTasks.map((task) => (
            <div
              key={task.id}
              className="ui-subpanel flex items-start gap-3 p-4"
            >
              <button
                aria-label={`${task.completed ? "Mark as incomplete" : "Mark as complete"}: ${task.title}`}
                className="mt-0.5 text-slate-400 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
                onClick={() => onToggleTask(task.id)}
                type="button"
              >
                {task.completed ? (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                ) : (
                  <Circle size={20} />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`font-medium text-slate-900 dark:text-white ${task.completed ? "line-through opacity-60" : ""}`}
                  >
                    {task.title}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                  <span>{task.subject}</span>
                  <span>{task.due}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-orange-50 p-2 text-orange-700 dark:bg-orange-400/10 dark:text-orange-100">
                <Flag size={16} />
              </div>
            </div>
          ))}
          {visibleTasks.length === 0 ? (
            <div className="ui-subpanel p-4 text-sm leading-6 text-slate-500 dark:text-slate-300">
              Blank view is active. Turn on starter examples to preview a sample checklist here.
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            leadingIcon={<RotateCcw size={16} />}
            onClick={onResetTasks}
            size="sm"
            variant="secondary"
          >
            Restore sample tasks
          </Button>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            {showSample
              ? "Starter tasks make the planner easy to understand before you add your own."
              : "Blank view keeps the checklist empty until you choose to load examples."}
          </p>
        </div>
      </div>
    </DashboardCard>
  );
}
