import { RefreshCw, WandSparkles } from "lucide-react";
import { useState } from "react";
import { DashboardCard } from "../DashboardCard";
import { Button } from "../ui/Button";
import type { StudyPlanPreview } from "../../types/dashboard";

type StudyPlanCardProps = {
  onApplyPlan: (plan: StudyPlanPreview) => void;
  plans: StudyPlanPreview[];
  showSample: boolean;
};

export function StudyPlanCard({ onApplyPlan, plans, showSample }: StudyPlanCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePlan = plans[activeIndex];

  function handleRegenerate() {
    setActiveIndex((current) => (current + 1) % plans.length);
  }

  return (
    <DashboardCard
      accent="sky"
      category="Planner"
      description="Organize subjects, study sessions, and break ideas before you begin."
      eyebrow="Study Planner"
      surface="solid"
      title="Build a study plan that matches your energy"
    >
      <div className="ui-subpanel border-sky-100/80 p-5 dark:border-sky-400/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="ui-demo-label">
              {showSample ? "Sample plan" : "Blank planner"}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
              Subject
            </p>
            <h4 className="mt-2 font-display text-3xl text-slate-950 dark:text-white">
              {activePlan.subject}
            </h4>
          </div>
          <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 dark:border-sky-400/15 dark:bg-sky-400/10 dark:text-sky-100">
            {activePlan.duration}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-sky-100/70 bg-sky-50/80 p-4 dark:border-sky-400/10 dark:bg-sky-400/10">
            <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
              Focus approach
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
              {activePlan.focus}
            </p>
          </div>
          <div className="rounded-[24px] border border-orange-100/70 bg-orange-50/80 p-4 dark:border-orange-400/10 dark:bg-orange-400/10">
            <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
              Break suggestion
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
              {activePlan.breaks}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-white/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-slate-100 p-2 text-slate-700 dark:bg-white/10 dark:text-slate-100">
              <WandSparkles size={18} />
            </div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {activePlan.note}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            disabled={!showSample}
            onClick={() => onApplyPlan(activePlan)}
            variant="primary"
          >
            {showSample ? "Use this plan" : "Sample view is off"}
          </Button>
          <Button
            onClick={handleRegenerate}
            variant="secondary"
          >
            <RefreshCw size={16} />
            {showSample ? "Show another sample" : "Keep blank"}
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
}
