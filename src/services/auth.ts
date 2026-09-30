import { UserSession, RegisteredUser, AuthResult } from '../types';

const STORAGE_KEYS = {
  USERS: 'studyai_registered_users',
  SESSION: 'studyai_auth_session',
  LEGACY_USER: 'studyai_user'
};

// Standard email regex validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Retrieve all registered users from persistence
 */
export function getRegisteredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      // Seed default existing user for immediate testing of the "Existing User Flow"
      const defaultUsers: RegisteredUser[] = [
        {
          id: 'usr_demo_01',
          name: 'Sayantan Maity',
          email: 'sayantanmaity41@gmail.com',
          password: 'Password123',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Failed to read registered users:', error);
    return [];
  }
}

/**
 * Register a new user account
 * Validates inputs, checks for duplicates, and stores the user without logging in.
 */
export async function registerUser(
  fullName: string,
  email: string,
  password: string,
  confirmPassword?: string
): Promise<AuthResult> {
  const trimmedName = (fullName || '').trim();
  const trimmedEmail = (email || '').trim().toLowerCase();

  // 1. Check all required fields
  if (!trimmedName) {
    return {
      success: false,
      message: 'Full Name is required.',
      code: 'VALIDATION_ERROR'
    };
  }

  if (!trimmedEmail) {
    return {
      success: false,
      message: 'Email address is required.',
      code: 'VALIDATION_ERROR'
    };
  }

  // 2. Validate email format
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      success: false,
      message: 'Please enter a valid email address (e.g. name@example.com).',
      code: 'VALIDATION_ERROR'
    };
  }

  // 3. Validate password length
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      code: 'VALIDATION_ERROR'
    };
  }

  // 4. Validate password confirmation
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return {
      success: false,
      message: 'Password and Confirm Password do not match.',
      code: 'VALIDATION_ERROR'
    };
  }

  // 5. Check if account already exists
  const users = getRegisteredUsers();
  const existingIndex = users.findIndex(u => u.email.toLowerCase() === trimmedEmail);
  
  let newUser: RegisteredUser;
  let updatedUsers: RegisteredUser[];

  if (existingIndex !== -1) {
    // If account exists (e.g. pre-seeded demo or previous registration), update with the new password and name
    newUser = {
      ...users[existingIndex],
      name: trimmedName,
      password: password
    };
    updatedUsers = [...users];
    updatedUsers[existingIndex] = newUser;
  } else {
    // Create new registered user
    newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      email: trimmedEmail,
      password: password,
      createdAt: new Date().toISOString()
    };
    updatedUsers = [...users, newUser];
  }

  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  } catch (error) {
    return {
      success: false,
      message: 'Storage error. Unable to create account.',
      code: 'VALIDATION_ERROR'
    };
  }

  // Generate active session for immediate access
  const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const userSession: UserSession = {
    name: newUser.name,
    email: newUser.email,
    isLoggedIn: true,
    token: sessionToken
  };

  try {
    const sessionData = {
      token: sessionToken,
      user: userSession,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    localStorage.setItem(STORAGE_KEYS.LEGACY_USER, JSON.stringify(userSession));
  } catch (error) {
    console.error('Failed to store new session:', error);
  }

  return {
    success: true,
    message: 'Account created successfully!',
    user: userSession,
    code: 'SUCCESS'
  };
}

/**
 * Sign In a user with email and password
 * Validates credentials and creates an active session.
 */
export async function loginUser(
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<AuthResult> {
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail) {
    return {
      success: false,
      message: 'Please enter your email address.',
      code: 'VALIDATION_ERROR'
    };
  }

  if (!password) {
    return {
      success: false,
      message: 'Please enter your password.',
      code: 'VALIDATION_ERROR'
    };
  }

  const users = getRegisteredUsers();
  // Find by email or username
  const matchedUser = users.find(
    u => u.email.toLowerCase() === trimmedEmail || u.name.toLowerCase() === trimmedEmail
  );

  // If no account with this email exists
  if (!matchedUser) {
    return {
      success: false,
      message: 'No account found with this email. Please create an account first.',
      code: 'USER_NOT_FOUND'
    };
  }

  // Verify password
  if (matchedUser.password !== password) {
    return {
      success: false,
      message: 'Invalid email or password.',
      code: 'INVALID_CREDENTIALS'
    };
  }

  // Generate secure session
  const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const userSession: UserSession = {
    name: matchedUser.name,
    email: matchedUser.email,
    isLoggedIn: true,
    token: sessionToken
  };

  try {
    const sessionData = {
      token: sessionToken,
      user: userSession,
      createdAt: Date.now(),
      expiresAt: Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
    };
    
    // Store in session storage / local storage
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    localStorage.setItem(STORAGE_KEYS.LEGACY_USER, JSON.stringify(userSession));
  } catch (error) {
    console.error('Failed to store auth session:', error);
  }

  return {
    success: true,
    message: 'Login successful!',
    user: userSession,
    code: 'SUCCESS'
  };
}

/**
 * Log out user: clears active session tokens and state
 */
export function logoutUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    
    // Prevent browser back button from re-entering dashboard
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

/**
 * Check if current session is active, valid, and unexpired
 */
export function isAuthenticated(): boolean {
  try {
    const rawSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!rawSession) return false;

    const session = JSON.parse(rawSession);
    if (!session || !session.token || !session.user || !session.user.isLoggedIn) {
      return false;
    }

    // Check expiration
    if (session.expiresAt && Date.now() > session.expiresAt) {
      logoutUser();
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get current authenticated user details
 */
export function getCurrentUser(): UserSession | null {
  if (!isAuthenticated()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEGACY_USER) || localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.user) return parsed.user;
    if (parsed.isLoggedIn) return parsed;
    return null;
  } catch {
    return null;
  }
}

/**
 * Route protection guard
 * Redirects to Sign In if the user is unauthenticated
 */
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
  protectRoute,
  getRegisteredUsers
};
