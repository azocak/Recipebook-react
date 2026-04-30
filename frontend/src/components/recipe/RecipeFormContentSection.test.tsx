import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecipeFormContentSection } from "./RecipeFormContentSection";

type RecipeFormContentSectionProps = ComponentProps<
  typeof RecipeFormContentSection
>;

function createDefaultProps(): RecipeFormContentSectionProps {
  return {
    ingredientsField: {
      name: "ingredients",
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
    },
    instructionsField: {
      name: "instructions",
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
    },
    ingredientsError: undefined,
    instructionsError: undefined,
    onIngredientsChange: vi.fn(),
    onInstructionsChange: vi.fn(),
  };
}

function renderContentSection(
  overrides: Partial<RecipeFormContentSectionProps> = {},
) {
  const props: RecipeFormContentSectionProps = {
    ...createDefaultProps(),
    ...overrides,
  };

  render(<RecipeFormContentSection {...props} />);

  return props;
}

describe("RecipeFormContentSection", () => {
  it("renders the ingredients and instructions fields", () => {
    renderContentSection();

    expect(screen.getByLabelText(/Hozzávalók/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Elkészítés/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Írd le a hozzávalókat, lehetőleg soronként.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Írd le lépésről lépésre az elkészítést."),
    ).toBeInTheDocument();
  });

  it("renders the ingredients helper text", () => {
    renderContentSection();

    expect(
      screen.getByText("Például: 20 dkg liszt, 2 db tojás, 3 dl tej..."),
    ).toBeInTheDocument();
  });

  it("renders field errors", () => {
    renderContentSection({
      ingredientsError: "Add meg a hozzávalókat.",
      instructionsError: "Add meg az elkészítést.",
    });

    expect(screen.getByText("Add meg a hozzávalókat.")).toBeInTheDocument();
    expect(screen.getByText("Add meg az elkészítést.")).toBeInTheDocument();
  });

  it("calls the ingredients change handler", async () => {
    const user = userEvent.setup();
    const onIngredientsChange = vi.fn();

    renderContentSection({ onIngredientsChange });

    await user.type(screen.getByLabelText(/Hozzávalók/i), "Liszt");

    expect(onIngredientsChange).toHaveBeenCalled();
  });

  it("calls the instructions change handler", async () => {
    const user = userEvent.setup();
    const onInstructionsChange = vi.fn();

    renderContentSection({ onInstructionsChange });

    await user.type(screen.getByLabelText(/Elkészítés/i), "Keverd össze.");

    expect(onInstructionsChange).toHaveBeenCalled();
  });
});
