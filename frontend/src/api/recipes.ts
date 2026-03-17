import { apiRequest } from "./client";
import type { Recipe } from "./types";

export const recipesApi = {
  getAll() {
    return apiRequest<Recipe[]>("/recipes", {
      method: "GET",
    });
  },
};
