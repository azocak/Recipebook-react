import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders the label and the textarea field", () => {
    render(<Textarea label="Hozzávalók" name="ingredients" />);

    expect(screen.getByText("Hozzávalók")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays an asterisk if required", () => {
    render(<Textarea label="Hozzávalók" name="ingredients" required />);

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders the hint text", () => {
    render(
      <Textarea
        label="Hozzávalók"
        name="ingredients"
        hint="Írd le a hozzávalókat, lehetőleg soronként."
      />,
    );

    expect(
      screen.getByText("Írd le a hozzávalókat, lehetőleg soronként."),
    ).toBeInTheDocument();
  });

  it("renders the error text and sets aria-invalid", () => {
    render(
      <Textarea
        label="Hozzávalók"
        name="ingredients"
        error="A(z) hozzávalók mező kötelező."
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("A(z) hozzávalók mező kötelező."),
    ).toBeInTheDocument();
  });

  it("uses the aria-describedby attribute to link the hint to the error", () => {
    render(
      <Textarea
        label="Hozzávalók"
        name="ingredients"
        hint="Segítő szöveg"
        error="Hiba történt"
      />,
    );

    const textarea = screen.getByRole("textbox");
    const describedBy = textarea.getAttribute("aria-describedby");

    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("-hint");
    expect(describedBy).toContain("-error");
  });

  it("forwardRef-compatible", () => {
    const ref = createRef<HTMLTextAreaElement>();

    render(<Textarea ref={ref} label="Hozzávalók" name="ingredients" />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("in disabled state is disabled", () => {
    render(<Textarea label="Hozzávalók" name="ingredients" disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
