import type { ReactNode } from "react";

import { StatePanel } from "./StatePanel";

type ErrorStateProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  visual?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
};

export function ErrorState({
  title,
  description,
  eyebrow = "Valami félrement",
  visual = "!",
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: ErrorStateProps) {
  return (
    <StatePanel
      tone="error"
      role="alert"
      title={title}
      description={description}
      eyebrow={eyebrow}
      visual={visual}
      actionLabel={actionLabel}
      onAction={onAction}
      secondaryActionLabel={secondaryActionLabel}
      onSecondaryAction={onSecondaryAction}
      className={className}
    />
  );
}
