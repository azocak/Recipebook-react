import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Label } from "./Label";
import { FormMessage } from "./FormMessage";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
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
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const describedBy =
      [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label ? (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "block w-full rounded-2xl border bg-(--color-surface) px-4 py-3 text-sm text-(--color-text-secondary) placeholder:text-(--color-text-muted) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
            error
              ? "border-(--color-danger-border)"
              : "border-(--color-border-strong)",
            className,
          )}
          {...props}
        />

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

Input.displayName = "Input";
