import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";

describe("Card", () => {
  it("renders the child content", () => {
    render(<Card>Panel tartalom</Card>);

    expect(screen.getByText("Panel tartalom")).toBeInTheDocument();
  });

  it("receives the basic card styles", () => {
    render(<Card data-testid="card">Panel</Card>);

    const card = screen.getByTestId("card");
    expect(card.className).toContain("rounded-3xl");
    expect(card.className).toContain("shadow-sm");
  });

  it("accepts a unique className", () => {
    render(
      <Card data-testid="card" className="max-w-2xl">
        Panel
      </Card>,
    );

    expect(screen.getByTestId("card").className).toContain("max-w-2xl");
  });
});

describe("Card subcomponents", () => {
  it("renders the header, title, and content blocks", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Recept adatai</CardTitle>
        </CardHeader>
        <CardContent>Tartalom</CardContent>
      </Card>,
    );

    expect(
      screen.getByRole("heading", { name: "Recept adatai" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tartalom")).toBeInTheDocument();
  });
});
