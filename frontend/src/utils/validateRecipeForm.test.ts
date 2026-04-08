import { describe, expect, it } from "vitest";
import { validateRecipeForm } from "./validateRecipeForm";

describe("validateRecipeForm", () => {
  const validData = {
    title: "Palacsinta",
    ingredients: "Liszt, tej, tojás, csipet só",
    instructions: "Keverd össze az alapanyagokat és süsd ki.",
    cooking_time: 20,
    servings: 4,
  };

  it("returns no errors for valid data", () => {
    expect(validateRecipeForm(validData)).toEqual({});
  });

  it("validates title boundaries", () => {
    expect(
      validateRecipeForm({
        ...validData,
        title: "  ",
      }).title,
    ).toBe("A recept neve kötelező.");

    expect(
      validateRecipeForm({
        ...validData,
        title: "ab",
      }).title,
    ).toBe("A recept neve legalább 3 karakter legyen.");

    expect(
      validateRecipeForm({
        ...validData,
        title: "a".repeat(121),
      }).title,
    ).toBe("A recept neve legfeljebb 120 karakter lehet.");
  });

  it("validates ingredients and instructions minimum length", () => {
    expect(
      validateRecipeForm({
        ...validData,
        ingredients: "rövid",
      }).ingredients,
    ).toBe("A(z) hozzávalók mező legalább 10 karakter legyen.");

    expect(
      validateRecipeForm({
        ...validData,
        instructions: "rövid",
      }).instructions,
    ).toBe("A(z) elkészítés mező legalább 10 karakter legyen.");
  });

  it("validates integer-only numeric fields", () => {
    expect(
      validateRecipeForm({
        ...validData,
        cooking_time: 12.5,
      }).cooking_time,
    ).toBe("A(z) főzési idő mezőbe egész számot adj meg.");

    expect(
      validateRecipeForm({
        ...validData,
        servings: 2.5,
      }).servings,
    ).toBe("A(z) adagok száma mezőbe egész számot adj meg.");
  });

  it("validates cooking_time boundaries", () => {
    expect(
      validateRecipeForm({
        ...validData,
        cooking_time: 0,
      }).cooking_time,
    ).toBe("A(z) főzési idő legalább 1 perc legyen.");

    expect(
      validateRecipeForm({
        ...validData,
        cooking_time: 1441,
      }).cooking_time,
    ).toBe("A(z) főzési idő legfeljebb 1440 perc lehet.");
  });

  it("validates servings boundaries", () => {
    expect(
      validateRecipeForm({
        ...validData,
        servings: 0,
      }).servings,
    ).toBe("A(z) adagok száma legalább 1 legyen.");

    expect(
      validateRecipeForm({
        ...validData,
        servings: 21,
      }).servings,
    ).toBe("A(z) adagok száma legfeljebb 20 lehet.");
  });

  it("rejects identical ingredients and instructions", () => {
    const sameText = "Liszt, tej, tojás, cukor";

    expect(
      validateRecipeForm({
        ...validData,
        ingredients: sameText,
        instructions: sameText.toUpperCase(),
      }).instructions,
    ).toBe("Az elkészítés nem lehet ugyanaz, mint a hozzávalók.");
  });
});
