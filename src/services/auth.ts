import { UserSession, AuthResult } from '../types';
import { authApi, ApiError } from './api';

/**
 * Check if the user is authenticated by calling the backend /api/auth/me
 * Falls back to localStorage cache for synchronous checks on initial load
 */
const SESSION_CACHE_KEY = 'scholarhub_session_cache';

function getCachedUser(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.isLoggedIn ? parsed : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: UserSession | null) {
  try {
    if (user) {
      localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_CACHE_KEY);
    }
  } catch {
    // ignore
  }
}

export async function registerUser(
  fullName: string,
  email: string,
  password: string,
  confirmPassword?: string
): Promise<AuthResult> {
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return {
      success: false,
      message: 'Password and Confirm Password do not match.',
      code: 'VALIDATION_ERROR',
    };
  }

  try {
    const result = await authApi.register(fullName, email, password);
    const userSession: UserSession = {
      name: result.user.name,
      email: result.user.email,
      isLoggedIn: true,
    };
    setCachedUser(userSession);
    return {
      success: true,
      message: 'Account created successfully!',
      user: userSession,
      code: 'SUCCESS',
    };
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Failed to create account.';
    const code = err instanceof ApiError && err.status === 409 ? 'EMAIL_EXISTS' : 'VALIDATION_ERROR';
    return { success: false, message, code };
  }
}

export async function loginUser(
  email: string,
  password: string,
  _rememberMe: boolean = true
): Promise<AuthResult> {
  try {
    const result = await authApi.login(email, password);
    const userSession: UserSession = {
      name: result.user.name,
      email: result.user.email,
      isLoggedIn: true,
    };
    setCachedUser(userSession);
    return {
      success: true,
      message: 'Login successful!',
      user: userSession,
      code: 'SUCCESS',
    };
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Failed to sign in.';
    let code = 'INVALID_CREDENTIALS';
    if (err instanceof ApiError && err.status === 0) {
      code = 'NETWORK_ERROR';
    }
    return { success: false, message, code };
  }
}

export function logoutUser(): void {
  setCachedUser(null);
  // Fire and forget the backend logout
  authApi.logout().catch(() => {});
}

export function isAuthenticated(): boolean {
  return getCachedUser() !== null;
}

export function getCurrentUser(): UserSession | null {
  return getCachedUser();
}

export async function verifySession(): Promise<UserSession | null> {
  try {
    const result = await authApi.me();
    const userSession: UserSession = {
      name: result.user.name,
      email: result.user.email,
      isLoggedIn: true,
    };
    setCachedUser(userSession);
    return userSession;
  } catch {
    setCachedUser(null);
    return null;
  }
}

export function protectRoute(
  onUnauthenticated?: (message: string) => void
): boolean {
  const authenticated = isAuthenticated();
  if (!authenticated) {
    const msg = 'Please sign in to access your dashboard.';
    if (onUnauthenticated) {
      onUnauthenticated(msg);
    }
    return false;
  }
  return true;
}

export const authService = {
  registerUser,
  loginUser,
  logoutUser,
  isAuthenticated,
  getCurrentUser,
  verifySession,
  protectRoute,
};
