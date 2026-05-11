import { useId } from "react";

type AuthRouteStatusProps = {
  title: string;
  description?: string;
};

export function AuthRouteStatus({ title, description }: AuthRouteStatusProps) {
  const titleId = useId();

  return (
    <section
      role="status"
      aria-live="polite"
      aria-labelledby={titleId}
      className="mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h2 id={titleId} className="text-xl font-semibold text-slate-900">
          {title}
        </h2>

        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
