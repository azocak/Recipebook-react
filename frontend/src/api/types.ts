export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

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
  created_at: string;
}

export interface RecipeFormData {
  title: string;
  ingredients: string;
  instructions: string;
  cooking_time: number;
  servings: number;
}
