import { screen } from "@testing-library/react";

import { recipesApi } from "../../api/recipes";
import {
  createPaginatedRecipes,
  mockRecipes,
} from "../../test/recipe-fixtures";
import { renderWithQueryClient } from "../../test/queryClient";
import { useRecipesQuery } from "./useRecipesQuery";

vi.mock("../../api/recipes", () => ({
  recipesApi: {
    getAll: vi.fn(),
  },
}));

const mockGetAll = vi.mocked(recipesApi.getAll);

function RecipesQueryTestComponent() {
  const { data, isError, isPending } = useRecipesQuery();

  if (isPending) {
    return <p>Betöltés...</p>;
  }

  if (isError) {
    return <p>Hiba történt.</p>;
  }

  return <p>{data?.results.length ?? 0} recept betöltve</p>;
}

describe("useRecipesQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads recipes successfully", async () => {
    mockGetAll.mockResolvedValue(createPaginatedRecipes(mockRecipes));

    renderWithQueryClient(<RecipesQueryTestComponent />);

    expect(await screen.findByText("2 recept betöltve")).toBeInTheDocument();
    expect(mockGetAll).toHaveBeenCalledTimes(1);
  });

  it("passes list params to the recipe API", async () => {
    const params = {
      search: "pala",
      ordering: "title" as const,
      page: 2,
    };

    function ParameterizedRecipesQueryTestComponent() {
      const { data, isPending } = useRecipesQuery(params);

      if (isPending) {
        return <p>Betöltés...</p>;
      }

      return <p>{data?.results.length ?? 0} recept betöltve</p>;
    }

    mockGetAll.mockResolvedValue(createPaginatedRecipes(mockRecipes));

    renderWithQueryClient(<ParameterizedRecipesQueryTestComponent />);

    expect(await screen.findByText("2 recept betöltve")).toBeInTheDocument();
    expect(mockGetAll).toHaveBeenCalledWith(params);
  });
  it("exposes the error state when loading recipes fails", async () => {
    mockGetAll.mockRejectedValue(new Error("Network error"));

    renderWithQueryClient(<RecipesQueryTestComponent />);

    expect(await screen.findByText("Hiba történt.")).toBeInTheDocument();
    expect(mockGetAll).toHaveBeenCalledTimes(1);
  });
});
