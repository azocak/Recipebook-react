import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createAuthState } from "../test/auth-fixtures";
import { mockRecipe } from "../test/recipe-fixtures";
import RecipeDetailPage from "./RecipeDetailPage";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

vi.mock("../hooks/useRecipe.ts", () => ({
  useRecipe: (id: string | undefined) => mockUseRecipe(id),
}));

vi.mock("../hooks/useDeleteRecipe.ts", () => ({
  useDeleteRecipe: () => mockUseDeleteRecipe(),
}));

function setAuthGuest() {
  mockUseAuth.mockReturnValue(createAuthState());
}

function setAuthUser(
  user = { id: 1, username: "anna", email: "anna@gmail.com" },
) {
  mockUseAuth.mockReturnValue(
    createAuthState({
      user,
      isAuthenticated: true,
    }),
  );
}

type MockUseRecipeState = {
  recipe: typeof mockRecipe | null;
  status:
    | "loading"
    | "success"
    | "invalid-id"
    | "not-found"
    | "forbidden"
    | "error";
  errorMessage: string;
  loading: boolean;
  error: string;
  notFound: boolean;
  invalidId: boolean;
  forbidden: boolean;
  genericError: boolean;
};

function createUseRecipeState(
  overrides?: Partial<MockUseRecipeState>,
): MockUseRecipeState {
  const status = overrides?.status ?? "success";
  const errorMessage = overrides?.errorMessage ?? "";

  return {
    recipe: mockRecipe,
    status,
    errorMessage,
    loading: status === "loading",
    error:
      status === "error" || status === "forbidden" || status === "invalid-id"
        ? errorMessage
        : "",
    notFound: status === "not-found",
    forbidden: status === "forbidden",
    invalidId: status === "invalid-id",
    genericError: status === "error",
    ...overrides,
  };
}

function setUseRecipeState(overrides?: Partial<MockUseRecipeState>) {
  const state = createUseRecipeState(overrides);
  mockUseRecipe.mockReturnValue(state);
  return state;
}

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

function renderRecipeDetailPage(route = "/recipes/1") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RecipeDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthGuest();
    setUseRecipeState();
    setDeleteHook();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("shows the loading state while the recipe is being fetched", () => {
    setUseRecipeState({
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

  it("shows the generic error state", () => {
    setUseRecipeState({
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
    setUseRecipeState({
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

  it("shows the owner action buttons for the recipe owner", () => {
    setAuthUser();

    renderRecipeDetailPage();

    expect(
      screen.getByRole("button", { name: "Szerkesztés" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Törlés" })).toBeInTheDocument();
  });

  it("does not show owner action buttons for guests", () => {
    setAuthGuest();

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

    setAuthUser();
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

    setAuthUser();
    setDeleteHook({ deleteRecipe: deleteRecipeMock });

    renderRecipeDetailPage();

    await user.click(screen.getByRole("button", { name: "Törlés" }));

    await waitFor(() => {
      expect(deleteRecipeMock).toHaveBeenCalledWith(1);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recipes");
  });

  it("shows the delete error as an alert", () => {
    setAuthUser();
    setDeleteHook({ deleteError: "Nem sikerült törölni a receptet." });

    renderRecipeDetailPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Nem sikerült törölni a receptet.",
    );
  });
});
