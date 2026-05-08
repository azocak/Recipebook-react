import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { ApiError } from "../api/errors";
import { recipesApi } from "../api/recipes";
import type { Recipe } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "../lib/queryKeys";
import { setAuthenticatedUser, setGuestAuth } from "../test/auth-fixtures";
import { createTestQueryClient } from "../test/queryClient";
import { mockRecipe } from "../test/recipe-fixtures";
import RecipeCard from "./RecipeCard";

const mockNavigate = vi.fn();

const ownerUser = { id: 1, username: "anna", email: "anna@gmail.com" };
const otherUser = { id: 2, username: "bela", email: "bela@gmail.com" };

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
  useAuth: vi.fn(),
}));

vi.mock("../api/recipes", () => ({
  recipesApi: {
    remove: vi.fn(),
  },
}));

const mockUseAuth = vi.mocked(useAuth);
const mockRemoveRecipe = vi.mocked(recipesApi.remove);

function createRecipe(overrides?: Partial<Recipe>): Recipe {
  return {
    ...mockRecipe,
    image: null,
    image_url: null,
    ...overrides,
  };
}

function setAuthGuest() {
  setGuestAuth(mockUseAuth);
}

function setAuthUser(user = ownerUser) {
  setAuthenticatedUser(mockUseAuth, user);
}

function renderRecipeCard(
  recipe: Recipe = createRecipe(),
  options?: {
    onDeleteSuccess?: (deletedRecipeId: number) => void;
    queryClient?: ReturnType<typeof createTestQueryClient>;
  },
) {
  const queryClient = options?.queryClient ?? createTestQueryClient();

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecipeCard
            recipe={recipe}
            onDeleteSuccess={options?.onDeleteSuccess}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  };
}

function getEditButton() {
  return screen.queryByRole("button", {
    name: `A(z) ${mockRecipe.title} recept szerkesztése`,
  });
}

function getDeleteButton() {
  return screen.queryByRole("button", {
    name: `A(z) ${mockRecipe.title} recept törlése`,
  });
}

function getEditButtonOrThrow() {
  return screen.getByRole("button", {
    name: `A(z) ${mockRecipe.title} recept szerkesztése`,
  });
}

function getDeleteButtonOrThrow() {
  return screen.getByRole("button", {
    name: `A(z) ${mockRecipe.title} recept törlése`,
  });
}

describe("RecipeCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setAuthGuest();
    mockRemoveRecipe.mockResolvedValue(undefined);
  });

  it("renders the recipe title, owner, metadata and detail links", () => {
    renderRecipeCard();

    expect(
      screen.getByRole("heading", { name: "Palacsinta" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/20 perc/i)).toBeInTheDocument();
    expect(screen.getByText(/4 adag/i)).toBeInTheDocument();
    expect(screen.getByText(/Készítette:/i)).toBeInTheDocument();
    expect(screen.getByText(/anna/i)).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "A(z) Palacsinta recept képének megnyitása",
      }),
    ).toHaveAttribute("href", "/recipes/1");

    expect(
      screen.getByRole("link", { name: "A(z) Palacsinta recept megnyitása" }),
    ).toHaveAttribute("href", "/recipes/1");
  });

  it("renders the placeholder block when the recipe has no image", () => {
    renderRecipeCard(
      createRecipe({
        image: null,
        image_url: null,
      }),
    );

    expect(
      screen.getByRole("img", { name: "Nincs feltöltött kép" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("img", { name: "Palacsinta recept képe" }),
    ).not.toBeInTheDocument();
  });

  it("renders the uploaded image when image_url is available", () => {
    const recipeWithImage = createRecipe({
      image: "recipes/palacsinta.jpg",
      image_url: "http://localhost:8000/media/recipes/palacsinta.jpg",
    });

    renderRecipeCard(recipeWithImage);

    expect(
      screen.getByRole("img", { name: "Palacsinta recept képe" }),
    ).toHaveAttribute("src", recipeWithImage.image_url);

    expect(
      screen.queryByRole("img", { name: "Nincs feltöltött kép" }),
    ).not.toBeInTheDocument();
  });

  it("does not show edit and delete buttons for guests", () => {
    setAuthGuest();

    renderRecipeCard();

    expect(getEditButton()).not.toBeInTheDocument();
    expect(getDeleteButton()).not.toBeInTheDocument();
  });

  it("does not show edit and delete buttons for an authenticated non-owner user", () => {
    setAuthUser(otherUser);

    renderRecipeCard();

    expect(getEditButton()).not.toBeInTheDocument();
    expect(getDeleteButton()).not.toBeInTheDocument();
  });

  it("shows edit and delete buttons for the owner", () => {
    setAuthUser(ownerUser);

    renderRecipeCard();

    expect(getEditButtonOrThrow()).toBeInTheDocument();
    expect(getDeleteButtonOrThrow()).toBeInTheDocument();
  });

  it("navigates to the edit page when the owner clicks the edit button", async () => {
    const user = userEvent.setup();

    setAuthUser(ownerUser);

    renderRecipeCard();

    await user.click(getEditButtonOrThrow());

    expect(mockNavigate).toHaveBeenCalledWith("/recipes/1/edit");
  });

  it("opens the delete confirmation dialog when the owner clicks the delete button", async () => {
    const user = userEvent.setup();

    setAuthUser(ownerUser);

    renderRecipeCard();

    await user.click(getDeleteButtonOrThrow());

    const dialog = screen.getByRole("dialog", { name: "Recept törlése" });

    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Biztosan törölni szeretnéd");
    expect(dialog).toHaveTextContent(mockRecipe.title);
  });

  it("does not delete the recipe when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    const onDeleteSuccess = vi.fn();

    setAuthUser(ownerUser);

    renderRecipeCard(createRecipe(), { onDeleteSuccess });

    await user.click(getDeleteButtonOrThrow());
    await user.click(screen.getByRole("button", { name: "Mégse" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockRemoveRecipe).not.toHaveBeenCalled();
    expect(onDeleteSuccess).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("deletes the recipe and calls onDeleteSuccess when deletion is confirmed", async () => {
    const user = userEvent.setup();
    const onDeleteSuccess = vi.fn();

    setAuthUser(ownerUser);

    renderRecipeCard(createRecipe(), { onDeleteSuccess });

    await user.click(getDeleteButtonOrThrow());
    await user.click(screen.getByRole("button", { name: "Törlés" }));

    await waitFor(() => {
      expect(mockRemoveRecipe).toHaveBeenCalledWith(1);
    });
    expect(onDeleteSuccess).toHaveBeenCalledWith(1);
    expect(mockNavigate).not.toHaveBeenCalledWith("/recipes");
  });

  it("removes the deleted recipe detail cache after successful deletion", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    queryClient.setQueryData(queryKeys.recipes.detail(1), mockRecipe);

    setAuthUser(ownerUser);

    renderRecipeCard(createRecipe(), { queryClient });

    await user.click(getDeleteButtonOrThrow());
    await user.click(screen.getByRole("button", { name: "Törlés" }));

    await waitFor(() => {
      expect(mockRemoveRecipe).toHaveBeenCalledWith(1);
    });
    expect(
      queryClient.getQueryData(queryKeys.recipes.detail(1)),
    ).toBeUndefined();
  });

  it("navigates back to /recipes after successful deletion when no callback is provided", async () => {
    const user = userEvent.setup();

    setAuthUser(ownerUser);

    renderRecipeCard();

    await user.click(getDeleteButtonOrThrow());
    await user.click(screen.getByRole("button", { name: "Törlés" }));

    await waitFor(() => {
      expect(mockRemoveRecipe).toHaveBeenCalledWith(1);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/recipes");
  });

  it("shows the delete error from the mutation", async () => {
    const user = userEvent.setup();

    mockRemoveRecipe.mockRejectedValue(
      new ApiError("Server error", 500, {
        detail: "Nem sikerült törölni a receptet.",
      }),
    );

    setAuthUser(ownerUser);

    renderRecipeCard();

    await user.click(getDeleteButtonOrThrow());
    await user.click(screen.getByRole("button", { name: "Törlés" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Nem sikerült törölni a receptet.",
    );
  });

  it("disables the owner action buttons while deletion is in progress", async () => {
    const user = userEvent.setup();

    mockRemoveRecipe.mockReturnValue(new Promise<void>(() => {}));

    setAuthUser(ownerUser);

    renderRecipeCard();

    await user.click(getDeleteButtonOrThrow());
    await user.click(screen.getByRole("button", { name: "Törlés" }));

    expect(await screen.findByText("Törlés...")).toBeInTheDocument();
    expect(getEditButtonOrThrow()).toBeDisabled();
    expect(getDeleteButtonOrThrow()).toBeDisabled();
  });
});
