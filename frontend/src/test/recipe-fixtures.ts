import type { Recipe } from "../api/types";

export const mockRecipe: Recipe = {
  id: 1,
  owner: 1,
  owner_username: "anna",
  title: "Palacsinta",
  ingredients: "Liszt, tej , tojás",
  instructions: "Keverd össze és  süsd ki.",
  cooking_time: 20,
  servings: 4,
  created_at: "2026-03-16T10:00:00Z",
};

export const mockRecipes: Recipe[] = [
  mockRecipe,
  {
    id: 2,
    owner: 2,
    owner_username: "bela",
    title: "Gulyásleves",
    ingredients: "Hús, hagyma, paprika",
    instructions: "Főzd meg lassan.",
    cooking_time: 90,
    servings: 6,
    created_at: "2026-03-18T12:00:00Z",
  },
];

export type MockUseRecipeState = {
  recipe: typeof mockRecipe | null;
  status:
    | "loading"
    | "success"
    | "invalid-id"
    | "not-found"
    | "forbidden"
    | "error";
  errorMessage: string;
  loading: boolean;
  error: string;
  notFound: boolean;
  invalidId: boolean;
  forbidden: boolean;
  genericError: boolean;
};

export function createUseRecipeState(
  overrides?: Partial<MockUseRecipeState>,
): MockUseRecipeState {
  const status = overrides?.status ?? "success";
  const errorMessage = overrides?.errorMessage ?? "";

  return {
    recipe: mockRecipe,
    status,
    errorMessage,
    loading: status === "loading",
    error:
      status === "error" || status === "forbidden" || status === "invalid-id"
        ? errorMessage
        : "",
    notFound: status === "not-found",
    forbidden: status === "forbidden",
    invalidId: status === "invalid-id",
    genericError: status === "error",
    ...overrides,
  };
}

export function setMockUseRecipeState(
  mockUseRecipe: ReturnType<typeof vi.fn>,
  overrides?: Partial<MockUseRecipeState>,
) {
  const state = createUseRecipeState(overrides);
  mockUseRecipe.mockReturnValue(state);
  return state;
}
