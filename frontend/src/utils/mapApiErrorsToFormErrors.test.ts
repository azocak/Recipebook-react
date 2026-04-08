import { describe, expect, it } from "vitest";
import { mapApiErrorsToFormErrors } from "./mapApiErrorsToFormErrors";
import { ApiError } from "../api/errors";

describe("mapApiErrorsToFormErrors", () => {
  const allowedFields = [
    "title",
    "ingredients",
    "instructions",
    "cooking_time",
    "servings",
    "image",
    "remove_image",
  ];

  it("returns only the fallback general error for non-ApiError values", () => {
    expect(
      mapApiErrorsToFormErrors(
        new Error("boom"),
        allowedFields,
        "Általános hiba",
      ),
    ).toEqual({
      general: "Általános hiba",
    });
  });

  it("maps string field errors from ApiError.data", () => {
    const error = new ApiError("Validation failed", 400, {
      title: "A recept neve kötelező.",
      image: "Nem támogatott fájltípus.",
    });

    expect(
      mapApiErrorsToFormErrors(error, allowedFields, "Általános hiba"),
    ).toEqual({
      general: "Általános hiba",
      title: "A recept neve kötelező.",
      image: "Nem támogatott fájltípus.",
    });
  });

  it("maps the first non-empty string from field error arrays", () => {
    const error = new ApiError("Validation failed", 400, {
      ingredients: ["", "A hozzávalók mező kötelező."],
      instructions: ["Az elkészítés mező kötelező."],
    });

    expect(
      mapApiErrorsToFormErrors(error, allowedFields, "Általános hiba"),
    ).toEqual({
      general: "Általános hiba",
      ingredients: "A hozzávalók mező kötelező.",
      instructions: "Az elkészítés mező kötelező.",
    });
  });

  it("prefers non_field_errors as the general message", () => {
    const error = new ApiError("Validation failed", 400, {
      non_field_errors: ["Általános backend hiba"],
      detail: "Másodlagos detail",
      message: "Másodlagos message",
    });

    expect(
      mapApiErrorsToFormErrors(error, allowedFields, "Általános hiba"),
    ).toEqual({
      general: "Általános backend hiba",
    });
  });

  it("falls back from detail to error to message for the general message", () => {
    const detailError = new ApiError("Validation failed", 400, {
      detail: "Detail hiba",
    });

    expect(
      mapApiErrorsToFormErrors(detailError, allowedFields, "Általános hiba"),
    ).toEqual({
      general: "Detail hiba",
    });

    const errorFieldError = new ApiError("Validation failed", 400, {
      error: "Error mező hiba",
    });

    expect(
      mapApiErrorsToFormErrors(
        errorFieldError,
        allowedFields,
        "Általános hiba",
      ),
    ).toEqual({
      general: "Error mező hiba",
    });

    const messageFieldError = new ApiError("Validation failed", 400, {
      message: "Message mező hiba",
    });

    expect(
      mapApiErrorsToFormErrors(
        messageFieldError,
        allowedFields,
        "Általános hiba",
      ),
    ).toEqual({
      general: "Message mező hiba",
    });
  });

  it("ignores fields that are not in the allowed list", () => {
    const error = new ApiError("Validation failed", 400, {
      owner: "Ezt nem szabad átvenni.",
      title: "Cím hiba",
    });

    expect(
      mapApiErrorsToFormErrors(error, allowedFields, "Általános hiba"),
    ).toEqual({
      general: "Általános hiba",
      title: "Cím hiba",
    });
  });
});
