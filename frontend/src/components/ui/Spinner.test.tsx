import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders with the default loading label", () => {
    render(<Spinner />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Betöltés...")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<Spinner label="Receptek betöltése..." />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Receptek betöltése...")).toBeInTheDocument();
  });

  it("keeps the label accessible when the label is visually hidden", () => {
    render(<Spinner label="Adatok betöltése..." showLabel={false} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Adatok betöltése...")).toHaveClass("sr-only");
  });

  it("accepts a custom className", () => {
    render(<Spinner className="mt-8" />);

    expect(screen.getByRole("status")).toHaveClass("mt-8");
  });
});
