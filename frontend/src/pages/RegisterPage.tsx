import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";

import { mapApiErrors } from "../utils/mapApiErrors";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/Formfield";

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
        mapApiErrors(
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
          Már van fiókod? <NavLink to="/login">Jelentkezz be</NavLink>
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
            onChange={(e) => setUsername(e.target.value)}
            placeholder="pl. chef123"
          />
        </FormField>
        <FormField id="email" label="Email" error={errors.email}>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="te@pelda.hu"
          />
        </FormField>
        <FormField id="password" label="Jelszó" error={errors.password}>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </FormField>
        <FormField
          id="confirmation"
          label="Jelszó mégegyszer"
          error={errors.confirmation}
        >
          <input
            id="confirmation"
            type="password"
            name="confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="••••••••"
          />
        </FormField>

        {errors.general && <div>{errors.general}</div>}

        <button type="submit" disabled={submitting || loading}>
          {submitting || loading ? "Regisztráció..." : "Fiók létrehozása"}
        </button>
      </form>
    </AuthLayout>
  );
}
