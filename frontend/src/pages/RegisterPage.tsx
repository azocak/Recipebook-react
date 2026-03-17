import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !email.trim() || !password || !confirmation) {
      setError("Minden mező kitöltése kötelező.");
      return;
    }

    if (password !== confirmation) {
      setError("A két jelszó nem egyezik.");
      return;
    }

    try {
      setSubmitting(true);
      await register(username.trim(), email.trim(), password, confirmation);
      navigate("/recipes", { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        "A regisztráció sikertelen. Lehet, hogy a felhasználónév már foglalt.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <div>
        <h1></h1>
        <p></p>
        <form onSubmit={handleSubmit}>
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
          </div>

          {error && <div>{error}</div>}

          <button type="submit" disabled={submitting || loading}>
            {submitting || loading ? "Regisztráció..." : "Fiók létrehozása"}
          </button>
        </form>
      </div>
    </section>
  );
}
