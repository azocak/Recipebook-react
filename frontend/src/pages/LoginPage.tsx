import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import { mapApiErrorsToFormErrors } from "../utils/mapApiErrorsToFormErrors";
import { AuthLayout } from "../components/auth/AuthLayout";
import { TextInputField } from "../components/auth/TextInputField";
import {
  AUTH_GENERAL_ERRORS,
  AUTH_REQUIRED_ERRORS,
  LOGIN_ALLOWED_ERROR_FIELDS,
} from "../constants/auth";

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

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const nextErrors: LoginFormErrors = {};

    if (!username.trim()) {
      nextErrors.username = AUTH_REQUIRED_ERRORS.username;
    }

    if (!password) {
      nextErrors.password = AUTH_REQUIRED_ERRORS.password;
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
          LOGIN_ALLOWED_ERROR_FIELDS,
          AUTH_GENERAL_ERRORS.loginFailed,
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
          Még nincs fiókod?{" "}
          <NavLink
            to="/register"
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            Regisztrálj
          </NavLink>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextInputField
          id="username"
          label="Felhasználónév"
          name="username"
          value={username}
          error={errors.username}
          required
          autoComplete="username"
          placeholder="Felhasználónév"
          onChange={(value) => {
            setUsername(value);
            setErrors((current) => ({
              ...current,
              username: undefined,
              general: undefined,
            }));
          }}
        />

        <TextInputField
          id="password"
          label="Jelszó"
          type="password"
          name="password"
          value={password}
          error={errors.password}
          required
          autoComplete="current-password"
          placeholder="Jelszó"
          onChange={(value) => {
            setPassword(value);
            setErrors((current) => ({
              ...current,
              password: undefined,
              general: undefined,
            }));
          }}
        />

        {errors.general ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {errors.general}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting || loading ? "Bejelentkezés folyamatban..." : "Belépés"}
        </button>
      </form>
    </AuthLayout>
  );
}
