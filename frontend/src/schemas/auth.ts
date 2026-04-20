import { z } from "zod";
import {
  AUTH_REQUIRED_ERRORS,
  AUTH_VALIDATION_ERRORS,
} from "../constants/auth";

const INVALID_EMAIL_ERROR = "Adj meg érvényes email címet.";

const requiredTrimmedString = (requiredError: string) =>
  z.string({ error: requiredError }).trim().min(1, { error: requiredError });

export const loginSchema = z.object({
  username: requiredTrimmedString(AUTH_REQUIRED_ERRORS.username),
  password: z
    .string({ error: AUTH_REQUIRED_ERRORS.password })
    .min(1, { error: AUTH_REQUIRED_ERRORS.password }),
});

export const registerSchema = z
  .object({
    username: requiredTrimmedString(AUTH_REQUIRED_ERRORS.username),
    email: requiredTrimmedString(AUTH_REQUIRED_ERRORS.email).refine(
      (value) => z.email().safeParse(value).success,
      { error: INVALID_EMAIL_ERROR },
    ),
    password: z
      .string({ error: AUTH_REQUIRED_ERRORS.password })
      .min(1, { error: AUTH_REQUIRED_ERRORS.password }),
    confirmation: z
      .string({ error: AUTH_REQUIRED_ERRORS.confirmation })
      .min(1, { error: AUTH_REQUIRED_ERRORS.confirmation }),
  })
  .refine((data) => data.password === data.confirmation, {
    path: ["confirmation"],
    error: AUTH_VALIDATION_ERRORS.passwordMismatch,
  });

export type LoginSchemaValues = z.infer<typeof loginSchema>;
export type RegisterSchemaValues = z.infer<typeof registerSchema>;
