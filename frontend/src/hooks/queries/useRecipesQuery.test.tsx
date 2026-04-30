import { screen } from "@testing-library/react";

import { recipesApi } from "../../api/recipes";
import { mockRecipes } from "../../test/recipe-fixtures";
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

  return <p>{data?.length ?? 0} recept betöltve</p>;
}

describe("useRecipesQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads recipes successfully", async () => {
    mockGetAll.mockResolvedValue(mockRecipes);

    renderWithQueryClient(<RecipesQueryTestComponent />);

    expect(await screen.findByText("2 recept betöltve")).toBeInTheDocument();
    expect(mockGetAll).toHaveBeenCalledTimes(1);
  });

  it("exposes the error state when loading recipes fails", async () => {
    mockGetAll.mockRejectedValue(new Error("Network error"));

    renderWithQueryClient(<RecipesQueryTestComponent />);

    expect(await screen.findByText("Hiba történt.")).toBeInTheDocument();
    expect(mockGetAll).toHaveBeenCalledTimes(1);
  });
});
