import { render, screen, waitFor } from "@testing-library/react";
import type { RecipeFormData } from "../api/types";
import RecipeForm from "./RecipeForm";
import userEvent from "@testing-library/user-event";
import { ApiError } from "../api/errors";

const validData: RecipeFormData = {
  title: "Palacsinta",
  ingredients: "Liszt, tej, tojás, cukor",
  instructions: "Keverd össze és süsd ki serpenyőben.",
  cooking_time: 20,
  servings: 4,
};

function setup(
  overrides?: Partial<{
    initialValues: RecipeFormData;
    onSubmit: (data: RecipeFormData) => Promise<void>;
    submitLabel: string;
  }>,
) {
  const onSubmit = overrides?.onSubmit ?? vi.fn().mockResolvedValue(undefined);

  render(
    <RecipeForm
      initialValues={overrides?.initialValues ?? validData}
      onSubmit={onSubmit}
      submitLabel={overrides?.submitLabel ?? "Mentés"}
    />,
  );

  return { onSubmit };
}

async function fillWithValidData() {
  const user = userEvent.setup();

  const titleInput = screen.getByRole("textbox", { name: /recept neve/i });
  const ingredientsInput = screen.getByRole("textbox", { name: /hozzávalók/i });
  const instructionsInput = screen.getByRole("textbox", {
    name: /elkészítés/i,
  });
  const cookingTimeInput = screen.getByRole("spinbutton", {
    name: /főzési idő/i,
  });
  const servingsInput = screen.getByRole("spinbutton", {
    name: /adagok száma/i,
  });

  await user.clear(titleInput);
  await user.type(titleInput, validData.title);

  await user.clear(ingredientsInput);
  await user.type(ingredientsInput, validData.ingredients);

  await user.clear(instructionsInput);
  await user.type(instructionsInput, validData.instructions);

  await user.clear(cookingTimeInput);
  await user.type(cookingTimeInput, String(validData.cooking_time));

  await user.clear(servingsInput);
  await user.type(servingsInput, String(validData.servings));

  return user;
}

async function submitFormWithInvalidField<K extends keyof RecipeFormData>(
  field: K,
  value: RecipeFormData[K],
) {
  const user = userEvent.setup();

  setup({
    initialValues: {
      ...validData,
      [field]: value,
    },
  });

  await user.click(screen.getByRole("button", { name: "Mentés" }));
}

describe("RecipeForm", () => {
  it.each([
    ["title", "", "A recept neve kötelező."],
    ["title", "ab", "A recept neve legalább 3 karakter legyen."],
    ["title", "a".repeat(121), "A recept neve legfeljebb 120 karakter lehet."],
    ["ingredients", "", "A(z) hozzávalók mező kötelező."],
    [
      "ingredients",
      "rövid",
      "A(z) hozzávalók mező legalább 10 karakter legyen.",
    ],
    ["instructions", "", "A(z) elkészítés mező kötelező."],
    [
      "instructions",
      "rövid",
      "A(z) elkészítés mező legalább 10 karakter legyen.",
    ],
    ["cooking_time", 0, "A(z) főzési idő legalább 1 perc legyen."],
    ["cooking_time", 1441, "A(z) főzési idő legfeljebb 1440 perc lehet."],
    ["servings", 0, "A(z) adagok száma legalább 1 legyen."],
    ["servings", 21, "A(z) adagok száma legfeljebb 20 lehet."],
  ] as const)(
    "megjeleníti a kliens oldali hibát, ha a(z) %s mező hibás",
    async (field, value, errorMessage) => {
      await submitFormWithInvalidField(field, value);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    },
  );

  it("clears the field error when the user begins to edit that field", async () => {
    const user = userEvent.setup();

    setup({
      initialValues: {
        ...validData,
        title: "",
      },
    });

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(screen.getByText("A recept neve kötelező.")).toBeInTheDocument();

    const titleInput = screen.getByRole("textbox", { name: /recept neve/i });
    await user.type(titleInput, "P");

    expect(
      screen.queryByText("A recept neve kötelező."),
    ).not.toBeInTheDocument();
  });

  it("displays an error if the ingredients and preparation are the same", async () => {
    const user = userEvent.setup();

    setup({
      initialValues: {
        ...validData,
        ingredients: "ugyanaz a szöveg",
        instructions: "ugyanaz a szöveg",
      },
    });

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(
      screen.getByText("Az elkészítés nem lehet ugyanaz, mint a hozzávalók."),
    ).toBeInTheDocument();
  });

  it("calls the onSubmit event with the correct data", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    setup({
      initialValues: {
        title: "",
        ingredients: "",
        instructions: "",
        cooking_time: 0,
        servings: 1,
      },
      onSubmit,
    });

    await fillWithValidData();
    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(validData);
  });

  it("call the onSubmit event with the trimmed data", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    setup({
      initialValues: {
        title: "  Palacsinta  ",
        ingredients: "  Liszt, tej, tojás, cukor  ",
        instructions: "  Keverd össze és süsd ki serpenyőben.  ",
        cooking_time: 20,
        servings: 4,
      },
      onSubmit,
    });

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Palacsinta",
      ingredients: "Liszt, tej, tojás, cukor",
      instructions: "Keverd össze és süsd ki serpenyőben.",
      cooking_time: 20,
      servings: 4,
    });
  });

  it("displays the backend field error", async () => {
    const user = userEvent.setup();

    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError("Validation error", 400, {
        title: ["Már van ilyen nevű recepted."],
      }),
    );

    setup({ onSubmit });

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(
      screen.getByText("Már van ilyen nevű recepted."),
    ).toBeInTheDocument();
  });

  it("displays a general backend error", async () => {
    const user = userEvent.setup();

    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError("Validation error", 400, {
        detail: "Szerverhiba történt.",
      }),
    );

    setup({
      onSubmit,
    });

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(screen.getByText("Szerverhiba történt.")).toBeInTheDocument();
  });

  it("disables the button while sending", async () => {
    let resolvePromise: (() => void) | undefined;

    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const user = userEvent.setup();

    setup({ onSubmit });

    await user.click(screen.getByRole("button", { name: "Mentés" }));
    const button = screen.getByRole("button", { name: "Mentés..." });
    expect(button).toBeDisabled();

    resolvePromise?.();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Mentés" })).not.toBeDisabled();
    });
  });
});
