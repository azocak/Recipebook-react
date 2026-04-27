import { QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "../api/errors";
import { recipesApi } from "../api/recipes";
import type { Recipe, RecipeFormData, RecipeImageFormData } from "../api/types";
import { setAuthenticatedUser } from "../test/auth-fixtures";
import { mockRecipe } from "../test/recipe-fixtures";
import { createTestQueryClient } from "../test/queryClient";
import { renderRoute } from "../test/router";
import EditRecipePage from "./EditRecipePage";
import { queryKeys } from "../lib/queryKeys";

const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();
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

vi.mock("../api/recipes", () => ({
  recipesApi: {
    getById: vi.fn(),
    update: vi.fn(),
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
    onSubmit: (data: RecipeImageFormData) => Promise<void>;
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

const mockGetById = vi.mocked(recipesApi.getById);
const mockUpdateRecipe = vi.mocked(recipesApi.update);

function renderEditRecipePage(route = "/recipes/1/edit") {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...renderRoute(
      <QueryClientProvider client={queryClient}>
        <EditRecipePage />
      </QueryClientProvider>,
      {
        path: "/recipes/:id/edit",
        entry: route,
      },
    ),
  };
}

describe("EditRecipePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setAuthenticatedUser(mockUseAuth);
    mockGetById.mockResolvedValue(mockRecipe);
    mockUpdateRecipe.mockResolvedValue(mockRecipe);
  });

  it("shows the loading state while the editor is being prepared", () => {
    mockGetById.mockReturnValue(new Promise<Recipe>(() => {}));

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

  it("shows the invalid id state without calling the API", () => {
    renderEditRecipePage("/recipes/abc/edit");

    expect(
      screen.getByRole("heading", {
        name: "Érvénytelen receptazonosító.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Érvénytelen azonosító.")).toBeInTheDocument();
    expect(mockGetById).not.toHaveBeenCalled();
    expect(mockRecipeFormProps).not.toHaveBeenCalled();
  });

  it("shows the not found state", async () => {
    mockGetById.mockRejectedValue(new ApiError("Not found", 404));

    renderEditRecipePage();

    expect(
      await screen.findByRole("heading", {
        name: "Nincs ilyen recept.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("A keresett recept nem található."),
    ).toBeInTheDocument();

    expect(mockGetById).toHaveBeenCalledWith(1);
    expect(mockRecipeFormProps).not.toHaveBeenCalled();
  });

  it("shows the forbidden state", async () => {
    mockGetById.mockRejectedValue(new ApiError("Forbidden", 403));

    renderEditRecipePage();

    expect(
      await screen.findByRole("heading", {
        name: "Nem módosíthatod ezt a receptet.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Nincs jogosultságod a recept megtekintéséhez."),
    ).toBeInTheDocument();

    expect(mockGetById).toHaveBeenCalledWith(1);
    expect(mockRecipeFormProps).not.toHaveBeenCalled();
  });

  it("shows the generic error state", async () => {
    mockGetById.mockRejectedValue(
      new ApiError("Server error", 500, {
        detail: "Szerver hiba.",
      }),
    );

    renderEditRecipePage();

    expect(
      await screen.findByRole("heading", {
        name: "Nem sikerült betölteni a receptet.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Szerver hiba.")).toBeInTheDocument();
    expect(mockRecipeFormProps).not.toHaveBeenCalled();
  });

  it("shows the no-access state for non-owners", async () => {
    setAuthenticatedUser(mockUseAuth, {
      id: 2,
      username: "bela",
      email: "bela@gmail.com",
    });

    renderEditRecipePage();

    expect(
      await screen.findByRole("heading", {
        name: "Nincs jogosultságod ehhez az oldalhoz.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Csak a recept készítője szerkesztheti ezt a receptet."),
    ).toBeInTheDocument();

    expect(mockRecipeFormProps).not.toHaveBeenCalled();
  });

  it("passes the initial recipe values and initialImageUrl to RecipeForm for the owner", async () => {
    renderEditRecipePage();

    expect(await screen.findByText("RecipeForm mock")).toBeInTheDocument();

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

  it("passes null as initialImageUrl when the recipe has no image", async () => {
    mockGetById.mockResolvedValue({
      ...mockRecipe,
      image: null,
      image_url: null,
    });

    renderEditRecipePage();

    expect(await screen.findByText("RecipeForm mock")).toBeInTheDocument();

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

  it("submits the updated recipe, updates the detail cache and navigates to the returned recipe detail page", async () => {
    const user = userEvent.setup();

    const updatedRecipe = {
      ...mockRecipe,
      id: 7,
      title: "Frissített palacsinta",
    };

    mockUpdateRecipe.mockResolvedValue(updatedRecipe);

    const { queryClient } = renderEditRecipePage();

    await user.click(
      await screen.findByRole("button", { name: "Módosítás mentése" }),
    );

    await waitFor(() => {
      expect(mockUpdateRecipe).toHaveBeenCalledWith(1, {
        title: mockRecipe.title,
        ingredients: mockRecipe.ingredients,
        instructions: mockRecipe.instructions,
        cooking_time: mockRecipe.cooking_time,
        servings: mockRecipe.servings,
      });
    });

    expect(queryClient.getQueryData(queryKeys.recipes.detail(7))).toEqual(
      updatedRecipe,
    );

    expect(mockNavigate).toHaveBeenCalledWith("/recipes/7");
  });
});
