import { render, screen } from "@testing-library/react";

import { ErrorState } from "./ErrorState";
import userEvent from "@testing-library/user-event";

describe("ErrorState", () => {
  it("renders as an alert region with the default error state content", () => {
    render(
      <ErrorState
        title="Nem sikerült betölteni a recepteket."
        description="Próbáld meg újra néhány másodperc múlva."
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Nem sikerült betölteni a recepteket.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Próbáld meg újra néhány másodperc múlva."),
    ).toBeInTheDocument();

    expect(screen.getByText("Valami félrement")).toBeInTheDocument();
    expect(screen.getByText("!")).toBeInTheDocument();
  });

  it("passes custom eyebrow and visual content to the shared panel", () => {
    render(
      <ErrorState
        eyebrow="Hálózati hiba"
        visual="⚠️"
        title="Nem érhető el a szerver"
        description="Ellenőrizd az internetkapcsolatot."
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Hálózati hiba")).toBeInTheDocument();
    expect(screen.getByText("⚠️")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Nem érhető el a szerver" }),
    ).toBeInTheDocument();
  });

  it("renders and calls the primary action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <ErrorState
        title="Nem sikerült betölteni a recepteket."
        description="Próbáld meg újra."
        actionLabel="Újrapróbálás"
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Újrapróbálás" }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("renders and calls the secondary action", async () => {
    const user = userEvent.setup();
    const onSecondaryAction = vi.fn();

    render(
      <ErrorState
        title="Nem sikerült betölteni a receptet."
        description="A keresett recept nem található."
        secondaryActionLabel="Vissza a receptekhez"
        onSecondaryAction={onSecondaryAction}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Vissza a receptekhez" }),
    );

    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });
});
