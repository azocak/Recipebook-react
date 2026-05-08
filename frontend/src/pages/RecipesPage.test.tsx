import { screen, waitFor, within } from "@testing-library/react";
import RecipesPage from "./RecipesPage";
import { setAuthenticatedUser, setGuestAuth } from "../test/auth-fixtures";
import { ApiError } from "../api/errors";
import userEvent from "@testing-library/user-event";
import { createPaginatedRecipes, mockRecipes } from "../test/recipe-fixtures";
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
    getAll: (...args: unknown[]) => mockGetAll(...args),
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

function renderRecipesPage(entry = "/recipes") {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...renderRoute(
      <QueryClientProvider client={queryClient}>
        <RecipesPage />
      </QueryClientProvider>,
      {
        path: "/recipes",
        entry,
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

  mockGetAll.mockResolvedValue(createPaginatedRecipes(recipes));
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the recipe list skeleton while fetching recipes", () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));

    renderRecipesPage();

    expect(
      screen.getByRole("region", { name: "Receptek betöltése" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Receptek betöltése...",
    );
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

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Betöltési hiba")).toBeInTheDocument();
    expect(screen.getByText("⚠️")).toBeInTheDocument();
    expect(screen.getByText("Szerver hiba.")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Újrapróbálás" }),
    ).toBeInTheDocument();
  });

  it("shows the empty state for guests and navigates to register", async () => {
    const user = userEvent.setup();

    await renderPageWithRecipes({ recipes: [], isAuthenticated: false });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getAllByText("Receptkönyv")).toHaveLength(2);
    expect(screen.getByText("🍲")).toBeInTheDocument();

    expect(
      screen.getByText(
        /Ez lesz az a hely, ahol a közösség receptjei megjelennek/i,
      ),
    ).toBeInTheDocument();

    expectRecipeCount(0);
    expectStatusBadge(false);

    const registerButton = screen.getByRole("button", {
      name: "Regisztráció a receptfeltöltéshez",
    });

    await user.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });
  it("shows the empty state create button for authenticated users and navigates on click", async () => {
    const user = userEvent.setup();

    await renderPageWithRecipes({ recipes: [], isAuthenticated: true });

    expect(screen.getByRole("status")).toBeInTheDocument();

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
  });

  it("shows a no-results empty state when filters return no recipes", async () => {
    mockGetAll.mockResolvedValue(
      createPaginatedRecipes([], {
        count: 0,
        next: null,
        previous: null,
      }),
    );

    renderRecipesPage("/recipes?search=tiramisu");

    expect(
      await screen.findByRole("heading", {
        name: "Nincs találat a keresésre",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Próbálj meg másik keresőkifejezést vagy rendezést választani.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Keresés")).toHaveValue("tiramisu");

    const noResultsState = screen.getByRole("status");

    expect(
      within(noResultsState).getByRole("button", { name: "Szűrők törlése" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Regisztráció a receptfeltöltéshez",
      }),
    ).not.toBeInTheDocument();
  });

  it("resets filters from the no-results empty state", async () => {
    const user = userEvent.setup();

    mockGetAll
      .mockResolvedValueOnce(
        createPaginatedRecipes([], {
          count: 0,
          next: null,
          previous: null,
        }),
      )
      .mockResolvedValueOnce(createPaginatedRecipes(mockRecipes));

    renderRecipesPage("/recipes?search=tiramisu");

    await screen.findByRole("heading", {
      name: "Nincs találat a keresésre",
    });

    const noResultsState = screen.getByRole("status");

    await user.click(
      within(noResultsState).getByRole("button", { name: "Szűrők törlése" }),
    );
    await waitFor(() => {
      expect(mockGetAll).toHaveBeenLastCalledWith({});
    });

    expect(screen.getByLabelText("Keresés")).toHaveValue("");
  });
  it("uses recipe list URL params when fetching recipes", async () => {
    mockGetAll.mockResolvedValue(createPaginatedRecipes(mockRecipes));

    renderRecipesPage("/recipes?search=pala&ordering=title");

    await screen.findByRole("heading", { name: "Receptkönyv" });

    expect(screen.getByLabelText("Keresés")).toHaveValue("pala");
    expect(screen.getByLabelText("Rendezés")).toHaveValue("title");

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith({
        search: "pala",
        ordering: "title",
      });
    });
  });

  it("debounces search changes before fetching recipes", async () => {
    const user = userEvent.setup();

    mockGetAll.mockResolvedValue(createPaginatedRecipes(mockRecipes));

    renderRecipesPage();

    await screen.findByRole("heading", { name: "Receptkönyv" });

    expect(mockGetAll).toHaveBeenCalledWith({});

    await user.type(screen.getByLabelText("Keresés"), "pala");

    expect(screen.getByLabelText("Keresés")).toHaveValue("pala");
    expect(mockGetAll).toHaveBeenCalledTimes(1);

    await waitFor(
      () => {
        expect(mockGetAll).toHaveBeenLastCalledWith({
          search: "pala",
        });
      },
      {
        timeout: 2500,
      },
    );
  });

  it("fetches the next recipe page from pagination controls", async () => {
    const user = userEvent.setup();

    mockGetAll.mockResolvedValue(
      createPaginatedRecipes(mockRecipes, {
        next: "http://testserver/api/recipes/?page=2",
        previous: null,
      }),
    );

    renderRecipesPage();

    await screen.findByRole("heading", { name: "Receptkönyv" });

    expect(screen.getByText("1. oldal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Következő oldal" }));

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenLastCalledWith({
        page: 2,
      });
    });
  });

  it("resets recipe list filters from the filter bar", async () => {
    const user = userEvent.setup();

    mockGetAll.mockResolvedValue(createPaginatedRecipes(mockRecipes));

    renderRecipesPage("/recipes?search=pala&ordering=title&page=2");

    await screen.findByRole("heading", { name: "Receptkönyv" });

    expect(screen.getByLabelText("Keresés")).toHaveValue("pala");
    expect(screen.getByLabelText("Rendezés")).toHaveValue("title");

    await user.click(screen.getByRole("button", { name: "Szűrők törlése" }));

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenLastCalledWith({});
    });

    expect(screen.getByLabelText("Keresés")).toHaveValue("");
    expect(screen.getByLabelText("Rendezés")).toHaveValue("");
  });

  it("retries fetching recipes after an error", async () => {
    const user = userEvent.setup();

    mockGetAll
      .mockRejectedValueOnce(
        new ApiError("Első hiba", 500, { detail: "Első hiba" }),
      )
      .mockResolvedValueOnce(createPaginatedRecipes(mockRecipes));

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
