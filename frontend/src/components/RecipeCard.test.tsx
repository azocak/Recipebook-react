import { render, screen } from "@testing-library/react";
import RecipeCard from "./RecipeCard";
import type { Recipe } from "../api/types";
import { mockRecipe } from "../test/recipe-fixtures";
import { createAuthState } from "../test/auth-fixtures";

const mockUseAuth = vi.fn();

vi.mock("../auth/AuthContext.tsx", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderRecipeCard(recipe: Recipe = mockRecipe) {
  return render(<RecipeCard recipe={recipe} />);
}
describe("RecipeCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders the recipe title and basic metadata", () => {
    mockUseAuth.mockReturnValue(createAuthState());

    renderRecipeCard();

    expect(screen.getByText("Palacsinta")).toBeInTheDocument();
    expect(screen.getByText(/20/i)).toBeInTheDocument();
    expect(screen.getByText(/4/i)).toBeInTheDocument();
    expect(screen.getByText(/Készítette:/i)).toBeInTheDocument();
    expect(screen.getByText(/anna/i)).toBeInTheDocument();
  });

  it("does not show edit and delete buttons for guests", () => {
    mockUseAuth.mockReturnValue(createAuthState());

    renderRecipeCard();

    expect(screen.queryByText("Szerkesztés")).not.toBeInTheDocument();
    expect(screen.queryByText("Törlés")).not.toBeInTheDocument();
  });

  it("does not show edit and delete buttons for an authenticated non-owner user", () => {
    mockUseAuth.mockReturnValue(
      createAuthState({
        user: { id: 2, username: "bela", email: "bela@gmail.com" },
        isAuthenticated: true,
      }),
    );

    renderRecipeCard();
    expect(screen.queryByText("Szerkesztés")).not.toBeInTheDocument();
    expect(screen.queryByText("Törlés")).not.toBeInTheDocument();
  });

  it("shows edit and delete buttons for the owner", () => {
    mockUseAuth.mockReturnValue(
      createAuthState({
        user: { id: 1, username: "anna", email: "anna@gmail.com" },
        isAuthenticated: true,
      }),
    );

    renderRecipeCard();

    expect(screen.getByText("Szerkesztés")).toBeInTheDocument();
    expect(screen.getByText("Törlés")).toBeInTheDocument();
  });
});
