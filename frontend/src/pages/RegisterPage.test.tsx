import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ApiError } from "../api/errors";
import { createAuthState } from "../test/auth-fixtures";
import { RegisterPage } from "./RegisterPage";

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

function renderRegisterPage(route = "/register") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthState();
  });

  it("shows validation errors when all required fields are empty", async () => {
    const user = userEvent.setup();
    const authState = setAuthState();

    renderRegisterPage();

    await user.click(screen.getByRole("button", { name: "Fiók létrehozása" }));

    expect(authState.register).not.toHaveBeenCalled();

    expect(
      screen.getByText("A felhasználónév megadása kötelező."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Az email cím megadása kötelező."),
    ).toBeInTheDocument();
    expect(screen.getByText("A jelszó megadása kötelező.")).toBeInTheDocument();
    expect(
      screen.getByText("A jelszó megerősítése kötelező."),
    ).toBeInTheDocument();
  });

  it("shows an error when the two passwords do not match", async () => {
    const user = userEvent.setup();
    const authState = setAuthState();

    renderRegisterPage();

    await user.type(screen.getByLabelText(/Felhasználónév/i), "anna");
    await user.type(screen.getByLabelText(/Email cím/i), "anna@gmail.com");
    await user.type(screen.getByLabelText(/^Jelszó\s*\*?$/i), "titok123");
    await user.type(
      screen.getByLabelText(/^Jelszó megerősítése\s*\*?$/i),
      "masjelszo123",
    );

    await user.click(screen.getByRole("button", { name: "Fiók létrehozása" }));

    expect(authState.register).not.toHaveBeenCalled();
    expect(screen.getByText("A két jelszó nem egyezik.")).toBeInTheDocument();
  });

  it("maps backend field errors to the matching form fields", async () => {
    const user = userEvent.setup();
    const authState = setAuthState({
      register: vi.fn().mockRejectedValue(
        new ApiError("Register failed", 400, {
          username: ["Ez a felhasználónév már foglalt."],
          email: ["Adj meg érvényes email címet."],
        }),
      ),
    });

    renderRegisterPage();

    await user.type(screen.getByLabelText(/Felhasználónév/i), "  anna  ");
    await user.type(screen.getByLabelText(/Email cím/i), "  rossz-email  ");
    await user.type(screen.getByLabelText(/^Jelszó\s*\*?$/i), "titok123");
    await user.type(
      screen.getByLabelText(/^Jelszó megerősítése\s*\*?$/i),
      "titok123",
    );

    await user.click(screen.getByRole("button", { name: "Fiók létrehozása" }));

    await waitFor(() => {
      expect(authState.register).toHaveBeenCalledWith(
        "anna",
        "rossz-email",
        "titok123",
        "titok123",
      );
    });

    expect(
      screen.getByText("Ez a felhasználónév már foglalt."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Adj meg érvényes email címet."),
    ).toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A regisztráció sikertelen.",
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("registers successfully and redirects to /recipes", async () => {
    const user = userEvent.setup();
    const authState = setAuthState({
      register: vi.fn().mockResolvedValue(undefined),
    });

    renderRegisterPage();

    await user.type(screen.getByLabelText(/Felhasználónév/i), "  anna  ");
    await user.type(screen.getByLabelText(/Email cím/i), "  anna@gmail.com  ");
    await user.type(screen.getByLabelText(/^Jelszó\s*\*?$/i), "titok123");
    await user.type(
      screen.getByLabelText(/^Jelszó megerősítése\s*\*?$/i),
      "titok123",
    );

    await user.click(screen.getByRole("button", { name: "Fiók létrehozása" }));

    await waitFor(() => {
      expect(authState.register).toHaveBeenCalledWith(
        "anna",
        "anna@gmail.com",
        "titok123",
        "titok123",
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recipes", { replace: true });
  });
});
