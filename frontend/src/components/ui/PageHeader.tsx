import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  eyebrow,
  description,
  meta,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-orange-100/80 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-slate-100 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 bg-orange-50/70 px-6 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="space-y-3">
            {eyebrow ? (
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-700">
                {eyebrow}
              </p>
            ) : null}

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>

            {description ? (
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>

          {meta ? <div className="flex flex-wrap gap-3">{meta}</div> : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
