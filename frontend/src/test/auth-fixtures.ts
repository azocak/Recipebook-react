import type { User } from "../api/types";

export type AuthState = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  refreshUser: ReturnType<typeof vi.fn>;
};

export function createAuthState(overrides?: Partial<AuthState>): AuthState {
  return {
    user: null,
    loading: false,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
    ...overrides,
  };
}
