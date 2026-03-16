import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
