import type { Recipe } from "./types";

const API_URL = "http://127.0.0.1:8000/api/recipes/";

export async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }

  return response.json();
}
