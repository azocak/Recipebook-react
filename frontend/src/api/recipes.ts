import { apiRequest } from "./client";
import type {
  HttpMethod,
  PaginatedResponse,
  Recipe,
  RecipeImageFormData,
  RecipeListParams,
} from "./types";

function request<T>(url: string, method: HttpMethod) {
  return apiRequest<T>(url, { method });
}

function buildRecipeListQuery(params: RecipeListParams = {}): string {
  const searchParams = new URLSearchParams();

  const search = params.search?.trim();

  if (search) {
    searchParams.set("search", search);
  }

  if (params.ordering) {
    searchParams.set("ordering", params.ordering);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

function buildRecipeFormData(data: RecipeImageFormData): FormData {
  const formData = new FormData();

  formData.append("title", data.title.trim());
  formData.append("ingredients", data.ingredients.trim());
  formData.append("instructions", data.instructions.trim());
  formData.append("cooking_time", String(data.cooking_time));
  formData.append("servings", String(data.servings));

  if (data.image) {
    formData.append("image", data.image);
  }

  if (data.remove_image) {
    formData.append("remove_image", "true");
  }

  return formData;
}

function sendRecipeForm<T>(
  url: string,
  method: "POST" | "PATCH",
  data: RecipeImageFormData,
) {
  return apiRequest<T>(url, {
    method,
    body: buildRecipeFormData(data),
  });
}

export const recipesApi = {
  getAll(params: RecipeListParams = {}) {
    return request<PaginatedResponse<Recipe>>(
      `/recipes/${buildRecipeListQuery(params)}`,
      "GET",
    );
  },

  getById(id: number) {
    return request<Recipe>(`/recipes/${id}/`, "GET");
  },

  create(data: RecipeImageFormData) {
    return sendRecipeForm<Recipe>("/recipes/", "POST", data);
  },

  update(id: number, data: RecipeImageFormData) {
    return sendRecipeForm<Recipe>(`/recipes/${id}/`, "PATCH", data);
  },

  remove(id: number) {
    return request<void>(`/recipes/${id}/`, "DELETE");
  },
};
