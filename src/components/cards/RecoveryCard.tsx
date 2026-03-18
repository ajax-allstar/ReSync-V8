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

  return (
    <DashboardCard
      accent="gold"
      category="Wellness"
      description="Built for the moment where distraction happens and shame tries to take over."
      eyebrow="Distraction Reset"
      surface="glass"
      title="Come back without making it dramatic"
    >
      <div className="ui-subpanel-glass border-amber-100/80 bg-[linear-gradient(135deg,rgba(255,246,232,0.92),rgba(255,255,255,0.8))] p-5 dark:border-amber-400/10 dark:bg-[linear-gradient(135deg,rgba(168,113,24,0.18),rgba(15,23,42,0.9))]">
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

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="ui-button-secondary border-transparent bg-white/90 px-4 py-2.5"
            onClick={() => setMessage(recoveryPrompts.breathe)}
            type="button"
          >
            <Wind size={16} />
            Breathe
          </button>
          <button
            className="ui-button-secondary px-4 py-2.5"
            onClick={() => setMessage(recoveryPrompts.restart)}
            type="button"
          >
            Restart
          </button>
          <button
            className="ui-button-secondary px-4 py-2.5"
            onClick={() => setMessage(recoveryPrompts.continue)}
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
