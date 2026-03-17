import { apiRequest } from "./client";
import type { User } from "./types";

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  confirmation: string;
};

export const authApi = {
  me() {
    return apiRequest<User | null>("/auth/me", {
      method: "GET",
    });
  },

  register(data: RegisterPayload) {
    return apiRequest<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: LoginPayload) {
    return apiRequest<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout() {
    return apiRequest<null>("/auth/logout", {
      method: "POST",
    });
  },
};
