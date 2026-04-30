import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecipeFormImageSection } from "./RecipeFormImageSection";
import type { ComponentProps } from "react";

type RecipeFormImageSectionProps = ComponentProps<
  typeof RecipeFormImageSection
>;

function createDefaultProps(): RecipeFormImageSectionProps {
  return {
    displayedImageUrl: null,
    imageError: undefined,
    removeImageError: undefined,
    removeImage: false,
    hasSelectedImage: false,
    hasExistingImage: false,
    onImageChange: vi.fn(),
    onRemoveSelectedImage: vi.fn(),
    onToggleRemoveExistingImage: vi.fn(),
  };
}

function renderImageSection(
  overrides: Partial<RecipeFormImageSectionProps> = {},
) {
  const props: RecipeFormImageSectionProps = {
    ...createDefaultProps(),
    ...overrides,
  };

  render(<RecipeFormImageSection {...props} />);

  return props;
}

describe("RecipeFormImageSection", () => {
  it("renders the image field label, helper text and file input", () => {
    renderImageSection();

    expect(screen.getByLabelText("Receptkép")).toBeInTheDocument();
    expect(screen.getByText(/JPG|PNG|WEBP/i)).toBeInTheDocument();
  });

  it("renders the current preview image when displayedImageUrl is provided", () => {
    renderImageSection({
      displayedImageUrl: "http://localhost:8000/media/recipes/palacsinta.jpg",
    });

    const image = screen.getByRole("img", {
      name: "Receptkép előnézet",
    });

    expect(image).toHaveAttribute(
      "src",
      "http://localhost:8000/media/recipes/palacsinta.jpg",
    );
  });

  it("calls onImageChange when a file is selected", async () => {
    const user = userEvent.setup();
    const onImageChange = vi.fn();

    renderImageSection({ onImageChange });

    const file = new File(["image"], "palacsinta.jpg", {
      type: "image/jpeg",
    });

    await user.upload(screen.getByLabelText("Receptkép"), file);

    expect(onImageChange).toHaveBeenCalledTimes(1);
  });

  it("shows and calls the selected image remove action", async () => {
    const user = userEvent.setup();
    const onRemoveSelectedImage = vi.fn();

    renderImageSection({
      hasSelectedImage: true,
      onRemoveSelectedImage,
    });

    await user.click(
      screen.getByRole("button", {
        name: "Kiválasztott kép eltávolítása",
      }),
    );

    expect(onRemoveSelectedImage).toHaveBeenCalledTimes(1);
  });

  it("shows and calls the existing image remove action", async () => {
    const user = userEvent.setup();
    const onToggleRemoveExistingImage = vi.fn();

    renderImageSection({
      hasExistingImage: true,
      onToggleRemoveExistingImage,
    });

    await user.click(
      screen.getByRole("button", {
        name: "Jelenlegi kép törlése mentéskor",
      }),
    );

    expect(onToggleRemoveExistingImage).toHaveBeenCalledTimes(1);
  });

  it("shows the undo remove action and warning when removeImage is active", () => {
    renderImageSection({
      hasExistingImage: true,
      removeImage: true,
    });

    expect(
      screen.getByRole("button", {
        name: "Képtörlés visszavonása",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("A jelenlegi kép a mentés után törlődni fog."),
    ).toBeInTheDocument();
  });

  it("renders image and remove image errors", () => {
    renderImageSection({
      imageError: "A kép túl nagy.",
      removeImageError: "Nem sikerült kezelni a képtörlést.",
    });

    expect(screen.getByText("A kép túl nagy.")).toBeInTheDocument();
    expect(
      screen.getByText("Nem sikerült kezelni a képtörlést."),
    ).toBeInTheDocument();
  });
});
