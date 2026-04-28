import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { recipesApi } from "../../api/recipes";
import type { RecipeImageFormData } from "../../api/types";
import { mockRecipe } from "../../test/recipe-fixtures";
import {
  createTestQueryClient,
  renderWithQueryClient,
} from "../../test/queryClient";
import { queryKeys } from "../../lib/queryKeys";
import { useUpdateRecipeMutation } from "./useUpdateRecipeMutation";
import { toast } from "sonner";
import { ApiError } from "../../api/errors";

vi.mock("../../api/recipes", () => ({
  recipesApi: {
    update: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUpdateRecipe = vi.mocked(recipesApi.update);
const mockToastSuccess = vi.mocked(toast.success);
const mockToastError = vi.mocked(toast.error);

const updateData: RecipeImageFormData = {
  title: "Frissített palacsinta",
  ingredients: "Liszt, tojás, tej, cukor",
  instructions: "Keverd össze, majd süsd ki.",
  cooking_time: 25,
  servings: 4,
};

function UpdateRecipeMutationTestComponent({
  recipeId = 1,
  data = updateData,
}: {
  recipeId?: number;
  data?: RecipeImageFormData;
}) {
  const mutation = useUpdateRecipeMutation();

  return (
    <div>
      <button type="button" onClick={() => mutation.mutate({ recipeId, data })}>
        Mentés
      </button>

      {mutation.isPending ? <p>Mentés folyamatban...</p> : null}
      {mutation.isSuccess ? <p>Sikeres mentés</p> : null}
      {mutation.isError ? <p>Mentési hiba</p> : null}
    </div>
  );
}

describe("useUpdateRecipeMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a recipe successfully", async () => {
    const user = userEvent.setup();

    const updatedRecipe = {
      ...mockRecipe,
      title: "Frissített palacsinta",
    };

    mockUpdateRecipe.mockResolvedValue(updatedRecipe);

    renderWithQueryClient(<UpdateRecipeMutationTestComponent />);

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(await screen.findByText("Sikeres mentés")).toBeInTheDocument();

    expect(mockUpdateRecipe).toHaveBeenCalledWith(1, updateData);
    expect(mockUpdateRecipe).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Recept sikeresen módosítva.",
    );
  });

  it("stores the updated recipe in the detail cache", async () => {
    const user = userEvent.setup();

    const updatedRecipe = {
      ...mockRecipe,
      title: "Frissített palacsinta",
    };

    mockUpdateRecipe.mockResolvedValue(updatedRecipe);

    const queryClient = createTestQueryClient();

    renderWithQueryClient(<UpdateRecipeMutationTestComponent />, queryClient);

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(await screen.findByText("Sikeres mentés")).toBeInTheDocument();

    expect(
      queryClient.getQueryData(queryKeys.recipes.detail(updatedRecipe.id)),
    ).toEqual(updatedRecipe);
  });

  it("invalidates recipe list queries after a successful update", async () => {
    const user = userEvent.setup();

    const updatedRecipe = {
      ...mockRecipe,
      title: "Frissített palacsinta",
    };

    mockUpdateRecipe.mockResolvedValue(updatedRecipe);

    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderWithQueryClient(<UpdateRecipeMutationTestComponent />, queryClient);

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.recipes.lists(),
      });
    });
  });

  it("exposes the error state when updating fails", async () => {
    const user = userEvent.setup();

    mockUpdateRecipe.mockRejectedValue(new Error("Update failed"));

    renderWithQueryClient(<UpdateRecipeMutationTestComponent />);

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(await screen.findByText("Mentési hiba")).toBeInTheDocument();
    expect(mockUpdateRecipe).toHaveBeenCalledWith(1, updateData);
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it("shows an error toast when updating fails with a non-validation error", async () => {
    const user = userEvent.setup();

    mockUpdateRecipe.mockRejectedValue(
      new ApiError("Server error", 500, {
        detail: "Szerver hiba.",
      }),
    );

    renderWithQueryClient(<UpdateRecipeMutationTestComponent />);

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(await screen.findByText("Mentési hiba")).toBeInTheDocument();
    expect(mockUpdateRecipe).toHaveBeenCalledWith(1, updateData);

    expect(mockToastError).toHaveBeenCalledWith("Szerver hiba.");
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });
});
