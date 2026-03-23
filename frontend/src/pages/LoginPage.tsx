import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import { mapApiErrorsToFormErrors } from "../utils/mapApiErrorsToFormErrors";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/Formfield";

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
    } catch (error) {
      setErrors(
        mapApiErrorsToFormErrors(
          error,
          ["username", "password"],
          "A bejelentkezés sikertelen.",
        ) as LoginFormErrors,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Bejelentkezés"
      subtitle="Lépj be a fiókodba."
      footer={
        <p>
          Még nincs fiókod? <NavLink to="/register">Regisztrálj</NavLink>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField id="username" label="Felhasználónév" error={errors.username}>
          <input
            id="username"
            type="text"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Felhasználónév"
          />
        </FormField>

        <FormField id="password" label="Jelszó" error={errors.password}>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Jelszó"
          />
        </FormField>

        {errors.general && <div>{errors.general}</div>}

        <button type="submit" disabled={submitting || loading}>
          {submitting || loading ? "Bejelentkezés folyamatban..." : "Belépés"}
        </button>
      </form>
    </AuthLayout>
  );
}
