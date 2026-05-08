import { forwardRef, useId, type SelectHTMLAttributes } from "react";

import { cn } from "../../lib/cn";
import { FormMessage } from "./FormMessage";
import { Label } from "./Label";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      hint,
      error,
      required = false,
      className,
      containerClassName,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const hintId = hint ? `${selectId}-hint` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;

    const describedBy =
      [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label ? (
          <Label htmlFor={selectId} required={required}>
            {label}
          </Label>
        ) : null}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "block min-h-12 w-full rounded-2xl border bg-(--color-surface) px-4 py-3 text-sm font-medium text-(--color-text-secondary) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
            error
              ? "border-(--color-danger-border)"
              : "border-(--color-border-strong)",
            className,
          )}
          {...props}
        >
          {children}
        </select>

        {hint ? (
          <FormMessage id={hintId} variant="hint">
            {hint}
          </FormMessage>
        ) : null}

        {error ? (
          <FormMessage id={errorId} variant="error" role="alert">
            {error}
          </FormMessage>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
