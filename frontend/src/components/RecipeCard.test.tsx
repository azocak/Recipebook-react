import { render, screen, waitFor } from "@testing-library/react";
import RecipeCard from "./RecipeCard";
import type { Recipe } from "../api/types";
import { mockRecipe } from "../test/recipe-fixtures";
import { createAuthState } from "../test/auth-fixtures";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();
const mockUseDeleteRecipe = vi.fn();

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
  useAuth: () => mockUseAuth(),
}));

vi.mock("../hooks/useDeleteRecipe", () => ({
  useDeleteRecipe: () => mockUseDeleteRecipe(),
}));

function createRecipe(overrides?: Partial<Recipe>): Recipe {
  return {
    ...mockRecipe,
    image: null,
    image_url: null,
    ...overrides,
  };
}

function setAuthGuest() {
  mockUseAuth.mockReturnValue(createAuthState());
}

function setAuthUser(user = ownerUser) {
  mockUseAuth.mockReturnValue(
    createAuthState({
      user,
      isAuthenticated: true,
    }),
  );
}

function createDeleteHookState(
  overrides?: Partial<{
    deleteRecipe: ReturnType<typeof vi.fn>;
    deleting: boolean;
    deleteError: string | null;
  }>,
) {
  return {
    deleteRecipe: vi.fn().mockResolvedValue(undefined),
    deleting: false,
    deleteError: null,
    ...overrides,
  };
}

function setDeleteHook(
  overrides?: Partial<{
    deleteRecipe: ReturnType<typeof vi.fn>;
    deleting: boolean;
    deleteError: string | null;
  }>,
) {
  const state = createDeleteHookState(overrides);
  mockUseDeleteRecipe.mockReturnValue(state);
  return state;
}

function renderRecipeCard(
  recipe: Recipe = createRecipe(),
  options?: {
    onDeleteSuccess?: (deleteRecipeId: number) => void;
  },
) {
  return render(
    <MemoryRouter>
      <RecipeCard recipe={recipe} onDeleteSuccess={options?.onDeleteSuccess} />
    </MemoryRouter>,
  );
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
    setDeleteHook();

    vi.spyOn(window, "confirm").mockReturnValue(true);
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

  it("does not delete the recipe when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    const deleteRecipeMock = vi.fn().mockResolvedValue(undefined);
    const onDeleteSuccess = vi.fn();

    vi.spyOn(window, "confirm").mockReturnValue(false);

    setAuthUser(ownerUser);
    setDeleteHook({ deleteRecipe: deleteRecipeMock });

    renderRecipeCard(createRecipe(), { onDeleteSuccess });

    await user.click(getDeleteButtonOrThrow());

    expect(window.confirm).toHaveBeenLastCalledWith(
      "Biztosan törölni szeretnéd ezt a receptet?",
    );
    expect(deleteRecipeMock).not.toHaveBeenCalled();
    expect(onDeleteSuccess).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("calls deleteRecipe and onDeleteSuccess when deletion is confirmed", async () => {
    const user = userEvent.setup();
    const deleteRecipeMock = vi.fn().mockResolvedValue(undefined);
    const onDeleteSuccess = vi.fn();

    setAuthUser(ownerUser);

    mockUseDeleteRecipe.mockReturnValue(
      createDeleteHookState({ deleteRecipe: deleteRecipeMock }),
    );

    renderRecipeCard(createRecipe(), { onDeleteSuccess });

    await user.click(getDeleteButtonOrThrow());

    await waitFor(() => {
      expect(deleteRecipeMock).toHaveBeenCalledWith(1);
    });

    expect(onDeleteSuccess).toHaveBeenCalledWith(1);
    expect(mockNavigate).not.toHaveBeenCalledWith("/recipes");
  });

  it("navigates back to /recipes after successful deletion when no callback is provided", async () => {
    const user = userEvent.setup();
    const deleteRecipeMock = vi.fn().mockResolvedValue(undefined);

    setAuthUser(ownerUser);

    mockUseDeleteRecipe.mockReturnValue(
      createDeleteHookState({
        deleteRecipe: deleteRecipeMock,
      }),
    );

    renderRecipeCard();

    await user.click(getDeleteButtonOrThrow());

    await waitFor(() => {
      expect(deleteRecipeMock).toHaveBeenCalledWith(1);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recipes");
  });

  it("shows the delete error from the hook", () => {
    setAuthUser(ownerUser);

    mockUseDeleteRecipe.mockReturnValue(
      createDeleteHookState({
        deleteError: "Nem sikerült törölni a receptet.",
      }),
    );

    renderRecipeCard();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Nem sikerült törölni a receptet.",
    );
  });

  it("disables the owner action buttons while deletion is in progress", () => {
    setAuthUser(ownerUser);

    mockUseDeleteRecipe.mockReturnValue(
      createDeleteHookState({
        deleting: true,
      }),
    );

    renderRecipeCard();

    expect(getEditButtonOrThrow()).toBeDisabled();
    expect(getDeleteButtonOrThrow()).toBeDisabled();
    expect(screen.getByText("Törlés...")).toBeInTheDocument();
  });
});
