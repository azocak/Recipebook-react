import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders the child content", () => {
    render(<Button>Mentés</Button>);

    expect(screen.getByRole("button", { name: "Mentés" })).toBeInTheDocument();
  });

  it("primary variánst használ alapértelmezetten", () => {
    render(<Button>Mentés</Button>);

    const button = screen.getByRole("button", { name: "Mentés" });
    expect(button.className).toContain("bg-[var(--color-primary)]");
  });

  it("suses the primary variant by default", () => {
    render(<Button variant="secondary">Mégse</Button>);

    const button = screen.getByRole("button", { name: "Mégse" });
    expect(button.className).toContain("border-[var(--color-border-strong)]");
  });

  it("uses the danger variant", () => {
    render(<Button variant="danger">Törlés</Button>);

    const button = screen.getByRole("button", { name: "Törlés" });
    expect(button.className).toContain("bg-[var(--color-danger-surface)]");
  });

  it("disabled while loading and displays the spinner icon", () => {
    render(<Button isLoading>Mentés</Button>);

    const button = screen.getByRole("button", { name: "Mentés" });
    expect(button).toBeDisabled();

    const spinner = button.querySelector('[aria-hidden="true"]');
    expect(spinner).not.toBeNull();
  });

  it("If fullWidth is specified, it takes up the full width", () => {
    render(<Button fullWidth>Mentés</Button>);

    const button = screen.getByRole("button", { name: "Mentés" });
    expect(button.className).toContain("w-full");
  });

  it("for icon sizes, you will receive the appropriate size categories", () => {
    render(
      <Button size="icon" aria-label="Bezárás">
        x
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Bezárás" });
    expect(button.className).toContain("h-11");
    expect(button.className).toContain("w-11");
    expect(button.className).toContain("p-0");
  });
});
