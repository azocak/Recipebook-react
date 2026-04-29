import { render, screen } from "@testing-library/react";

import { RecipeMeta } from "./RecipeMeta";

describe("RecipeMeta", () => {
  it("renders the label and value", () => {
    render(<RecipeMeta label="Főzési idő" value="20 perc" />);

    expect(screen.getByText("Főzési idő")).toBeInTheDocument();
    expect(screen.getByText("20 perc")).toBeInTheDocument();
  });

  it("renders numeric values", () => {
    render(<RecipeMeta label="Adag" value={4} />);

    expect(screen.getByText("Adag")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders an optional decorative icon", () => {
    render(<RecipeMeta label="Adag" value="4 adag" icon="🍽" />);

    expect(screen.getByText("Adag")).toBeInTheDocument();
    expect(screen.getByText("🍽")).toBeInTheDocument();
  });

  it("supports centered value alignment", () => {
    render(<RecipeMeta label="Adag" value="4" align="center" />);

    expect(screen.getByText("4")).toHaveClass("text-center");
  });

  it("accepts a custom className", () => {
    const { container } = render(
      <RecipeMeta label="Készítette" value="anna" className="min-w-40" />,
    );

    expect(container.firstChild).toHaveClass("min-w-40");
  });
});
