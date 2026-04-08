import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./getApiErrorMessage";
import { ApiError } from "../api/errors";

describe("getApiErrorMessage", () => {
  it("returns the fallback message for non-ApiError values", () => {
    expect(getApiErrorMessage(new Error("boom"), "Fallback hiba")).toBe(
      "Fallback hiba",
    );
  });

  it("returns the 404-specific message", () => {
    const error = new ApiError("Not found", 404);

    expect(getApiErrorMessage(error, "Fallback hiba")).toBe(
      "Nincs ilyen recept.",
    );
  });

  it("returns the 403-specific message", () => {
    const error = new ApiError("Forbidden", 403);

    expect(getApiErrorMessage(error, "Fallback hiba")).toBe(
      "Nincs jogosultságod a recept megtekintéséhez.",
    );
  });

  it("returns the backend detail message when available", () => {
    const error = new ApiError("API hiba", 400, {
      detail: "Egyedi backend hibaüzenet.",
    });

    expect(getApiErrorMessage(error, "Fallback hiba")).toBe(
      "Egyedi backend hibaüzenet.",
    );
  });

  it("falls back to error.message when there is no detail field", () => {
    const error = new ApiError("Általános API hiba", 500, {
      foo: "bar",
    });

    expect(getApiErrorMessage(error, "Fallback hiba")).toBe(
      "Általános API hiba",
    );
  });

  it("falls back to the provided fallback message when message is empty", () => {
    const error = new ApiError("", 500, null);

    expect(getApiErrorMessage(error, "Fallback hiba")).toBe("Fallback hiba");
  });
});
