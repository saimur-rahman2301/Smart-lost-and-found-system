/**
 * Dashboard.js — Smart Lost & Found
 * "Find It. Match It. Return It."
 *
 * Clean, modern, intuitive dashboard with live DSA statistics, quick actions,
 * and direct 1-click match finding & recovery.
 */
import { AppLayout } from '../components/AppLayout.js';
import { authStore } from '../auth.js';
import { itemsApi } from '../api.js';

export async function renderDashboard() {
  const layout = new AppLayout('Dashboard');
  const user = authStore.getUser() || { name: 'Ali Raza', role: 'STUDENT' };

  const html = `
    <!-- Top Hero Banner -->
    <div style="background: linear-gradient(135deg, rgba(30,58,138,0.35) 0%, rgba(15,23,42,0.8) 100%); border: 1px solid rgba(59,130,246,0.25); border-radius: var(--radius-xl); padding: 2rem 2.25rem; margin-bottom: 2rem; box-shadow: 0 8px 30px rgba(0,0,0,0.3);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem;">
        <div style="max-width: 680px;">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; color: var(--brand-400); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
            ⚡ Algorithmic Smart Matching &bull; University DSA Engine
          </div>
          <h2 style="font-size: 2rem; font-weight: 800; color: #fff; margin: 0 0 0.5rem; line-height: 1.2;">
            Welcome to Smart Lost & Found
          </h2>
          <p style="color: var(--slate-300); font-size: 1.05rem; line-height: 1.6; margin: 0;">
            A transparent, rule-based campus platform that automatically matches lost belongings with found items using exact 100-point scoring and Max Heap priority ranking.
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <a href="#/report/lost" class="btn btn-danger" style="font-weight: 700; padding: 0.75rem 1.25rem;">
            🔴 Report Lost Item
          </a>
          <a href="#/report/found" class="btn btn-success" style="font-weight: 700; padding: 0.75rem 1.25rem;">
            🟢 Report Found Item
          </a>
        </div>
      </div>
    </div>

    <!-- 5 Live Stats Metric Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
      <div class="card" style="padding: 1.25rem 1.5rem; border-top: 3px solid var(--rose-500);">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase;">Total Lost Items</div>
        <div id="metric-lost" style="font-size: 2rem; font-weight: 800; color: var(--rose-400); margin-top: 0.35rem;">-</div>
        <div style="font-size: 0.75rem; color: var(--slate-400); margin-top: 0.25rem;">Reported by students</div>
      </div>

      <div class="card" style="padding: 1.25rem 1.5rem; border-top: 3px solid var(--emerald-500);">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase;">Total Found Items</div>
        <div id="metric-found" style="font-size: 2rem; font-weight: 800; color: var(--emerald-400); margin-top: 0.35rem;">-</div>
        <div style="font-size: 0.75rem; color: var(--slate-400); margin-top: 0.25rem;">Turned in on campus</div>
      </div>

      <div class="card" style="padding: 1.25rem 1.5rem; border-top: 3px solid var(--amber-500);">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase;">Active Matches</div>
        <div id="metric-matches" style="font-size: 2rem; font-weight: 800; color: var(--amber-400); margin-top: 0.35rem;">-</div>
        <div style="font-size: 0.75rem; color: var(--slate-400); margin-top: 0.25rem;">Score &ge; 60% detected</div>
      </div>

      <div class="card" style="padding: 1.25rem 1.5rem; border-top: 3px solid var(--brand-500);">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase;">Recovered Items</div>
        <div id="metric-recovered" style="font-size: 2rem; font-weight: 800; color: var(--brand-400); margin-top: 0.35rem;">-</div>
        <div style="font-size: 0.75rem; color: var(--slate-400); margin-top: 0.25rem;">Returned to owners</div>
      </div>

      <div class="card" style="padding: 1.25rem 1.5rem; border-top: 3px solid #06b6d4;">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase;">Recovery Rate</div>
        <div id="metric-rate" style="font-size: 2rem; font-weight: 800; color: #22d3ee; margin-top: 0.35rem;">-</div>
        <div style="font-size: 0.75rem; color: var(--slate-400); margin-top: 0.25rem;">Campus efficiency</div>
      </div>
    </div>

    <!-- Interactive Items Directory Section -->
    <div class="card" style="padding: 1.75rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0 0 0.25rem;">
            Campus Belongings & Smart Matches
          </h3>
          <p style="color: var(--slate-400); font-size: 0.9rem; margin: 0;">
            Click <strong>"Find Matches"</strong> to run the Max Heap ranking or <strong>"Mark Recovered"</strong> when resolved.
          </p>
        </div>

        <!-- Filter Pill Tabs -->
        <div style="display: flex; gap: 0.5rem; background: #0d1524; padding: 0.35rem; border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.08);">
          <button class="btn btn-primary btn-sm tab-filter" data-type="All" style="font-weight: 700;">All Items</button>
          <button class="btn btn-ghost btn-sm tab-filter" data-type="LOST" style="font-weight: 700;">🔴 Lost</button>
          <button class="btn btn-ghost btn-sm tab-filter" data-type="FOUND" style="font-weight: 700;">🟢 Found</button>
          <button class="btn btn-ghost btn-sm tab-filter" data-type="RECOVERED" style="font-weight: 700;">✅ Recovered</button>
        </div>
      </div>

      <!-- Items Grid -->
      <div id="dashboard-items-grid">
        <div style="text-align: center; padding: 3rem; color: var(--slate-400);">
          <div class="spinner spinner-lg" style="margin-bottom: 1rem;"></div>
          <div>Loading campus records...</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('app').innerHTML = layout.wrap(html, 'Dashboard');
  layout.attachEventListeners();

  // Load live statistics & items
  loadData('All');

  // Setup tab filter listeners
  document.querySelectorAll('.tab-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-filter').forEach(b => {
        b.className = 'btn btn-ghost btn-sm tab-filter';
      });
      btn.className = 'btn btn-primary btn-sm tab-filter';
      loadData(btn.dataset.type);
    });
  });
}

async function loadData(filterType = 'All') {
  const grid = document.getElementById('dashboard-items-grid');
  if (!grid) return;

  try {
    const [itemsRes, statsRes] = await Promise.all([
      itemsApi.list({ limit: 40 }),
      itemsApi.getAnalytics ? itemsApi.getAnalytics() : fetch('http://localhost:3000/api/v1/analytics').then(r => r.json())
    ]);

    // Update Top Metric KPIs
    const stats = statsRes?.data || statsRes || {};
    document.getElementById('metric-lost').textContent = stats.totalLost ?? 0;
    document.getElementById('metric-found').textContent = stats.totalFound ?? 0;
    document.getElementById('metric-matches').textContent = stats.activeMatches ?? 0;
    document.getElementById('metric-recovered').textContent = stats.totalRecovered ?? 0;
    document.getElementById('metric-rate').textContent = stats.recoveryRate || '0%';

    let items = itemsRes?.items || itemsRes?.data?.items || (Array.isArray(itemsRes?.data) ? itemsRes.data : []) || [];

    if (filterType === 'LOST') items = items.filter(i => i.type === 'LOST');
    else if (filterType === 'FOUND') items = items.filter(i => i.type === 'FOUND');
    else if (filterType === 'RECOVERED') items = items.filter(i => i.status === 'RECOVERED');

    if (!items.length) {
      grid.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--slate-400);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📋</div>
          <h4 style="font-weight: 700; color: #fff; margin-bottom: 0.5rem;">No items found</h4>
          <p style="font-size: 0.9rem;">There are currently no items under this category filter.</p>
        </div>
      `;
      return;
    }

    const categoryIcons = {
      'Electronics': '💻', 'Documents & Cards': '🪪', 'Keys & Wallets': '🔑',
      'Bags & Backpacks': '🎒', 'Books & Stationery': '📚', 'Clothing': '👕',
      'Accessories': '👜', 'Sports Equipment': '⚽', 'Other': '📦'
    };

    grid.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 1.25rem;">
        ${items.map(item => {
      const icon = categoryIcons[item.category] || '📦';
      const isLost = item.type === 'LOST';
      const isRecovered = item.status === 'RECOVERED';
      const isMatched = item.status === 'MATCHED';

      const accentColor = isRecovered ? '#06b6d4' : (isLost ? 'var(--rose-500)' : 'var(--emerald-500)');

      return `
            <div class="card" style="padding: 1.35rem; display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid ${accentColor}; background: #131d2e;">
              <div>
                <!-- Top Row: Icon + Type Badge + Status Badge -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                  <div style="display: flex; align-items: center; gap: 0.65rem;">
                    <span style="font-size: 1.65rem;">${icon}</span>
                    <div>
                      <span class="badge ${isLost ? 'badge-error' : 'badge-success'}" style="font-size: 0.7rem;">
                        ${isLost ? '🔴 LOST ITEM' : '🟢 FOUND ITEM'}
                      </span>
                    </div>
                  </div>
                  <div>
                    ${isRecovered ? `
                      <span class="badge" style="background: rgba(6,182,212,0.15); color: #22d3ee; border: 1px solid rgba(6,182,212,0.3);">
                        ✅ RECOVERED
                      </span>
                    ` : (isMatched ? `
                      <span class="badge badge-warning" style="animation: pulse 2s infinite;">
                        ⚡ MATCH FOUND
                      </span>
                    ` : `
                      <span class="badge badge-neutral">ACTIVE</span>
                    `)}
                  </div>
                </div>

                <!-- Item Title -->
                <h4 style="font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0 0 0.4rem; line-height: 1.35;">
                  ${item.name}
                </h4>

                <!-- Location, Date, Brand Meta -->
                <div style="font-size: 0.8rem; color: var(--slate-300); margin-bottom: 0.75rem; line-height: 1.5;">
                  <div>📍 <strong>Location:</strong> ${item.locationName}</div>
                  <div>📅 <strong>Date:</strong> ${item.date} &bull; 🏷️ <strong>Brand:</strong> ${item.brand || 'N/A'}</div>
                </div>

                <!-- Description Excerpt -->
                <p style="color: var(--slate-400); font-size: 0.825rem; line-height: 1.5; margin: 0 0 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${item.description || 'No description provided.'}
                </p>
              </div>

              <!-- Action Buttons Row -->
              <div style="padding-top: 0.85rem; border-top: 1px solid rgba(255,255,255,0.07); display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                ${!isRecovered ? `
                  <button class="btn btn-primary btn-sm btn-find-matches" data-id="${item.id}" style="font-weight: 700; flex: 1;">
                    ⚡ Find Matches
                  </button>
                  <button class="btn btn-secondary btn-sm btn-recover" data-id="${item.id}" data-name="${item.name.replace(/"/g, '&quot;')}" title="Mark as Recovered" style="color: var(--emerald-400);">
                    ✅ Recover
                  </button>
                ` : `
                  <span style="font-size: 0.8rem; color: var(--slate-400);">
                    🎉 Returned to Owner
                  </span>
                  <a href="#/items/${item.id}" class="btn btn-ghost btn-sm">Details</a>
                `}
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `;

    // Attach Action Listeners
    document.querySelectorAll('.btn-find-matches').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.hash = `#/matches?itemId=${btn.dataset.id}`;
      });
    });

    document.querySelectorAll('.btn-recover').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        if (!confirm(`Mark "${name}" as successfully RECOVERED and returned to owner?`)) return;

        try {
          btn.disabled = true;
          btn.textContent = 'Updating...';
          const res = await fetch(`http://localhost:3000/api/v1/items/${id}/recover`, { method: 'PATCH' }).then(r => r.json());
          if (res.success) {
            window.app?.toast?.success(`"${name}" is now marked as RECOVERED!`);
            loadData(filterType);
          } else {
            alert(res.message || 'Could not update status');
            btn.disabled = false;
          }
        } catch (e) {
          alert('Failed to mark item as recovered');
          btn.disabled = false;
        }
      });
    });

  } catch (err) {
    grid.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--rose-400);">
        Could not load items: ${err.message}. Please refresh the page.
      </div>
    `;
  }
}

export default renderDashboard;
