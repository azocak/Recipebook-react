import { setAuthenticatedUser, setGuestAuth } from "../test/auth-fixtures";
import { mockRecipe, setMockUseRecipeState } from "../test/recipe-fixtures";
import RecipeDetailPage from "./RecipeDetailPage";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderRoute } from "../test/router";
import type { Recipe } from "../api/types";

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();
const mockUseRecipe = vi.fn();
const mockUseDeleteRecipe = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../hooks/useRecipe", () => ({
  useRecipe: (id: string | undefined) => mockUseRecipe(id),
}));

vi.mock("../hooks/useDeleteRecipe", () => ({
  useDeleteRecipe: () => mockUseDeleteRecipe(),
}));

type DeleteHookState = {
  deleteRecipe: ReturnType<typeof vi.fn>;
  deleting: boolean;
  deleteError: string | null;
};

function createDeleteHookState(overrides?: Partial<DeleteHookState>) {
  return {
    deleteRecipe: vi.fn().mockResolvedValue(undefined),
    deleting: false,
    deleteError: null,
    ...overrides,
  };
}

function setDeleteHook(overrides?: Partial<DeleteHookState>) {
  const state = createDeleteHookState(overrides);
  mockUseDeleteRecipe.mockReturnValue(state);
  return state;
}

function createRecipe(overrides?: Partial<Recipe>): Recipe {
  return {
    ...mockRecipe,
    image: null,
    image_url: null,
    ...overrides,
  };
}

function renderRecipeDetailPage(route = "/recipes/1") {
  return renderRoute(<RecipeDetailPage />, {
    path: "/recipes/:id",
    entry: route,
  });
}

describe("RecipeDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setGuestAuth(mockUseAuth);
    setMockUseRecipeState(mockUseRecipe);
    setDeleteHook();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("shows the loading state while the recipe is being fetched", () => {
    setMockUseRecipeState(mockUseRecipe, {
      recipe: null,
      status: "loading",
      errorMessage: "",
      loading: true,
    });

    renderRecipeDetailPage();

    expect(
      screen.getByRole("heading", { name: "Recept betöltése..." }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Betöltjük a recept részleteit."),
    ).toBeInTheDocument();
  });

  it("shows the invalid id state", () => {
    setMockUseRecipeState(mockUseRecipe, {
      recipe: null,
      status: "invalid-id",
      errorMessage: "Érvénytelen azonosító.",
      invalidId: true,
      error: "Érvénytelen azonosító.",
    });

    renderRecipeDetailPage("/recipes/abc");

    expect(
      screen.getByRole("heading", {
        name: "Érvénytelen receptazonosító.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Érvénytelen azonosító.")).toBeInTheDocument();
  });

  it("shows the forbidden state", () => {
    setMockUseRecipeState(mockUseRecipe, {
      recipe: null,
      status: "forbidden",
      errorMessage: "Nincs jogosultságod a recept megtekintéséhez.",
      forbidden: true,
      error: "Nincs jogosultságod a recept megtekintéséhez.",
    });

    renderRecipeDetailPage();

    expect(
      screen.getByRole("heading", {
        name: "Nem tekintheted meg ezt a receptet.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Nincs jogosultságod a recept megtekintéséhez."),
    ).toBeInTheDocument();
  });
  it("shows the generic error state", () => {
    setMockUseRecipeState(mockUseRecipe, {
      recipe: null,
      status: "error",
      errorMessage: "Szerver hiba.",
      error: "Szerver hiba",
      genericError: true,
    });

    renderRecipeDetailPage();

    expect(
      screen.getByRole("heading", {
        name: "Nem sikerült betölteni a receptet.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Szerver hiba.")).toBeInTheDocument();
  });

  it("shows the not found state", () => {
    setMockUseRecipeState(mockUseRecipe, {
      recipe: null,
      status: "not-found",
      errorMessage: "",
      notFound: true,
    });

    renderRecipeDetailPage();

    expect(
      screen.getByRole("heading", { name: "Nincs ilyen recept." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A keresett recept nem található."),
    ).toBeInTheDocument();
  });

  it("renders the placeholder block when the recipe has no image", () => {
    setMockUseRecipeState(mockUseRecipe, {
      recipe: createRecipe({
        image: null,
        image_url: null,
      }),
      status: "success",
    });

    renderRecipeDetailPage();

    expect(
      screen.getByRole("img", { name: "Nincs feltöltött kép" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("img", { name: "Palacsinta recept képe" }),
    ).not.toBeInTheDocument();
  });

  it("renders the uploaded image when image_url is available", () => {
    const recipeWithImage = createRecipe({
      image: "recipes/palacsinta.jpg",
      image_url: "http://localhost:8000/media/recipes/palacsinta.jpg",
    });

    setMockUseRecipeState(mockUseRecipe, {
      recipe: recipeWithImage,
      status: "success",
    });

    renderRecipeDetailPage();

    expect(
      screen.getByRole("img", { name: "Palacsinta recept képe" }),
    ).toHaveAttribute("src", recipeWithImage.image_url);

    expect(
      screen.queryByRole("img", { name: "Nincs feltöltött kép" }),
    ).not.toBeInTheDocument();
  });
  it("shows the owner action buttons for the recipe owner", () => {
    setAuthenticatedUser(mockUseAuth);

    renderRecipeDetailPage();

    expect(
      screen.getByRole("button", { name: "Szerkesztés" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Törlés" })).toBeInTheDocument();
  });

  it("does not show owner action buttons for guests", () => {
    setGuestAuth(mockUseAuth);

    renderRecipeDetailPage();

    expect(
      screen.queryByRole("button", { name: "Szerkesztés" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Törlés" }),
    ).not.toBeInTheDocument();
  });

  it("does not delete the recipe when the confirmation is cancelled", async () => {
    const user = userEvent.setup();
    const deleteRecipeMock = vi.fn().mockResolvedValue(undefined);

    setAuthenticatedUser(mockUseAuth);
    setDeleteHook({ deleteRecipe: deleteRecipeMock });
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderRecipeDetailPage();

    await user.click(screen.getByRole("button", { name: "Törlés" }));

    expect(window.confirm).toHaveBeenCalledWith(
      "Biztosan törölni szeretnéd ezt a receptet?",
    );
    expect(deleteRecipeMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("deletes the recipe and navigates to /recipes after confirmation", async () => {
    const user = userEvent.setup();
    const deleteRecipeMock = vi.fn().mockResolvedValue(undefined);

    setAuthenticatedUser(mockUseAuth);
    setDeleteHook({ deleteRecipe: deleteRecipeMock });

    renderRecipeDetailPage();

    await user.click(screen.getByRole("button", { name: "Törlés" }));

    await waitFor(() => {
      expect(deleteRecipeMock).toHaveBeenCalledWith(1);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recipes");
  });

  it("shows the delete error as an alert", () => {
    setAuthenticatedUser(mockUseAuth);
    setDeleteHook({ deleteError: "Nem sikerült törölni a receptet." });

    renderRecipeDetailPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Nem sikerült törölni a receptet.",
    );
  });

  it("navigates to the edit page when the owner clicks edit", async () => {
    const user = userEvent.setup();

    setAuthenticatedUser(mockUseAuth);

    renderRecipeDetailPage();

    await user.click(screen.getByRole("button", { name: "Szerkesztés" }));

    expect(mockNavigate).toHaveBeenCalledWith(`/recipes/${mockRecipe.id}/edit`);
  });
});
