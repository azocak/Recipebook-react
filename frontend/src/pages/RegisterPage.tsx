import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/errors";

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

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
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
      nextErrors.username = "A jelszó megerősítése kötelező.";
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
    } catch (err) {
      const nextErrors: RegisterFormErrors = {
        general: "A regisztráció sikertelen",
      };

      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const data = err.data as Record<string, unknown>;

        if (
          Array.isArray(data.username) &&
          typeof data.username[0] === "string"
        ) {
          nextErrors.username = data.username[0];
        }

        if (Array.isArray(data.email) && typeof data.email[0] === "string") {
          nextErrors.email = data.email[0];
        }

        if (
          Array.isArray(data.password) &&
          typeof data.password[0] === "string"
        ) {
          nextErrors.password = data.password[0];
        }

        if (
          Array.isArray(data.confirmation) &&
          typeof data.confirmation[0] === "string"
        ) {
          nextErrors.confirmation = data.confirmation[0];
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
    <section>
      <div>
        <h1>Regisztráció</h1>
        <p>Hozd létre a fiókodat a receptkönyv használatához.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="username">Felhasználónév</label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="pl. chef123"
            />
            {errors.username && <p>{errors.username}</p>}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="te@pelda.hu"
            />
            {errors.email && <p>{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password">Jelszó</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {errors.password && <p>{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirmation">Jelszó mégegyszer</label>
            <input
              type="password"
              name="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="••••••••"
            />
            {errors.confirmation && <p>{errors.confirmation}</p>}
          </div>

          {errors.general && <div>{errors.general}</div>}

          <button type="submit" disabled={submitting || loading}>
            {submitting || loading ? "Regisztráció..." : "Fiók létrehozása"}
          </button>
        </form>
      </div>
    </section>
  );
}
