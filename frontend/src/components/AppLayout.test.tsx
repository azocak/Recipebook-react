import { render, screen, within } from "@testing-library/react";
import { AppLayout } from "./AppLayout";

vi.mock("./Navbar", () => ({
  Navbar: () => <nav data-testid="navbar">Navbar mock</nav>,
}));

describe("AppLayout", () => {
  it("renders the navbar and the page content", () => {
    render(
      <AppLayout>
        <div>Oldal tartalom</div>
      </AppLayout>,
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByText("Oldal tartalom")).toBeInTheDocument();
  });

  it("renders children inside the main element", () => {
    render(
      <AppLayout>
        <section>
          <h1>Receptek oldal</h1>
          <p>Ez a fő tartalom.</p>
        </section>
      </AppLayout>,
    );

    const main = screen.getByRole("main");

    expect(main).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "Receptek oldal" }),
    ).toBeInTheDocument();
    expect(within(main).getByText("Ez a fő tartalom.")).toBeInTheDocument();
  });
});
