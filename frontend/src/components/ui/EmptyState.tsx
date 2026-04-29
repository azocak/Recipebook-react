import type { ReactNode } from "react";

import { StatePanel } from "./StatePanel";

type EmptyStateProps = {
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

export function EmptyState({
  title,
  description,
  eyebrow = "Üres állapot",
  visual = "✨",
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <StatePanel
      tone="empty"
      role="status"
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
