import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";
import type { User } from "../api/types";

const mockMe = vi.fn();
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockRegister = vi.fn();

vi.mock("../api/auth", () => ({
  authApi: {
    me: () => mockMe(),
    login: (payload: { username: string; password: string }) =>
      mockLogin(payload),
    logout: () => mockLogout(),
    register: (payload: {
      username: string;
      email: string;
      password: string;
      confirmation: string;
    }) => mockRegister(payload),
  },
}));

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const existingUser: User = {
  id: 1,
  username: "anna",
  email: "anna@gmail.com",
};

const refreshedUser: User = {
  id: 2,
  username: "bela",
  email: "bela@gmail.com",
};

const registeredUser: User = {
  id: 3,
  username: "csilla",
  email: "csilla@gmail.com",
};

function AuthProbe() {
  const {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    refreshUser,
  } = useAuth();

  return (
    <div>
      <p>Loading: {loading ? "igen" : "nem"}</p>
      <p>Authenticated: {isAuthenticated ? "igen" : "nem"}</p>
      <p>User: {user ? user.username : "vendég"}</p>

      <button type="button" onClick={() => void login("anna", "titok123")}>
        Login
      </button>

      <button type="button" onClick={() => void logout()}>
        Logout
      </button>

      <button
        type="button"
        onClick={() =>
          void register("csilla", "csilla@gmail.com", "titok123", "titok123")
        }
      >
        Register
      </button>

      <button type="button" onClick={() => void refreshUser()}>
        Refresh
      </button>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws an error when useAuth is used outside AuthProvider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    function OutsideConsumer() {
      useAuth();
      return null;
    }

    expect(() => render(<OutsideConsumer />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );

    consoleErrorSpy.mockRestore();
  });

  it("restores the session on mount and marks the user as authenticated", async () => {
    mockMe.mockResolvedValue(existingUser);

    renderAuthProvider();

    expect(screen.getByText("Loading: igen")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Loading: nem")).toBeInTheDocument();
    });

    expect(mockMe).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Authenticated: igen")).toBeInTheDocument();
    expect(screen.getByText("User: anna")).toBeInTheDocument();
  });

  it("handles restoreSession failure, logs the error, and keeps guest state", async () => {
    const restoreError = new Error("Session restore failed");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    mockMe.mockRejectedValue(restoreError);

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("Loading: nem")).toBeInTheDocument();
    });

    expect(screen.getByText("Authenticated: nem")).toBeInTheDocument();
    expect(screen.getByText("User: vendég")).toBeInTheDocument();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to restore auth session:",
      restoreError,
    );

    consoleErrorSpy.mockRestore();
  });

  it("login stores the returned user and authenticates the session", async () => {
    const user = userEvent.setup();

    mockMe.mockResolvedValue(null);
    mockLogin.mockResolvedValue(existingUser);

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("Loading: nem")).toBeInTheDocument();
    });

    expect(screen.getByText("User: vendég")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: "anna",
        password: "titok123",
      });
    });

    expect(screen.getByText("Authenticated: igen")).toBeInTheDocument();
    expect(screen.getByText("User: anna")).toBeInTheDocument();
  });

  it("logout clears the current user", async () => {
    const user = userEvent.setup();

    mockMe.mockResolvedValue(existingUser);
    mockLogout.mockResolvedValue(null);

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("User: anna")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Authenticated: nem")).toBeInTheDocument();
    expect(screen.getByText("User: vendég")).toBeInTheDocument();
  });

  it("register stores the newly registered user", async () => {
    const user = userEvent.setup();

    mockMe.mockResolvedValue(null);
    mockRegister.mockResolvedValue(registeredUser);

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("Loading: nem")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: "csilla",
        email: "csilla@gmail.com",
        password: "titok123",
        confirmation: "titok123",
      });
    });

    expect(screen.getByText("Authenticated: igen")).toBeInTheDocument();
    expect(screen.getByText("User: csilla")).toBeInTheDocument();
  });

  it("refreshUser sets loading during refresh and updates the user from authApi.me", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<User | null>();

    mockMe.mockResolvedValueOnce(existingUser);
    mockMe.mockReturnValueOnce(deferred.promise);

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("User: anna")).toBeInTheDocument();
    });

    expect(screen.getByText("Loading: nem")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => {
      expect(screen.getByText("Loading: igen")).toBeInTheDocument();
    });

    deferred.resolve(refreshedUser);

    await waitFor(() => {
      expect(screen.getByText("Loading: nem")).toBeInTheDocument();
    });

    expect(mockMe).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Authenticated: igen")).toBeInTheDocument();
    expect(screen.getByText("User: bela")).toBeInTheDocument();
  });
});
