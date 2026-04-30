import { render, screen } from "@testing-library/react";

import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders as a decorative loading placeholder", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts a custom className", () => {
    render(<Skeleton data-testid="skeleton" className="h-10 w-40" />);

    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton).toHaveClass("h-10");
    expect(skeleton).toHaveClass("w-40");
  });

  it("passes through native div attributes", () => {
    render(<Skeleton data-testid="skeleton" title="Betöltési helykitöltő" />);

    expect(screen.getByTitle("Betöltési helykitöltő")).toBeInTheDocument();
  });
});
