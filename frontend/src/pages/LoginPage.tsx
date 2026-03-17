import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/errors";

type LoginFormErrors = {
  username?: string;
  password?: string;
  general?: string;
};

type LocationState = {
  from?: {
    pathname?: string;
  };
};
export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const from =
    (location.state as LocationState | null)?.from?.pathname || "/recipes";

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const nextErrors: LoginFormErrors = {};

    if (!username.trim()) {
      nextErrors.username = "A felhasználónév megadása kötelező.";
    }

    if (!password) {
      nextErrors.password = "A jelszó megadása kötelező.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    try {
      setSubmitting(true);
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const nextErrors: LoginFormErrors = {
        general: "A bejelentkezés sikertelen.",
      };

      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const data = err.data as Record<string, unknown>;

        if (
          Array.isArray(data.username) &&
          typeof data.username[0] === "string"
        ) {
          nextErrors.username = data.username[0];
        }

        if (
          Array.isArray(data.password) &&
          typeof data.password[0] === "string"
        ) {
          nextErrors.password = data.password[0];
        }

        if (typeof data.detail === "string") {
          nextErrors.general = data.detail;
        }
      }

      setErrors(nextErrors);
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
              {errors.username && <p>{errors.username}</p>}
            </div>
            <div>
              <label htmlFor="password">Jelszó</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p>{errors.password}</p>}
            </div>
            {errors.general && <p>{errors.general}</p>}
            <button type="submit" disabled={submitting || loading}>
              {submitting || loading ? "Bejelentkezés..." : "Belépés"}
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
