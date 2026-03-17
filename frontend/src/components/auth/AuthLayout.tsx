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
    <section>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}

        {children}

        {footer && <div>{footer}</div>}
      </div>
    </section>
  );
}
