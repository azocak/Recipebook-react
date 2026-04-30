import { render, screen } from "@testing-library/react";

import { RecipeFormActions } from "./RecipeFormActions";

describe("RecipeFormActions", () => {
  it("renders the required fields helper text", () => {
    render(
      <RecipeFormActions submitLabel="Recept mentése" isSubmitting={false} />,
    );

    expect(
      screen.getByText(/jelölt mezők kitöltése kötelező/i),
    ).toBeInTheDocument();

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders the provided submit label when the form is not submitting", () => {
    render(
      <RecipeFormActions submitLabel="Recept mentése" isSubmitting={false} />,
    );

    expect(
      screen.getByRole("button", { name: "Recept mentése" }),
    ).toBeInTheDocument();
  });

  it("renders the loading submit label while the form is submitting", () => {
    render(<RecipeFormActions submitLabel="Recept mentése" isSubmitting />);

    expect(
      screen.getByRole("button", { name: "Mentés..." }),
    ).toBeInTheDocument();
  });
});
