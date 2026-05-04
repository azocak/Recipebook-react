export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Recipe {
  id: number;
  owner: number;
  owner_username: string;
  title: string;
  ingredients: string;
  instructions: string;
  cooking_time: number;
  servings: number;
  image: string | null;
  image_url: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type RecipeOrdering = "created_at" | "-created_at" | "title" | "-title";

export interface RecipeListParams {
  search?: string;
  ordering?: RecipeOrdering;
  page?: number;
}

export interface RecipeFormData {
  title: string;
  ingredients: string;
  instructions: string;
  cooking_time: number;
  servings: number;
}

export interface RecipeImageFormData extends RecipeFormData {
  image?: File | null;
  remove_image?: boolean;
}
