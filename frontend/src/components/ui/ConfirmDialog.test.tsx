import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  const defaultProps = {
    open: true,
    title: "Recept törlése",
    description: "Biztosan törölni szeretnéd ezt a receptet?",
    confirmLabel: "Törlés",
    cancelLabel: "Mégse",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dialog when open", () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(
      screen.getByRole("dialog", { name: "Recept törlése" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Biztosan törölni szeretnéd ezt a receptet?"),
    ).toBeInTheDocument();
  });

  it("does not render the dialog when closed", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves focus to the cancel button when opened", () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Mégse" })).toHaveFocus();
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(<ConfirmDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Mégse" }));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const user = userEvent.setup();

    render(<ConfirmDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Törlés" }));

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel when Escape is pressed", async () => {
    const user = userEvent.setup();

    render(<ConfirmDialog {...defaultProps} />);

    await user.keyboard("{Escape}");

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables actions while loading", async () => {
    const user = userEvent.setup();

    render(<ConfirmDialog {...defaultProps} isLoading />);

    const cancelButton = screen.getByRole("button", { name: "Mégse" });
    const confirmButton = screen.getByRole("button", { name: "Törlés" });

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();

    await user.click(confirmButton);
    await user.keyboard("{Escape}");

    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it("uses the danger visual treatment for destructive actions", () => {
    render(<ConfirmDialog {...defaultProps} intent="danger" />);

    const confirmButton = screen.getByRole("button", { name: "Törlés" });

    expect(confirmButton.className).toContain(
      "bg-[var(--color-danger-surface)]",
    );
  });
});
