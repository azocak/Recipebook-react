import { screen, waitFor } from "@testing-library/react";
import RecipesPage from "./RecipesPage";
import { setAuthenticatedUser, setGuestAuth } from "../test/auth-fixtures";
import { ApiError } from "../api/errors";
import userEvent from "@testing-library/user-event";
import { mockRecipes } from "../test/recipe-fixtures";
import { renderRoute } from "../test/router";
import { createTestQueryClient } from "../test/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

const mockUseAuth = vi.fn();
const mockGetAll = vi.fn();
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
    getAll: () => mockGetAll(),
  },
}));

vi.mock("../components/RecipeCard", () => ({
  default: ({
    recipe,
    onDeleteSuccess,
  }: {
    recipe: { id: number; title: string };
    onDeleteSuccess?: (deleteRecipeId: number) => void;
  }) => (
    <article data-testid={`recipe-card-${recipe.id}`}>
      <h2>{recipe.title}</h2>
      <button type="button" onClick={() => onDeleteSuccess?.(recipe.id)}>
        Törlés sikeres {recipe.id}
      </button>
    </article>
  ),
}));

function renderRecipesPage() {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...renderRoute(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>,
      {
        path: "/recipes",
        entry: "/recipes",
      },
    ),
  };
}

async function renderPageWithRecipes({
  recipes = [],
  isAuthenticated = false,
}: {
  recipes?: typeof mockRecipes;
  isAuthenticated?: boolean;
}) {
  if (isAuthenticated) {
    setAuthenticatedUser(mockUseAuth);
  } else {
    setGuestAuth(mockUseAuth);
  }

  mockGetAll.mockResolvedValue(recipes);
  renderRecipesPage();

  if (recipes.length === 0) {
    if (isAuthenticated) {
      await screen.findByRole("button", { name: "Első recept létrehozása" });
    } else {
      await screen.findByRole("heading", {
        name: "Még nincs egyetlen recept sem",
      });
    }
  }

  await screen.findByRole("heading", { name: "Receptkönyv" });
}

function expectStatusBadge(isAuthenticated: boolean) {
  expect(
    screen.getByText(isAuthenticated ? "Bejelentkezve" : "Vendég mód"),
  ).toBeInTheDocument();
}

function expectRecipeCount(count: number) {
  expect(screen.getByText(`${count} db`)).toBeInTheDocument();
}

describe("RecipesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setGuestAuth(mockUseAuth);
  });

  it("shows the loading state while recipes are being fetched", () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));

    renderRecipesPage();

    expect(
      screen.getByRole("heading", { name: "Receptek betöltése..." }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Betöltjük a publikus recepteket."),
    ).toBeInTheDocument();
  });

  it("shows the error state and retry button when fetching fails", async () => {
    mockGetAll.mockRejectedValue(
      new ApiError("Szerver hiba.", 500, { detail: "Szerver hiba." }),
    );

    renderRecipesPage();

    expect(
      await screen.findByRole("heading", {
        name: "Nem sikerült betölteni a recepteket.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Szerver hiba.")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Újrapróbálás" }),
    ).toBeInTheDocument();
  });

  it("shows the empty state for guests", async () => {
    await renderPageWithRecipes({ recipes: [], isAuthenticated: false });

    expect(
      screen.getByText(
        /Ez lesz az a hely, ahol a közösség receptjei megjelennek/i,
      ),
    ).toBeInTheDocument();

    expectRecipeCount(0);
    expectStatusBadge(false);

    expect(
      screen.getByRole("link", { name: "Regisztráció a receptfeltöltéshez" }),
    ).toHaveAttribute("href", "/register");
  });

  it("shows the empty state create button for authenticated users and navigates on click", async () => {
    const user = userEvent.setup();

    await renderPageWithRecipes({ recipes: [], isAuthenticated: true });

    const createButton = await screen.findByRole("button", {
      name: "Első recept létrehozása",
    });

    expect(createButton).toBeInTheDocument();
    expectStatusBadge(true);

    await user.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith("/recipes/new");
  });

  it("renders the recipe list successfully for guests", async () => {
    await renderPageWithRecipes({
      recipes: mockRecipes,
      isAuthenticated: false,
    });

    expectRecipeCount(2);
    expectStatusBadge(false);

    expect(screen.getByText("Palacsinta")).toBeInTheDocument();
    expect(screen.getByText("Gulyásleves")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Bejelentkezés a megosztáshoz" }),
    ).toHaveAttribute("href", "/login");
  });

  it("shows the create button for authenticated users and navigates on click", async () => {
    const user = userEvent.setup();

    await renderPageWithRecipes({
      recipes: mockRecipes,
      isAuthenticated: true,
    });

    const createButton = await screen.findByRole("button", {
      name: "Új recept létrehozása",
    });

    expect(createButton).toBeInTheDocument();
    expectStatusBadge(true);

    await user.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith("/recipes/new");
  });

  it("retries fetching recipes after an error", async () => {
    const user = userEvent.setup();

    mockGetAll
      .mockRejectedValueOnce(
        new ApiError("Első hiba", 500, { detail: "Első hiba" }),
      )
      .mockResolvedValueOnce(mockRecipes);

    renderRecipesPage();

    const retryButton = await screen.findByRole("button", {
      name: "Újrapróbálás",
    });

    expect(screen.getByText("Első hiba")).toBeInTheDocument();

    await user.click(retryButton);

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledTimes(2);
    });
  });

  it("removes a recipe from the list after the card reports successful deletion", async () => {
    const user = userEvent.setup();

    await renderPageWithRecipes({
      recipes: mockRecipes,
      isAuthenticated: true,
    });

    expect(screen.getByText("Palacsinta")).toBeInTheDocument();
    expect(screen.getByText("Gulyásleves")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Törlés sikeres 1" }));

    await waitFor(() => {
      expect(screen.queryByText("Palacsinta")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Gulyásleves")).toBeInTheDocument();
    expectRecipeCount(1);
  });
});
