import { screen, waitFor } from "@testing-library/react";
import type { RecipeFormData, RecipeImageFormData } from "../api/types";
import NewRecipePage from "./NewRecipePage";
import { mockRecipe } from "../test/recipe-fixtures";
import userEvent from "@testing-library/user-event";
import { renderRoute } from "../test/router";

const mockNavigate = vi.fn();
const mockCreateRecipe = vi.fn();
const mockRecipeFormProps = vi.fn();

const defaultSubmitPayload: RecipeImageFormData = {
  title: "",
  ingredients: "",
  instructions: "",
  cooking_time: 0,
  servings: 1,
};

let mockSubmitPayload: RecipeImageFormData = defaultSubmitPayload;

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

vi.mock("../api/recipes", () => ({
  recipesApi: {
    create: (...args: unknown[]) => mockCreateRecipe(...args),
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
    mockRecipeFormProps({
      initialValues,
      initialImageUrl,
      submitLabel,
    });

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

        <button
          type="button"
          onClick={() => {
            void onSubmit(mockSubmitPayload).catch(() => undefined);
          }}
        >
          {submitLabel}
        </button>
      </div>
    );
  },
}));

function renderNewRecipePage(route = "/recipes/new") {
  return renderRoute(<NewRecipePage />, {
    path: "/recipes/new",
    entry: route,
  });
}

describe("NewRecipePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateRecipe.mockResolvedValue(mockRecipe);
    mockSubmitPayload = {
      title: "",
      ingredients: "",
      instructions: "",
      cooking_time: 0,
      servings: 1,
    };
  });

  it("renders the page and passes empty default values with null initialImageUrl to RecipeForm", () => {
    renderNewRecipePage();

    expect(screen.getByText("RecipeForm mock")).toBeInTheDocument();

    expect(mockRecipeFormProps).toHaveBeenCalledWith({
      initialValues: {
        title: "",
        ingredients: "",
        instructions: "",
        cooking_time: 0,
        servings: 1,
      },
      initialImageUrl: null,
      submitLabel: "Recept mentése",
    });

    expect(screen.getByTestId("initial-title")).toHaveTextContent("");
    expect(screen.getByTestId("initial-ingredients")).toHaveTextContent("");
    expect(screen.getByTestId("initial-instructions")).toHaveTextContent("");
    expect(screen.getByTestId("initial-cooking-time")).toHaveTextContent("0");
    expect(screen.getByTestId("initial-servings")).toHaveTextContent("1");
    expect(screen.getByTestId("initial-image-url")).toHaveTextContent("");
  });

  it("forwards the submitted image payload to recipesApi.create and navigates to the detail page", async () => {
    const user = userEvent.setup();
    const imageFile = new File(["fake-image"], "new-recipe.png", {
      type: "image/png",
    });

    mockSubmitPayload = {
      title: "Új recept",
      ingredients: "Liszt, tojás",
      instructions: "Keverd össze.",
      cooking_time: 25,
      servings: 2,
      image: imageFile,
      remove_image: false,
    };

    mockCreateRecipe.mockResolvedValue({
      ...mockRecipe,
      id: 7,
    });

    renderNewRecipePage();

    await user.click(screen.getByRole("button", { name: "Recept mentése" }));

    await waitFor(() => {
      expect(mockCreateRecipe).toHaveBeenCalledWith({
        title: "Új recept",
        ingredients: "Liszt, tojás",
        instructions: "Keverd össze.",
        cooking_time: 25,
        servings: 2,
        image: imageFile,
        remove_image: false,
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recipes/7");
  });

  it("does not navigate away when recipe creation fails", async () => {
    const user = userEvent.setup();

    mockSubmitPayload = {
      title: "Hibás mentés",
      ingredients: "Teszt",
      instructions: "Teszt instrukció",
      cooking_time: 15,
      servings: 3,
    };

    mockCreateRecipe.mockRejectedValue(new Error("Create failed"));

    renderNewRecipePage();

    await user.click(screen.getByRole("button", { name: "Recept mentése" }));

    await waitFor(() => {
      expect(mockCreateRecipe).toHaveBeenCalledWith({
        title: "Hibás mentés",
        ingredients: "Teszt",
        instructions: "Teszt instrukció",
        cooking_time: 15,
        servings: 3,
      });
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders a back link to the recipes page", () => {
    renderNewRecipePage();

    expect(
      screen.getByRole("link", { name: /vissza a receptekhez/i }),
    ).toHaveAttribute("href", "/recipes");
  });
});
