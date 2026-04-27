import { screen } from "@testing-library/react";

import { ApiError } from "../../api/errors";
import { recipesApi } from "../../api/recipes";
import { mockRecipe } from "../../test/recipe-fixtures";
import { renderWithQueryClient } from "../../test/queryClient";
import { useRecipeQuery } from "./useRecipeQuery";

vi.mock("../../api/recipes", () => ({
  recipesApi: {
    getById: vi.fn(),
  },
}));

const mockGetById = vi.mocked(recipesApi.getById);

function RecipeQueryTestComponent({ id }: { id?: string }) {
  const { recipe, status, errorMessage } = useRecipeQuery(id);

  if (status === "loading") {
    return <p>Betöltés...</p>;
  }

  if (status === "success") {
    return <p>{recipe?.title}</p>;
  }

  return (
    <p>
      {status}
      {errorMessage ? `: ${errorMessage}` : ""}
    </p>
  );
}

describe("useRecipeQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a recipe successfully", async () => {
    mockGetById.mockResolvedValue(mockRecipe);

    renderWithQueryClient(<RecipeQueryTestComponent id="1" />);

    expect(await screen.findByText("Palacsinta")).toBeInTheDocument();
    expect(mockGetById).toHaveBeenCalledWith(1);
    expect(mockGetById).toHaveBeenCalledTimes(1);
  });

  it("returns invalid-id status without calling the API for an invalid id", () => {
    renderWithQueryClient(<RecipeQueryTestComponent id="abc" />);

    expect(
      screen.getByText("invalid-id: Érvénytelen azonosító."),
    ).toBeInTheDocument();

    expect(mockGetById).not.toHaveBeenCalled();
  });

  it("returns not-found status for 404 API errors", async () => {
    mockGetById.mockRejectedValue(new ApiError("Not found", 404));

    renderWithQueryClient(<RecipeQueryTestComponent id="999" />);

    expect(await screen.findByText("not-found")).toBeInTheDocument();
    expect(mockGetById).toHaveBeenCalledWith(999);
  });

  it("returns forbidden status for 403 API errors", async () => {
    mockGetById.mockRejectedValue(new ApiError("Forbidden", 403));

    renderWithQueryClient(<RecipeQueryTestComponent id="1" />);

    expect(
      await screen.findByText(
        "forbidden: Nincs jogosultságod a recept megtekintéséhez.",
      ),
    ).toBeInTheDocument();

    expect(mockGetById).toHaveBeenCalledWith(1);
  });

  it("returns generic error status for unexpected API errors", async () => {
    mockGetById.mockRejectedValue(
      new ApiError("Server error", 500, {
        detail: "Szerver hiba.",
      }),
    );

    renderWithQueryClient(<RecipeQueryTestComponent id="1" />);

    expect(
      await screen.findByText(
        (content) =>
          content.includes("error") && content.includes("Szerver hiba."),
      ),
    ).toBeInTheDocument();
    expect(mockGetById).toHaveBeenCalledWith(1);
  });
});
