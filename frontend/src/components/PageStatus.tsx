import { useNavigate } from "react-router-dom";

type PageStatusVariant = "default" | "error" | "success";

type PageStatusProps = {
  title: string;
  description?: string;
  variant?: PageStatusVariant;
  actionLabel?: string;
  onAction?: () => void;
  backTo?: string;
  backLabel?: string;
};

export function PageStatus({
  title,
  description,
  variant = "default",
  actionLabel,
  onAction,
  backTo,
  backLabel,
}: PageStatusProps) {
  const navigate = useNavigate();

  const titleColor =
    variant === "error"
      ? "text-red-600"
      : variant === "success"
        ? "text-green-600"
        : "text-slate-900";

  return (
    <section className="mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h2 className={`text-xl font-semibold ${titleColor}`}>{title}</h2>

        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        ) : null}

        {(onAction || backTo) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {onAction && actionLabel ? (
              <button
                type="button"
                onClick={onAction}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                {actionLabel}
              </button>
            ) : null}

            {backTo ? (
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-300"
              >
                {backLabel ?? "Vissza"}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
