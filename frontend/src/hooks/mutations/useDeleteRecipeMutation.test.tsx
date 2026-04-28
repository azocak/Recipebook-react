import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { recipesApi } from "../../api/recipes";
import { queryKeys } from "../../lib/queryKeys";
import {
  createTestQueryClient,
  renderWithQueryClient,
} from "../../test/queryClient";
import { mockRecipe } from "../../test/recipe-fixtures";
import { useDeleteRecipeMutation } from "./useDeleteRecipeMutation";
import { toast } from "sonner";
import { ApiError } from "../../api/errors";

vi.mock("../../api/recipes", () => ({
  recipesApi: {
    remove: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockRemoveRecipe = vi.mocked(recipesApi.remove);
const mockToastSuccess = vi.mocked(toast.success);
const mockToastError = vi.mocked(toast.error);

function DeleteRecipeMutationTestComponent({
  recipeId = 1,
}: {
  recipeId?: number;
}) {
  const mutation = useDeleteRecipeMutation();

  return (
    <div>
      <button type="button" onClick={() => mutation.mutate({ recipeId })}>
        Törlés
      </button>

      {mutation.isPending ? <p>Törlés folyamatban...</p> : null}
      {mutation.isSuccess ? <p>Sikeres törlés</p> : null}
      {mutation.isError ? <p>Törlési hiba</p> : null}
    </div>
  );
}

describe("useDeleteRecipeMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a recipe successfully", async () => {
    const user = userEvent.setup();

    mockRemoveRecipe.mockResolvedValue(undefined);

    renderWithQueryClient(<DeleteRecipeMutationTestComponent />);

    await user.click(screen.getByRole("button", { name: "Törlés" }));

    expect(await screen.findByText("Sikeres törlés")).toBeInTheDocument();

    expect(mockRemoveRecipe).toHaveBeenCalledWith(1);
    expect(mockRemoveRecipe).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith("Recept sikeresen törölve.");
  });

  it("removes the deleted recipe detail query from the cache", async () => {
    const user = userEvent.setup();

    mockRemoveRecipe.mockResolvedValue(undefined);

    const queryClient = createTestQueryClient();

    queryClient.setQueryData(queryKeys.recipes.detail(1), mockRecipe);

    expect(queryClient.getQueryData(queryKeys.recipes.detail(1))).toEqual(
      mockRecipe,
    );

    renderWithQueryClient(<DeleteRecipeMutationTestComponent />, queryClient);

    await user.click(screen.getByRole("button", { name: "Törlés" }));

    expect(await screen.findByText("Sikeres törlés")).toBeInTheDocument();

    expect(
      queryClient.getQueryData(queryKeys.recipes.detail(1)),
    ).toBeUndefined();
  });

  it("invalidates recipe list queries after a successful delete", async () => {
    const user = userEvent.setup();

    mockRemoveRecipe.mockResolvedValue(undefined);

    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderWithQueryClient(<DeleteRecipeMutationTestComponent />, queryClient);

    await user.click(screen.getByRole("button", { name: "Törlés" }));

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.recipes.lists(),
      });
    });
  });

  it("exposes the error state when deleting fails", async () => {
    const user = userEvent.setup();

    mockRemoveRecipe.mockRejectedValue(new Error("Delete failed"));

    renderWithQueryClient(<DeleteRecipeMutationTestComponent />);

    await user.click(screen.getByRole("button", { name: "Törlés" }));

    expect(await screen.findByText("Törlési hiba")).toBeInTheDocument();
    expect(mockRemoveRecipe).toHaveBeenCalledWith(1);
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it("shows an error toast when deleting fails", async () => {
    const user = userEvent.setup();

    mockRemoveRecipe.mockRejectedValue(
      new ApiError("Server error", 500, {
        detail: "Nem sikerült törölni a receptet.",
      }),
    );

    renderWithQueryClient(<DeleteRecipeMutationTestComponent />);

    await user.click(screen.getByRole("button", { name: "Törlés" }));

    expect(await screen.findByText("Törlési hiba")).toBeInTheDocument();
    expect(mockRemoveRecipe).toHaveBeenCalledWith(1);

    expect(mockToastError).toHaveBeenCalledWith(
      "Nem sikerült törölni a receptet.",
    );
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });
});
