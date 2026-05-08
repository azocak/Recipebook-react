import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StatePanel } from "./StatePanel";

describe("StatePanel", () => {
  it("renders the title, description, eyebrow and visual", () => {
    render(
      <StatePanel
        tone="empty"
        role="status"
        title="Nincs találat"
        description="Próbálj más keresési kifejezést."
        eyebrow="Receptkönyv"
        visual="🍲"
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Nincs találat" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Próbálj más keresési kifejezést."),
    ).toBeInTheDocument();

    expect(screen.getByText("Receptkönyv")).toBeInTheDocument();
    expect(screen.getByText("🍲")).toBeInTheDocument();
  });

  it("renders and calls the primary action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <StatePanel
        tone="empty"
        role="status"
        title="Üres lista"
        eyebrow="Üres állapot"
        visual="✨"
        actionLabel="Új recept létrehozása"
        onAction={onAction}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Új recept létrehozása" }),
    );

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("renders and calls the secondary action", async () => {
    const user = userEvent.setup();
    const onSecondaryAction = vi.fn();

    render(
      <StatePanel
        tone="error"
        role="alert"
        title="Nem sikerült betölteni"
        eyebrow="Valami félrement"
        visual="!"
        secondaryActionLabel="Vissza a receptekhez"
        onSecondaryAction={onSecondaryAction}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Vissza a receptekhez" }),
    );

    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it("renders both actions when both complete action pairs are provided", () => {
    render(
      <StatePanel
        tone="error"
        role="alert"
        title="Nem sikerült betölteni"
        eyebrow="Valami félrement"
        visual="!"
        actionLabel="Újrapróbálás"
        onAction={vi.fn()}
        secondaryActionLabel="Vissza"
        onSecondaryAction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Újrapróbálás" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Vissza" })).toBeInTheDocument();
  });

  it("does not render incomplete action pairs", () => {
    render(
      <StatePanel
        tone="empty"
        role="status"
        title="Nincs akció"
        eyebrow="Üres állapot"
        visual="✨"
        actionLabel="Hiányzó callback"
        onSecondaryAction={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the secondary action when the primary action pair is incomplete", () => {
    const onSecondaryAction = vi.fn();

    render(
      <StatePanel
        tone="empty"
        role="status"
        title="Nincs találat"
        eyebrow="Üres állapot"
        visual="✨"
        actionLabel="Hiányzó primary callback"
        secondaryActionLabel="Szűrők törlése"
        onSecondaryAction={onSecondaryAction}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Hiányzó primary callback" }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Szűrők törlése" }),
    ).toBeInTheDocument();
  });

  it("renders the primary action when the secondary action pair is incomplete", () => {
    const onAction = vi.fn();

    render(
      <StatePanel
        tone="empty"
        role="status"
        title="Üres lista"
        eyebrow="Üres állapot"
        visual="✨"
        actionLabel="Új recept létrehozása"
        onAction={onAction}
        secondaryActionLabel="Hiányzó secondary callback"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Új recept létrehozása" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Hiányzó secondary callback" }),
    ).not.toBeInTheDocument();
  });

  it("uses alert role when configured as an error state", () => {
    render(
      <StatePanel
        tone="error"
        role="alert"
        title="Hiba történt"
        eyebrow="Valami félrement"
        visual="!"
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
