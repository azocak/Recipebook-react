import { render, screen } from "@testing-library/react";
import { Label } from "./Label";

describe("Label", () => {
  it("renders the label text", () => {
    render(<Label htmlFor="title">Recept neve</Label>);

    expect(screen.getByText("Recept neve")).toBeInTheDocument();
  });

  it("displays an asterisk if required", () => {
    render(
      <Label htmlFor="title" required>
        Recept neve
      </Label>,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("rendereli a renders the helper text szöveget", () => {
    render(
      <Label htmlFor="title" helperText="Adj rövid, jól érthető címet.">
        Recept neve
      </Label>,
    );

    expect(
      screen.getByText("Adj rövid, jól érthető címet."),
    ).toBeInTheDocument();
  });
});
