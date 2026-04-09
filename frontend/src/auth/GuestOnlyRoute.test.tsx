import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { setMockAuthState } from "../test/auth-fixtures";

const mockUseAuth = vi.fn();

vi.mock("./AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

function LoginProbe() {
  const location = useLocation();
  const state = location.state as { from?: { pathname?: string } } | null;

  return (
    <div>
      <p>Belépés oldal</p>
      <p data-testid="from-path">{state?.from?.pathname ?? ""}</p>
    </div>
  );
}

function renderProtectedRoute(initialEntry = "/recipes/new") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<LoginProbe />} />
        <Route
          path="/recipes/new"
          element={
            <ProtectedRoute>
              <div>Új recept oldal</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockAuthState(mockUseAuth);
  });

  it("shows the loading status while auth state is being checked", () => {
    setMockAuthState(mockUseAuth, {
      loading: true,
      isAuthenticated: false,
    });

    renderProtectedRoute();

    expect(
      screen.getByRole("heading", { name: "Ellenőrzés folyamatban..." }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Megnézzük, hogy be vagy-e jelentkezve."),
    ).toBeInTheDocument();
  });

  it("redirects guests to /login and preserves the original location in state.from", () => {
    setMockAuthState(mockUseAuth, {
      loading: false,
      isAuthenticated: false,
    });

    renderProtectedRoute("/recipes/new");

    expect(screen.getByText("Belépés oldal")).toBeInTheDocument();
    expect(screen.getByTestId("from-path")).toHaveTextContent("/recipes/new");
  });

  it("renders the protected children for authenticated users", () => {
    setMockAuthState(mockUseAuth, {
      loading: false,
      isAuthenticated: true,
      user: {
        id: 1,
        username: "anna",
        email: "anna@gmail.com",
      },
    });

    renderProtectedRoute();

    expect(screen.getByText("Új recept oldal")).toBeInTheDocument();
    expect(screen.queryByText("Belépés oldal")).not.toBeInTheDocument();
  });
});
