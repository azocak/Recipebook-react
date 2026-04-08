import { screen, waitFor } from "@testing-library/react";
import type { RecipeFormData } from "../api/types";
import { setAuthenticatedUser } from "../test/auth-fixtures";
import { mockRecipe, setMockUseRecipeState } from "../test/recipe-fixtures";
import EditRecipePage from "./EditRecipePage";
import userEvent from "@testing-library/user-event";
import { renderRoute } from "../test/router";

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
    initialImageUrl,
    onSubmit,
    submitLabel,
  }: {
    initialValues: RecipeFormData;
    initialImageUrl?: string | null;
    onSubmit: (data: RecipeFormData) => Promise<void>;
    submitLabel: string;
  }) => {
    mockRecipeFormProps({ initialValues, initialImageUrl, submitLabel });

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
        <div data-testid="initial-image-url">{initialImageUrl ?? ""}</div>

        <button type="button" onClick={() => void onSubmit(initialValues)}>
          {submitLabel}
        </button>
      </div>
    );
  },
}));

function renderEditRecipePage(route = "/recipes/1/edit") {
  return renderRoute(<EditRecipePage />, {
    path: "/recipes/:id/edit",
    entry: route,
  });
}

describe("EditRecipePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthenticatedUser(mockUseAuth);
    setMockUseRecipeState(mockUseRecipe);
    mockUpdateRecipe.mockResolvedValue(mockRecipe);
  });

  it("shows the loading state while the editor is being prepared", () => {
    setMockUseRecipeState(mockUseRecipe, {
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

  it("shows the invalid id state", () => {
    setMockUseRecipeState(mockUseRecipe, {
      recipe: null,
      status: "invalid-id",
      errorMessage: "Érvénytelen azonosító.",
      invalidId: true,
      error: "Érvénytelen azonosító.",
    });

    renderEditRecipePage("/recipes/abc/edit");

    expect(
      screen.getByRole("heading", {
        name: "Érvénytelen receptazonosító.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Érvénytelen azonosító.")).toBeInTheDocument();
    expect(mockRecipeFormProps).not.toHaveBeenCalled();
  });

  it("shows the not found state", () => {
    setMockUseRecipeState(mockUseRecipe, {
      recipe: null,
      status: "not-found",
      errorMessage: "",
      notFound: true,
    });

    renderEditRecipePage();

    expect(
      screen.getByRole("heading", {
        name: "Nincs ilyen recept.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("A keresett recept nem található."),
    ).toBeInTheDocument();

    expect(mockRecipeFormProps).not.toHaveBeenCalled();
  });

  it("shows the forbidden state", () => {
    setMockUseRecipeState(mockUseRecipe, {
      recipe: null,
      status: "forbidden",
      errorMessage: "Nincs jogosultságod a recept szerkesztéséhez.",
      forbidden: true,
      error: "Nincs jogosultságod a recept szerkesztéséhez.",
    });

    renderEditRecipePage();

    expect(
      screen.getByRole("heading", {
        name: "Nem módosíthatod ezt a receptet.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Nincs jogosultságod a recept szerkesztéséhez."),
    ).toBeInTheDocument();

    expect(mockRecipeFormProps).not.toHaveBeenCalled();
  });

  it("shows the generic error state", () => {
    setMockUseRecipeState(mockUseRecipe, {
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
    setAuthenticatedUser(mockUseAuth, {
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

  it("passes the initial recipe values and initialImageUrl to RecipeForm for the owner", () => {
    renderEditRecipePage();

    expect(mockRecipeFormProps).toHaveBeenCalledWith({
      initialValues: {
        title: mockRecipe.title,
        ingredients: mockRecipe.ingredients,
        instructions: mockRecipe.instructions,
        cooking_time: mockRecipe.cooking_time,
        servings: mockRecipe.servings,
      },
      initialImageUrl: mockRecipe.image_url,
      submitLabel: "Módosítás mentése",
    });

    expect(screen.getByTestId("initial-title")).toHaveTextContent(
      mockRecipe.title,
    );
    expect(screen.getByTestId("initial-cooking-time")).toHaveTextContent("20");
    expect(screen.getByTestId("initial-servings")).toHaveTextContent("4");
    expect(screen.getByTestId("initial-image-url")).toHaveTextContent(
      mockRecipe.image_url ?? "",
    );
  });

  it("passes null as initialImageUrl when the recipe has no image", () => {
    setMockUseRecipeState(mockUseRecipe, {
      recipe: {
        ...mockRecipe,
        image: null,
        image_url: null,
      },
      status: "success",
    });

    renderEditRecipePage();

    expect(mockRecipeFormProps).toHaveBeenCalledWith({
      initialValues: {
        title: mockRecipe.title,
        ingredients: mockRecipe.ingredients,
        instructions: mockRecipe.instructions,
        cooking_time: mockRecipe.cooking_time,
        servings: mockRecipe.servings,
      },
      initialImageUrl: null,
      submitLabel: "Módosítás mentése",
    });

    expect(screen.getByTestId("initial-image-url")).toHaveTextContent("");
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
