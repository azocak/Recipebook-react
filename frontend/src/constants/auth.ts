export const LOGIN_ALLOWED_ERROR_FIELDS = ["username", "password"];

export const REGISTER_ALLOWED_ERROR_FIELDS = [
  "username",
  "email",
  "password",
  "confirmation",
];

export const AUTH_REQUIRED_ERRORS = {
  username: "A felhasználónév megadása kötelező.",
  email: "Az email cím megadása kötelező.",
  password: "A jelszó megadása kötelező.",
  confirmation: "A jelszó megerősítése kötelező.",
} as const;

export const AUTH_VALIDATION_ERRORS = {
  passwordMismatch: "A két jelszó nem egyezik.",
} as const;

export const AUTH_GENERAL_ERRORS = {
  loginFailed: "A bejelentkezés sikertelen.",
  registerFailed: "A regisztráció sikertelen.",
} as const;
