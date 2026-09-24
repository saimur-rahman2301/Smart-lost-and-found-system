import { AppLayout } from '../components/AppLayout.js';
import { itemsApi } from '../api.js';

export async function renderAdminItems() {
  const layout = new AppLayout('Manage Items');
  let currentPage = 1;

  document.getElementById('app').innerHTML = layout.wrap(`
    <div style="padding:2rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem">
        <h2 style="font-size:1.5rem;font-weight:700">Manage Items</h2>
        <div style="display:flex;gap:1rem">
          <select class="select" id="filter-type">
            <option value="">All Types</option>
            <option value="LOST">Lost</option>
            <option value="FOUND">Found</option>
          </select>
          <select class="select" id="filter-status">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="RESOLVED">Resolved</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>
      <div class="card" style="overflow-x:auto">
        <table class="admin-claims-table" style="width:100%;text-align:left;border-collapse:collapse">
          <thead>
            <tr style="border-bottom:1px solid var(--slate-700)">
              <th style="padding:1rem;color:var(--slate-400)">Type</th>
              <th style="padding:1rem;color:var(--slate-400)">Category</th>
              <th style="padding:1rem;color:var(--slate-400)">Brand</th>
              <th style="padding:1rem;color:var(--slate-400)">Location</th>
              <th style="padding:1rem;color:var(--slate-400)">Date</th>
              <th style="padding:1rem;color:var(--slate-400)">Hidden Detail</th>
              <th style="padding:1rem;color:var(--slate-400)">Status</th>
              <th style="padding:1rem;color:var(--slate-400)">Actions</th>
            </tr>
          </thead>
          <tbody id="items-tbody">
            <tr><td colspan="8" style="padding:3rem;text-align:center"><div class="spinner" style="margin:0 auto"></div></td></tr>
          </tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:center;gap:1rem;margin-top:2rem">
        <button class="btn btn-secondary btn-sm" id="btn-prev" disabled>Previous</button>
        <button class="btn btn-secondary btn-sm" id="btn-next" disabled>Next</button>
      </div>
    </div>
  `, 'Manage Items');
  layout.attachEventListeners();

  window.updateItemStatus = async (id, status) => {
    try {
      const res = await itemsApi.update(id, { status });
      if (res.success) {
        window.app.toast.success('Status updated');
      } else {
        throw new Error(res.error);
      }
    } catch(e) { 
      window.app.toast.error(e.message || 'Failed to update status'); 
      loadItems(); 
    }
  };

  window.deleteItem = async (id) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
      const res = await itemsApi.delete(id);
      if (res.success) {
        window.app.toast.success('Item deleted');
        loadItems();
      } else throw new Error(res.error);
    } catch(e) { window.app.toast.error(e.message || 'Failed to delete item'); }
  };

  window.goToItem = (id) => {
    window.app.router.go('#/items/' + id);
  };

  async function loadItems() {
    try {
      const filterType = document.getElementById('filter-type').value;
      const filterStatus = document.getElementById('filter-status').value;
      const query = { page: currentPage, limit: 20 };
      if (filterType) query.type = filterType;
      if (filterStatus) query.status = filterStatus;

      const res = await itemsApi.list(query);
      if (!res.success) throw new Error(res.error);
      
      const items = res.data.items || res.data || [];
      renderTable(items);
      document.getElementById('btn-prev').disabled = currentPage === 1;
      document.getElementById('btn-next').disabled = items.length < 20;
    } catch (e) {
      document.getElementById('items-tbody').innerHTML = \`<tr><td colspan="8" style="padding:2rem;text-align:center;color:var(--rose-400)">Error: \${e.message}</td></tr>\`;
    }
  }

  function renderTable(items) {
    const tbody = document.getElementById('items-tbody');
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="padding:2rem;text-align:center;color:var(--slate-500)">No items found.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(i => {
      const typeBadge = i.type === 'LOST' ? '<span class="badge badge-error">LOST</span>' : '<span class="badge badge-success">FOUND</span>';
      return \`
        <tr style="border-bottom:1px solid var(--slate-800);cursor:pointer" class="hover-row">
          <td style="padding:1rem" onclick="goToItem('\${i.id}')">\${typeBadge}</td>
          <td style="padding:1rem" onclick="goToItem('\${i.id}')">\${i.category || 'N/A'}</td>
          <td style="padding:1rem" onclick="goToItem('\${i.id}')">\${i.brand || 'N/A'}</td>
          <td style="padding:1rem" onclick="goToItem('\${i.id}')">\${i.location || 'N/A'}</td>
          <td style="padding:1rem" onclick="goToItem('\${i.id}')">\${new Date(i.date).toLocaleDateString()}</td>
          <td style="padding:1rem;color:var(--amber-400)" onclick="goToItem('\${i.id}')">\${i.hiddenDetail || 'N/A'}</td>
          <td style="padding:1rem">
            <select class="select select-sm" onchange="updateItemStatus('\${i.id}', this.value)">
              <option value="ACTIVE" \${i.status==='ACTIVE'?'selected':''}>Active</option>
              <option value="RESOLVED" \${i.status==='RESOLVED'?'selected':''}>Resolved</option>
              <option value="EXPIRED" \${i.status==='EXPIRED'?'selected':''}>Expired</option>
            </select>
          </td>
          <td style="padding:1rem">
            <button class="btn btn-error btn-sm" onclick="deleteItem('\${i.id}')">Delete</button>
          </td>
        </tr>
      \`;
    }).join('');
  }

  document.getElementById('filter-type').addEventListener('change', () => { currentPage = 1; loadItems(); });
  document.getElementById('filter-status').addEventListener('change', () => { currentPage = 1; loadItems(); });
  document.getElementById('btn-prev').addEventListener('click', () => { if (currentPage > 1) { currentPage--; loadItems(); } });
  document.getElementById('btn-next').addEventListener('click', () => { currentPage++; loadItems(); });

  loadItems();
}

export default renderAdminItems;
