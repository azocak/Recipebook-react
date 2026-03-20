import { render, screen } from "@testing-library/react";
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

  const titleInput = screen.getByLabelText("Recept neve");
  const ingredientsInput = screen.getByLabelText("Hozzávalók");
  const instructionsInput = screen.getByLabelText("Elkészítés");
  const cookingTimeInput = screen.getByLabelText("Főzési idő (perc)");
  const servingsInput = screen.getByLabelText("Adagok száma");

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

async function submitFormWithInvalidFiled<K extends keyof RecipeFormData>(
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
    ["ingredients", "", "A hozzávalók mező kötelező."],
    ["ingredients", "rövid", "A hozzávalók mező legalább 10 karakter legyen."],
    ["instructions", "", "Az elkészítés mező kötelező."],
    [
      "instructions",
      "rövid",
      "Az elkészítés mező legalább 10 karakter legyen.",
    ],
    ["cooking_time", 0, "A főzési idő legalább 1 perc legyen."],
    ["servings", 0, "Az adagok száma legalább 1 legyen."],
  ] as const)(
    "megjeleníti a kliens oldali hibát, ha a(z) %s mező hibás",
    async (field, value, errorMessage) => {
      await submitFormWithInvalidFiled(field, value);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    },
  );

  it("megjeleníti a hibát, ha a hozzávalók és az elkészítés ugyanaz", async () => {
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

  it("meghívja az onSubmit-et helyes adatokkal", async () => {
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

  it("trim-elt adatokkal hívja meg az onSubmit-et", async () => {
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

  it("megjeleníti a backend mezőhibát", async () => {
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

  it("megjeleníti az általános backend hibát", async () => {
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

  it("disable-olja a gombot küldés közben", async () => {
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
  });
});
