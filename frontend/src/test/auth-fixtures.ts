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

export type MockUseAuth = ReturnType<typeof vi.fn>;

export function setMockAuthState(
  mockUseAuth: MockUseAuth,
  overrides?: Partial<AuthState>,
) {
  const state = createAuthState(overrides);
  mockUseAuth.mockReturnValue(state);
  return state;
}

export function setGuestAuth(mockUseAuth: MockUseAuth) {
  return setMockAuthState(mockUseAuth);
}

export function setAuthenticatedUser(
  mockUseAuth: MockUseAuth,
  user = {
    id: 1,
    username: "anna",
    email: "anna@gmail.com",
  },
) {
  return setMockAuthState(mockUseAuth, {
    user,
    isAuthenticated: true,
  });
}
