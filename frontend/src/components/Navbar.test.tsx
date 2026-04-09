import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "./Navbar";
import {
  setGuestAuth,
  setMockAuthState,
  type MockUseAuth,
} from "../test/auth-fixtures";

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();
const mockGetApiErrorMessage = vi.fn();

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../utils/getApiErrorMessage", () => ({
  getApiErrorMessage: (error: unknown, fallbackMessage: string) =>
    mockGetApiErrorMessage(error, fallbackMessage),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function renderNavbar(initialEntry = "/recipes") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Navbar />
    </MemoryRouter>,
  );
}

function setGuestNavbarAuth(mock: MockUseAuth = mockUseAuth) {
  return setGuestAuth(mock);
}

function setAuthenticatedNavbarAuth(
  overrides?: Partial<{
    id: number;
    username: string;
    email: string;
    logout: ReturnType<typeof vi.fn>;
  }>,
) {
  const logoutMock = overrides?.logout ?? vi.fn();

  setMockAuthState(mockUseAuth, {
    user: {
      id: overrides?.id ?? 1,
      username: overrides?.username ?? "anna",
      email: overrides?.email ?? "anna@gmail.com",
    },
    isAuthenticated: true,
    logout: logoutMock,
  });

  return { logoutMock };
}

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setGuestNavbarAuth();
    mockGetApiErrorMessage.mockReturnValue("A kijelentkezés nem sikerült.");
  });

  it("renders guest navigation links and hides authenticated-only actions", () => {
    setGuestNavbarAuth();

    renderNavbar("/login");

    expect(
      screen.getByRole("link", { name: "Ugrás a receptek oldalra" }),
    ).toHaveAttribute("href", "/recipes");

    expect(screen.getByRole("link", { name: "Receptek" })).toHaveAttribute(
      "href",
      "/recipes",
    );

    expect(screen.getByRole("link", { name: "Bejelentkezés" })).toHaveAttribute(
      "href",
      "/login",
    );

    expect(screen.getByRole("link", { name: "Regisztráció" })).toHaveAttribute(
      "href",
      "/register",
    );

    expect(
      screen.queryByRole("link", { name: "Új recept" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Kijelentkezés" }),
    ).not.toBeInTheDocument();

    expect(screen.queryByText(/Szia,/i)).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Bejelentkezés" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders authenticated navigation state with welcome label and logout button", () => {
    setAuthenticatedNavbarAuth();

    renderNavbar("/recipes/new");

    expect(screen.getByText("Szia, anna!")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Receptek" })).toHaveAttribute(
      "href",
      "/recipes",
    );

    expect(screen.getByRole("link", { name: "Új recept" })).toHaveAttribute(
      "href",
      "/recipes/new",
    );

    expect(
      screen.getByRole("button", { name: "Kijelentkezés" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Bejelentkezés" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Regisztráció" }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Új recept" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("navigates to /login after successful logout and preserves the current location", async () => {
    const user = userEvent.setup();
    const logoutMock = vi.fn().mockResolvedValue(undefined);

    setAuthenticatedNavbarAuth({ logout: logoutMock });

    renderNavbar("/recipes/new");

    await user.click(screen.getByRole("button", { name: "Kijelentkezés" }));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login", {
      replace: true,
      state: {
        from: {
          pathname: "/recipes/new",
        },
      },
    });
  });

  it("shows a pending logout state while logout is in flight", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<void>();
    const logoutMock = vi.fn().mockReturnValue(deferred.promise);

    setAuthenticatedNavbarAuth({ logout: logoutMock });

    renderNavbar("/recipes");

    await user.click(screen.getByRole("button", { name: "Kijelentkezés" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Kijelentkezés..." }),
      ).toBeDisabled();
    });

    deferred.resolve();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Kijelentkezés" }),
      ).toBeEnabled();
    });
  });

  it("shows an alert when logout fails and does not navigate away", async () => {
    const user = userEvent.setup();
    const logoutError = new Error("Logout failed");
    const logoutMock = vi.fn().mockRejectedValue(logoutError);

    setAuthenticatedNavbarAuth({ logout: logoutMock });
    mockGetApiErrorMessage.mockReturnValue("A kijelentkezés nem sikerült.");

    renderNavbar("/recipes");

    await user.click(screen.getByRole("button", { name: "Kijelentkezés" }));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockGetApiErrorMessage).toHaveBeenCalledWith(
        logoutError,
        "A kijelentkezés nem sikerült.",
      );
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A kijelentkezés nem sikerült.",
    );

    expect(mockNavigate).not.toHaveBeenCalled();

    expect(screen.getByRole("button", { name: "Kijelentkezés" })).toBeEnabled();
  });
});
