import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

export type RouteEntry = string | { pathname: string; state?: unknown };

type RenderRouteOptions = {
  path: string;
  entry?: RouteEntry;
};

export function renderRoute(
  ui: ReactElement,
  { path, entry }: RenderRouteOptions,
) {
  return render(
    <MemoryRouter initialEntries={[entry ?? path]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}
