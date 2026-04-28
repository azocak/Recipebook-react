import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { recipesApi } from "../../api/recipes";
import type { RecipeImageFormData } from "../../api/types";
import { queryKeys } from "../../lib/queryKeys";
import { mockRecipe } from "../../test/recipe-fixtures";
import {
  createTestQueryClient,
  renderWithQueryClient,
} from "../../test/queryClient";
import { useCreateRecipeMutation } from "./useCreateRecipeMutation";
import { toast } from "sonner";
import { ApiError } from "../../api/errors";

vi.mock("../../api/recipes", () => ({
  recipesApi: {
    create: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockCreateRecipe = vi.mocked(recipesApi.create);
const mockToastSuccess = vi.mocked(toast.success);
const mockToastError = vi.mocked(toast.error);

const createData: RecipeImageFormData = {
  title: "Új palacsinta",
  ingredients: "Liszt, tojás, tej, cukor",
  instructions: "Keverd össze, majd süsd ki.",
  cooking_time: 25,
  servings: 4,
};

function CreateRecipeMutationTestComponent({
  data = createData,
}: {
  data?: RecipeImageFormData;
}) {
  const mutation = useCreateRecipeMutation();

  return (
    <div>
      <button type="button" onClick={() => mutation.mutate(data)}>
        Létrehozás
      </button>

      {mutation.isPending ? <p>Létrehozás folyamatban...</p> : null}
      {mutation.isSuccess ? <p>Sikeres létrehozás</p> : null}
      {mutation.isError ? <p>Létrehozási hiba</p> : null}
    </div>
  );
}

describe("useCreateRecipeMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a recipe successfully", async () => {
    const user = userEvent.setup();

    const createdRecipe = {
      ...mockRecipe,
      id: 10,
      title: "Új palacsinta",
    };

    mockCreateRecipe.mockResolvedValue(createdRecipe);

    renderWithQueryClient(<CreateRecipeMutationTestComponent />);

    await user.click(screen.getByRole("button", { name: "Létrehozás" }));

    expect(await screen.findByText("Sikeres létrehozás")).toBeInTheDocument();

    expect(mockCreateRecipe).toHaveBeenCalledWith(createData);
    expect(mockCreateRecipe).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Recept sikeresen létrehozva.",
    );
  });

  it("stores the created recipe in the detail cache", async () => {
    const user = userEvent.setup();

    const createdRecipe = {
      ...mockRecipe,
      id: 10,
      title: "Új palacsinta",
    };

    mockCreateRecipe.mockResolvedValue(createdRecipe);

    const queryClient = createTestQueryClient();

    renderWithQueryClient(<CreateRecipeMutationTestComponent />, queryClient);

    await user.click(screen.getByRole("button", { name: "Létrehozás" }));

    expect(await screen.findByText("Sikeres létrehozás")).toBeInTheDocument();

    expect(
      queryClient.getQueryData(queryKeys.recipes.detail(createdRecipe.id)),
    ).toEqual(createdRecipe);
  });

  it("invalidates recipe list queries after a successful create", async () => {
    const user = userEvent.setup();

    const createdRecipe = {
      ...mockRecipe,
      id: 10,
      title: "Új palacsinta",
    };

    mockCreateRecipe.mockResolvedValue(createdRecipe);

    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    renderWithQueryClient(<CreateRecipeMutationTestComponent />, queryClient);

    await user.click(screen.getByRole("button", { name: "Létrehozás" }));

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.recipes.lists(),
      });
    });
  });

  it("exposes the error state when creating fails", async () => {
    const user = userEvent.setup();

    mockCreateRecipe.mockRejectedValue(new Error("Create failed"));

    renderWithQueryClient(<CreateRecipeMutationTestComponent />);

    await user.click(screen.getByRole("button", { name: "Létrehozás" }));

    expect(await screen.findByText("Létrehozási hiba")).toBeInTheDocument();
    expect(mockCreateRecipe).toHaveBeenCalledWith(createData);
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it("shows an error toast when creating fails with a non-validation error", async () => {
    const user = userEvent.setup();

    mockCreateRecipe.mockRejectedValue(
      new ApiError("Server error", 500, {
        detail: "Szerver hiba.",
      }),
    );

    renderWithQueryClient(<CreateRecipeMutationTestComponent />);

    await user.click(screen.getByRole("button", { name: "Létrehozás" }));

    expect(await screen.findByText("Létrehozási hiba")).toBeInTheDocument();
    expect(mockCreateRecipe).toHaveBeenCalledWith(createData);

    expect(mockToastError).toHaveBeenCalledWith("Szerver hiba.");
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });
});
