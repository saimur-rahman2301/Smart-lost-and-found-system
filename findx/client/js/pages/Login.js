/**
 * Login.js — Login page with form validation and error display.
 */
import { authApi } from '../api.js';
import { authStore } from '../auth.js';

export default class LoginPage {
  async render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem;background:radial-gradient(ellipse at top,rgba(59,130,246,.1) 0%,transparent 60%)">
        <div style="width:100%;max-width:400px">
          <div style="text-align:center;margin-bottom:2rem">
            <a href="#/" style="display:inline-flex;align-items:center;gap:.5rem;text-decoration:none;font-size:1.5rem;font-weight:800;color:var(--brand-400)">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#1e293b"/>
                <circle cx="13" cy="13" r="6" fill="none" stroke="#3B82F6" stroke-width="2.5"/>
                <line x1="17.5" y1="17.5" x2="24" y2="24" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              FindX
            </a>
            <h1 style="font-size:1.5rem;font-weight:700;margin-top:1.25rem;margin-bottom:.375rem">Welcome back</h1>
            <p style="color:var(--slate-400);font-size:.9375rem">Sign in to your campus account</p>
          </div>
          
          <div class="card" style="padding:2rem">
            <div id="login-error" style="display:none" class="alert alert-error" role="alert"></div>
            <form id="login-form" novalidate>
              <div class="form-group">
                <label class="label" for="email">Email address</label>
                <input class="input" type="email" id="email" name="email" placeholder="you@university.edu" required autocomplete="email">
                <div class="field-error" id="email-error" style="color:var(--rose-400);font-size:.8125rem;margin-top:.25rem;display:none"></div>
              </div>
              <div class="form-group" style="margin-top:1rem">
                <label class="label" for="password">Password</label>
                <div style="position:relative">
                  <input class="input" type="password" id="password" name="password" placeholder="••••••••" required autocomplete="current-password" style="padding-right:2.75rem">
                  <button type="button" id="toggle-password" style="position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--slate-400);cursor:pointer">👁</button>
                </div>
                <div class="field-error" id="password-error" style="color:var(--rose-400);font-size:.8125rem;margin-top:.25rem;display:none"></div>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;margin-top:1.5rem;padding:.75rem" id="submit-btn">
                Sign In
              </button>
            </form>
            <div style="text-align:center;margin-top:1.25rem;font-size:.9375rem;color:var(--slate-400)">
              Don't have an account? <a href="#/register" style="color:var(--brand-400);font-weight:600">Sign up</a>
            </div>
          </div>

          <div style="margin-top:1.5rem;background:#151f32;border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius-lg);padding:1.25rem">
            <div style="font-size:.75rem;color:var(--slate-400);margin-bottom:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">QUICK DEMO ACCOUNTS (1-CLICK FILL)</div>
            <div style="display:flex;gap:.5rem;flex-direction:column">
              <button type="button" id="fill-student" class="btn btn-secondary btn-sm" style="justify-content:flex-start;padding:0.5rem 0.75rem;background:rgba(255,255,255,0.04)">
                <span>👤</span>
                <span style="font-weight:600">Student Account</span>
                <span style="color:var(--slate-400);font-size:.75rem;margin-left:auto">student1@findx.edu</span>
              </button>
              <button type="button" id="fill-admin" class="btn btn-secondary btn-sm" style="justify-content:flex-start;padding:0.5rem 0.75rem;background:rgba(255,255,255,0.04)">
                <span>🔑</span>
                <span style="font-weight:600">Admin Account</span>
                <span style="color:var(--slate-400);font-size:.75rem;margin-left:auto">admin@findx.edu</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;

    this.attachListeners();
  }

  attachListeners() {
    const form = document.getElementById('login-form');
    const togglePw = document.getElementById('toggle-password');
    const fillStudent = document.getElementById('fill-student');
    const fillAdmin = document.getElementById('fill-admin');

    fillStudent?.addEventListener('click', () => {
      document.getElementById('email').value = 'student1@findx.edu';
      document.getElementById('password').value = 'Student1234!';
      form?.dispatchEvent(new Event('submit', { cancelable: true }));
    });

    fillAdmin?.addEventListener('click', () => {
      document.getElementById('email').value = 'admin@findx.edu';
      document.getElementById('password').value = 'Admin1234!';
      form?.dispatchEvent(new Event('submit', { cancelable: true }));
    });

    togglePw?.addEventListener('click', () => {
      const pw = document.getElementById('password');
      pw.type = pw.type === 'password' ? 'text' : 'password';
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearErrors();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      let valid = true;
      if (!email || !email.includes('@')) {
        this.setFieldError('email', 'Please enter a valid email address');
        valid = false;
      }
      if (!password) {
        this.setFieldError('password', 'Password is required');
        valid = false;
      }
      if (!valid) return;

      const btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      try {
        const res = await authApi.login({ email, password });
        if (res.success && res.data) {
          authStore.setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
          window.app.toast.success(`Welcome back, ${res.data.user.name}!`);
          window.app.router.go('/dashboard');
        } else {
          this.showError(res.message || 'Invalid email or password');
        }
      } catch (err) {
        this.showError('Connection error. Please try again.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
  }

  clearErrors() {
    ['email', 'password'].forEach(f => {
      const el = document.getElementById(`${f}-error`);
      if (el) { el.style.display = 'none'; el.textContent = ''; }
    });
    const errEl = document.getElementById('login-error');
    if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
  }

  setFieldError(field, msg) {
    const el = document.getElementById(`${field}-error`);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
    const input = document.getElementById(field);
    if (input) input.style.borderColor = 'var(--rose-500)';
  }

  showError(msg) {
    const el = document.getElementById('login-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }
}
