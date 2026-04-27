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
  image: null,
  image_url: null,
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
    image: null,
    image_url: null,
    created_at: "2026-03-18T12:00:00Z",
  },
];
