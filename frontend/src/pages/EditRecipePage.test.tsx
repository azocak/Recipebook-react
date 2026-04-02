import { render, screen, waitFor } from "@testing-library/react";
import type { RecipeFormData } from "../api/types";
import { createAuthState } from "../test/auth-fixtures";
import { mockRecipe } from "../test/recipe-fixtures";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EditRecipePage from "./EditRecipePage";
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();
const mockUseRecipe = vi.fn();
const mockUpdateRecipe = vi.fn();
const mockRecipeFormProps = vi.fn();

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

vi.mock("../api/recipes", () => ({
  recipesApi: {
    update: (...args: unknown[]) => mockUpdateRecipe(...args),
  },
}));

vi.mock("../components/RecipeForm", () => ({
  default: ({
    initialValues,
    onSubmit,
    submitLabel,
  }: {
    initialValues: RecipeFormData;
    onSubmit: (data: RecipeFormData) => Promise<void>;
    submitLabel: string;
  }) => {
    mockRecipeFormProps({ initialValues, submitLabel });

    return (
      <div>
        <p>RecipeForm mock</p>

        <div data-testid="initial-title">{initialValues.title}</div>
        <div data-testid="initial-ingredients">{initialValues.ingredients}</div>
        <div data-testid="initial-instructions">
          {initialValues.instructions}
        </div>
        <div data-testid="initial-cooking-time">
          {String(initialValues.cooking_time)}
        </div>
        <div data-testid="initial-servings">
          {String(initialValues.servings)}
        </div>

        <button type="button" onClick={() => void onSubmit(initialValues)}>
          {submitLabel}
        </button>
      </div>
    );
  },
}));

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

function renderEditRecipePage(route = "/recipes/1/edit") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EditRecipePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthUser();
    setUseRecipeState();
    mockUpdateRecipe.mockResolvedValue(mockRecipe);
  });

  it("shows the loading state while the editor is being prepared", () => {
    setUseRecipeState({
      recipe: null,
      status: "loading",
      errorMessage: "",
      loading: true,
    });

    renderEditRecipePage();

    expect(
      screen.getByRole("heading", {
        name: "Recept szerkesztő betöltése...",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Előkészítjük a szerkesztő űrlapot."),
    ).toBeInTheDocument();
  });

  it("shows the generic error state", () => {
    setUseRecipeState({
      recipe: null,
      status: "error",
      errorMessage: "Szerver hiba.",
      error: "Szerver hiba.",
      genericError: true,
    });

    renderEditRecipePage();

    expect(
      screen.getByRole("heading", {
        name: "Nem sikerült betölteni a receptet.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Szerver hiba.")).toBeInTheDocument();
  });

  it("shows the no-access state for non-owners", () => {
    setAuthUser({
      id: 2,
      username: "bela",
      email: "bela@gmail.com",
    });

    renderEditRecipePage();

    expect(
      screen.getByRole("heading", {
        name: "Nincs jogosultságod ehhez az oldalhoz.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Csak a recept készítője szerkesztheti ezt a receptet."),
    ).toBeInTheDocument();

    expect(mockRecipeFormProps).not.toHaveBeenCalled();
  });

  it("passes the initial recipe values to RecipeForm for the owner", () => {
    renderEditRecipePage();

    expect(mockRecipeFormProps).toHaveBeenCalledWith({
      initialValues: {
        title: mockRecipe.title,
        ingredients: mockRecipe.ingredients,
        instructions: mockRecipe.instructions,
        cooking_time: mockRecipe.cooking_time,
        servings: mockRecipe.servings,
      },
      submitLabel: "Módosítás mentése",
    });

    expect(screen.getByTestId("initial-title")).toHaveTextContent(
      mockRecipe.title,
    );
    expect(screen.getByTestId("initial-cooking-time")).toHaveTextContent("20");
    expect(screen.getByTestId("initial-servings")).toHaveTextContent("4");
  });

  it("submits the updated recipe and navigates to the returned recipe detail page", async () => {
    const user = userEvent.setup();

    mockUpdateRecipe.mockResolvedValue({
      ...mockRecipe,
      id: 7,
    });

    renderEditRecipePage();
    await user.click(screen.getByRole("button", { name: "Módosítás mentése" }));

    await waitFor(() => {
      expect(mockUpdateRecipe).toHaveBeenCalledWith(1, {
        title: mockRecipe.title,
        ingredients: mockRecipe.ingredients,
        instructions: mockRecipe.instructions,
        cooking_time: mockRecipe.cooking_time,
        servings: mockRecipe.servings,
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recipes/7");
  });
});
