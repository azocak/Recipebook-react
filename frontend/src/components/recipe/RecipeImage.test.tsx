import { render, screen } from "@testing-library/react";

import { RecipeImage } from "./RecipeImage";

describe("RecipeImage", () => {
  it("renders the uploaded image when imageUrl is provided", () => {
    render(
      <RecipeImage
        imageUrl="http://localhost:8000/media/recipes/palacsinta.jpg"
        alt="Palacsinta recept képe"
        placeholderLabel="Nincs feltöltött kép"
        placeholderIconClassName="h-10 w-10"
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

  it("renders an accessible placeholder when imageUrl is missing", () => {
    render(
      <RecipeImage
        imageUrl={null}
        alt="Palacsinta recept képe"
        placeholderLabel="Nincs feltöltött kép"
        placeholderIconClassName="h-10 w-10"
      />,
    );

    expect(
      screen.getByRole("img", { name: "Nincs feltöltött kép" }),
    ).toBeInTheDocument();
  });

  it("hides the placeholder label visually by default", () => {
    render(
      <RecipeImage
        imageUrl={null}
        alt="Palacsinta recept képe"
        placeholderLabel="Nincs feltöltött kép"
        placeholderIconClassName="h-10 w-10"
      />,
    );

    expect(screen.getByText("Nincs feltöltött kép")).toHaveClass("sr-only");
  });

  it("shows the placeholder label when requested", () => {
    render(
      <RecipeImage
        imageUrl={null}
        alt="Palacsinta recept képe"
        placeholderLabel="Nincs feltöltött kép"
        placeholderIconClassName="h-10 w-10"
        showPlaceholderText
      />,
    );

    expect(screen.getByText("Nincs feltöltött kép")).not.toHaveClass("sr-only");
  });
});
