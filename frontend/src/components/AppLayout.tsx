import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-8">{children}</main>
    </div>
  );
}
