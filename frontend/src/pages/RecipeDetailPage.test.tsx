import { QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "../api/errors";
import { recipesApi } from "../api/recipes";
import type { Recipe } from "../api/types";
import { setAuthenticatedUser, setGuestAuth } from "../test/auth-fixtures";
import { mockRecipe } from "../test/recipe-fixtures";
import { createTestQueryClient } from "../test/queryClient";
import { renderRoute } from "../test/router";
import RecipeDetailPage from "./RecipeDetailPage";

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

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

vi.mock("../api/recipes", () => ({
  recipesApi: {
    getById: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockGetById = vi.mocked(recipesApi.getById);
const mockRemoveRecipe = vi.mocked(recipesApi.remove);

function createRecipe(overrides?: Partial<Recipe>): Recipe {
  return {
    ...mockRecipe,
    image: null,
    image_url: null,
    ...overrides,
  };
}

function renderRecipeDetailPage(route = "/recipes/1") {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...renderRoute(
      <QueryClientProvider client={queryClient}>
        <RecipeDetailPage />
      </QueryClientProvider>,
      {
        path: "/recipes/:id",
        entry: route,
      },
    ),
  };
}

describe("RecipeDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setGuestAuth(mockUseAuth);
    mockRemoveRecipe.mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    mockGetById.mockResolvedValue(createRecipe());
  });

  it("shows the recipe detail skeleton while the recipe is being fetched", () => {
    mockGetById.mockReturnValue(new Promise(() => {}));

    renderRecipeDetailPage();

    expect(
      screen.getByRole("region", {
        name: "Recept részleteinek betöltése",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("status")).toHaveTextContent("Recept betöltése...");
  });

  it("shows the invalid id state without calling the API", () => {
    renderRecipeDetailPage("/recipes/abc");

    expect(screen.getByRole("alert")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Érvénytelen receptazonosító.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Hibás hivatkozás")).toBeInTheDocument();
    expect(screen.getByText("🧭")).toBeInTheDocument();
    expect(screen.getByText("Érvénytelen azonosító.")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Vissza a receptekhez" }),
    ).toBeInTheDocument();

    expect(mockGetById).not.toHaveBeenCalled();
  });

  it("shows the forbidden state", async () => {
    mockGetById.mockRejectedValue(new ApiError("Forbidden", 403));

    renderRecipeDetailPage();

    expect(
      await screen.findByRole("heading", {
        name: "Nem tekintheted meg ezt a receptet.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Hozzáférés megtagadva")).toBeInTheDocument();
    expect(screen.getByText("🔒")).toBeInTheDocument();

    expect(
      screen.getByText("Nincs jogosultságod a recept megtekintéséhez."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Vissza a receptekhez" }),
    ).toBeInTheDocument();

    expect(mockGetById).toHaveBeenCalledWith(1);
  });

  it("shows the generic error state", async () => {
    mockGetById.mockRejectedValue(
      new ApiError("Server error", 500, {
        detail: "Szerver hiba.",
      }),
    );

    renderRecipeDetailPage();

    expect(
      await screen.findByRole("heading", {
        name: "Nem sikerült betölteni a receptet.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Betöltési hiba")).toBeInTheDocument();
    expect(screen.getByText("⚠️")).toBeInTheDocument();
    expect(screen.getByText("Szerver hiba.")).toBeInTheDocument();
  });

  it("shows the not found state", async () => {
    mockGetById.mockRejectedValue(new ApiError("Not found", 404));

    renderRecipeDetailPage();

    expect(
      await screen.findByRole("heading", { name: "Nincs ilyen recept." }),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Eltűnt recept")).toBeInTheDocument();
    expect(screen.getByText("🔎")).toBeInTheDocument();

    expect(
      screen.getByText("A keresett recept nem található."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Vissza a receptekhez" }),
    ).toBeInTheDocument();

    expect(mockGetById).toHaveBeenCalledWith(1);
  });

  it("navigates back to recipes from the not found state", async () => {
    const user = userEvent.setup();

    mockGetById.mockRejectedValue(new ApiError("Not found", 404));

    renderRecipeDetailPage();

    await user.click(
      await screen.findByRole("button", { name: "Vissza a receptekhez" }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/recipes");
  });
  it("renders the placeholder block when the recipe has no image", async () => {
    mockGetById.mockResolvedValue(
      createRecipe({
        image: null,
        image_url: null,
      }),
    );

    renderRecipeDetailPage();

    expect(
      await screen.findByRole("img", { name: "Nincs feltöltött kép" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("img", { name: "Palacsinta recept képe" }),
    ).not.toBeInTheDocument();
  });

  it("renders the uploaded image when image_url is available", async () => {
    const recipeWithImage = createRecipe({
      image: "recipes/palacsinta.jpg",
      image_url: "http://localhost:8000/media/recipes/palacsinta.jpg",
    });

    mockGetById.mockResolvedValue(recipeWithImage);

    renderRecipeDetailPage();

    expect(
      await screen.findByRole("img", { name: "Palacsinta recept képe" }),
    ).toHaveAttribute("src", recipeWithImage.image_url);

    expect(
      screen.queryByRole("img", { name: "Nincs feltöltött kép" }),
    ).not.toBeInTheDocument();
  });

  it("shows the owner action buttons for the recipe owner", async () => {
    setAuthenticatedUser(mockUseAuth);

    renderRecipeDetailPage();

    expect(
      await screen.findByRole("button", { name: "Szerkesztés" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Törlés" })).toBeInTheDocument();
  });

  it("does not show owner action buttons for guests", async () => {
    setGuestAuth(mockUseAuth);

    renderRecipeDetailPage();

    expect(
      await screen.findByRole("heading", { name: "Palacsinta" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Szerkesztés" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Törlés" }),
    ).not.toBeInTheDocument();
  });

  it("does not delete the recipe when the confirmation is cancelled", async () => {
    const user = userEvent.setup();

    setAuthenticatedUser(mockUseAuth);
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderRecipeDetailPage();

    await user.click(await screen.findByRole("button", { name: "Törlés" }));

    expect(window.confirm).toHaveBeenCalledWith(
      "Biztosan törölni szeretnéd ezt a receptet?",
    );

    expect(mockRemoveRecipe).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("deletes the recipe and navigates to /recipes after confirmation", async () => {
    const user = userEvent.setup();

    setAuthenticatedUser(mockUseAuth);

    renderRecipeDetailPage();

    await user.click(await screen.findByRole("button", { name: "Törlés" }));

    await waitFor(() => {
      expect(mockRemoveRecipe).toHaveBeenCalledWith(1);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recipes");
  });

  it("shows the delete error as an alert", async () => {
    const user = userEvent.setup();

    mockRemoveRecipe.mockRejectedValue(
      new ApiError("Server error", 500, {
        detail: "Nem sikerült törölni a receptet.",
      }),
    );

    setAuthenticatedUser(mockUseAuth);

    renderRecipeDetailPage();

    await user.click(await screen.findByRole("button", { name: "Törlés" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Nem sikerült törölni a receptet.",
    );

    expect(mockNavigate).not.toHaveBeenCalledWith("/recipes");
  });

  it("navigates to the edit page when the owner clicks edit", async () => {
    const user = userEvent.setup();

    setAuthenticatedUser(mockUseAuth);

    renderRecipeDetailPage();

    await user.click(
      await screen.findByRole("button", { name: "Szerkesztés" }),
    );

    expect(mockNavigate).toHaveBeenCalledWith(`/recipes/${mockRecipe.id}/edit`);
  });
});
