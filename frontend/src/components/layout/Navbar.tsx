import {
  NavLink,
  useLocation,
  useNavigate,
  type NavLinkRenderProps,
} from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.tsx";
import { useMemo, useState } from "react";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage.ts";
import { Button } from "../ui/Button.tsx";

function getNavLinkClassname({ isActive }: NavLinkRenderProps) {
  return [
    "rounded-full px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-700 hover:bg-white hover:text-slate-900",
  ].join(" ");
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const welcomeLabel = useMemo(() => {
    if (!user) {
      return null;
    }

    return `Szia, ${user.username}!`;
  }, [user]);

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/login", {
        replace: true,
        state: {
          from: {
            pathname: location.pathname,
          },
        },
      });
    } catch (error) {
      setLogoutError(
        getApiErrorMessage(error, "A kijelentkezés nem sikerült."),
      );
    } finally {
      setIsLoggingOut(false);
    }
  }
  return (
    <header className="border-b border-orange-100 bg-orange-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4 md:justify-start ">
            <NavLink
              to="/recipes"
              className="inline-flex items-center gap-3 rounded-2xl px-1 py-1 transition-opacity hover:opacity-90"
              aria-label="Ugrás a receptek oldalra"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-sm">
                R
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold tracking-tight text-slate-950">
                  Receptkönyv
                </span>
                <span className="block text-sm text-slate-600">
                  Találd meg kedvenc receptjeidet.
                </span>
              </span>
            </NavLink>
          </div>

          <div className="flex gap-3 md:items-end">
            <nav
              className="flex flex-wrap items-center gap-2"
              aria-label="Fő navigáció"
            >
              <NavLink to="/recipes" className={getNavLinkClassname}>
                Receptek
              </NavLink>

              {user ? (
                <NavLink to="/recipes/new" className={getNavLinkClassname}>
                  Új recept
                </NavLink>
              ) : null}
            </nav>

            <div className="flex flex-col gap-2 md:items-end">
              {user ? (
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <span className="rounded-full border border-orange-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                    {welcomeLabel}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    isLoading={isLoggingOut}
                    onClick={() => void handleLogout()}
                    className="rounded-full font-medium shadow-sm cursor-pointer"
                  >
                    {isLoggingOut ? "Kijelentkezés..." : "Kijelentkezés"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <NavLink to="/login" className={getNavLinkClassname}>
                    Bejelentkezés
                  </NavLink>
                  <NavLink to="/register" className={getNavLinkClassname}>
                    Regisztráció
                  </NavLink>
                </div>
              )}

              {logoutError ? (
                <p
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:max-w-md"
                  role="alert"
                >
                  {logoutError}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
