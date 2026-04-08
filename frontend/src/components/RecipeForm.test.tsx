import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeFormData, RecipeImageFormData } from "../api/types";
import { ApiError } from "../api/errors";
import RecipeForm from "./RecipeForm";

const validData: RecipeFormData = {
  title: "Palacsinta",
  ingredients: "Liszt, tej, tojás, cukor",
  instructions: "Keverd össze és süsd ki serpenyőben.",
  cooking_time: 20,
  servings: 4,
};

const previewUrl = "blob:preview-url";

beforeEach(() => {
  Object.defineProperty(globalThis.URL, "createObjectURL", {
    writable: true,
    value: vi.fn(() => previewUrl),
  });

  Object.defineProperty(globalThis.URL, "revokeObjectURL", {
    writable: true,
    value: vi.fn(),
  });
});

function setup(
  overrides?: Partial<{
    initialValues: RecipeFormData;
    initialImageUrl: string | null;
    onSubmit: (data: RecipeImageFormData) => Promise<void>;
    submitLabel: string;
  }>,
) {
  const onSubmit = overrides?.onSubmit ?? vi.fn().mockResolvedValue(undefined);

  render(
    <RecipeForm
      initialValues={overrides?.initialValues ?? validData}
      initialImageUrl={overrides?.initialImageUrl ?? null}
      onSubmit={onSubmit}
      submitLabel={overrides?.submitLabel ?? "Mentés"}
    />,
  );

  return { onSubmit };
}

function createImageFile(
  name = "recipe.jpg",
  type = "image/jpeg",
  size?: number,
) {
  const file = new File(["image-content"], name, { type });

  if (typeof size === "number") {
    Object.defineProperty(file, "size", {
      value: size,
      configurable: true,
    });
  }

  return file;
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
  it("displays the file selector field and the editor placeholder block", () => {
    setup({
      initialValues: {
        title: "",
        ingredients: "",
        instructions: "",
        cooking_time: 0,
        servings: 1,
      },
    });

    expect(screen.getByLabelText(/receptkép/i)).toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: "Nincs feltöltött kép" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Nincs feltöltött kép")).toBeInTheDocument();
  });

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

  it("shows the placeholder after marking the existing image for removal", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    setup({
      initialImageUrl: "http://localhost:8000/media/recipes/existing.jpg",
      onSubmit,
    });

    expect(
      screen.getByRole("img", { name: /receptkép előnézet/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /jelenlegi kép törlése mentéskor/i }),
    );

    expect(
      screen.getByText("A jelenlegi kép a mentés után törlődni fog."),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("img", { name: /receptkép előnézet/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: "Nincs feltöltött kép" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Nincs feltöltött kép")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(onSubmit).toHaveBeenCalledWith({
      ...validData,
      image: null,
      remove_image: true,
    });
  });

  it("shows the placeholder again when the selected preview is removed", async () => {
    const user = userEvent.setup();
    setup();

    const fileInput = screen.getByLabelText(/receptkép/i);
    const file = createImageFile();

    await user.upload(fileInput, file);

    expect(
      screen.getByRole("img", { name: /receptkép előnézet/i }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /kiválasztott kép eltávolítása/i }),
    );

    expect(
      screen.queryByRole("img", { name: /receptkép előnézet/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: "Nincs feltöltött kép" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Nincs feltöltött kép")).toBeInTheDocument();
  });

  it("restores the existing image when image removal is undone", async () => {
    const user = userEvent.setup();

    setup({
      initialImageUrl: "http://localhost:8000/media/recipes/existing.jpg",
    });

    await user.click(
      screen.getByRole("button", { name: /jelenlegi kép törlése mentéskor/i }),
    );

    expect(
      screen.getByRole("img", { name: "Nincs feltöltött kép" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /képtörlés visszavonása/i }),
    );

    expect(
      screen.getByRole("img", { name: /receptkép előnézet/i }),
    ).toHaveAttribute(
      "src",
      "http://localhost:8000/media/recipes/existing.jpg",
    );

    expect(
      screen.queryByRole("img", { name: "Nincs feltöltött kép" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("A jelenlegi kép a mentés után törlődni fog."),
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

  it("displays a preview of the new image after it has been uploaded", async () => {
    const user = userEvent.setup();
    setup();

    const fileInput = screen.getByLabelText(/receptkép/i);
    const file = createImageFile();

    await user.upload(fileInput, file);

    expect(
      screen.getByRole("img", { name: /receptkép előnézet/i }),
    ).toHaveAttribute("src", previewUrl);
    expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it("displays an error if the file is too large", async () => {
    const user = userEvent.setup();
    setup();

    const fileInput = screen.getByLabelText(/receptkép/i);
    const file = createImageFile(
      "too-large.jpg",
      "image/jpeg",
      5 * 1024 * 1024 + 1,
    );

    await user.upload(fileInput, file);

    expect(
      screen.getByText("A fájl mérete nem lehet nagyobb 5 MB-nál."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /receptkép előnézet/i }),
    ).not.toBeInTheDocument();
  });

  it("displays an error if the file format is not supported", async () => {
    const user = userEvent.setup({ applyAccept: false });
    setup();

    const fileInput = screen.getByLabelText(/receptkép/i);
    const file = createImageFile("recipe.gif", "image/gif");

    await user.upload(fileInput, file);

    expect(
      screen.getByText("Csak JPG, JPEG, PNG vagy WEBP formátum tölthető fel."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /receptkép előnézet/i }),
    ).not.toBeInTheDocument();
  });

  it("displays the existing image during editing", () => {
    setup({
      initialImageUrl: "http://localhost:8000/media/recipes/existing.jpg",
    });

    expect(
      screen.getByRole("img", { name: /receptkép előnézet/i }),
    ).toHaveAttribute(
      "src",
      "http://localhost:8000/media/recipes/existing.jpg",
    );

    expect(
      screen.queryByRole("img", { name: "Nincs feltöltött kép" }),
    ).not.toBeInTheDocument();
  });

  it("shows the newly selected preview instead of the existing image", async () => {
    const user = userEvent.setup();

    setup({
      initialImageUrl: "http://localhost:8000/media/recipes/existing.jpg",
    });

    expect(
      screen.getByRole("img", { name: /receptkép előnézet/i }),
    ).toHaveAttribute(
      "src",
      "http://localhost:8000/media/recipes/existing.jpg",
    );

    const fileInput = screen.getByLabelText(/receptkép/i);
    const file = createImageFile("new-image.png", "image/png");

    await user.upload(fileInput, file);

    expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(file);

    expect(
      screen.getByRole("img", { name: /receptkép előnézet/i }),
    ).toHaveAttribute("src", previewUrl);

    expect(
      screen.queryByRole("img", { name: "Nincs feltöltött kép" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("A jelenlegi kép a mentés után törlődni fog."),
    ).not.toBeInTheDocument();
  });

  it("calls onSubmit with the correct data but without an image", async () => {
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
    expect(onSubmit).toHaveBeenCalledWith({
      ...validData,
      image: null,
      remove_image: false,
    });
  });

  it("calls onSubmit with the correct data and image", async () => {
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

    const fileInput = screen.getByLabelText(/receptkép/i);
    const file = createImageFile("recipe.png", "image/png");

    await user.upload(fileInput, file);
    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      ...validData,
      image: file,
      remove_image: false,
    });
  });

  it("sends on the trimmed data", async () => {
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
      image: null,
      remove_image: false,
    });
  });

  it("displays a backend image field error", async () => {
    const user = userEvent.setup();

    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError("Validation error", 400, {
        image: ["A fájl mérete nem lehet nagyobb 5 MB-nál."],
      }),
    );

    setup({ onSubmit });

    await user.click(screen.getByRole("button", { name: "Mentés" }));

    expect(
      screen.getByText("A fájl mérete nem lehet nagyobb 5 MB-nál."),
    ).toBeInTheDocument();
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

  it("disables the button while saving", async () => {
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
