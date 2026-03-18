import type { AccentTone, CardCategory } from "../types/dashboard";
import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  eyebrow: string;
  description: string;
  category: CardCategory;
  accent: AccentTone;
  surface?: "glass" | "solid";
  children: ReactNode;
};

const accentToneClasses: Record<AccentTone, string> = {
  sage: "from-emerald-50 via-white to-white dark:from-emerald-400/10 dark:via-slate-950 dark:to-slate-950",
  peach: "from-orange-50 via-white to-white dark:from-orange-400/10 dark:via-slate-950 dark:to-slate-950",
  violet: "from-violet-50 via-white to-white dark:from-violet-400/10 dark:via-slate-950 dark:to-slate-950",
  sky: "from-sky-50 via-white to-white dark:from-sky-400/10 dark:via-slate-950 dark:to-slate-950",
  gold: "from-amber-50 via-white to-white dark:from-amber-400/10 dark:via-slate-950 dark:to-slate-950",
};

const surfaceClasses = {
  glass:
    "border-white/75 bg-white/86 shadow-[0_16px_34px_rgba(110,93,77,0.09)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/74",
  solid:
    "border-white/80 bg-white/92 shadow-[0_14px_30px_rgba(110,93,77,0.07)] dark:border-white/10 dark:bg-slate-950/60",
};

export function DashboardCard({
  title,
  eyebrow,
  description,
  category,
  accent,
  surface = "solid",
  children,
}: DashboardCardProps) {
  return (
    <article
      className={`ui-hover-lift relative h-full overflow-hidden rounded-[28px] border bg-gradient-to-br p-6 ${surfaceClasses[surface]} ${accentToneClasses[accent]}`}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/85 to-transparent dark:via-white/20" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ui-kicker">
            {eyebrow}
          </p>
          <h3 className="mt-3 font-display text-[1.75rem] leading-tight text-slate-950 dark:text-white sm:text-[1.9rem]">
            {title}
          </h3>
          <p className="mt-2.5 max-w-[30rem] text-sm leading-6 text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        <span className="ui-chip">
          {category}
        </span>
      </div>
      <div className="relative mt-5">{children}</div>
    </article>
  );
}
