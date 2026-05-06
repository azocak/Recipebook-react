import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useUnsavedChangesBlocker } from "./useUnsavedChangesBlocker";

const mockUseBlocker = vi.hoisted(() => vi.fn());
const mockProceed = vi.hoisted(() => vi.fn());
const mockReset = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useBlocker: mockUseBlocker,
  };
});

type MockLocation = {
  pathname: string;
  search: string;
  hash: string;
};

type MockBlockerFunctionArgs = {
  currentLocation: MockLocation;
  nextLocation: MockLocation;
  historyAction: "PUSH" | "POP" | "REPLACE";
};

function createLocation(overrides?: Partial<MockLocation>): MockLocation {
  return {
    pathname: "/recipes/new",
    search: "",
    hash: "",
    ...overrides,
  };
}

function UnsavedChangesBlockerTestComponent({
  shouldBlock,
}: {
  shouldBlock: boolean;
}) {
  const { isBlocked, confirmNavigation, cancelNavigation } =
    useUnsavedChangesBlocker(shouldBlock);

  return (
    <div>
      <p data-testid="is-blocked">{String(isBlocked)}</p>

      <button type="button" onClick={confirmNavigation}>
        Confirm navigation
      </button>

      <button type="button" onClick={cancelNavigation}>
        Cancel navigation
      </button>
    </div>
  );
}

describe("useUnsavedChangesBlocker", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseBlocker.mockReturnValue({
      state: "unblocked",
      location: undefined,
      proceed: undefined,
      reset: undefined,
    });
  });

  it("returns isBlocked false when the router blocker is unblocked", () => {
    render(<UnsavedChangesBlockerTestComponent shouldBlock />);

    expect(screen.getByTestId("is-blocked")).toHaveTextContent("false");
  });

  it("returns isBlocked true when the router blocker is blocked", () => {
    mockUseBlocker.mockReturnValue({
      state: "blocked",
      location: createLocation({ pathname: "/recipes" }),
      proceed: mockProceed,
      reset: mockReset,
    });

    render(<UnsavedChangesBlockerTestComponent shouldBlock />);

    expect(screen.getByTestId("is-blocked")).toHaveTextContent("true");
  });

  it("does not block navigation when shouldBlock is false", () => {
    let capturedBlockerFunction:
      | ((args: MockBlockerFunctionArgs) => boolean)
      | undefined;

    mockUseBlocker.mockImplementation((blockerFunction) => {
      capturedBlockerFunction = blockerFunction;

      return {
        state: "unblocked",
        location: undefined,
        proceed: undefined,
        reset: undefined,
      };
    });

    render(<UnsavedChangesBlockerTestComponent shouldBlock={false} />);

    expect(capturedBlockerFunction).toBeDefined();

    const shouldBlockNavigation = capturedBlockerFunction?.({
      currentLocation: createLocation(),
      nextLocation: createLocation({ pathname: "/recipes" }),
      historyAction: "PUSH",
    });

    expect(shouldBlockNavigation).toBe(false);
  });

  it("blocks navigation to a different pathname when shouldBlock is true", () => {
    let capturedBlockerFunction:
      | ((args: MockBlockerFunctionArgs) => boolean)
      | undefined;

    mockUseBlocker.mockImplementation((blockerFunction) => {
      capturedBlockerFunction = blockerFunction;

      return {
        state: "unblocked",
        location: undefined,
        proceed: undefined,
        reset: undefined,
      };
    });

    render(<UnsavedChangesBlockerTestComponent shouldBlock />);

    expect(capturedBlockerFunction).toBeDefined();

    const shouldBlockNavigation = capturedBlockerFunction?.({
      currentLocation: createLocation(),
      nextLocation: createLocation({ pathname: "/recipes" }),
      historyAction: "PUSH",
    });

    expect(shouldBlockNavigation).toBe(true);
  });

  it("blocks navigation to the same pathname with different search params when shouldBlock is true", () => {
    let capturedBlockerFunction:
      | ((args: MockBlockerFunctionArgs) => boolean)
      | undefined;

    mockUseBlocker.mockImplementation((blockerFunction) => {
      capturedBlockerFunction = blockerFunction;

      return {
        state: "unblocked",
        location: undefined,
        proceed: undefined,
        reset: undefined,
      };
    });

    render(<UnsavedChangesBlockerTestComponent shouldBlock />);

    const shouldBlockNavigation = capturedBlockerFunction?.({
      currentLocation: createLocation({ search: "" }),
      nextLocation: createLocation({ search: "?page=2" }),
      historyAction: "PUSH",
    });

    expect(shouldBlockNavigation).toBe(true);
  });

  it("does not block navigation to the exact same location", () => {
    let capturedBlockerFunction:
      | ((args: MockBlockerFunctionArgs) => boolean)
      | undefined;

    mockUseBlocker.mockImplementation((blockerFunction) => {
      capturedBlockerFunction = blockerFunction;

      return {
        state: "unblocked",
        location: undefined,
        proceed: undefined,
        reset: undefined,
      };
    });

    render(<UnsavedChangesBlockerTestComponent shouldBlock />);

    const shouldBlockNavigation = capturedBlockerFunction?.({
      currentLocation: createLocation(),
      nextLocation: createLocation(),
      historyAction: "PUSH",
    });

    expect(shouldBlockNavigation).toBe(false);
  });

  it("confirms the blocked navigation", async () => {
    const user = userEvent.setup();

    mockUseBlocker.mockReturnValue({
      state: "blocked",
      location: createLocation({ pathname: "/recipes" }),
      proceed: mockProceed,
      reset: mockReset,
    });

    render(<UnsavedChangesBlockerTestComponent shouldBlock />);

    await user.click(
      screen.getByRole("button", { name: "Confirm navigation" }),
    );

    expect(mockProceed).toHaveBeenCalledTimes(1);
    expect(mockReset).not.toHaveBeenCalled();
  });

  it("cancels the blocked navigation", async () => {
    const user = userEvent.setup();

    mockUseBlocker.mockReturnValue({
      state: "blocked",
      location: createLocation({ pathname: "/recipes" }),
      proceed: mockProceed,
      reset: mockReset,
    });

    render(<UnsavedChangesBlockerTestComponent shouldBlock />);

    await user.click(screen.getByRole("button", { name: "Cancel navigation" }));

    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(mockProceed).not.toHaveBeenCalled();
  });

  it("does not confirm navigation when there is no blocked navigation", async () => {
    const user = userEvent.setup();

    render(<UnsavedChangesBlockerTestComponent shouldBlock={false} />);

    await user.click(
      screen.getByRole("button", { name: "Confirm navigation" }),
    );

    expect(mockProceed).not.toHaveBeenCalled();
    expect(mockReset).not.toHaveBeenCalled();
  });

  it("does not cancel navigation when there is no blocked navigation", async () => {
    const user = userEvent.setup();

    render(<UnsavedChangesBlockerTestComponent shouldBlock={false} />);

    await user.click(screen.getByRole("button", { name: "Cancel navigation" }));

    expect(mockReset).not.toHaveBeenCalled();
    expect(mockProceed).not.toHaveBeenCalled();
  });
});
