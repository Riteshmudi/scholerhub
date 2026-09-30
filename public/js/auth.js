/**
 * Centralized Authentication System for AI Based Study Assistant
 * File: js/auth.js
 * 
 * Reusable functions:
 * - registerUser()
 * - loginUser()
 * - logoutUser()
 * - isAuthenticated()
 * - getCurrentUser()
 * - protectRoute()
 */

const STORAGE_KEYS = {
  USERS: 'studyai_registered_users',
  SESSION: 'studyai_auth_session',
  LEGACY_USER: 'studyai_user'
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Retrieve all registered users from storage
 * @returns {Array} Array of user objects
 */
function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      // Seed default existing user for immediate testing of the "Existing User Flow"
      const defaultUsers = [
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
 * @param {string} fullName 
 * @param {string} email 
 * @param {string} password 
 * @param {string} confirmPassword 
 * @returns {Promise<{success: boolean, message: string, code: string}>}
 */
async function registerUser(fullName, email, password, confirmPassword) {
  const trimmedName = (fullName || '').trim();
  const trimmedEmail = (email || '').trim().toLowerCase();

  // 1. Validate required fields
  if (!trimmedName) {
    return { success: false, message: 'Full Name is required.', code: 'VALIDATION_ERROR' };
  }
  if (!trimmedEmail) {
    return { success: false, message: 'Email address is required.', code: 'VALIDATION_ERROR' };
  }

  // 2. Validate email format
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { success: false, message: 'Please enter a valid email address.', code: 'VALIDATION_ERROR' };
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

  // 5. Prevent duplicate accounts with the same email
  const users = getRegisteredUsers();
  const existingUser = users.find(u => u.email.toLowerCase() === trimmedEmail);
  if (existingUser) {
    return {
      success: false,
      message: 'An account with this email already exists. Please sign in instead.',
      code: 'EMAIL_EXISTS'
    };
  }

  // 6. Save new user (NO auto-login)
  const newUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: trimmedName,
    email: trimmedEmail,
    password: password,
    createdAt: new Date().toISOString()
  };

  try {
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    return { success: false, message: 'Storage error. Unable to create account.', code: 'VALIDATION_ERROR' };
  }

  return {
    success: true,
    message: 'Account created successfully! Please sign in to continue.',
    code: 'SUCCESS'
  };
}

/**
 * Sign In user with credentials
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} rememberMe 
 * @returns {Promise<{success: boolean, message: string, user?: object, code: string}>}
 */
async function loginUser(email, password, rememberMe = true) {
  const trimmedEmail = (email || '').trim().toLowerCase();

  if (!trimmedEmail) {
    return { success: false, message: 'Please enter your email address.', code: 'VALIDATION_ERROR' };
  }
  if (!password) {
    return { success: false, message: 'Please enter your password.', code: 'VALIDATION_ERROR' };
  }

  const users = getRegisteredUsers();
  const matchedUser = users.find(
    u => u.email.toLowerCase() === trimmedEmail || u.name.toLowerCase() === trimmedEmail
  );

  // If user does not exist
  if (!matchedUser) {
    return {
      success: false,
      message: 'No account found with this email. Please create an account first.',
      code: 'USER_NOT_FOUND'
    };
  }

  // Check password
  if (matchedUser.password !== password) {
    return {
      success: false,
      message: 'Invalid email or password.',
      code: 'INVALID_CREDENTIALS'
    };
  }

  // Create active session
  const sessionToken = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
  const userSession = {
    name: matchedUser.name,
    email: matchedUser.email,
    isLoggedIn: true,
    token: sessionToken
  };

  const sessionData = {
    token: sessionToken,
    user: userSession,
    createdAt: Date.now(),
    expiresAt: Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
  };

  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
  localStorage.setItem(STORAGE_KEYS.LEGACY_USER, JSON.stringify(userSession));

  return {
    success: true,
    message: 'Login successful!',
    user: userSession,
    code: 'SUCCESS'
  };
}

/**
 * Log out user and clear session
 */
function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);

  if (typeof window !== 'undefined' && window.history) {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

/**
 * Check if the user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  try {
    const rawSession = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!rawSession) return false;

    const session = JSON.parse(rawSession);
    if (!session || !session.token || !session.user || !session.user.isLoggedIn) {
      return false;
    }

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
 * Get current logged in user
 * @returns {object|null}
 */
function getCurrentUser() {
  if (!isAuthenticated()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEGACY_USER) || localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.user || parsed;
  } catch {
    return null;
  }
}

/**
 * Route protection guard
 * @param {function} onUnauthenticated Callback when unauthenticated
 * @returns {boolean}
 */
function protectRoute(onUnauthenticated) {
  if (!isAuthenticated()) {
    const message = 'Please sign in to access your dashboard.';
    if (typeof onUnauthenticated === 'function') {
      onUnauthenticated(message);
    } else {
      sessionStorage.setItem('auth_redirect_msg', message);
      window.location.replace('signin.html');
    }
    return false;
  }
  return true;
}

// Support both Browser Global and ES Module environments
if (typeof window !== 'undefined') {
  window.AuthService = {
    registerUser,
    loginUser,
    logoutUser,
    isAuthenticated,
    getCurrentUser,
    protectRoute,
    getRegisteredUsers
  };
}
