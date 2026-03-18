import { AnimatePresence, motion } from "motion/react";
import type { CardCategory } from "../types/dashboard";

type FilterBarProps = {
  filters: readonly CardCategory[];
  activeFilter: CardCategory;
  onFilterChange: (filter: CardCategory) => void;
};

export function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
}: FilterBarProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex min-w-full gap-2 rounded-full border border-white/70 bg-white/68 p-2 shadow-[0_18px_38px_rgba(113,95,80,0.09)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:min-w-0">
        {filters.map((filter) => {
          const isActive = filter === activeFilter;

          return (
            <button
              key={filter}
              className={`relative rounded-full px-4 py-2.5 text-sm font-medium transition duration-300 sm:px-5 ${
                isActive
                  ? "text-slate-950 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
              }`}
              onClick={() => onFilterChange(filter)}
              type="button"
            >
              <AnimatePresence>
                {isActive ? (
                  <motion.span
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 rounded-full border border-white/75 bg-[linear-gradient(135deg,rgba(255,247,240,0.98),rgba(226,238,228,0.95))] shadow-[0_12px_22px_rgba(128,107,85,0.14)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(107,138,126,0.22))]"
                    exit={{ opacity: 0, scale: 0.92 }}
                    initial={{ opacity: 0, scale: 0.92 }}
                    layoutId="active-filter-pill"
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                ) : null}
              </AnimatePresence>
              <span className="relative z-10">{filter}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
