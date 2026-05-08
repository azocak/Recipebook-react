import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders as a status region with the default empty state content", () => {
    render(
      <EmptyState
        title="Még nincs egyetlen recept sem"
        description="Légy te az első, aki megoszt egy új fogást."
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Még nincs egyetlen recept sem",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Légy te az első, aki megoszt egy új fogást."),
    ).toBeInTheDocument();

    expect(screen.getByText("Üres állapot")).toBeInTheDocument();
    expect(screen.getByText("✨")).toBeInTheDocument();
  });

  it("passes custom eyebrow and visual content to the shared panel", () => {
    render(
      <EmptyState
        eyebrow="Receptkönyv"
        visual="🍲"
        title="Nincs találat"
        description="Próbálj más keresési kifejezést."
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Receptkönyv")).toBeInTheDocument();
    expect(screen.getByText("🍲")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Nincs találat" }),
    ).toBeInTheDocument();
  });

  it("renders and calls the primary action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <EmptyState
        title="Még nincs egyetlen recept sem"
        description="Légy te az első, aki megoszt egy új fogást."
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
      <EmptyState
        title="Nincs találat"
        description="Próbálj más keresési kifejezést."
        secondaryActionLabel="Szűrők törlése"
        onSecondaryAction={onSecondaryAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Szűrők törlése" }));

    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });
});
