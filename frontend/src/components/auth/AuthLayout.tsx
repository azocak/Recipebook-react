import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-6xl items-start justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm leading-6 text-slate-600">{subtitle}</p>
          ) : null}
        </div>

        <div>{children}</div>

        {footer ? (
          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  );
}
