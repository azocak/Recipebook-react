import { act, render, screen } from "@testing-library/react";

import { useDebouncedValue } from "./useDebouncedValue";

function DebouncedValueTestComponent({
  value,
  delayMs = 400,
}: {
  value: string;
  delayMs?: number;
}) {
  const debouncedValue = useDebouncedValue(value, delayMs);

  return <p>{debouncedValue}</p>;
}

describe("useDebouncedValue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    render(<DebouncedValueTestComponent value="pizza" />);

    expect(screen.getByText("pizza")).toBeInTheDocument();
  });

  it("updates the debounced value only after the delay", () => {
    vi.useFakeTimers();

    const { rerender } = render(
      <DebouncedValueTestComponent value="pizza" delayMs={400} />,
    );

    rerender(<DebouncedValueTestComponent value="palacsinta" delayMs={400} />);

    expect(screen.getByText("pizza")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(399);
    });

    expect(screen.getByText("pizza")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByText("palacsinta")).toBeInTheDocument();
  });

  it("uses the latest value when the value changes repeatedly", () => {
    vi.useFakeTimers();

    const { rerender } = render(
      <DebouncedValueTestComponent value="p" delayMs={400} />,
    );

    rerender(<DebouncedValueTestComponent value="pa" delayMs={400} />);
    rerender(<DebouncedValueTestComponent value="pal" delayMs={400} />);
    rerender(<DebouncedValueTestComponent value="pala" delayMs={400} />);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText("pala")).toBeInTheDocument();
  });
});
