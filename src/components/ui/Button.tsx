import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "icon";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "ui-button-primary",
  secondary: "ui-button-secondary",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-transparent text-sm font-medium text-slate-600 transition duration-300 hover:bg-white/70 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-full border border-rose-200/80 bg-rose-50/90 text-sm font-medium text-rose-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-[0_18px_34px_rgba(190,92,114,0.12)] dark:border-rose-400/20 dark:bg-rose-400/12 dark:text-rose-50",
  icon:
    "inline-flex items-center justify-center rounded-2xl border border-white/80 bg-white/82 text-slate-600 shadow-[0_14px_28px_rgba(108,92,76,0.1)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/15 dark:hover:text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2.5 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
  icon: "h-11 w-11",
};

export function Button({
  children,
  className = "",
  disabled,
  fullWidth = false,
  leadingIcon,
  loading = false,
  size = "md",
  trailingIcon,
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={[
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        isDisabled ? "cursor-not-allowed opacity-60 hover:translate-y-0" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        leadingIcon
      )}
      {children}
      {!loading ? trailingIcon : null}
    </button>
  );
}
