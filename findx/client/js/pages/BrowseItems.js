/**
 * BrowseItems.js — Clean, simplified campus items directory.
 * Easy tabs for Lost / Found with quick search.
 */
import { AppLayout } from '../components/AppLayout.js';
import { itemsApi } from '../api.js';

export function renderBrowseItems() {
  const layout = new AppLayout('Browse Items');

  let currentType = 'All';
  let searchQuery = '';

  const html = `
    <div style="max-width: 1050px; margin: 0 auto;">
      <!-- Header & Quick Search -->
      <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem;">Campus Items Directory</h2>
          <p style="color: var(--slate-400); font-size: 0.95rem;">
            Search and view all reported lost and found items on campus.
          </p>
        </div>

        <!-- Search Bar and Quick Type Buttons -->
        <div class="card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="position: relative;">
            <input type="text" id="browse-search" class="input" placeholder="🔍 Search by item name, brand, description (e.g. MacBook, Nike, Keys)..." style="padding: 0.75rem 1rem; font-size: 1rem;">
          </div>

          <!-- Type Filter Tabs -->
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm filter-btn" data-type="All" style="font-weight: 700;">
              All Items
            </button>
            <button class="btn btn-secondary btn-sm filter-btn" data-type="LOST" style="font-weight: 700;">
              🔴 Lost Items
            </button>
            <button class="btn btn-secondary btn-sm filter-btn" data-type="FOUND" style="font-weight: 700;">
              🟢 Found Items
            </button>
            <button class="btn btn-secondary btn-sm filter-btn" data-type="MATCHED" style="font-weight: 700;">
              ⚡ Matched Pairs
            </button>
          </div>
        </div>
      </div>

      <!-- Items Grid -->
      <div id="browse-grid">
        <div class="card" style="padding: 3rem; text-align: center;">
          <div class="spinner" style="margin-bottom: 1rem;"></div>
          <p style="color: var(--slate-400);">Loading items...</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('app').innerHTML = layout.wrap(html, 'Browse Campus Items');
  layout.attachEventListeners();

  // Attach search and filter events
  const searchInput = document.getElementById('browse-search');
  let debounceTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      searchQuery = e.target.value.trim();
      fetchAndRenderItems(currentType, searchQuery);
    }, 300);
  });

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.className = 'btn btn-secondary btn-sm filter-btn';
      });
      btn.className = 'btn btn-primary btn-sm filter-btn';
      currentType = btn.dataset.type;
      fetchAndRenderItems(currentType, searchQuery);
    });
  });

  // Initial fetch
  fetchAndRenderItems(currentType, searchQuery);
}

async function fetchAndRenderItems(type, query) {
  const grid = document.getElementById('browse-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="card" style="padding: 3rem; text-align: center;">
      <div class="spinner" style="margin-bottom: 1rem;"></div>
      <p style="color: var(--slate-400);">Loading items...</p>
    </div>
  `;

  try {
    const params = { limit: 40 };
    if (type === 'LOST' || type === 'FOUND') params.type = type;
    if (type === 'MATCHED') params.status = 'MATCHED';
    if (query) params.q = query;

    const res = await itemsApi.list(params);
    const items = res?.items || res?.data?.items || (Array.isArray(res?.data) ? res.data : []) || [];

    if (!items.length) {
      grid.innerHTML = `
        <div class="card" style="padding: 3rem; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔍</div>
          <h4 style="font-weight: 700; margin-bottom: 0.5rem;">No items found</h4>
          <p style="color: var(--slate-400); font-size: 0.9rem;">
            Try a different search term or select another category.
          </p>
        </div>
      `;
      return;
    }

    const categoryIcons = {
      'Electronics': '💻', 'Clothing': '👕', 'Accessories': '👜',
      'Books & Stationery': '📚', 'Keys & Wallets': '🔑', 'Sports Equipment': '⚽',
      'Musical Instruments': '🎸', 'Jewelry': '💍', 'Other': '📦'
    };

    grid.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem;">
        ${items.map(item => {
      const icon = categoryIcons[item.category] || '📦';
      const isLost = item.type === 'LOST';
      const hasMatch = item.status === 'MATCHED';

      return `
            <div class="card" style="padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid ${isLost ? 'var(--rose-500)' : 'var(--emerald-500)'};">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">${icon}</span>
                    <div>
                      <div style="font-weight: 700; font-size: 1rem; color: #fff;">
                        ${item.category} ${item.brand ? '· ' + item.brand : ''}
                      </div>
                      <div style="font-size: 0.75rem; color: var(--slate-400);">
                        📍 ${item.locationName || 'Campus'} &bull; 📅 ${item.date || ''}
                      </div>
                    </div>
                  </div>
                  <span class="badge ${isLost ? 'badge-error' : 'badge-success'}">
                    ${isLost ? 'Lost' : 'Found'}
                  </span>
                </div>

                <p style="color: var(--slate-300); font-size: 0.85rem; line-height: 1.5; margin: 0.75rem 0 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${item.description || 'No description provided.'}
                </p>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid var(--navy-700);">
                ${hasMatch ? `
                  <span class="badge badge-warning" style="font-size: 0.7rem;">⚡ Match Found</span>
                  <a href="#/items/${item.id}/matches" class="btn btn-primary btn-sm" style="font-weight: 700;">
                    View Match →
                  </a>
                ` : `
                  <span style="font-size: 0.75rem; color: var(--slate-500);">By ${item.reporter?.name || 'Student'}</span>
                  <a href="#/items/${item.id}" class="btn btn-secondary btn-sm">
                    View Details →
                  </a>
                `}
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `;

  } catch (err) {
    grid.innerHTML = `
      <div class="card" style="padding: 2rem; text-align: center; color: var(--rose-400);">
        Failed to load items. Please try again.
      </div>
    `;
  }
}

export default renderBrowseItems;
