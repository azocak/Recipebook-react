import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PaginationControls } from "./PaginationControls";

function createDefaultProps() {
  return {
    currentPage: 1,
    hasPreviousPage: false,
    hasNextPage: true,
    onPreviousPage: vi.fn(),
    onNextPage: vi.fn(),
  };
}

function renderPaginationControls(
  overrides: Partial<ReturnType<typeof createDefaultProps>> = {},
) {
  const props = {
    ...createDefaultProps(),
    ...overrides,
  };

  render(<PaginationControls {...props} />);

  return props;
}

describe("PaginationControls", () => {
  it("renders the current page and result count", () => {
    renderPaginationControls({
      currentPage: 2,
    });

    expect(screen.getByText("2. oldal")).toBeInTheDocument();
  });

  it("disables the previous button when there is no previous page", () => {
    renderPaginationControls({
      hasPreviousPage: false,
    });

    expect(screen.getByRole("button", { name: "Előző oldal" })).toBeDisabled();
  });

  it("disables the next button when there is no next page", () => {
    renderPaginationControls({
      hasNextPage: false,
    });

    expect(
      screen.getByRole("button", { name: "Következő oldal" }),
    ).toBeDisabled();
  });

  it("calls onPreviousPage when the previous button is clicked", async () => {
    const user = userEvent.setup();
    const onPreviousPage = vi.fn();

    renderPaginationControls({
      hasPreviousPage: true,
      onPreviousPage,
    });

    await user.click(screen.getByRole("button", { name: "Előző oldal" }));

    expect(onPreviousPage).toHaveBeenCalledTimes(1);
  });

  it("calls onNextPage when the next button is clicked", async () => {
    const user = userEvent.setup();
    const onNextPage = vi.fn();

    renderPaginationControls({
      hasNextPage: true,
      onNextPage,
    });

    await user.click(screen.getByRole("button", { name: "Következő oldal" }));

    expect(onNextPage).toHaveBeenCalledTimes(1);
  });
});
