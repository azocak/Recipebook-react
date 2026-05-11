import { render, screen } from "@testing-library/react";

import { AuthRouteStatus } from "./AuthRouteStatus";

describe("AuthRouteStatus", () => {
  it("renders an accessible auth route status with title and description", () => {
    render(
      <AuthRouteStatus
        title="Ellenőrzés folyamatban..."
        description="Megnézzük, hogy be vagy-e jelentkezve."
      />,
    );

    const status = screen.getByRole("status");

    expect(status).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ellenőrzés folyamatban..." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Megnézzük, hogy be vagy-e jelentkezve."),
    ).toBeInTheDocument();
  });

  it("renders without description when it is not provided", () => {
    const { container } = render(
      <AuthRouteStatus title="Ellenőrzés folyamatban..." />,
    );

    expect(
      screen.getByRole("heading", { name: "Ellenőrzés folyamatban..." }),
    ).toBeInTheDocument();
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });
});
