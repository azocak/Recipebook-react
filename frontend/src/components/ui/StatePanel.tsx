import { useId, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { Button } from "./Button";

type StatePanelTone = "empty" | "error";

type StatePanelProps = {
  tone: StatePanelTone;
  role: "status" | "alert";
  title: string;
  description?: string;
  eyebrow: string;
  visual: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
};

const toneStyles: Record<
  StatePanelTone,
  {
    wrapper: string;
    primaryGlow: string;
    secondaryGlow: string;
    visual: string;
    eyebrow: string;
    primaryButtonVariant: "primary" | "danger";
  }
> = {
  empty: {
    wrapper: "border-dashed border-slate-300",
    primaryGlow: "bg-orange-100/70",
    secondaryGlow: "bg-slate-100",
    visual:
      "border-orange-100 bg-gradient-to-br from-orange-50 to-white text-slate-900",
    eyebrow: "text-orange-700",
    primaryButtonVariant: "primary",
  },
  error: {
    wrapper: "border-red-200",
    primaryGlow: "bg-red-100/80",
    secondaryGlow: "bg-orange-100/60",
    visual:
      "border-red-100 bg-gradient-to-br from-red-50 to-white font-black text-red-700",
    eyebrow: "text-red-700",
    primaryButtonVariant: "danger",
  },
};

export function StatePanel({
  tone,
  role,
  title,
  description,
  eyebrow,
  visual,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: StatePanelProps) {
  const titleId = useId();
  const styles = toneStyles[tone];

  const hasPrimaryAction = Boolean(actionLabel && onAction);
  const hasSecondaryAction = Boolean(secondaryActionLabel && onSecondaryAction);
  const hasActions = hasPrimaryAction || hasSecondaryAction;

  return (
    <section
      role={role}
      aria-labelledby={titleId}
      className={cn(
        "relative overflow-hidden rounded-4xl border bg-white px-6 py-10 text-center shadow-sm sm:px-8",
        styles.wrapper,
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full blur-3xl",
          styles.primaryGlow,
        )}
        aria-hidden="true"
      />

      <div
        className={cn(
          "pointer-events-none absolute -bottom-20 right-0 h-44 w-44 rounded-full blur-3xl",
          styles.secondaryGlow,
        )}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <div
          className={cn(
            "mb-5 inline-flex h-20 w-20 items-center justify-center rounded-[1.75rem] border text-4xl shadow-sm",
            styles.visual,
          )}
        >
          <span aria-hidden="true">{visual}</span>
        </div>

        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.22em]",
            styles.eyebrow,
          )}
        >
          {eyebrow}
        </p>

        <h2
          id={titleId}
          className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
        >
          {title}
        </h2>

        {description ? (
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>
        ) : null}

        {hasActions ? (
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {hasPrimaryAction ? (
              <Button
                type="button"
                variant={styles.primaryButtonVariant}
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            ) : null}

            {hasSecondaryAction ? (
              <Button
                type="button"
                variant="secondary"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
