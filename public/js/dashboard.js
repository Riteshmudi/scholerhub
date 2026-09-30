/**
 * Dashboard Page Logic & Route Protection
 * File: js/dashboard.js
 * 
 * Requirements:
 * - Route protection: checks isAuthenticated() immediately
 * - If unauthenticated, redirects to signin.html with notification
 * - Logout handler: clears session, redirects to signin.html, prevents browser Back button return
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Immediate Route Protection
  const isAllowed = window.AuthService.protectRoute((message) => {
    sessionStorage.setItem('auth_redirect_msg', message);
    window.location.replace('signin.html');
  });

  if (!isAllowed) {
    return; // Stop execution if not authenticated
  }

  // 2. Display logged in user details
  const currentUser = window.AuthService.getCurrentUser();
  const userNameDisplay = document.getElementById('user-name-display') || document.querySelector('.user-profile-name');
  if (userNameDisplay && currentUser) {
    userNameDisplay.textContent = currentUser.name;
  }

  // 3. Setup Logout Buttons
  const logoutButtons = document.querySelectorAll('.logout-button, #logout-btn, [data-action="logout"]');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Clear authentication session
      window.AuthService.logoutUser();
      sessionStorage.setItem('auth_redirect_msg', 'You have been logged out.');

      // Redirect and replace history state so back button cannot re-enter
      window.location.replace('signin.html');
    });
  });

  // 4. Prevent returning to Dashboard using browser Back button
  window.addEventListener('popstate', () => {
    if (!window.AuthService.isAuthenticated()) {
      window.location.replace('signin.html');
    }
  });
});
