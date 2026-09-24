import { AppLayout } from '../components/AppLayout.js';
import { adminApi } from '../api.js';
import { authStore } from '../auth.js';

export async function renderAdminUsers() {
  const layout = new AppLayout('Manage Users');
  let currentPage = 1;
  let allUsers = [];

  document.getElementById('app').innerHTML = layout.wrap(`
    <div style="padding:2rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem">
        <h2 style="font-size:1.5rem;font-weight:700">Manage Users</h2>
        <input type="text" class="input" id="search-users" placeholder="Search name or email..." style="width:300px">
      </div>
      <div class="card" style="overflow-x:auto">
        <table class="admin-claims-table" style="width:100%;text-align:left;border-collapse:collapse">
          <thead>
            <tr style="border-bottom:1px solid var(--slate-700)">
              <th style="padding:1rem;color:var(--slate-400)">Name</th>
              <th style="padding:1rem;color:var(--slate-400)">Email</th>
              <th style="padding:1rem;color:var(--slate-400)">Role</th>
              <th style="padding:1rem;color:var(--slate-400)">Verified</th>
              <th style="padding:1rem;color:var(--slate-400)">Joined</th>
              <th style="padding:1rem;color:var(--slate-400)">Actions</th>
            </tr>
          </thead>
          <tbody id="users-tbody">
            <tr><td colspan="6" style="padding:3rem;text-align:center"><div class="spinner" style="margin:0 auto"></div></td></tr>
          </tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:center;gap:1rem;margin-top:2rem">
        <button class="btn btn-secondary btn-sm" id="btn-prev" disabled>Previous</button>
        <button class="btn btn-secondary btn-sm" id="btn-next" disabled>Next</button>
      </div>
    </div>
  `, 'Manage Users');
  layout.attachEventListeners();

  const currentUser = authStore.getUser();

  window.toggleRole = async (id, currentRole) => {
    if (id === currentUser.id) {
      window.app.toast.error("You cannot change your own role");
      return;
    }
    const newRole = currentRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    try {
      const res = await adminApi.updateUser(id, { role: newRole });
      if (res.success) {
        window.app.toast.success('Role updated');
        loadUsers();
      } else throw new Error(res.error);
    } catch(e) { window.app.toast.error(e.message || 'Failed to update role'); }
  };

  window.deleteUser = async (id) => {
    if (id === currentUser.id) {
      window.app.toast.error("You cannot delete yourself");
      return;
    }
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
      const res = await adminApi.deleteUser(id);
      if (res.success) {
        window.app.toast.success('User deleted');
        loadUsers();
      } else throw new Error(res.error);
    } catch(e) { window.app.toast.error(e.message || 'Failed to delete user'); }
  };

  async function loadUsers() {
    try {
      const res = await adminApi.getUsers({ page: currentPage, limit: 20 });
      if (!res.success) throw new Error(res.error);
      allUsers = res.data.users || res.data || [];
      renderTable(allUsers);
      document.getElementById('btn-prev').disabled = currentPage === 1;
      document.getElementById('btn-next').disabled = allUsers.length < 20;
    } catch (e) {
      document.getElementById('users-tbody').innerHTML = \`<tr><td colspan="6" style="padding:2rem;text-align:center;color:var(--rose-400)">Error: \${e.message}</td></tr>\`;
    }
  }

  function renderTable(users) {
    const tbody = document.getElementById('users-tbody');
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="padding:2rem;text-align:center;color:var(--slate-500)">No users found.</td></tr>';
      return;
    }
    tbody.innerHTML = users.map(u => {
      const roleBadge = u.role === 'ADMIN' ? '<span class="badge badge-brand">ADMIN</span>' : '<span class="badge" style="background:var(--slate-700)">STUDENT</span>';
      return \`
        <tr style="border-bottom:1px solid var(--slate-800)">
          <td style="padding:1rem">\${u.name}</td>
          <td style="padding:1rem">\${u.email}</td>
          <td style="padding:1rem">\${roleBadge}</td>
          <td style="padding:1rem">\${u.isVerified ? '✓' : '✗'}</td>
          <td style="padding:1rem">\${new Date(u.createdAt).toLocaleDateString()}</td>
          <td style="padding:1rem">
            <button class="btn btn-secondary btn-sm" onclick="toggleRole('\${u.id}', '\${u.role}')">Toggle Role</button>
            <button class="btn btn-error btn-sm" style="margin-left:.5rem" onclick="deleteUser('\${u.id}')">Delete</button>
          </td>
        </tr>
      \`;
    }).join('');
  }

  document.getElementById('search-users').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = allUsers.filter(u => (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q));
    renderTable(filtered);
  });

  document.getElementById('btn-prev').addEventListener('click', () => { if (currentPage > 1) { currentPage--; loadUsers(); } });
  document.getElementById('btn-next').addEventListener('click', () => { currentPage++; loadUsers(); });

  loadUsers();
}

export default renderAdminUsers;
