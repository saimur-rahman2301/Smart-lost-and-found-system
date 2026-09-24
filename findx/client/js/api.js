/**
 * api.js — Centralized API client for FindX.
 * All fetch calls go through `request()` which handles:
 *   - Auth header injection
 *   - 401 → auto-refresh token → retry once
 *   - Consistent error shape
 */

const BASE_URL = '/api/v1';

// ─── Token helpers ────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

// ─── Auto-refresh state (prevent refresh loops) ───────────────────────────────
let isRefreshing = false;
let refreshPromise = null;

async function doRefresh() {
  if (isRefreshing) return refreshPromise;
  isRefreshing = true;
  refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: getRefreshToken() }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.data) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        return data.data.accessToken;
      }
      // Refresh failed — clear auth and redirect to login
      localStorage.clear();
      window.location.hash = '#/login';
      return null;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  return refreshPromise;
}

// ─── Core request function ────────────────────────────────────────────────────
async function request(method, path, body = null, useAuth = true, isFormData = false) {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (useAuth && getToken()) headers['Authorization'] = `Bearer ${getToken()}`;

  const opts = { method, headers };
  if (body) {
    opts.body = isFormData ? body : JSON.stringify(body);
  }

  let res = await fetch(BASE_URL + path, opts);

  // Auto-refresh on 401
  if (res.status === 401 && useAuth && getRefreshToken()) {
    const newToken = await doRefresh();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(BASE_URL + path, { ...opts, headers });
    }
  }

  const json = await res.json().catch(() => ({
    success: false,
    message: 'Invalid server response',
  }));

  if (json && typeof json === 'object' && json.data !== undefined && json.data !== null) {
    if (Array.isArray(json.data)) {
      json.length = json.data.length;
      json[Symbol.iterator] = function* () { yield* json.data; };
      ['map', 'filter', 'forEach', 'find', 'some', 'every', 'reduce', 'slice'].forEach(method => {
        if (typeof json.data[method] === 'function') {
          json[method] = (...args) => json.data[method](...args);
        }
      });
      json.items = json.data;
      json.data.forEach((val, idx) => { json[idx] = val; });
    } else if (typeof json.data === 'object') {
      for (const key of Object.keys(json.data)) {
        if (key !== 'success' && key !== 'message') {
          json[key] = json.data[key];
        }
      }
      // Aliases for analytics stats
      if (json.totalLost !== undefined && json.totalLostReports === undefined) {
        json.totalLostReports = json.totalLost;
      }
      if (json.totalFound !== undefined && json.totalFoundReports === undefined) {
        json.totalFoundReports = json.totalFound;
      }
    }
  }

  return json;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => request('POST', '/auth/register', data, false),
  login: (data) => request('POST', '/auth/login', data, false),
  refresh: () => request('POST', '/auth/refresh', { refreshToken: getRefreshToken() }, false),
  logout: () => request('POST', '/auth/logout', { refreshToken: getRefreshToken() }),
  me: () => request('GET', '/auth/me'),
};

// ─── Items API ────────────────────────────────────────────────────────────────
export const itemsApi = {
  /** GET /items with filter/sort/pagination query params */
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, v); });
    const query = qs.toString() ? `?${qs}` : '';
    return request('GET', `/items${query}`);
  },

  createLost: (formData) => request('POST', '/items/lost', formData, true, true),
  createFound: (formData) => request('POST', '/items/found', formData, true, true),

  getById: (id) => request('GET', `/items/${id}`),
  update: (id, data) => request('PATCH', `/items/${id}`, data),
  delete: (id) => request('DELETE', `/items/${id}`),
  getMatches: (id) => request('GET', `/items/${id}/matches`),
};

// ─── Claims API ───────────────────────────────────────────────────────────────
export const claimsApi = {
  create: (data) => request('POST', '/claims', data),
  getMyClaims: () => request('GET', '/claims/me'),
  getById: (id) => request('GET', `/claims/${id}`),
  verify: (id, answers) => request('POST', `/claims/${id}/verify`, answers),
  updateStatus: (id, data) => request('PATCH', `/claims/${id}/status`, data),
};

// ─── Search API ───────────────────────────────────────────────────────────────
export const searchApi = {
  autocomplete: (q) => request('GET', `/search/autocomplete?q=${encodeURIComponent(q)}`),
};

// ─── Graph API ────────────────────────────────────────────────────────────────
export const graphApi = {
  getBuildings: () => request('GET', '/graph/buildings'),
  createBuilding: (data) => request('POST', '/graph/buildings', data),
  deleteBuilding: (id) => request('DELETE', `/graph/buildings/${id}`),
  createEdge: (data) => request('POST', '/graph/edges', data),
  getShortestPath: (from, to) =>
    request('GET', `/graph/shortest-path?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminApi = {
  getAnalytics: () => request('GET', '/admin/analytics'),
  getQueue: () => request('GET', '/admin/queue'),

  getUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/admin/users${qs ? '?' + qs : ''}`);
  },
  updateUser: (id, data) => request('PATCH', `/admin/users/${id}`, data),
  deleteUser: (id) => request('DELETE', `/admin/users/${id}`),

  getItems: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/admin/items${qs ? '?' + qs : ''}`);
  },

  undo: () => request('POST', '/admin/undo'),
  redo: () => request('POST', '/admin/redo'),
};

// ─── Notifications API ────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/notifications${qs ? '?' + qs : ''}`);
  },
  markRead: (id) => request('PATCH', `/notifications/${id}/read`),
  markAllRead: () => request('PATCH', '/notifications/read-all'),
};

// ─── Debug API (admin only) ───────────────────────────────────────────────────
export const debugApi = {
  getEngineState: () => request('GET', '/debug/engine-state'),
};
