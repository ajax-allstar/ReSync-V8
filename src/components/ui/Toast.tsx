type ToastProps = {
  isVisible: boolean;
  message: string;
  tone?: "success" | "error" | "info";
};

const toneClasses = {
  success:
    "border-emerald-200/80 bg-emerald-50/95 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/12 dark:text-emerald-50",
  error:
    "border-rose-200/80 bg-rose-50/95 text-rose-900 dark:border-rose-400/20 dark:bg-rose-400/12 dark:text-rose-50",
  info: "border-white/70 bg-white/95 text-slate-900 dark:border-white/10 dark:bg-slate-950/85 dark:text-white",
};

export function Toast({
  isVisible,
  message,
  tone = "info",
}: ToastProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      <div
        className={`rounded-full border px-4 py-3 text-sm font-medium shadow-[0_10px_22px_rgba(15,23,42,0.12)] ${toneClasses[tone]}`}
        role="status"
      >
        {message}
      </div>
    </div>
  );
}
