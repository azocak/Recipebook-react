import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

type RecipeMetaAlign = "start" | "center";

type RecipeMetaProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  align?: RecipeMetaAlign;
  className?: string;
};

const valueAlignClasses: Record<RecipeMetaAlign, string> = {
  start: "text-left",
  center: "text-center",
};

export function RecipeMeta({
  label,
  value,
  icon,
  align = "start",
  className,
}: RecipeMetaProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon ? (
          <span aria-hidden="true" className="text-sm">
            {icon}
          </span>
        ) : null}

        <span>{label}</span>
      </p>

      <p
        className={cn(
          "mt-1 text-sm font-semibold text-slate-900",
          valueAlignClasses[align],
        )}
      >
        {value}
      </p>
    </div>
  );
}
