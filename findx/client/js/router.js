/**
 * router.js — Hash-based SPA router.
 *
 * Routes are registered with addRoute(path, loader, requiresAuth, requiresRole).
 * When the hash changes, navigate() is called:
 *   1. Match current hash against registered routes (supports :param wildcards)
 *   2. Check auth / role requirements → redirect if failed
 *   3. Dynamic import() the page module
 *   4. Instantiate the default export class and call .render()
 *   5. Store matched params in window.app.params for pages to read
 */
import { authStore } from './auth.js';

export class Router {
  constructor() {
    this.routes = [];
  }

  /** Register a route.
   * @param {string} path - e.g. '/items/:id/matches'
   * @param {Function} loader - dynamic import: () => import('./pages/X.js')
   * @param {boolean} requiresAuth
   * @param {string|null} requiresRole - 'ADMIN' or null
   */
  addRoute(path, loader, requiresAuth = false, requiresRole = null) {
    this.routes.push({ path, loader, requiresAuth, requiresRole });
  }

  start() {
    window.addEventListener('hashchange', () => this.navigate());
    this.navigate();
  }

  /** Navigate to a new hash path programmatically. */
  go(path) {
    window.location.hash = '#' + path;
  }

  /** Match current hash and render the page. */
  async navigate() {
    const raw = window.location.hash.slice(1) || '/';
    const path = raw.split('?')[0]; // strip query string for matching
    const query = raw.includes('?') ? raw.split('?')[1] : '';
    window.app.query = Object.fromEntries(new URLSearchParams(query));

    const app = document.getElementById('app');
    if (!app) return;

    // ── Match route ───────────────────────────────────────────────────
    let matched = null;
    let params = {};
    for (const route of this.routes) {
      const result = this._matchPath(route.path, path);
      if (result !== null) {
        matched = route;
        params = result;
        break;
      }
    }

    if (!matched) {
      app.innerHTML = this._notFound(path);
      return;
    }

    window.app.params = params;

    // ── Auth guard ────────────────────────────────────────────────────
    if (matched.requiresAuth && !authStore.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }

    if (matched.requiresRole && authStore.getUser()?.role !== matched.requiresRole) {
      app.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;padding:2rem;text-align:center">
          <div style="font-size:3rem">🔒</div>
          <h2 style="font-weight:700">Access Denied</h2>
          <p style="color:var(--slate-400)">You need ${matched.requiresRole} privileges to access this page.</p>
          <button class="btn btn-primary" onclick="window.app.router.go('/dashboard')">Go to Dashboard</button>
        </div>`;
      return;
    }

    // ── Loading state ─────────────────────────────────────────────────
    app.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center">
        <div class="spinner"></div>
      </div>`;

    // ── Load and render page ──────────────────────────────────────────
    try {
      const module = await matched.loader();
      let Target = module.default;
      if (!Target) {
        const fnName = Object.keys(module).find(k => k.startsWith('render') || typeof module[k] === 'function');
        if (fnName) Target = module[fnName];
      }
      if (!Target) throw new Error('Page module has no default export or render function');

      if (typeof Target === 'function') {
        if (Target.prototype && typeof Target.prototype.render === 'function') {
          const page = new Target();
          await page.render();
        } else {
          await Target();
        }
      } else if (typeof Target === 'object' && typeof Target.render === 'function') {
        await Target.render();
      } else {
        throw new Error('Unsupported page export format');
      }
    } catch (err) {
      console.error('Router: failed to render page', path, err);
      app.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;padding:2rem;text-align:center">
          <div style="font-size:3rem">⚠️</div>
          <h2 style="font-weight:700">Something went wrong</h2>
          <p style="color:var(--slate-400)">${err.message}</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Reload</button>
        </div>`;
    }
  }

  /** Match a route pattern against an actual path.
   *  Supports :param segments. Returns params object or null if no match.
   */
  _matchPath(pattern, actual) {
    const pParts = pattern.split('/').filter(Boolean);
    const aParts = actual.split('/').filter(Boolean);
    if (pParts.length !== aParts.length) return null;

    const params = {};
    for (let i = 0; i < pParts.length; i++) {
      if (pParts[i].startsWith(':')) {
        params[pParts[i].slice(1)] = decodeURIComponent(aParts[i]);
      } else if (pParts[i] !== aParts[i]) {
        return null;
      }
    }
    return params;
  }

  _notFound(path) {
    return `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;padding:2rem;text-align:center">
        <div style="font-size:4rem;font-weight:800;color:var(--brand-400)">404</div>
        <h2 style="font-weight:700">Page not found</h2>
        <p style="color:var(--slate-400)">No route matches <code>${path}</code></p>
        <button class="btn btn-primary" onclick="window.app.router.go('/dashboard')">Go Home</button>
      </div>`;
  }
}
