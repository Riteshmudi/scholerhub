/**
 * Sign In Page Logic
 * File: js/signin.js
 * 
 * Flow:
 * - Collects Email, Password
 * - Calls loginUser()
 * - If account not found, shows: "No account found with this email. Please create an account first."
 * - On success, redirects to dashboard.html
 */

document.addEventListener('DOMContentLoaded', () => {
  const signinForm = document.getElementById('signin-form') || document.querySelector('form.sign-in-form');
  const messageBox = document.getElementById('auth-message') || document.getElementById('notification');

  function showMessage(msg, isError = false, actionHtml = '') {
    if (messageBox) {
      messageBox.innerHTML = `<span>${msg}</span> ${actionHtml}`;
      messageBox.className = isError ? 'auth-msg error' : 'auth-msg success';
      messageBox.style.display = 'block';
    } else {
      alert(msg);
    }
  }

  // Check if redirected with a message (e.g. from registration or protected route)
  const redirectMsg = sessionStorage.getItem('auth_redirect_msg');
  if (redirectMsg) {
    showMessage(redirectMsg, false);
    sessionStorage.removeItem('auth_redirect_msg');
  }

  // Pre-fill email if passed from successful signup
  const prefillEmail = sessionStorage.getItem('prefill_email');
  if (prefillEmail && signinForm) {
    const emailInput = document.getElementById('signin-email') || signinForm.querySelector('input[type="email"], input[type="text"]');
    if (emailInput) {
      emailInput.value = prefillEmail;
      sessionStorage.removeItem('prefill_email');
    }
  }

  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = (document.getElementById('signin-email') || signinForm.querySelector('input[type="email"], input[type="text"]'))?.value;
      const password = (document.getElementById('signin-password') || signinForm.querySelector('input[type="password"]'))?.value;
      const rememberMe = (document.getElementById('remember-me') || signinForm.querySelector('input[type="checkbox"]'))?.checked ?? true;

      if (!email || !password) {
        showMessage('Please enter both your email and password.', true);
        return;
      }

      const result = await window.AuthService.loginUser(email, password, rememberMe);

      if (!result.success) {
        let actionHtml = '';
        if (result.code === 'USER_NOT_FOUND') {
          actionHtml = `<a href="signup.html" class="create-account-link" style="color: #d4af37; font-weight: 600; text-decoration: underline; margin-left: 8px;">Create Account</a>`;
        }
        showMessage(result.message, true, actionHtml);
      } else {
        showMessage('Login successful!', false);
        setTimeout(() => {
          window.location.replace('dashboard.html');
        }, 500);
      }
    });
  }
});
