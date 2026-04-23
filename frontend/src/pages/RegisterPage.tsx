import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "../auth/AuthContext";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import {
  AUTH_GENERAL_ERRORS,
  REGISTER_ALLOWED_ERROR_FIELDS,
} from "../constants/auth";
import { applyApiErrorsToForm } from "../forms/apiErrorAdapter";
import { registerSchema, type RegisterSchemaValues } from "../schemas/auth";

export function RegisterPage() {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchemaValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmation: "",
    },
    mode: "onSubmit",
  });

  const usernameField = register("username");
  const emailField = register("email");
  const passwordField = register("password");
  const confirmationField = register("confirmation");

  const isBusy = isSubmitting || loading;

  async function onSubmit(values: RegisterSchemaValues) {
    try {
      await registerUser(
        values.username,
        values.email,
        values.password,
        values.confirmation,
      );
      navigate("/recipes", { replace: true });
    } catch (error) {
      applyApiErrorsToForm<RegisterSchemaValues>(error, setError, {
        allowedFields: REGISTER_ALLOWED_ERROR_FIELDS,
        fallbackMessage: AUTH_GENERAL_ERRORS.registerFailed,
      });
    }
  }

  return (
    <AuthLayout
      title="Regisztráció"
      subtitle="Hozd létre az új fiókodat."
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
          id="email"
          label="Email cím"
          type="email"
          autoComplete="email"
          placeholder="Email cím"
          required
          error={errors.email?.message}
          disabled={isBusy}
          {...emailField}
          onChange={(event) => {
            clearErrors("email");
            if (errors.root?.server) {
              clearErrors();
            }
            emailField.onChange(event);
          }}
        />

        <Input
          id="password"
          label="Jelszó"
          type="password"
          autoComplete="new-password"
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

        <Input
          id="confirmation"
          label="Jelszó megerősítése"
          type="password"
          autoComplete="new-password"
          placeholder="Jelszó megerősítése"
          required
          error={errors.confirmation?.message}
          disabled={isBusy}
          {...confirmationField}
          onChange={(event) => {
            clearErrors("confirmation");
            if (errors.root?.server) {
              clearErrors();
            }
            confirmationField.onChange(event);
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
          {isBusy ? "Fiók létrehozása folyamatban..." : "Fiók létrehozása"}
        </Button>
      </form>
    </AuthLayout>
  );
}
