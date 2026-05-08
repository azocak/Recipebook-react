/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth";
import type { User } from "../api/types";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    confirmation: string,
  ) => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      console.error("Failed to restore auth session:", error);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setLoading(true);

    try {
      await restoreSession();
    } finally {
      setLoading(false);
    }
  }, [restoreSession]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (username: string, password: string) => {
    const loggedInUser = await authApi.login({ username, password });
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string,
      confirmation: string,
    ) => {
      const newUser = await authApi.register({
        username,
        email,
        password,
        confirmation,
      });
      setUser(newUser);
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
      register,
      isAuthenticated: !!user,
      refreshUser,
    }),
    [user, loading, login, logout, register, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
