import { render, screen } from "@testing-library/react";
import RecipesPage from "./RecipesPage";
import { createAuthState } from "../test/auth-fixtures";
import { mockRecipes } from "../test/recipe-fixtures";
import { MemoryRouter } from "react-router-dom";

const mockUseAuth = vi.fn();
const mockGetAll = vi.fn();

vi.mock("../auth/AuthContext.tsx", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../api/recipes.ts", () => ({
  recipesApi: {
    getAll: () => mockGetAll(),
  },
}));

describe("RecipesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderRecipesPage() {
    return render(
      <MemoryRouter>
        <RecipesPage />
      </MemoryRouter>,
    );
  }

  it("shows loading initially", () => {
    mockUseAuth.mockReturnValue(createAuthState());
    mockGetAll.mockReturnValue(new Promise(() => {}));

    renderRecipesPage();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders recipes after successful fetch", async () => {
    mockUseAuth.mockReturnValue(createAuthState());
    mockGetAll.mockResolvedValue(mockRecipes);

    renderRecipesPage();

    expect(await screen.findByText("Palacsinta")).toBeInTheDocument();
    expect(screen.getByText("Gulyásleves")).toBeInTheDocument();
    expect(screen.getByText("Receptkönyv")).toBeInTheDocument();
  });

  it("shows the new recipe button for authenticated users", async () => {
    mockUseAuth.mockReturnValue(
      createAuthState({
        user: { id: 1, username: "anna", email: "anna@gmail.com" },
        isAuthenticated: true,
      }),
    );
    mockGetAll.mockResolvedValue(mockRecipes);

    renderRecipesPage();

    expect(await screen.findByText("Új recept")).toBeInTheDocument();
  });

  it("does not show the new recipe button for guests", async () => {
    mockUseAuth.mockReturnValue(createAuthState());
    mockGetAll.mockResolvedValue(mockRecipes);

    renderRecipesPage();

    expect(await screen.findByText("Palacsinta")).toBeInTheDocument();
    expect(screen.queryByText("Új recept")).not.toBeInTheDocument();
  });
});
