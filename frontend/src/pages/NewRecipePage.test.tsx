import { render, screen, waitFor } from "@testing-library/react";
import type { RecipeFormData } from "../api/types";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import NewRecipePage from "./NewRecipePage";
import { mockRecipe } from "../test/recipe-fixtures";
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn();
const mockCreateRecipe = vi.fn();
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

vi.mock("../api/recipes", () => ({
  recipesApi: {
    create: (...args: unknown[]) => mockCreateRecipe(...args),
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
    mockRecipeFormProps({
      initialValues,
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

        <button
          type="button"
          onClick={() => {
            void onSubmit(initialValues).catch(() => undefined);
          }}
        >
          {submitLabel}
        </button>
      </div>
    );
  },
}));

function renderNewRecipePage(route = "/recipes/new") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/recipes/new" element={<NewRecipePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("NewRecipePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateRecipe.mockResolvedValue(mockRecipe);
  });

  it("renders the page and passes empty default values to RecipeForm", () => {
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
      submitLabel: "Recept mentése",
    });

    expect(screen.getByTestId("initial-title")).toHaveTextContent("");
    expect(screen.getByTestId("initial-ingredients")).toHaveTextContent("");
    expect(screen.getByTestId("initial-instructions")).toHaveTextContent("");
    expect(screen.getByTestId("initial-cooking-time")).toHaveTextContent("0");
    expect(screen.getByTestId("initial-servings")).toHaveTextContent("1");
  });

  it("creates a new recipe and navigates to the detail page", async () => {
    const user = userEvent.setup();

    mockCreateRecipe.mockResolvedValue({
      ...mockRecipe,
      id: 7,
    });

    renderNewRecipePage();

    await user.click(screen.getByRole("button", { name: "Recept mentése" }));

    await waitFor(() => {
      expect(mockCreateRecipe).toHaveBeenCalledWith({
        title: "",
        ingredients: "",
        instructions: "",
        cooking_time: 0,
        servings: 1,
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recipes/7");
  });

  it("does not navigate away when recipe creation fails", async () => {
    const user = userEvent.setup();

    mockCreateRecipe.mockRejectedValue(new Error("Create failed"));

    renderNewRecipePage();

    await user.click(screen.getByRole("button", { name: "Recept mentése" }));

    await waitFor(() => {
      expect(mockCreateRecipe).toHaveBeenCalledWith({
        title: "",
        ingredients: "",
        instructions: "",
        cooking_time: 0,
        servings: 1,
      });
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
