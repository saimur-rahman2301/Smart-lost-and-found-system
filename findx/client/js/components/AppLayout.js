/**
 * AppLayout.js — Smart Lost & Found
 * "Find It. Match It. Return It."
 *
 * Professional, clean, and intuitive navigation shell for students & examiners.
 */
import { authStore } from '../auth.js';

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard', badge: null },
  { icon: '🔴', label: 'Report Lost Item', path: '/report/lost', badge: null },
  { icon: '🟢', label: 'Report Found Item', path: '/report/found', badge: null },
  { icon: '⚡', label: 'Find Matches', path: '/matches', badge: '100-pt DSA' },
  { icon: '🔍', label: 'Search & Filter', path: '/search', badge: null },
  { icon: '📈', label: 'Statistics', path: '/statistics', badge: null },
  { icon: '💡', label: 'DSA Viva Guide', path: '/dsa', badge: 'Lab Viva' },
];

export class AppLayout {
  constructor(pageTitle = 'Smart Lost & Found') {
    this.pageTitle = pageTitle;
    this.user = authStore.getUser() || { name: 'Ali Raza', role: 'STUDENT', email: 'ali.raza@uni.edu' };
  }

  renderSidebar() {
    const user = this.user;
    const currentPath = window.location.hash.slice(1) || '/dashboard';

    const renderNavItem = ({ icon, label, path, badge }) => {
      const active = currentPath === path || (path !== '/dashboard' && currentPath.startsWith(path)) ? 'active' : '';
      return `
        <a class="nav-item ${active}" href="#${path}" style="font-size: 0.925rem; padding: 0.75rem 1rem; margin-bottom: 0.35rem; display: flex; align-items: center; justify-content: space-between; border-radius: var(--radius-md);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.15rem; width: 1.5rem; text-align: center;">${icon}</span>
            <span style="font-weight: 600;">${label}</span>
          </div>
          ${badge ? `<span class="badge badge-warning" style="font-size: 0.65rem; padding: 0.15rem 0.45rem;">${badge}</span>` : ''}
        </a>
      `;
    };

    return `
      <aside class="sidebar" id="sidebar" style="background: #0f172a; border-right: 1px solid rgba(255,255,255,0.08); width: var(--sidebar-width); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <!-- Clean Logo Header -->
          <a class="sidebar-logo" href="#/dashboard" style="display: flex; align-items: center; gap: 0.85rem; padding: 1.5rem 1.25rem; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.07);">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; box-shadow: 0 4px 12px rgba(59,130,246,0.35);">
              🔍
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #fff; line-height: 1.2; letter-spacing: -0.01em;">
                Smart Lost & Found
              </div>
              <div style="font-size: 0.72rem; color: var(--brand-400); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                “Find It. Match It. Return It.”
              </div>
            </div>
          </a>

          <!-- Navigation Links -->
          <nav class="sidebar-nav" style="padding: 1.25rem 0.75rem;">
            <div style="font-size: 0.7rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.08em; padding: 0 0.5rem 0.5rem;">
              Main Navigation
            </div>
            ${NAV_ITEMS.map(renderNavItem).join('')}
          </nav>
        </div>

        <!-- User / Quick Role Bar -->
        <div style="padding: 1rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.2);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--brand-600); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">
                ${(user.name || 'U')[0]}
              </div>
              <div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #fff; line-height: 1.2;">${user.name}</div>
                <div style="font-size: 0.72rem; color: var(--slate-400);">${user.role === 'ADMIN' ? '🛡️ Administrator' : '🎓 Student Account'}</div>
              </div>
            </div>
            <button id="toggle-role-btn" class="btn btn-ghost btn-sm" title="Toggle Student/Admin" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; color: var(--brand-400);">
              ${user.role === 'ADMIN' ? 'To Student' : 'To Admin'}
            </button>
          </div>
          <div style="font-size: 0.7rem; color: var(--slate-400); text-align: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 0.4rem;">
            DSA Lab Project &bull; Semester Evaluation
          </div>
        </div>
      </aside>`;
  }

  wrap(contentHtml, title = this.pageTitle) {
    return `
      <div class="app-layout" style="display: flex; min-height: 100vh; background: var(--navy-950);">
        ${this.renderSidebar()}
        <div class="main-content" style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
          <!-- Professional Top Bar -->
          <header class="topbar" style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 2rem; background: #0f172a; border-bottom: 1px solid rgba(255,255,255,0.08); position: sticky; top: 0; z-index: 50;">
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <button class="btn btn-ghost btn-sm" id="menu-toggle" style="font-size: 1.25rem; display: none;">☰</button>
              <div>
                <h1 style="font-size: 1.25rem; font-weight: 800; margin: 0; color: #fff; line-height: 1.2;">${title}</h1>
                <div style="font-size: 0.75rem; color: var(--slate-400);">Campus Lost & Found System</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <a href="#/report/lost" class="btn btn-danger btn-sm" style="font-weight: 700; box-shadow: 0 2px 8px rgba(239,68,68,0.3);">
                + Report Lost
              </a>
              <a href="#/report/found" class="btn btn-success btn-sm" style="font-weight: 700; box-shadow: 0 2px 8px rgba(16,185,129,0.3);">
                + Report Found
              </a>
              <a href="#/matches" class="btn btn-primary btn-sm" style="font-weight: 700; box-shadow: 0 2px 8px rgba(59,130,246,0.3);">
                ⚡ Find Matches
              </a>
            </div>
          </header>

          <!-- Main Page Body -->
          <main class="page-content" style="padding: 2rem; max-width: 1280px; margin: 0 auto; width: 100%;">
            ${contentHtml}
          </main>
        </div>
      </div>`;
  }

  attachEventListeners() {
    const toggleRoleBtn = document.getElementById('toggle-role-btn');
    if (toggleRoleBtn) {
      toggleRoleBtn.addEventListener('click', () => {
        const currentUser = authStore.getUser() || { name: 'Ali Raza', role: 'STUDENT' };
        const newRole = currentUser.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
        const newName = newRole === 'ADMIN' ? 'Admin Instructor' : 'Ali Raza';
        authStore.setAuth({ ...currentUser, role: newRole, name: newName }, 'demo_token', 'demo_ref');
        window.location.reload();
      });
    }

    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        sidebar?.classList.remove('open');
      });
    });
  }
}

export default AppLayout;
