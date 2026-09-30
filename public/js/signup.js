/**
 * Sign Up Page Logic
 * File: js/signup.js
 * 
 * Flow:
 * - Collects Full Name, Email, Password, Confirm Password
 * - Validates input fields
 * - Calls registerUser()
 * - On success, redirects to signin.html with confirmation message
 */

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form') || document.querySelector('form.sign-up-form');
  const messageBox = document.getElementById('auth-message') || document.getElementById('notification');

  function showMessage(msg, isError = false) {
    if (messageBox) {
      messageBox.textContent = msg;
      messageBox.className = isError ? 'auth-msg error' : 'auth-msg success';
      messageBox.style.display = 'block';
      setTimeout(() => { messageBox.style.display = 'none'; }, 4000);
    } else {
      alert(msg);
    }
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = (document.getElementById('signup-name') || signupForm.querySelector('input[type="text"]'))?.value;
      const email = (document.getElementById('signup-email') || signupForm.querySelector('input[type="email"]'))?.value;
      const passwordInputs = signupForm.querySelectorAll('input[type="password"]');
      const password = passwordInputs[0]?.value;
      const confirmPassword = passwordInputs[1]?.value;

      if (!fullName || !email || !password || !confirmPassword) {
        showMessage('All required fields must be completed.', true);
        return;
      }

      if (password !== confirmPassword) {
        showMessage('Password and Confirm Password must match.', true);
        return;
      }

      const result = await window.AuthService.registerUser(fullName, email, password, confirmPassword);

      if (!result.success) {
        showMessage(result.message, true);
      } else {
        showMessage(result.message, false);
        sessionStorage.setItem('auth_redirect_msg', 'Account created successfully! Please sign in to continue.');
        sessionStorage.setItem('prefill_email', email);
        
        setTimeout(() => {
          window.location.href = 'signin.html';
        }, 800);
      }
    });
  }
});
