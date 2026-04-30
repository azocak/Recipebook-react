import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecipeFormBasicsSection } from "./RecipeFormBasicsSection";

type RecipeFormBasicsSectionProps = ComponentProps<
  typeof RecipeFormBasicsSection
>;

function createDefaultProps(): RecipeFormBasicsSectionProps {
  return {
    titleField: {
      name: "title",
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
    },
    cookingTimeField: {
      name: "cooking_time",
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
    },
    servingsField: {
      name: "servings",
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
    },
    titleError: undefined,
    cookingTimeError: undefined,
    servingsError: undefined,
    onTitleChange: vi.fn(),
    onCookingTimeChange: vi.fn(),
    onServingsChange: vi.fn(),
  };
}

function renderBasicsSection(
  overrides: Partial<RecipeFormBasicsSectionProps> = {},
) {
  const props: RecipeFormBasicsSectionProps = {
    ...createDefaultProps(),
    ...overrides,
  };

  render(<RecipeFormBasicsSection {...props} />);

  return props;
}

describe("RecipeFormBasicsSection", () => {
  it("renders the title, cooking time and servings fields", () => {
    renderBasicsSection();

    expect(screen.getByLabelText(/Recept neve/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Főzési idő/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adagok száma/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("pl. Házi palacsinta"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("pl. 30")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("pl. 4")).toBeInTheDocument();
  });

  it("renders the title helper text", () => {
    renderBasicsSection();

    expect(
      screen.getByText("Adj rövid, jól érthető címet a receptnek."),
    ).toBeInTheDocument();
  });

  it("renders field errors", () => {
    renderBasicsSection({
      titleError: "Add meg a recept nevét.",
      cookingTimeError: "Add meg a főzési időt.",
      servingsError: "Add meg az adagok számát.",
    });

    expect(screen.getByText("Add meg a recept nevét.")).toBeInTheDocument();
    expect(screen.getByText("Add meg a főzési időt.")).toBeInTheDocument();
    expect(screen.getByText("Add meg az adagok számát.")).toBeInTheDocument();
  });

  it("calls the title change handler", async () => {
    const user = userEvent.setup();
    const onTitleChange = vi.fn();

    renderBasicsSection({ onTitleChange });

    await user.type(screen.getByLabelText(/Recept neve/i), "Palacsinta");

    expect(onTitleChange).toHaveBeenCalled();
  });

  it("calls the cooking time change handler", async () => {
    const user = userEvent.setup();
    const onCookingTimeChange = vi.fn();

    renderBasicsSection({ onCookingTimeChange });

    await user.type(screen.getByLabelText(/Főzési idő/i), "30");

    expect(onCookingTimeChange).toHaveBeenCalled();
  });

  it("calls the servings change handler", async () => {
    const user = userEvent.setup();
    const onServingsChange = vi.fn();

    renderBasicsSection({ onServingsChange });

    await user.type(screen.getByLabelText(/Adagok száma/i), "4");

    expect(onServingsChange).toHaveBeenCalled();
  });
});
