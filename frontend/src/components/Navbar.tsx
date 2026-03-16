import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.tsx";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <header>
      <div>
        <div>
          Receptkönyv
          <span>2026</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/recipes">Receptek</NavLink>

          {user ? (
            <>
              <span>
                Hello, <span>{user.username}</span>
              </span>
              <button onClick={handleLogout}>Kijelentkezés</button>
            </>
          ) : (
            <>
              <NavLink to="/register">Regisztráció</NavLink>
              <NavLink to="/login">Belépés</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
