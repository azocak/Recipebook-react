import {
  getRecipeFormDefaultValues,
  RECIPE_FORM_DEFAULT_VALUES,
} from "./getRecipeFormDefaultValues";

describe("getRecipeFormDefaultValues", () => {
  it("in create mode, it returns the default values", () => {
    expect(getRecipeFormDefaultValues()).toEqual(RECIPE_FORM_DEFAULT_VALUES);
  });

  it("in edit mode, it overwrites the normal fields based on the initialValues", () => {
    expect(
      getRecipeFormDefaultValues({
        title: "Palacsinta",
        ingredients: "liszt, tojás, tej",
        instructions: "Keverd össze és süsd ki.",
        cooking_time: 30,
        servings: 4,
      }),
    ).toEqual({
      ...RECIPE_FORM_DEFAULT_VALUES,
      title: "Palacsinta",
      ingredients: "liszt, tojás, tej",
      instructions: "Keverd össze és süsd ki.",
      cooking_time: 30,
      servings: 4,
      image: undefined,
      remove_image: false,
    });
  });

  it("does not take the image value from initialValues", () => {
    const file = new File(["image"], "recipe.png", { type: "image/png" });

    const result = getRecipeFormDefaultValues({
      image: file,
    });

    expect(result.image).toBeUndefined();
  });

  it("does not adopt the `remove_image` value from initialValues", () => {
    const result = getRecipeFormDefaultValues({
      remove_image: true,
    });

    expect(result.remove_image).toBe(false);
  });
});
