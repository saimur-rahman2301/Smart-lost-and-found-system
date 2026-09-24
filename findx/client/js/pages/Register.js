import { authStore } from '../auth.js';
import { authApi } from '../api.js';

export function renderRegister() {
  const html = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; background-color: var(--slate-50);">
      <div class="card" style="width: 100%; max-width: 24rem; padding: 2rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="color: var(--primary-600); font-weight: 800; font-size: 1.875rem;">FindX</h1>
          <p style="color: var(--slate-500); margin-top: 0.5rem;">Create a new account</p>
        </div>
        
        <form id="register-form" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label class="form-label" for="reg-name">Full Name</label>
            <input class="form-input" id="reg-name" type="text" placeholder="John Doe">
            <div id="err-name" style="color: var(--rose-500); font-size: 0.75rem; margin-top: 0.25rem; display: none;"></div>
          </div>
          <div>
            <label class="form-label" for="reg-email">Email Address</label>
            <input class="form-input" id="reg-email" type="email" placeholder="you@example.com">
            <div id="err-email" style="color: var(--rose-500); font-size: 0.75rem; margin-top: 0.25rem; display: none;"></div>
          </div>
          <div>
            <label class="form-label" for="reg-password">Password</label>
            <input class="form-input" id="reg-password" type="password" placeholder="••••••••">
            <div id="err-password" style="color: var(--rose-500); font-size: 0.75rem; margin-top: 0.25rem; display: none;"></div>
          </div>
          <div>
            <label class="form-label" for="reg-confirm">Confirm Password</label>
            <input class="form-input" id="reg-confirm" type="password" placeholder="••••••••">
            <div id="err-confirm" style="color: var(--rose-500); font-size: 0.75rem; margin-top: 0.25rem; display: none;"></div>
          </div>
          
          <button type="submit" id="reg-submit" class="btn btn-primary" style="margin-top: 1rem;">
            Create Account
          </button>
        </form>
        
        <div style="text-align: center; margin-top: 1.5rem; font-size: 0.875rem;">
          <span style="color: var(--slate-500);">Already have an account?</span>
          <a href="#/login" style="color: var(--primary-600); font-weight: 500; text-decoration: none;">Log in</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('app').innerHTML = html;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    document.getElementById('err-name').style.display = 'none';
    document.getElementById('err-email').style.display = 'none';
    document.getElementById('err-password').style.display = 'none';
    document.getElementById('err-confirm').style.display = 'none';

    let hasError = false;
    if (name.length < 2) {
      document.getElementById('err-name').textContent = 'Name must be at least 2 characters';
      document.getElementById('err-name').style.display = 'block';
      hasError = true;
    }
    if (!email.includes('@')) {
      document.getElementById('err-email').textContent = 'Invalid email address';
      document.getElementById('err-email').style.display = 'block';
      hasError = true;
    }
    if (password.length < 8) {
      document.getElementById('err-password').textContent = 'Password must be at least 8 characters';
      document.getElementById('err-password').style.display = 'block';
      hasError = true;
    }
    if (password !== confirm) {
      document.getElementById('err-confirm').textContent = 'Passwords do not match';
      document.getElementById('err-confirm').style.display = 'block';
      hasError = true;
    }

    if (hasError) return;

    const btn = document.getElementById('reg-submit');
    const originalText = btn.textContent;
    btn.textContent = 'Loading...';
    btn.disabled = true;

    try {
      const data = await authApi.register({ name, email, password });
      authStore.setAuth(data.user, data.accessToken, data.refreshToken);
      window.app.toast.success('Registration successful!');
      window.app.router.go('/dashboard');
    } catch (err) {
      window.app.toast.error(err.message || 'Registration failed');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

export default renderRegister;
