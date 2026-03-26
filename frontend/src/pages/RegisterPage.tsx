import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";

import { mapApiErrorsToFormErrors } from "../utils/mapApiErrorsToFormErrors";
import { AuthLayout } from "../components/auth/AuthLayout";
import { TextInputField } from "../components/auth/TextInputField";

type RegisterFormErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmation?: string;
  general?: string;
};

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<RegisterFormErrors>({});

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const nextErrors: RegisterFormErrors = {};

    if (!username.trim()) {
      nextErrors.username = "A felhasználónév megadása kötelező.";
    }
    if (!email.trim()) {
      nextErrors.email = "Az email cím megadása kötelező.";
    }
    if (!password) {
      nextErrors.password = "A jelszó megadása kötelező.";
    }
    if (!confirmation) {
      nextErrors.confirmation = "A jelszó megerősítése kötelező.";
    }

    if (password && confirmation && password !== confirmation) {
      nextErrors.confirmation = "A két jelszó nem egyezik.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    try {
      setSubmitting(true);
      await register(username.trim(), email.trim(), password, confirmation);
      navigate("/recipes", { replace: true });
    } catch (error) {
      setErrors(
        mapApiErrorsToFormErrors(
          error,
          ["username", "email", "password", "confirmation"],
          "A regisztráció sikertelen.",
        ) as RegisterFormErrors,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Regisztráció"
      subtitle="Hozd létre a fiókodat a receptkönyv használatához."
      footer={
        <p>
          Már van fiókod?{" "}
          <NavLink
            to="/login"
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            Jelentkezz be
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
          placeholder="pl. chef123"
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
          id="email"
          label="Email cím"
          type="email"
          name="email"
          value={email}
          error={errors.email}
          required
          autoComplete="email"
          placeholder="te@pelda.hu"
          onChange={(value) => {
            setEmail(value);
            setErrors((current) => ({
              ...current,
              email: undefined,
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
          hint="Használj erős, nehezen kitalálható jelszót."
          required
          autoComplete="new-password"
          placeholder="••••••••"
          onChange={(value) => {
            setPassword(value);
            setErrors((current) => ({
              ...current,
              password: undefined,
              general: undefined,
            }));
          }}
        />

        <TextInputField
          id="confirmation"
          label="Jelszó megerősítése"
          type="password"
          name="confirmation"
          value={confirmation}
          error={errors.confirmation}
          required
          autoComplete="new-password"
          placeholder="••••••••"
          onChange={(value) => {
            setConfirmation(value);
            setErrors((current) => ({
              ...current,
              confirmation: undefined,
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
          {submitting || loading ? "Regisztráció..." : "Fiók létrehozása"}
        </button>
      </form>
    </AuthLayout>
  );
}
