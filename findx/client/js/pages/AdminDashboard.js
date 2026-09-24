import { AppLayout } from '../components/AppLayout.js';
import { adminApi } from '../api.js';

export async function renderAdminDashboard() {
  const layout = new AppLayout('Admin Dashboard');
  document.getElementById('app').innerHTML = layout.wrap(`
    <div style="padding:2rem" id="dashboard-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem">
        <h2 style="font-size:1.5rem;font-weight:700">Admin Dashboard</h2>
        <div style="display:flex;gap:.5rem">
          <button class="btn btn-secondary btn-sm" id="btn-undo">Undo Action</button>
          <button class="btn btn-secondary btn-sm" id="btn-redo">Redo Action</button>
        </div>
      </div>
      <div id="dashboard-content">
        <div style="text-align:center;padding:3rem"><div class="spinner"></div></div>
      </div>
    </div>
  `, 'Admin Dashboard');
  layout.attachEventListeners();

  document.getElementById('btn-undo').addEventListener('click', async () => {
    try {
      const res = await adminApi.undo();
      if (res.success) {
        window.app.toast.success('Action undone successfully');
        renderAdminDashboard();
      } else throw new Error(res.error);
    } catch(e) { window.app.toast.error(e.message || 'Undo failed'); }
  });

  document.getElementById('btn-redo').addEventListener('click', async () => {
    try {
      const res = await adminApi.redo();
      if (res.success) {
        window.app.toast.success('Action redone successfully');
        renderAdminDashboard();
      } else throw new Error(res.error);
    } catch(e) { window.app.toast.error(e.message || 'Redo failed'); }
  });

  try {
    const res = await adminApi.getAnalytics();
    if (!res.success) throw new Error(res.error || 'Failed to load analytics');
    const data = res.data;

    let html = \`
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:1rem;margin-bottom:2rem">
        <div class="card" style="padding:1.5rem"><div style="color:var(--slate-400);font-size:.875rem">Total Lost</div><div style="font-size:1.5rem;font-weight:700;margin-top:.5rem">\${data.totalLost || 0}</div></div>
        <div class="card" style="padding:1.5rem"><div style="color:var(--slate-400);font-size:.875rem">Total Found</div><div style="font-size:1.5rem;font-weight:700;margin-top:.5rem">\${data.totalFound || 0}</div></div>
        <div class="card" style="padding:1.5rem"><div style="color:var(--slate-400);font-size:.875rem">Successful Matches</div><div style="font-size:1.5rem;font-weight:700;margin-top:.5rem">\${data.successfulMatches || 0}</div></div>
        <div class="card" style="padding:1.5rem"><div style="color:var(--slate-400);font-size:.875rem">Items Returned</div><div style="font-size:1.5rem;font-weight:700;margin-top:.5rem">\${data.itemsReturned || 0}</div></div>
        <div class="card" style="padding:1.5rem"><div style="color:var(--slate-400);font-size:.875rem">Avg Match Score</div><div style="font-size:1.5rem;font-weight:700;margin-top:.5rem">\${(data.avgMatchScore || 0).toFixed(1)}%</div></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">
        <div class="card" style="padding:1.5rem">
          <h3 style="font-weight:600;margin-bottom:1rem">Reports Over Time</h3>
          <canvas id="chart-reports" height="200"></canvas>
        </div>
        <div class="card" style="padding:1.5rem">
          <h3 style="font-weight:600;margin-bottom:1rem">Category Breakdown</h3>
          <canvas id="chart-categories" height="200"></canvas>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:2fr 1fr;gap:1.5rem">
        <div class="card" style="padding:1.5rem">
          <h3 style="font-weight:600;margin-bottom:1rem">Campus Loss Heatmap</h3>
          <table style="width:100%;border-collapse:collapse;font-size:.875rem" class="admin-table">
            <thead>
              <tr style="border-bottom:1px solid var(--slate-700);text-align:left"><th style="padding:.75rem">Building</th><th style="padding:.75rem">Items Count</th></tr>
            </thead>
            <tbody>
              \${(data.heatmap || []).map(h => {
                const color = h.count > 10 ? 'var(--rose-500)' : 'var(--blue-400)';
                return \`<tr style="border-bottom:1px solid var(--slate-800)">
                  <td style="padding:.75rem">\${h.location}</td>
                  <td style="padding:.75rem;color:\${color};font-weight:600">\${h.count}</td>
                </tr>\`;
              }).join('') || '<tr><td colspan="2" style="padding:1rem;text-align:center;color:var(--slate-500)">No data</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="card" style="padding:1.5rem">
          <h3 style="font-weight:600;margin-bottom:1rem">Recent Matches Feed</h3>
          \${(data.recentMatches || []).length === 0 ? '<div style="color:var(--slate-500);font-size:.875rem">No recent matches</div>' : ''}
          <div style="display:flex;flex-direction:column;gap:1rem">
            \${(data.recentMatches || []).map(m => \`
              <div style="background:var(--slate-800);padding:1rem;border-radius:.5rem;display:flex;align-items:center;gap:1rem">
                <div style="font-size:1.25rem;font-weight:700;color:var(--brand-400)">\${Math.round(m.score)}%</div>
                <div style="font-size:.8125rem;color:var(--slate-300)">
                  \${m.itemCategory || 'Item'} match found!
                </div>
              </div>
            \`).join('')}
          </div>
        </div>
      </div>
    \`;

    document.getElementById('dashboard-content').innerHTML = html;

    if (window.Chart && data.reportsOverTime) {
      const ctx1 = document.getElementById('chart-reports').getContext('2d');
      new Chart(ctx1, {
        type: 'line',
        data: {
          labels: data.reportsOverTime.map(d => d.date),
          datasets: [
            { label: 'Lost', data: data.reportsOverTime.map(d => d.lost), borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
            { label: 'Found', data: data.reportsOverTime.map(d => d.found), borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 }
          ]
        },
        options: { responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } },
          scales: { x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
                    y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } } }
        }
      });
    }

    if (window.Chart && data.categoryBreakdown) {
      const ctx2 = document.getElementById('chart-categories').getContext('2d');
      new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: data.categoryBreakdown.map(d => d.category),
          datasets: [{ label: 'Items', data: data.categoryBreakdown.map(d => d.count), backgroundColor: '#3B82F6' }]
        },
        options: { indexAxis: 'y', responsive: true, plugins: { legend: { display:false } },
          scales: { x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
                    y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } } }
        }
      });
    }

  } catch(err) {
    document.getElementById('dashboard-content').innerHTML = \`<div class="alert alert-error">Error loading analytics: \${err.message}</div>\`;
  }
}

export default renderAdminDashboard;
