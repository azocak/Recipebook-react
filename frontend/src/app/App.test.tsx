import { render, screen } from "@testing-library/react";

import App from "./App";

vi.mock("./router", () => ({
  AppRouter: () => <div>Router mock</div>,
}));

vi.mock("sonner", () => ({
  Toaster: ({
    position,
    richColors,
    closeButton,
  }: {
    position?: string;
    richColors?: boolean;
    closeButton?: boolean;
  }) => (
    <div
      data-testid="app-toaster"
      data-position={position}
      data-rich-colors={String(richColors)}
      data-close-button={String(closeButton)}
    />
  ),
}));

describe("App", () => {
  it("renders the app router and global toaster", () => {
    render(<App />);

    expect(screen.getByText("Router mock")).toBeInTheDocument();

    const toaster = screen.getByTestId("app-toaster");

    expect(toaster).toHaveAttribute("data-position", "top-right");
    expect(toaster).toHaveAttribute("data-rich-colors", "true");
    expect(toaster).toHaveAttribute("data-close-button", "true");
  });
});
