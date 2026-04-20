import { describe, expect, it } from "vitest";
import { recipeSchema } from "./recipe";
import { RECIPE_IMAGE_MAX_SIZE } from "../constants/recipe";

describe("recipeSchema", () => {
  it("trim the text fields", () => {
    const result = recipeSchema.safeParse({
      title: "  Házi palacsinta  ",
      ingredients: "  liszt, tojás, tej  ",
      instructions: "  Keverd össze és süsd ki.  ",
      cooking_time: "30",
      servings: "4",
      image: undefined,
      remove_image: false,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Házi palacsinta");
      expect(result.data.ingredients).toBe("liszt, tojás, tej");
      expect(result.data.instructions).toBe("Keverd össze és süsd ki.");
      expect(result.data.cooking_time).toBe(30);
      expect(result.data.servings).toBe(4);
    }
  });

  it("It throws an error if the title is too short", () => {
    const result = recipeSchema.safeParse({
      title: "ab",
      ingredients: "liszt, tojás, tej",
      instructions: "Keverd össze és süsd ki.",
      cooking_time: 30,
      servings: 4,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issue = result.error.issues.find(
        (entry) => entry.path[0] === "title",
      );

      expect(issue?.message).toBe("A recept neve legalább 3 karakter legyen.");
    }
  });

  it("It throws an error if the ingredients is too short", () => {
    const result = recipeSchema.safeParse({
      title: "Palacsinta",
      ingredients: "rövid",
      instructions: "Keverd össze és süsd ki.",
      cooking_time: 30,
      servings: 4,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issue = result.error.issues.find(
        (entry) => entry.path[0] === "ingredients",
      );

      expect(issue?.message).toBe(
        "A(z) hozzávalók mező legalább 10 karakter legyen.",
      );
    }
  });

  it("Throws an error if cooking_time is not an integer", () => {
    const result = recipeSchema.safeParse({
      title: "Palacsinta",
      ingredients: "liszt, tojás, tej",
      instructions: "Keverd össze és süsd ki.",
      cooking_time: "12.5",
      servings: 4,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issue = result.error.issues.find(
        (entry) => entry.path[0] === "cooking_time",
      );

      expect(issue?.message).toBe(
        "A(z) főzési idő mezőbe egész számot adj meg.",
      );
    }
  });

  it("Throws an error if the number of servings is outside the range", () => {
    const result = recipeSchema.safeParse({
      title: "Palacsinta",
      ingredients: "liszt, tojás, tej",
      instructions: "Keverd össze és süsd ki.",
      cooking_time: 30,
      servings: 21,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issue = result.error.issues.find(
        (entry) => entry.path[0] === "servings",
      );

      expect(issue?.message).toBe("A(z) adagok száma legfeljebb 20 lehet.");
    }
  });

  it("It gives an error if the ingredients and preparation are essentially the same", () => {
    const result = recipeSchema.safeParse({
      title: "Palacsinta",
      ingredients: "  Liszt tojás tej  ",
      instructions: "liszt   tojás   tej",
      cooking_time: 30,
      servings: 4,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issue = result.error.issues.find(
        (entry) => entry.path[0] === "instructions",
      );

      expect(issue?.message).toBe(
        "Az elkészítés nem lehet ugyanaz, mint a hozzávalók.",
      );
    }
  });

  it("accepts the supported image file", () => {
    const file = new File(["image"], "recipe.png", { type: "image/png" });

    const result = recipeSchema.safeParse({
      title: "Palacsinta",
      ingredients: "liszt, tojás, tej",
      instructions: "Keverd össze és süsd ki.",
      cooking_time: 30,
      servings: 4,
      image: file,
    });

    expect(result.success).toBe(true);
  });

  it("displays an error for an unsupported image type", () => {
    const file = new File(["image"], "recipe.gif", { type: "image/gif" });

    const result = recipeSchema.safeParse({
      title: "Palacsinta",
      ingredients: "liszt, tojás, tej",
      instructions: "Keverd össze és süsd ki.",
      cooking_time: 30,
      servings: 4,
      image: file,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issue = result.error.issues.find(
        (entry) => entry.path[0] === "image",
      );

      expect(issue?.message).toBe(
        "Csak JPG, JPEG, PNG vagy WEBP formátum tölthető fel.",
      );
    }
  });

  it("returns an error for image files that are too large", () => {
    const oversizedFile = new File(
      [new Uint8Array(RECIPE_IMAGE_MAX_SIZE + 1)],
      "recipe.png",
      { type: "image/png" },
    );

    const result = recipeSchema.safeParse({
      title: "Palacsinta",
      ingredients: "liszt, tojás, tej",
      instructions: "Keverd össze és süsd ki.",
      cooking_time: 30,
      servings: 4,
      image: oversizedFile,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issue = result.error.issues.find(
        (entry) => entry.path[0] === "image",
      );

      expect(issue?.message).toBe("A fájl mérete nem lehet nagyobb 5 MB-nál.");
    }
  });
});
