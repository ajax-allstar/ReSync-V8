import { Flower2, MoveRight, Wind } from "lucide-react";
import { useState } from "react";
import { DashboardCard } from "../DashboardCard";

const recoveryPrompts = {
  breathe: "Try two slow breaths and re-open just the next task, not the whole list.",
  restart: "A five-minute restart counts. Begin with the easiest meaningful step.",
  continue: "You do not need a perfect comeback. A gentle continuation still moves the day.",
};

export function RecoveryCard() {
  const [message, setMessage] = useState(recoveryPrompts.breathe);
  const [activePrompt, setActivePrompt] =
    useState<keyof typeof recoveryPrompts>("breathe");

  function selectPrompt(prompt: keyof typeof recoveryPrompts) {
    setActivePrompt(prompt);
    setMessage(recoveryPrompts[prompt]);
  }

  return (
    <DashboardCard
      accent="gold"
      category="Wellness"
      description="Choose a quick reset when focus slips so restarting feels easier."
      eyebrow="Distraction Reset"
      surface="glass"
      title="Use a simple reset instead of forcing it"
    >
      <div className="ui-subpanel-glass border-amber-100/80 bg-[linear-gradient(135deg,rgba(255,246,232,0.9),rgba(255,255,255,0.86))] p-5 dark:border-amber-400/10 dark:bg-[linear-gradient(135deg,rgba(168,113,24,0.14),rgba(15,23,42,0.9))]">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-400/12 dark:text-amber-100">
            <Flower2 size={20} />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              Getting distracted is not the same thing as failing.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {message}
            </p>
          </div>
        </div>

        <p className="ui-demo-label mt-5">
          Quick reset ideas
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            aria-pressed={activePrompt === "breathe"}
            className="ui-button-secondary border-transparent bg-white/90 px-4 py-2.5"
            onClick={() => selectPrompt("breathe")}
            type="button"
          >
            <Wind size={16} />
            Breathe
          </button>
          <button
            aria-pressed={activePrompt === "restart"}
            className="ui-button-secondary px-4 py-2.5"
            onClick={() => selectPrompt("restart")}
            type="button"
          >
            Restart
          </button>
          <button
            aria-pressed={activePrompt === "continue"}
            className="ui-button-secondary px-4 py-2.5"
            onClick={() => selectPrompt("continue")}
            type="button"
          >
            Continue gently
            <MoveRight size={16} />
          </button>
        </div>
      </div>
    </DashboardCard>
  );
}
