import { apiRequest } from "./client";
import type { HttpMethod, Recipe, RecipeFormData } from "./types";

function request<T>(url: string, method: HttpMethod, data?: RecipeFormData) {
  return apiRequest<T>(url, {
    method,
    ...(data && { body: JSON.stringify(data) }),
  });
}

export const recipesApi = {
  getAll() {
    return request<Recipe[]>("/recipes/", "GET");
  },

  getById(id: number) {
    return request<Recipe>(`/recipes/${id}`, "GET");
  },

  create(data: RecipeFormData) {
    return request<Recipe>("/recipes/", "POST", data);
  },

  update(id: number, data: RecipeFormData) {
    return request<Recipe>(`/recipes/${id}`, "PUT", data);
  },

  remove(id: number) {
    return request<void>(`/recipes/${id}`, "DELETE");
  },
};
