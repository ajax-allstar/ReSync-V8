import { CalendarClock, Coffee, Waves } from "lucide-react";
import type { ScheduleBlock } from "../../types/dashboard";

type ScheduleSectionProps = {
  blocks: ScheduleBlock[];
  showSample: boolean;
};

const intensityStyles: Record<ScheduleBlock["intensity"], string> = {
  light: "bg-sky-100 text-sky-800 dark:bg-sky-400/12 dark:text-sky-100",
  steady: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/12 dark:text-emerald-100",
  deep: "bg-violet-100 text-violet-800 dark:bg-violet-400/12 dark:text-violet-100",
};

export function ScheduleSection({ blocks, showSample }: ScheduleSectionProps) {
  return (
    <section
      className="ui-panel p-6"
      id="planner"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ui-kicker">
            Daily Study Schedule
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-950 dark:text-white">
            {showSample
              ? "A sample day shaped for focus and recovery"
              : "Build your day from a clean slate"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {showSample
              ? "Starter time blocks show how to balance deep work, breaks, and lighter review."
              : "Blank view keeps this area open until you want to load or create a schedule."}
          </p>
        </div>
        <div className="ui-chip px-4 py-2 text-sm">
          {showSample ? "Sample schedule" : "0 study windows"}
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {blocks.map((block) => (
            <article
              key={block.id}
              className="ui-subpanel p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
                    {block.time}
                  </p>
                  <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">
                    {block.title}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${intensityStyles[block.intensity]}`}
                >
                  {block.intensity}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {block.detail}
              </p>
            </article>
          ))}
          {blocks.length === 0 ? (
            <article className="ui-subpanel p-5 text-sm leading-6 text-slate-500 dark:text-slate-300">
              Blank view is active. Turn on starter examples to preview a suggested daily study schedule.
            </article>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="ui-subpanel-glass bg-[linear-gradient(135deg,rgba(255,247,240,0.92),rgba(231,241,234,0.9))] p-5 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(74,101,96,0.14))]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/80 p-3 text-slate-800 dark:bg-white/10 dark:text-white">
                <CalendarClock size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Energy-aware plan
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Heavier work is front-loaded. Evening stays intentionally soft.
                </p>
              </div>
            </div>
          </div>

          <div className="ui-subpanel p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-50 p-3 text-orange-700 dark:bg-orange-400/12 dark:text-orange-100">
                <Coffee size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Reset pocket
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Keep a 20-minute buffer after lunch to avoid forcing focus too early.
                </p>
              </div>
            </div>
          </div>

          <div className="ui-subpanel p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-50 p-3 text-sky-700 dark:bg-sky-400/12 dark:text-sky-100">
                <Waves size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Wind-down cue
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Stop adding new content after 8 PM. Switch to review or reflection only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
