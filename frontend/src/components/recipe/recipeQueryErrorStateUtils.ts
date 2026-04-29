import type { UseRecipeQueryStatus } from "../../hooks/queries/useRecipeQuery";

export type RecipeQueryErrorStatus = Extract<
  UseRecipeQueryStatus,
  "invalid-id" | "forbidden" | "not-found" | "error"
>;

export type RecipeQueryErrorMode = "detail" | "edit";

const recipeQueryErrorStatuses: readonly RecipeQueryErrorStatus[] = [
  "invalid-id",
  "forbidden",
  "not-found",
  "error",
];

export function isRecipeQueryErrorStatus(
  status: UseRecipeQueryStatus,
): status is RecipeQueryErrorStatus {
  return recipeQueryErrorStatuses.includes(status as RecipeQueryErrorStatus);
}

export function getForbiddenTitle(mode: RecipeQueryErrorMode) {
  if (mode === "edit") {
    return "Nem módosíthatod ezt a receptet.";
  }

  return "Nem tekintheted meg ezt a receptet.";
}
