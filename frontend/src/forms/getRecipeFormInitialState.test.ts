import { describe, expect, it } from "vitest";
import {
  EMPTY_RECIPE_FORM_STATE,
  getRecipeFormInitialState,
} from "./getRecipeFormInitialState";

describe("getRecipeFormInitialState", () => {
  it("converts RecipeFormData values to a string-based form state", () => {
    expect(
      getRecipeFormInitialState({
        title: "Palacsinta",
        ingredients: "liszt, tojás, tej",
        instructions: "Keverd össze és süsd ki.",
        cooking_time: 30,
        servings: 4,
      }),
    ).toEqual({
      title: "Palacsinta",
      ingredients: "liszt, tojás, tej",
      instructions: "Keverd össze és süsd ki.",
      cooking_time: "30",
      servings: "4",
    });
  });

  it("the empty initial state provides a stable foundation", () => {
    expect(EMPTY_RECIPE_FORM_STATE).toEqual({
      title: "",
      ingredients: "",
      instructions: "",
      cooking_time: "",
      servings: "1",
    });
  });

  it("retains the text fields in initialValues without resetting them", () => {
    expect(
      getRecipeFormInitialState({
        title: "",
        ingredients: "",
        instructions: "",
        cooking_time: 0,
        servings: 1,
      }),
    ).toEqual({
      title: "",
      ingredients: "",
      instructions: "",
      cooking_time: "0",
      servings: "1",
    });
  });
});
