import { render, screen } from "@testing-library/react";
import { FormMessage } from "./FormMessage";

describe("FormMessage", () => {
  it("displays the default message", () => {
    render(<FormMessage>Általános információ</FormMessage>);

    expect(screen.getByText("Általános információ")).toBeInTheDocument();
  });

  it("In the case of the hint variant, use the hint style class", () => {
    render(<FormMessage variant="hint">Segítő szöveg</FormMessage>);

    const message = screen.getByText("Segítő szöveg");
    expect(message.className).toContain("text-[var(--color-text-muted)]");
  });

  it("In the case of an error variant, use the error style class", () => {
    render(<FormMessage variant="error">Hiba történt</FormMessage>);

    const message = screen.getByText("Hiba történt");
    expect(message.className).toContain("text-red-600");
  });

  it("it doesn't render anything if there is no content", () => {
    const { container } = render(<FormMessage>{undefined}</FormMessage>);

    expect(container).toBeEmptyDOMElement();
  });
});
