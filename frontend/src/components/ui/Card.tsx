import type { ComponentPropsWithoutRef } from "react";

import { cn } from "../../lib/cn";

type DivCardProps = ComponentPropsWithoutRef<"div"> & {
  as?: "div";
};

type ArticleCardProps = ComponentPropsWithoutRef<"article"> & {
  as: "article";
};

export type CardProps = DivCardProps | ArticleCardProps;
export type CardHeaderProps = ComponentPropsWithoutRef<"div">;
export type CardTitleProps = ComponentPropsWithoutRef<"h2">;
export type CardContentProps = ComponentPropsWithoutRef<"div">;

const cardBaseClassName =
  "rounded-3xl border border-(--color-border) bg-(--color-surface) shadow-sm";

export function Card({ as = "div", className, ...props }: CardProps) {
  const cardClassName = cn(cardBaseClassName, className);

  if (as === "article") {
    return (
      <article
        className={cardClassName}
        {...(props as ComponentPropsWithoutRef<"article">)}
      />
    );
  }

  return (
    <div
      className={cardClassName}
      {...(props as ComponentPropsWithoutRef<"div">)}
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
