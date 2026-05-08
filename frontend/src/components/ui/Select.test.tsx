import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Select } from "./Select";

describe("Select", () => {
  it("renders the label and the select field", () => {
    render(
      <Select label="Rendezés" name="ordering">
        <option value="">Alapértelmezett</option>
        <option value="title">Cím szerint növekvő</option>
      </Select>,
    );

    expect(screen.getByText("Rendezés")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("displays an asterisk if required", () => {
    render(
      <Select label="Rendezés" name="ordering" required>
        <option value="">Alapértelmezett</option>
      </Select>,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders the hint text", () => {
    render(
      <Select
        label="Rendezés"
        name="ordering"
        hint="Válaszd ki a lista rendezését."
      >
        <option value="">Alapértelmezett</option>
      </Select>,
    );

    expect(
      screen.getByText("Válaszd ki a lista rendezését."),
    ).toBeInTheDocument();
  });

  it("renders the error text and sets aria-invalid", () => {
    render(
      <Select
        label="Rendezés"
        name="ordering"
        error="A rendezési érték érvénytelen."
      >
        <option value="">Alapértelmezett</option>
      </Select>,
    );

    const select = screen.getByRole("combobox");

    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("A rendezési érték érvénytelen."),
    ).toBeInTheDocument();
  });

  it("uses the aria-describedby attribute to link the hint to the error", () => {
    render(
      <Select
        label="Rendezés"
        name="ordering"
        hint="Segítő szöveg"
        error="Hiba történt"
      >
        <option value="">Alapértelmezett</option>
      </Select>,
    );

    const select = screen.getByRole("combobox");
    const describedBy = select.getAttribute("aria-describedby");

    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain("-hint");
    expect(describedBy).toContain("-error");
  });

  it("renders the selected controlled value", () => {
    render(
      <Select label="Rendezés" name="ordering" value="title" onChange={vi.fn()}>
        <option value="">Alapértelmezett</option>
        <option value="title">Cím szerint növekvő</option>
      </Select>,
    );

    expect(screen.getByRole("combobox")).toHaveValue("title");
  });

  it("forwardRef-compatible", () => {
    const ref = createRef<HTMLSelectElement>();

    render(
      <Select ref={ref} label="Rendezés" name="ordering">
        <option value="">Alapértelmezett</option>
      </Select>,
    );

    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("in disabled state is disabled", () => {
    render(
      <Select label="Rendezés" name="ordering" disabled>
        <option value="">Alapértelmezett</option>
      </Select>,
    );

    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
