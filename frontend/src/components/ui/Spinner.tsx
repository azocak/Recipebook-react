import { cn } from "../../lib/cn";

type SpinnerSize = "sm" | "md" | "lg";

type SpinnerProps = {
  label?: string;
  size?: SpinnerSize;
  showLabel?: boolean;
  className?: string;
};

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

export function Spinner({
  label = "Betöltés...",
  size = "md",
  showLabel = true,
  className,
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center justify-center gap-3 text-slate-600",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block animate-spin rounded-full border-slate-200 border-t-orange-600",
          sizeClasses[size],
        )}
      />

      <span
        className={cn(
          "text-sm font-medium",
          !showLabel && "sr-only",
          size === "lg" && "text-base",
        )}
      >
        {label}
      </span>
    </div>
  );
}
