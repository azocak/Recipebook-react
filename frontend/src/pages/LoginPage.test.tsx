import { render, screen, waitFor } from "@testing-library/react";
import { createAuthState } from "../test/auth-fixtures";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import userEvent from "@testing-library/user-event";
import { ApiError } from "../api/errors";

const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();

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

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

function setAuthState(overrides?: Partial<ReturnType<typeof createAuthState>>) {
  const state = createAuthState(overrides);
  mockUseAuth.mockReturnValue(state);
  return state;
}

function renderLoginPage(
  initialEntry: string | { pathname: string; state?: unknown } = "/login",
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthState();
  });

  it("shows validation errors when the required fields are empty", async () => {
    const user = userEvent.setup();
    const authState = setAuthState();

    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Belépés" }));

    expect(authState.login).not.toHaveBeenCalled();

    expect(
      screen.getByText("A felhasználónév megadása kötelező."),
    ).toBeInTheDocument();
    expect(screen.getByText("A jelszó megadása kötelező.")).toBeInTheDocument();
  });

  it("shows the backend login error", async () => {
    const user = userEvent.setup();
    const authState = setAuthState({
      login: vi.fn().mockRejectedValue(
        new ApiError("Login failed", 400, {
          non_field_errors: ["Hibás felhasználónév vagy jelszó."],
        }),
      ),
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/Felhasználónév/i), "anna");
    await user.type(screen.getByLabelText(/Jelszó/i), "rosszjelszo");
    await user.click(screen.getByRole("button", { name: "Belépés" }));

    await waitFor(() => {
      expect(authState.login).toHaveBeenCalledWith("anna", "rosszjelszo");
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Hibás felhasználónév vagy jelszó.",
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("logs in successfully and redirects to /recipes by default", async () => {
    const user = userEvent.setup();
    const authState = setAuthState({
      login: vi.fn().mockResolvedValue(undefined),
    });

    renderLoginPage();

    await user.type(screen.getByLabelText(/Felhasználónév/i), "anna");
    await user.type(screen.getByLabelText(/Jelszó/i), "titok123");
    await user.click(screen.getByRole("button", { name: "Belépés" }));

    await waitFor(() => {
      expect(authState.login).toHaveBeenCalledWith("anna", "titok123");
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recipes", { replace: true });
  });

  it("redirects to location.state.from after a successful login", async () => {
    const user = userEvent.setup();
    const authState = setAuthState({
      login: vi.fn().mockResolvedValue(undefined),
    });

    renderLoginPage({
      pathname: "/login",
      state: {
        from: {
          pathname: "/recipes/new",
        },
      },
    });

    await user.type(screen.getByLabelText(/Felhasználónév/i), "anna");
    await user.type(screen.getByLabelText(/Jelszó/i), "titok123");
    await user.click(screen.getByRole("button", { name: "Belépés" }));

    await waitFor(() => {
      expect(authState.login).toHaveBeenCalledWith("anna", "titok123");
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recipes/new", {
      replace: true,
    });
  });
});
