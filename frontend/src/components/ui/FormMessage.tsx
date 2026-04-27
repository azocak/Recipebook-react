import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type FormMessageVariant = "default" | "hint" | "error";

export type FormMessageProps = HTMLAttributes<HTMLParagraphElement> & {
  children?: ReactNode;
  variant?: FormMessageVariant;
};

const variantClasses: Record<FormMessageVariant, string> = {
  default: "text-[var(--color-text-secondary)]",
  hint: "text-[var(--color-text-muted)]",
  error: "text-red-600",
};

export function FormMessage({
  children,
  className,
  variant = "default",
  ...props
}: FormMessageProps) {
  if (!children) {
    return null;
  }

  return (
    <p className={cn("text-sm", variantClasses[variant], className)} {...props}>
      {children}
    </p>
  );
}
