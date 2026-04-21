import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";

export type CardProps = ComponentPropsWithoutRef<"div">;
export type CardHeaderProps = ComponentPropsWithoutRef<"div">;
export type CardTitleProps = ComponentPropsWithoutRef<"h2">;
export type CardContentProps = ComponentPropsWithoutRef<"div">;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-(--color-border) bg-(--color-surface) shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold tracking-tight text-(--color-text-primary)",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
