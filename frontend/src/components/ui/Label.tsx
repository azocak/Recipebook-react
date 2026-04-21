import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  helperText?: ReactNode;
};

export function Label({
  className,
  children,
  required = false,
  helperText,
  ...props
}: LabelProps) {
  return (
    <div className="space-y-1">
      <label
        className={cn(
          "text-sm font-semibold text-(--color-text-primary)",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        {required ? (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {helperText ? (
        <p className="text-sm text-(--color-text-muted)">{helperText}</p>
      ) : null}
    </div>
  );
}
