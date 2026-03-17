import { useState } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
  type Location,
} from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const location = useLocation() as Location & {
    state: LoginLocationState | null;
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Add meg a felhasználónevet és a jelszót!");
      return;
    }

    try {
      setSubmitting(true);
      await login(username.trim(), password);
      const from = location.state?.from ?? "/recipes";
      navigate(from, { replace: true });
    } catch {
      setError("Sikertelen bejelentkezés. Hibás adatok?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section>
        <div>
          <h1>Bejelentkezés</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Felhasználónév</label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                name="username"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Jelszó</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="text-sm text-red-300">{error}</div>}
            <button type="submit" disabled={submitting || loading}>
              {submitting || loading ? "Bejelentkezés" : "Belépés"}
            </button>
          </form>
          <p>
            Még nincs fiókod?
            <NavLink to="/register">Regisztrálj itt.</NavLink>
          </p>
        </div>
      </section>
    </>
  );
}
