import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders the label and the input", () => {
    render(<Input label="Recept neve" name="title" />);

    expect(screen.getByText("Recept neve")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays an asterisk if required", () => {
    render(<Input label="Recept neve" name="title" required />);

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders the hint text", () => {
    render(
      <Input
        label="Recept neve"
        name="title"
        hint="Adj rövid, jól érthető címet."
      />,
    );

    expect(
      screen.getByText("Adj rövid, jól érthető címet."),
    ).toBeInTheDocument();
  });

  it("renders the error text and sets aria-invalid", () => {
    render(
      <Input
        label="Recept neve"
        name="title"
        error="A recept neve kötelező."
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("A recept neve kötelező.")).toBeInTheDocument();
  });

  it("uses the aria-describedby attribute to link the hint to the error", () => {
    render(
      <Input
        label="Recept neve"
        name="title"
        hint="Segítő szöveg"
        error="Hiba történt"
      />,
    );

    const input = screen.getByRole("textbox");
    const describedBy = input.getAttribute("aria-describedby");

    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("-hint");
    expect(describedBy).toContain("-error");
  });

  it("forwardRef-compatible", () => {
    const ref = createRef<HTMLInputElement>();

    render(<Input ref={ref} label="Recept neve" name="title" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("in disabled state is disabled", () => {
    render(<Input label="Recept neve" name="title" disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
