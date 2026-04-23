import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "../auth/AuthContext";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import {
  AUTH_GENERAL_ERRORS,
  LOGIN_ALLOWED_ERROR_FIELDS,
} from "../constants/auth";
import { applyApiErrorsToForm } from "../forms/apiErrorAdapter";
import { loginSchema, type LoginSchemaValues } from "../schemas/auth";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as LocationState | null)?.from?.pathname || "/recipes";

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const usernameField = register("username");
  const passwordField = register("password");

  const isBusy = isSubmitting || loading;

  async function onSubmit(values: LoginSchemaValues) {
    try {
      await login(values.username, values.password);
      navigate(from, { replace: true });
    } catch (error) {
      applyApiErrorsToForm<LoginSchemaValues>(error, setError, {
        allowedFields: LOGIN_ALLOWED_ERROR_FIELDS,
        fallbackMessage: AUTH_GENERAL_ERRORS.loginFailed,
      });
    }
  }

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
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          id="username"
          label="Felhasználónév"
          autoComplete="username"
          placeholder="Felhasználónév"
          required
          error={errors.username?.message}
          disabled={isBusy}
          {...usernameField}
          onChange={(event) => {
            clearErrors("username");
            if (errors.root?.server) {
              clearErrors();
            }
            usernameField.onChange(event);
          }}
        />

        <Input
          id="password"
          label="Jelszó"
          type="password"
          autoComplete="current-password"
          placeholder="Jelszó"
          required
          error={errors.password?.message}
          disabled={isBusy}
          {...passwordField}
          onChange={(event) => {
            clearErrors("password");
            if (errors.root?.server) {
              clearErrors();
            }
            passwordField.onChange(event);
          }}
        />

        {errors.root?.server?.message ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {errors.root.server.message}
          </div>
        ) : null}

        <Button type="submit" fullWidth size="lg" isLoading={isBusy}>
          {isBusy ? "Bejelentkezés folyamatban..." : "Belépés"}
        </Button>
      </form>
    </AuthLayout>
  );
}
