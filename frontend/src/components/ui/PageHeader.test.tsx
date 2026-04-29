import { render, screen } from "@testing-library/react";

import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title, eyebrow and description", () => {
    render(
      <PageHeader
        eyebrow="Publikus receptgyűjtemény"
        title="Receptkönyv"
        description="Böngészd a közösség receptjeit."
      />,
    );

    expect(screen.getByText("Publikus receptgyűjtemény")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Receptkönyv", level: 1 }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Böngészd a közösség receptjeit."),
    ).toBeInTheDocument();
  });

  it("renders without optional eyebrow and description", () => {
    render(<PageHeader title="Egyszerű oldal" />);

    expect(
      screen.getByRole("heading", { name: "Egyszerű oldal", level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders meta content", () => {
    render(
      <PageHeader
        title="Receptkönyv"
        meta={
          <>
            <div>12 recept</div>
            <div>Bejelentkezve</div>
          </>
        }
      />,
    );

    expect(screen.getByText("12 recept")).toBeInTheDocument();
    expect(screen.getByText("Bejelentkezve")).toBeInTheDocument();
  });

  it("renders action content", () => {
    render(
      <PageHeader
        title="Receptkönyv"
        actions={<button type="button">Új recept létrehozása</button>}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Új recept létrehozása" }),
    ).toBeInTheDocument();
  });

  it("accepts a custom className", () => {
    const { container } = render(
      <PageHeader title="Receptkönyv" className="mt-8" />,
    );

    expect(container.firstChild).toHaveClass("mt-8");
  });
});
