import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { useDeleteRecipe } from "./useDeleteRecipe";

const mockRemove = vi.fn();
const mockGetApiErrorMessage = vi.fn();

vi.mock("../api/recipes", () => ({
  recipesApi: {
    remove: (recipeId: number) => mockRemove(recipeId),
  },
}));

vi.mock("../utils/getApiErrorMessage", () => ({
  getApiErrorMessage: (error: unknown, fallbackMessage: string) =>
    mockGetApiErrorMessage(error, fallbackMessage),
}));

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function UseDeleteRecipeHarness({ recipeId = 1 }: { recipeId?: number }) {
  const { deleting, deleteError, deleteRecipe } = useDeleteRecipe();
  const [caughtError, setCaughtError] = useState("");

  return (
    <div>
      <div data-testid="deleting">{String(deleting)}</div>
      <div data-testid="delete-error">{deleteError ?? ""}</div>
      <div data-testid="caught-error">{caughtError}</div>

      <button
        type="button"
        onClick={() => {
          void deleteRecipe(recipeId).catch((error: unknown) => {
            if (error instanceof Error) {
              setCaughtError(error.message);
            } else {
              setCaughtError("Ismeretlen hiba");
            }
          });
        }}
      >
        Recept törlése
      </button>
    </div>
  );
}

describe("useDeleteRecipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiErrorMessage.mockReturnValue("Nem sikerült törölni a receptet.");
  });

  it("starts with an idle state", () => {
    render(<UseDeleteRecipeHarness />);

    expect(screen.getByTestId("deleting")).toHaveTextContent("false");
    expect(screen.getByTestId("delete-error")).toHaveTextContent("");
    expect(screen.getByTestId("caught-error")).toHaveTextContent("");
  });

  it("calls recipesApi.remove and stays clean on successful deletion", async () => {
    const user = userEvent.setup();
    mockRemove.mockResolvedValue(undefined);

    render(<UseDeleteRecipeHarness recipeId={7} />);

    await user.click(screen.getByRole("button", { name: "Recept törlése" }));

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith(7);
    });

    expect(screen.getByTestId("deleting")).toHaveTextContent("false");
    expect(screen.getByTestId("delete-error")).toHaveTextContent("");
    expect(screen.getByTestId("caught-error")).toHaveTextContent("");
  });

  it("sets deleting=true while the deletion request is in flight", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<void>();

    mockRemove.mockReturnValue(deferred.promise);

    render(<UseDeleteRecipeHarness />);

    await user.click(screen.getByRole("button", { name: "Recept törlése" }));

    await waitFor(() => {
      expect(screen.getByTestId("deleting")).toHaveTextContent("true");
    });

    deferred.resolve();

    await waitFor(() => {
      expect(screen.getByTestId("deleting")).toHaveTextContent("false");
    });
  });

  it("maps the API error message, stores it, and rethrows the original error", async () => {
    const user = userEvent.setup();
    const deleteError = new Error("Delete failed");

    mockRemove.mockRejectedValue(deleteError);
    mockGetApiErrorMessage.mockReturnValue("Nem sikerült törölni a receptet.");

    render(<UseDeleteRecipeHarness recipeId={3} />);

    await user.click(screen.getByRole("button", { name: "Recept törlése" }));

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith(3);
    });

    await waitFor(() => {
      expect(mockGetApiErrorMessage).toHaveBeenCalledWith(
        deleteError,
        "Nem sikerült törölni a receptet.",
      );
    });

    expect(screen.getByTestId("delete-error")).toHaveTextContent(
      "Nem sikerült törölni a receptet.",
    );
    expect(screen.getByTestId("caught-error")).toHaveTextContent(
      "Delete failed",
    );
    expect(screen.getByTestId("deleting")).toHaveTextContent("false");
  });
});
