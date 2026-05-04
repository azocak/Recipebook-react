import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecipeFilterBar } from "./RecipeFilterBar";
import { useState, type ComponentProps } from "react";

type RecipeFilterBarTestProps = ComponentProps<typeof RecipeFilterBar>;

function createDefaultProps(): RecipeFilterBarTestProps {
  return {
    search: "",
    ordering: "",
    onSearchChange: vi.fn(),
    onOrderingChange: vi.fn(),
    onReset: vi.fn(),
    isResetDisabled: false,
  };
}

function renderFilterBar(overrides: Partial<RecipeFilterBarTestProps> = {}) {
  const props = {
    ...createDefaultProps(),
    ...overrides,
  };

  render(<RecipeFilterBar {...props} />);

  return props;
}

describe("RecipeFilterBar", () => {
  it("renders search, ordering and reset controls", () => {
    renderFilterBar();

    expect(screen.getByLabelText("Keresés")).toBeInTheDocument();
    expect(screen.getByLabelText("Rendezés")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Szűrők törlése" }),
    ).toBeInTheDocument();
  });

  it("renders the current search value", () => {
    renderFilterBar({ search: "pizza" });

    expect(screen.getByLabelText("Keresés")).toHaveValue("pizza");
  });

  it("renders the current ordering value", () => {
    renderFilterBar({ ordering: "title" });

    expect(screen.getByLabelText("Rendezés")).toHaveValue("title");
  });

  it("calls onSearchChange when the search input changes", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    function ControlledFilterBar() {
      const [search, setSearch] = useState("");

      function handleSearchChange(nextSearch: string) {
        setSearch(nextSearch);
        onSearchChange(nextSearch);
      }

      return (
        <RecipeFilterBar
          search={search}
          ordering=""
          onSearchChange={handleSearchChange}
          onOrderingChange={vi.fn()}
          onReset={vi.fn()}
        />
      );
    }

    render(<ControlledFilterBar />);

    await user.type(screen.getByLabelText("Keresés"), "pala");

    expect(onSearchChange).toHaveBeenCalled();
    expect(onSearchChange).toHaveBeenLastCalledWith("pala");
    expect(screen.getByLabelText("Keresés")).toHaveValue("pala");
  });

  it("calls onOrderingChange when the ordering select changes", async () => {
    const user = userEvent.setup();
    const onOrderingChange = vi.fn();

    renderFilterBar({ onOrderingChange });

    await user.selectOptions(screen.getByLabelText("Rendezés"), "title");

    expect(onOrderingChange).toHaveBeenCalledWith("title");
  });

  it("calls onOrderingChange with an empty value when default ordering is selected", async () => {
    const user = userEvent.setup();
    const onOrderingChange = vi.fn();

    renderFilterBar({
      ordering: "title",
      onOrderingChange,
    });

    await user.selectOptions(screen.getByLabelText("Rendezés"), "");

    expect(onOrderingChange).toHaveBeenCalledWith("");
  });

  it("calls onReset when the reset button is clicked", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    renderFilterBar({ onReset });

    await user.click(screen.getByRole("button", { name: "Szűrők törlése" }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("disables the reset button when reset is not available", () => {
    renderFilterBar({ isResetDisabled: true });

    expect(
      screen.getByRole("button", { name: "Szűrők törlése" }),
    ).toBeDisabled();
  });
});
