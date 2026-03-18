import { X } from "lucide-react";
import { useEffect, useId } from "react";
import type { ReactNode } from "react";
import { Button } from "./Button";

type ModalProps = {
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export function Modal({
  children,
  description,
  footer,
  isOpen,
  onClose,
  title,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-3 py-3 backdrop-blur-[2px] sm:items-center sm:px-6"
      role="dialog"
    >
      <button
        aria-label="Close dialog"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div className="ui-panel relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px]">
        <div className="flex items-start justify-between gap-4 border-b border-white/60 px-5 py-5 dark:border-white/10 sm:px-6">
          <div>
            <h2
              className="font-display text-3xl text-slate-950 dark:text-white"
              id={titleId}
            >
              {title}
            </h2>
            {description ? (
              <p
                className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300"
                id={descriptionId}
              >
                {description}
              </p>
            ) : null}
          </div>
          <Button
            aria-label="Close dialog"
            onClick={onClose}
            size="icon"
            variant="icon"
          >
            <X size={18} />
          </Button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="border-t border-white/60 px-5 py-4 dark:border-white/10 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
