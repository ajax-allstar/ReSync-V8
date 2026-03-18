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
      <div className="inline-flex min-w-full gap-2 rounded-full border border-white/75 bg-white/88 p-2 shadow-[0_12px_24px_rgba(113,95,80,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-white/6 md:min-w-0">
        {filters.map((filter) => {
          const isActive = filter === activeFilter;

          return (
            <button
              aria-pressed={isActive}
              key={filter}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium transition duration-200 sm:px-5 ${
                isActive
                  ? "border-white/80 bg-[linear-gradient(135deg,rgba(255,247,240,0.92),rgba(226,238,228,0.9))] text-slate-950 shadow-[0_10px_18px_rgba(128,107,85,0.10)] dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,rgba(31,51,49,0.9),rgba(15,23,42,0.96))] dark:text-white dark:shadow-[0_10px_18px_rgba(7,12,26,0.28)]"
                  : "border-transparent text-slate-500 hover:border-white/70 hover:bg-white/70 hover:text-slate-800 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/8 dark:hover:text-white"
              }`}
              onClick={() => onFilterChange(filter)}
              type="button"
            >
              {filter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
