import { render, screen } from "@testing-library/react";

import { RecipeImageBlock } from "./RecipeImageBlock";

describe("RecipeImageBlock", () => {
  it("renders an image when imageUrl is provided", () => {
    render(
      <RecipeImageBlock
        imageUrl="http://localhost:8000/media/recipes/palacsinta.jpg"
        alt="Palacsinta recept képe"
      />,
    );

    const image = screen.getByRole("img", {
      name: "Palacsinta recept képe",
    });

    expect(image).toHaveAttribute(
      "src",
      "http://localhost:8000/media/recipes/palacsinta.jpg",
    );
    expect(image).toHaveAttribute("loading", "lazy");
  });

  it("uses the card wrapper variant by default", () => {
    const { container } = render(
      <RecipeImageBlock
        imageUrl={null}
        alt="Palacsinta recept képe"
        placeholderLabel="Nincs feltöltött kép"
      />,
    );

    const wrapper = container.firstElementChild;

    expect(wrapper).toHaveClass("overflow-hidden");
    expect(wrapper).toHaveClass("aspect-video");
    expect(wrapper).toHaveClass("rounded-t-3xl");
    expect(wrapper).toHaveClass("bg-slate-100");
  });

  it("uses the detail wrapper variant", () => {
    const { container } = render(
      <RecipeImageBlock
        imageUrl={null}
        alt="Palacsinta recept képe"
        variant="detail"
        placeholderLabel="Nincs feltöltött kép"
      />,
    );

    const wrapper = container.firstElementChild;

    expect(wrapper).toHaveClass("overflow-hidden");
    expect(wrapper).toHaveClass("aspect-video");
    expect(wrapper).toHaveClass("rounded-3xl");
    expect(wrapper).toHaveClass("border");
    expect(wrapper).toHaveClass("border-slate-200");
    expect(wrapper).toHaveClass("bg-slate-100");
  });

  it("uses the editor wrapper variant", () => {
    const { container } = render(
      <RecipeImageBlock
        imageUrl={null}
        alt="Palacsinta recept képe"
        variant="editor"
        placeholderLabel="Nincs feltöltött kép"
      />,
    );

    const wrapper = container.firstElementChild;

    expect(wrapper).toHaveClass("overflow-hidden");
    expect(wrapper).toHaveClass("aspect-video");
    expect(wrapper).toHaveClass("rounded-2xl");
    expect(wrapper).toHaveClass("border");
    expect(wrapper).toHaveClass("border-slate-200");
    expect(wrapper).toHaveClass("bg-slate-100");
  });

  it("renders an accessible placeholder when imageUrl is missing", () => {
    render(
      <RecipeImageBlock
        imageUrl={null}
        alt="Palacsinta recept képe"
        placeholderLabel="Nincs feltöltött kép"
      />,
    );

    expect(
      screen.getByRole("img", { name: "Nincs feltöltött kép" }),
    ).toBeInTheDocument();
  });

  it("keeps the placeholder label visually hidden for card and detail variants", () => {
    const { rerender } = render(
      <RecipeImageBlock
        imageUrl={null}
        alt="Palacsinta recept képe"
        variant="card"
        placeholderLabel="Nincs feltöltött kép"
      />,
    );

    expect(screen.getByText("Nincs feltöltött kép")).toHaveClass("sr-only");

    rerender(
      <RecipeImageBlock
        imageUrl={null}
        alt="Palacsinta recept képe"
        variant="detail"
        placeholderLabel="Nincs feltöltött kép"
      />,
    );

    expect(screen.getByText("Nincs feltöltött kép")).toHaveClass("sr-only");
  });

  it("shows the placeholder label in editor variant", () => {
    render(
      <RecipeImageBlock
        imageUrl={null}
        alt="Palacsinta recept képe"
        variant="editor"
        placeholderLabel="Nincs feltöltött kép"
      />,
    );

    expect(screen.getByText("Nincs feltöltött kép")).not.toHaveClass("sr-only");
  });
});
