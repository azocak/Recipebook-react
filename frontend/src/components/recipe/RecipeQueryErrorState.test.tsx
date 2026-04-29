import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecipeQueryErrorState } from "./RecipeQueryErrorState";
import { isRecipeQueryErrorStatus } from "./recipeQueryErrorStateUtils";

describe("RecipeQueryErrorState", () => {
  it("identifies recipe query error statuses", () => {
    expect(isRecipeQueryErrorStatus("invalid-id")).toBe(true);
    expect(isRecipeQueryErrorStatus("forbidden")).toBe(true);
    expect(isRecipeQueryErrorStatus("not-found")).toBe(true);
    expect(isRecipeQueryErrorStatus("error")).toBe(true);

    expect(isRecipeQueryErrorStatus("loading")).toBe(false);
    expect(isRecipeQueryErrorStatus("success")).toBe(false);
  });

  it("renders the invalid id state", () => {
    render(
      <RecipeQueryErrorState
        status="invalid-id"
        errorMessage="Érvénytelen azonosító."
        mode="detail"
        onBackToRecipes={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Érvénytelen receptazonosító.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Hibás hivatkozás")).toBeInTheDocument();
    expect(screen.getByText("🧭")).toBeInTheDocument();
    expect(screen.getByText("Érvénytelen azonosító.")).toBeInTheDocument();
  });

  it("renders the detail forbidden state", () => {
    render(
      <RecipeQueryErrorState
        status="forbidden"
        errorMessage="Nincs jogosultságod a recept megtekintéséhez."
        mode="detail"
        onBackToRecipes={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Nem tekintheted meg ezt a receptet.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Hozzáférés megtagadva")).toBeInTheDocument();
    expect(screen.getByText("🔒")).toBeInTheDocument();
  });

  it("renders the edit forbidden state", () => {
    render(
      <RecipeQueryErrorState
        status="forbidden"
        errorMessage="Nincs jogosultságod a recept megtekintéséhez."
        mode="edit"
        onBackToRecipes={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Nem módosíthatod ezt a receptet.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Hozzáférés megtagadva")).toBeInTheDocument();
    expect(screen.getByText("🔒")).toBeInTheDocument();
  });

  it("renders the not found state", () => {
    render(
      <RecipeQueryErrorState
        status="not-found"
        errorMessage=""
        mode="detail"
        onBackToRecipes={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Nincs ilyen recept." }),
    ).toBeInTheDocument();

    expect(screen.getByText("Eltűnt recept")).toBeInTheDocument();
    expect(screen.getByText("🔎")).toBeInTheDocument();
    expect(
      screen.getByText("A keresett recept nem található."),
    ).toBeInTheDocument();
  });

  it("renders the generic error state without a back button", () => {
    render(
      <RecipeQueryErrorState
        status="error"
        errorMessage="Szerver hiba."
        mode="detail"
        onBackToRecipes={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Nem sikerült betölteni a receptet.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Betöltési hiba")).toBeInTheDocument();
    expect(screen.getByText("⚠️")).toBeInTheDocument();
    expect(screen.getByText("Szerver hiba.")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Vissza a receptekhez" }),
    ).not.toBeInTheDocument();
  });

  it("calls onBackToRecipes from recoverable error states", async () => {
    const user = userEvent.setup();
    const onBackToRecipes = vi.fn();

    render(
      <RecipeQueryErrorState
        status="not-found"
        errorMessage=""
        mode="detail"
        onBackToRecipes={onBackToRecipes}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Vissza a receptekhez" }),
    );

    expect(onBackToRecipes).toHaveBeenCalledTimes(1);
  });
});
