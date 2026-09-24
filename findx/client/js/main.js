/**
 * main.js — FindX SPA entry point.
 * Initializes the router, toast manager, and registers all routes.
 * Exposed on window.app for page modules to access.
 */
import { Router } from './router.js';
import { authStore } from './auth.js';
import { ToastManager } from './components/Toast.js';

const router = new Router();
const toast = new ToastManager();

// ── Global app object (accessible from all page modules) ─────────────────────
window.app = {
  router,
  toast,
  authStore,
  params: {},  // populated by router on each navigation
  query: {},  // ?key=value from current hash
};

// ── Route definitions ─────────────────────────────────────────────────────────
// Public routes (no auth required)
router.addRoute('/', () => import('./pages/Landing.js'), false);
router.addRoute('/login', () => import('./pages/Login.js'), false);
router.addRoute('/register', () => import('./pages/Register.js'), false);

// Authenticated routes
router.addRoute('/dashboard', () => import('./pages/Dashboard.js'), true);
router.addRoute('/items/:id', () => import('./pages/ItemDetail.js'), true);
router.addRoute('/items/:id/matches', () => import('./pages/MatchResults.js'), true);
router.addRoute('/report/lost', () => import('./pages/ReportLost.js'), true);
router.addRoute('/report/found', () => import('./pages/ReportFound.js'), true);
router.addRoute('/claims', () => import('./pages/MyClaims.js'), true);
router.addRoute('/claims/:id', () => import('./pages/ClaimDetail.js'), true);
router.addRoute('/notifications', () => import('./pages/Notifications.js'), true);

// Admin-only routes
router.addRoute('/items', () => import('./pages/BrowseItems.js'), true, 'ADMIN');
router.addRoute('/admin', () => import('./pages/AdminDashboard.js'), true, 'ADMIN');
router.addRoute('/admin/users', () => import('./pages/AdminUsers.js'), true, 'ADMIN');
router.addRoute('/admin/items', () => import('./pages/AdminItems.js'), true, 'ADMIN');
router.addRoute('/admin/claims', () => import('./pages/AdminClaims.js'), true, 'ADMIN');
router.addRoute('/admin/graph', () => import('./pages/CampusGraph.js'), true, 'ADMIN');
router.addRoute('/engine-visualizer', () => import('./pages/EngineVisualizer.js'), true, 'ADMIN');

// ── Add global keyframe animations (injected once) ───────────────────────────
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
@keyframes slideUp { from { transform:translateY(12px);opacity:0 } to { transform:translateY(0);opacity:1 } }
@keyframes spin    { to { transform:rotate(360deg) } }
`;
document.head.appendChild(style);

// ── Start routing ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  router.start();
});
