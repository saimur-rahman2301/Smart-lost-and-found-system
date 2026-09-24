/**
 * SMART LOST & FOUND - FRONTEND APPLICATION
 * "Find It. Match It. Return It."
 * 
 * Interacts with C++ DSA Backend via simple local JSON REST API endpoints.
 * Enforces Role-Based Access Control: Students can only view their own items;
 * Campus Administrators have full access to browse all items & view DSA metrics.
 */

const API_BASE = ''; // Same-origin when served by C++ server or demo proxy

// Global State
// ── Session & User Role State ──────────────────────────────────────────────
let currentUser = JSON.parse(localStorage.getItem('smart_lost_found_user')) || {
  role: 'STUDENT',
  contact: 'ali.raza@uni.edu',
  name: 'Student (ali.raza@uni.edu)',
  token: ''
};

// Global Filter State
let allItemsCache = [];
let currentFilter = {
  q: '',
  type: 'ALL',
  category: 'ALL',
  status: 'ALL',
  sort: 'DATE_NEWEST'
};

// ── Role UI Management ─────────────────────────────────────────────────────
function updateRoleUI() {
  const badge = document.getElementById('current-user-badge');
  const label = document.getElementById('current-user-label');
  const authBtn = document.getElementById('auth-action-btn');
  const navBrowse = document.getElementById('nav-item-browse');
  const navStats = document.getElementById('nav-item-stats');
  const heroBrowseBtn = document.getElementById('hero-browse-btn');
  const privacyBanner = document.getElementById('student-privacy-banner');
  const navDashBtn = document.getElementById('nav-dashboard');

  if (currentUser.role === 'ADMIN') {
    badge.className = 'user-badge admin-active';
    label.innerHTML = `🛡️ <strong>Admin:</strong> Campus Office`;
    authBtn.textContent = '🚪 Sign Out';
    authBtn.onclick = handleSignOut;

    if (navBrowse) navBrowse.style.display = 'block';
    if (navStats) navStats.style.display = 'block';
    if (heroBrowseBtn) heroBrowseBtn.style.display = 'inline-flex';
    if (privacyBanner) privacyBanner.style.display = 'none';
    if (navDashBtn) navDashBtn.innerHTML = '📊 Campus Dashboard';
  } else {
    badge.className = 'user-badge student-active';
    label.innerHTML = `👨‍🎓 <strong>Student:</strong> ${escapeHtml(currentUser.contact)}`;
    authBtn.textContent = '🔐 Admin Login';
    authBtn.onclick = openLoginModal;

    if (navBrowse) navBrowse.style.display = 'none';
    if (navStats) navStats.style.display = 'none';
    if (heroBrowseBtn) heroBrowseBtn.style.display = 'none';
    if (privacyBanner) {
      privacyBanner.style.display = 'flex';
      const emailSpan = document.getElementById('banner-student-email');
      if (emailSpan) emailSpan.textContent = currentUser.contact;
    }
    if (navDashBtn) navDashBtn.innerHTML = '📊 My Belongings';

    // Auto-fill forms with current student contact
    const lostContact = document.getElementById('lost-contact');
    const foundContact = document.getElementById('found-contact');
    if (lostContact) lostContact.value = currentUser.contact;
    if (foundContact) foundContact.value = currentUser.contact;
  }
}

// ── View Management ────────────────────────────────────────────────────────
function switchView(viewName) {
  // Guard admin-only views
  if ((viewName === 'browse' || viewName === 'stats') && currentUser.role !== 'ADMIN') {
    showToast('Campus-wide browsing is restricted to administrators', 'error');
    openLoginModal('ADMIN');
    return;
  }

  const sections = document.querySelectorAll('.view-section');
  sections.forEach(sec => sec.classList.remove('active'));

  const activeSec = document.getElementById(`view-${viewName}`);
  if (activeSec) {
    activeSec.classList.add('active');
  }

  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  const activeNav = document.getElementById(`nav-${viewName}`);
  if (activeNav) {
    activeNav.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Hook specific view loaders
  if (viewName === 'dashboard') {
    loadDashboard();
  } else if (viewName === 'browse') {
    loadBrowseItems();
  } else if (viewName === 'matches') {
    populateMatchDropdown();
  } else if (viewName === 'stats') {
    loadStatistics();
  }
}

// ── Toast Notifications ───────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '⚠️'}</span>
    <div>${message}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Data Fetching: Items (Role-Enforced) ────────────────────────────────────
async function fetchItems(params = {}) {
  try {
    const combined = { ...params };
    if (currentUser.role === 'ADMIN') {
      combined.role = 'ADMIN';
      combined.token = currentUser.token;
    } else {
      combined.role = 'STUDENT';
      combined.contact = currentUser.contact;
    }

    const query = new URLSearchParams(combined).toString();
    const res = await fetch(`${API_BASE}/api/items?${query}`);
    if (!res.ok) {
      if (res.status === 403) {
        showToast('Access restricted by C++ security policy', 'error');
      }
      throw new Error('Failed to fetch items');
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching items:', err);
    showToast('Failed to connect to C++ backend', 'error');
    return [];
  }
}

// ── Dashboard View ─────────────────────────────────────────────────────────
async function loadDashboard() {
  updateRoleUI();

  // Load items for the current active role
  const items = await fetchItems({ sort: 'DATE_NEWEST' });
  const grid = document.getElementById('dashboard-recent-grid');

  if (currentUser.role === 'STUDENT') {
    // Calculate student's personal metrics
    let myLost = 0, myFound = 0, myRecovered = 0;
    items.forEach(it => {
      if (it.type === 'LOST') myLost++;
      else if (it.type === 'FOUND') myFound++;
      if (it.status === 'RECOVERED') myRecovered++;
    });

    document.getElementById('dash-total-lost').textContent = myLost;
    document.getElementById('dash-total-found').textContent = myFound;
    document.getElementById('dash-total-recovered').textContent = myRecovered;
    const rate = myLost > 0 ? ((myRecovered / myLost) * 100).toFixed(1) : '0.0';
    document.getElementById('dash-recovery-rate').textContent = `${rate}%`;

    const heading = document.getElementById('dashboard-items-heading');
    const subheading = document.getElementById('dashboard-items-subheading');
    if (heading) heading.textContent = '📋 My Reported Belongings';
    if (subheading) subheading.textContent = `Items reported under ${currentUser.contact}`;

    if (!items || items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem; background:white; border-radius:var(--radius-md); border:1px dashed var(--border);">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">📦</div>
          <div style="font-weight:700; font-size:1.1rem; color:var(--text-primary);">No belongings reported yet</div>
          <p style="font-size:0.875rem; color:var(--text-secondary); margin-top:0.35rem; margin-bottom:1.25rem;">
            You haven't reported any lost or found items under <strong>${escapeHtml(currentUser.contact)}</strong>.
          </p>
          <div style="display:flex; justify-content:center; gap:0.75rem;">
            <button class="btn btn-danger btn-sm" onclick="switchView('report-lost')">🔴 Report Lost</button>
            <button class="btn btn-success btn-sm" onclick="switchView('report-found')">🟢 Report Found</button>
          </div>
        </div>
      `;
      return;
    }
  } else {
    // Admin role: fetch full university statistics
    try {
      const statsRes = await fetch(`${API_BASE}/api/statistics`);
      if (statsRes.ok) {
        const stats = await statsRes.json();
        document.getElementById('dash-total-lost').textContent = stats.totalLost;
        document.getElementById('dash-total-found').textContent = stats.totalFound;
        document.getElementById('dash-total-recovered').textContent = stats.totalRecovered;
        document.getElementById('dash-recovery-rate').textContent = `${stats.recoveryRate.toFixed(1)}%`;
      }
    } catch (e) {
      console.warn('Backend stats offline');
    }

    const heading = document.getElementById('dashboard-items-heading');
    const subheading = document.getElementById('dashboard-items-subheading');
    if (heading) heading.textContent = '📋 Recent Campus Items (All Reports)';
    if (subheading) subheading.textContent = 'Administrator view of all latest student reports across campus.';

    if (!items || items.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">No campus items recorded yet.</div>`;
      return;
    }
  }

  // Render recent items (up to 6)
  grid.innerHTML = items.slice(0, 6).map(item => renderItemCard(item)).join('');
}


// ── Search & Browse View ───────────────────────────────────────────────────
// ── Search & Browse View (Admin Only) ──────────────────────────────────────
let searchDebounceTimer = null;
function handleSearchChange() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    currentFilter.q = document.getElementById('search-input').value.trim();
    loadBrowseItems();
  }, 250);
}

function handleFilterChange() {
  currentFilter.type = document.getElementById('filter-type').value;
  currentFilter.category = document.getElementById('filter-category').value;
  currentFilter.status = document.getElementById('filter-status').value;
  currentFilter.sort = document.getElementById('filter-sort').value;
  loadBrowseItems();
}

function resetFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-type').value = 'ALL';
  document.getElementById('filter-category').value = 'ALL';
  document.getElementById('filter-status').value = 'ALL';
  document.getElementById('filter-sort').value = 'DATE_NEWEST';
  currentFilter = { q: '', type: 'ALL', category: 'ALL', status: 'ALL', sort: 'DATE_NEWEST' };
  loadBrowseItems();
}

async function loadBrowseItems() {
  if (currentUser.role !== 'ADMIN') {
    switchView('dashboard');
    return;
  }

  const grid = document.getElementById('browse-items-grid');
  grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">Searching C++ Data Structures...</div>`;

  const items = await fetchItems(currentFilter);
  allItemsCache = items;

  if (!items || items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; background:white; border-radius:var(--radius-md); border:1px dashed var(--border); color:var(--text-muted);">
        <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
        <div style="font-weight:600; color:var(--text-primary); margin-bottom:0.25rem;">No matching items found</div>
        <p style="font-size:0.875rem;">Try adjusting your search query, location, or category filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(item => renderItemCard(item)).join('');
}

// ── Render Item Card ───────────────────────────────────────────────────────
function renderItemCard(item) {
  const isLost = item.type === 'LOST';
  const isRecovered = item.status === 'RECOVERED';
  const typeBadgeClass = isLost ? 'badge-lost' : 'badge-found';
  const statusBadgeClass = isRecovered ? 'badge-recovered' : 'badge-active';

  return `
    <div class="item-card">
      <div>
        <div class="card-header">
          <span class="badge ${typeBadgeClass}">${item.type}</span>
          <span class="badge ${statusBadgeClass}">${item.status}</span>
        </div>
        <h3 class="item-title">${escapeHtml(item.name)}</h3>
        <p class="item-description">${escapeHtml(item.description || 'No additional description provided.')}</p>
        
        <div class="item-meta-grid">
          <div class="meta-item">
            <span class="meta-label">Category</span>
            <span class="meta-value">${escapeHtml(item.category)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Location</span>
            <span class="meta-value">📍 ${escapeHtml(item.location)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Color / Brand</span>
            <span class="meta-value">${escapeHtml(item.color || 'N/A')} • ${escapeHtml(item.brand || 'Generic')}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Date</span>
            <span class="meta-value">📅 ${escapeHtml(item.date)}</span>
          </div>
          <div class="meta-item" style="grid-column:span 2;">
            <span class="meta-label">Reporter Contact</span>
            <span class="meta-value" style="font-size:0.75rem;">📞 ${escapeHtml(item.contact)}</span>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${item.id}</span>
        <div style="display:flex; gap:0.5rem;">
          ${isLost && !isRecovered ? `<button class="btn btn-outline btn-sm" onclick="matchSpecificItem('${item.id}')">🎯 Matches</button>` : ''}
          <button class="btn btn-outline btn-sm" onclick="showItemModal('${item.id}')">View Details</button>
        </div>
      </div>
    </div>
  `;
}

// ── Report Submission (Lost or Found) ──────────────────────────────────────
async function submitReport(event, type) {
  event.preventDefault();

  const prefix = type === 'LOST' ? 'lost' : 'found';
  const payload = {
    type: type,
    name: document.getElementById(`${prefix}-name`).value.trim(),
    category: document.getElementById(`${prefix}-category`).value,
    color: document.getElementById(`${prefix}-color`).value.trim(),
    brand: document.getElementById(`${prefix}-brand`).value.trim() || 'Generic',
    location: document.getElementById(`${prefix}-location`).value,
    date: document.getElementById(`${prefix}-date`).value,
    contact: document.getElementById(`${prefix}-contact`).value.trim(),
    keywords: document.getElementById(`${prefix}-keywords`).value.trim(),
    description: document.getElementById(`${prefix}-description`).value.trim(),
    status: 'ACTIVE'
  };

  try {
    const res = await fetch(`${API_BASE}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Submission failed');
    const createdItem = await res.json();

    showToast(`Successfully reported ${type.toLowerCase()} item! (ID: ${createdItem.id})`, 'success');
    document.getElementById(`form-${prefix}`).reset();

    // If student reported a lost item, offer to run matches immediately
    // Re-fill student contact after reset
    if (currentUser.role === 'STUDENT') {
      const contactEl = document.getElementById(`${prefix}-contact`);
      if (contactEl) contactEl.value = currentUser.contact;
    }

    if (type === 'LOST') {
      setTimeout(() => {
        matchSpecificItem(createdItem.id);
      }, 500);
    } else {
      switchView('browse');
      switchView('dashboard');
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to record report on C++ server', 'error');
  }
}

// ── Matching Engine View ───────────────────────────────────────────────────
async function populateMatchDropdown(selectedId = null) {
  const select = document.getElementById('match-item-select');
  select.innerHTML = `<option value="">Loading active lost items...</option>`;
  select.innerHTML = `<option value="">Loading lost items...</option>`;

  // When student, only fetches their own lost items!
  const lostItems = await fetchItems({ type: 'LOST', status: 'ACTIVE' });


  if (!lostItems || lostItems.length === 0) {
    select.innerHTML = `<option value="">No active lost items found</option>`;
    const msg = currentUser.role === 'STUDENT'
      ? `No active lost items registered under ${currentUser.contact}`
      : 'No active lost items found';
    select.innerHTML = `<option value="">${msg}</option>`;
    return;
  }

  select.innerHTML = `<option value="">-- Choose a Lost Item (${lostItems.length} available) --</option>` +
    lostItems.map(it => `
      <option value="${it.id}" ${selectedId === it.id ? 'selected' : ''}>
        ${it.id}: ${escapeHtml(it.name)} (${it.location})
      </option>
    `).join('');

  if (selectedId) {
    runMatchAlgorithm();
  }
}

function matchSpecificItem(itemId) {
  switchView('matches');
  populateMatchDropdown(itemId);
}

async function runMatchAlgorithm() {
  const select = document.getElementById('match-item-select');
  const lostId = select.value;
  const container = document.getElementById('matches-results-container');
  const summaryBox = document.getElementById('match-target-summary');

  if (!lostId) {
    summaryBox.style.display = 'none';
    container.innerHTML = `
      <div style="text-align:center; padding:3rem; color:var(--text-muted); background:white; border-radius:var(--radius-md); border:1px dashed var(--border);">
        Please select a lost item from the dropdown to run the matching engine.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--text-secondary); background:white; border-radius:var(--radius-md); border:1px solid var(--border);">
      <div style="font-size:1.75rem; margin-bottom:0.5rem;">⚙️</div>
      <div style="font-weight:700;">Evaluating Match Candidates in C++ Engine...</div>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Applying 100-Point Rule Formula &rarr; Inserting to Max Heap &rarr; Extracting Ranked Results</p>
    </div>
  `;

  try {
    // 1. Fetch the lost item details
    const itemRes = await fetch(`${API_BASE}/api/items/${lostId}`);
    if (itemRes.ok) {
      const lostItem = await itemRes.json();
      summaryBox.style.display = 'block';
      summaryBox.innerHTML = `
        <div style="background:var(--primary-light); border:1px solid #bfdbfe; border-radius:var(--radius-md); padding:1.25rem;">
          <div style="font-size:0.75rem; font-weight:700; color:var(--primary); text-transform:uppercase; letter-spacing:0.04em;">LOST ITEM BEING MATCHED:</div>
          <h3 style="font-size:1.15rem; font-weight:700; margin:0.25rem 0;">${escapeHtml(lostItem.name)}</h3>
          <div style="font-size:0.85rem; color:var(--text-secondary); display:flex; gap:1.25rem; flex-wrap:wrap; margin-top:0.35rem;">
            <span><strong>Category:</strong> ${lostItem.category}</span>
            <span><strong>Brand:</strong> ${lostItem.brand || 'N/A'}</span>
            <span><strong>Color:</strong> ${lostItem.color}</span>
            <span><strong>Location:</strong> 📍 ${lostItem.location}</span>
            <span><strong>Date:</strong> 📅 ${lostItem.date}</span>
          </div>
        </div>
      `;
    }

    // 2. Fetch matches from C++ backend with authorization
    const roleParam = currentUser.role === 'ADMIN' ? `role=ADMIN&token=${currentUser.token}` : `role=STUDENT&contact=${encodeURIComponent(currentUser.contact)}`;
    const res = await fetch(`${API_BASE}/api/matches?id=${lostId}&${roleParam}`);
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('Access denied: You can only view matches for your own lost items');
      }
      throw new Error('Match query failed');
    }
    const matches = await res.json();

    if (!matches || matches.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:3rem; background:white; border-radius:var(--radius-md); border:1px dashed var(--border);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">📭</div>
          <div style="font-weight:700; color:var(--text-primary); margin-bottom:0.25rem;">No strong matches found yet</div>
          <p style="font-size:0.875rem; color:var(--text-secondary); max-width:480px; margin:0 auto;">
            Our algorithm evaluated all active found items. None scored above the 20% relevance threshold.
            We will automatically evaluate new found items as they are submitted.
          </p>
        </div>
      `;
      return;
    }

    // Render matches ranked from Max Heap
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <span style="font-size:0.875rem; font-weight:700; color:var(--text-secondary);">
          🏆 ${matches.length} POSSIBLY MATCHED CANDIDATE(S) (RANKED BY C++ MAX HEAP)
        </span>
        <span style="font-size:0.75rem; color:var(--text-muted);">Formula: Cat(+20) Name(+20) Brand(+15) Color(+10) Loc(+20) Key(+10) Date(+5)</span>
      </div>
      <div>
        ${matches.map((m, idx) => renderMatchCard(m, idx + 1, lostId)).join('')}
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div style="padding:2rem; color:var(--danger); background:white; border-radius:var(--radius-md);">Error running matching algorithm. Ensure C++ server is active.</div>`;
    container.innerHTML = `<div style="padding:2rem; color:var(--danger); background:white; border-radius:var(--radius-md);">${err.message || 'Error running matching algorithm.'}</div>`;
  }
}

function renderMatchCard(match, rank, lostId) {
  const item = match.item;
  const score = match.score;
  let tierClass = 'tier-low';
  let tierColor = 'var(--text-secondary)';

  if (score >= 90) {
    tierClass = 'tier-very-strong';
    tierColor = 'var(--success-text)';
  } else if (score >= 75) {
    tierClass = 'tier-strong';
    tierColor = 'var(--primary)';
  } else if (score >= 60) {
    tierClass = 'tier-possible';
    tierColor = 'var(--warning-text)';
  }

  const breakdownHtml = (match.breakdown || []).map(b => `<li>✓ ${escapeHtml(b)}</li>`).join('');

  return `
    <div class="match-card ${tierClass}">
      <div class="score-circle ${tierClass}">
        <span class="score-num">${score}%</span>
        <span class="score-label">MATCH</span>
      </div>

      <div class="match-details">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;">
          <div>
            <span class="match-tier-badge" style="background:${tierColor}15; color:${tierColor};">
              #${rank} • ${escapeHtml(match.categoryLabel || match.category)}
            </span>
            <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-primary);">${escapeHtml(item.name)}</h3>
          </div>
          <button class="btn btn-success btn-sm" onclick="markPairRecovered('${lostId}', '${item.id}')">
            🎉 Mark as Recovered
          </button>
        </div>

        <div style="font-size:0.8125rem; color:var(--text-secondary); margin:0.4rem 0; display:flex; gap:1rem; flex-wrap:wrap;">
          <span>📍 <strong>Location:</strong> ${escapeHtml(item.location)}</span>
          <span>📅 <strong>Date Found:</strong> ${escapeHtml(item.date)}</span>
          <span>🎨 <strong>Color:</strong> ${escapeHtml(item.color)}</span>
          <span>🏷️ <strong>Brand:</strong> ${escapeHtml(item.brand)}</span>
          <span>📞 <strong>Finder Contact:</strong> ${escapeHtml(item.contact)}</span>
        </div>

        <p style="font-size:0.85rem; color:var(--text-secondary); margin:0.35rem 0;">
          ${escapeHtml(item.description || '')}
        </p>

        <div style="margin-top:0.75rem; background:var(--bg-subtle); padding:0.6rem 0.85rem; border-radius:var(--radius-sm);">
          <strong style="font-size:0.75rem; color:var(--text-primary); text-transform:uppercase;">Scoring Audit Trail:</strong>
          <ul class="audit-list">
            ${breakdownHtml || '<li>Points calculated according to compatibility formula.</li>'}
          </ul>
        </div>
      </div>
    </div>
  `;
}

// ── Mark as Recovered ──────────────────────────────────────────────────────
async function markPairRecovered(lostId, foundId) {
  if (!confirm(`Are you sure you want to mark Lost Item (${lostId}) and Found Item (${foundId}) as RECOVERED? They will be archived from future matching.`)) {
    return;
  }

  try {
    const res1 = await fetch(`${API_BASE}/api/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lostId })
    });
    const res2 = await fetch(`${API_BASE}/api/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: foundId })
    });

    if (res1.ok && res2.ok) {
      showToast('Belonging successfully marked as RECOVERED! Congratulations! 🎉', 'success');
      runMatchAlgorithm();
    } else {
      throw new Error('Recovery update failed');
    }
  } catch (e) {
    showToast('Failed to update recovery status on C++ server', 'error');
  }
}

async function markSingleRecovered(itemId) {
  if (!confirm(`Mark item ${itemId} as RECOVERED?`)) return;

  try {
    const res = await fetch(`${API_BASE}/api/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId })
    });

    if (res.ok) {
      showToast(`Item ${itemId} marked as RECOVERED!`, 'success');
      closeModal();
      loadBrowseItems();
      loadDashboard();
    }
  } catch (e) {
    showToast('Failed to update status', 'error');
  }
}

// ── Item Details Modal ─────────────────────────────────────────────────────
async function showItemModal(itemId) {
  const modal = document.getElementById('item-modal');
  const contentArea = document.getElementById('modal-content-area');
  contentArea.innerHTML = `<div style="text-align:center; padding:2rem;">Loading item details from C++ Hash Table...</div>`;
  modal.style.display = 'flex';

  try {
    const res = await fetch(`${API_BASE}/api/items/${itemId}`);
    if (!res.ok) throw new Error('Item not found');
    const item = await res.json();

    const isRecovered = item.status === 'RECOVERED';

    contentArea.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
        <div>
          <span class="badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}">${item.type}</span>
          <span class="badge ${isRecovered ? 'badge-recovered' : 'badge-active'}" style="margin-left:0.4rem;">${item.status}</span>
        </div>
        <button onclick="closeModal()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-muted);">&times;</button>
      </div>

      <h2 style="font-size:1.35rem; font-weight:800; margin-bottom:0.5rem; color:var(--text-primary);">${escapeHtml(item.name)}</h2>
      <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1.25rem;">${escapeHtml(item.description || 'No description.')}</p>

      <div class="item-meta-grid" style="margin-bottom:1.25rem;">
        <div class="meta-item">
          <span class="meta-label">Category</span>
          <span class="meta-value">${escapeHtml(item.category)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Location</span>
          <span class="meta-value">📍 ${escapeHtml(item.location)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Color / Brand</span>
          <span class="meta-value">${escapeHtml(item.color)} • ${escapeHtml(item.brand)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Date Recorded</span>
          <span class="meta-value">📅 ${escapeHtml(item.date)}</span>
        </div>
        <div class="meta-item" style="grid-column:span 2;">
          <span class="meta-label">Contact Information</span>
          <span class="meta-value">📞 ${escapeHtml(item.contact)}</span>
        </div>
        <div class="meta-item" style="grid-column:span 2;">
          <span class="meta-label">Matching Keywords</span>
          <span class="meta-value" style="font-family:var(--font-mono); font-size:0.75rem;">${escapeHtml(item.keywords || 'N/A')}</span>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:1rem;">
        <span style="font-size:0.8125rem; color:var(--text-muted); font-family:var(--font-mono);">ID: ${item.id}</span>
        <div style="display:flex; gap:0.5rem;">
          ${!isRecovered ? `<button class="btn btn-success btn-sm" onclick="markSingleRecovered('${item.id}')">Mark as Recovered</button>` : ''}
          <button class="btn btn-outline btn-sm" onclick="closeModal()">Close</button>
        </div>
      </div>
    `;
  } catch (err) {
    contentArea.innerHTML = `<div style="color:var(--danger); padding:1rem;">Could not load item details.</div>`;
  }
}

function closeModal() {
  document.getElementById('item-modal').style.display = 'none';
}

function handleModalOverlayClick(event) {
  if (event.target.id === 'item-modal') {
    closeModal();
  }
}

// ── Statistics & DSA Inspector ─────────────────────────────────────────────
// ── Authentication Modal Handlers ──────────────────────────────────────────
function openLoginModal(tab = 'STUDENT') {
  document.getElementById('login-modal').style.display = 'flex';
  switchAuthTab(tab);
}

function closeLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
}

function handleLoginModalOverlayClick(event) {
  if (event.target.id === 'login-modal') {
    closeLoginModal();
  }
}

function switchAuthTab(tab) {
  const studentBtn = document.getElementById('tab-student-btn');
  const adminBtn = document.getElementById('tab-admin-btn');
  const studentForm = document.getElementById('student-login-form');
  const adminForm = document.getElementById('admin-login-form');

  if (tab === 'ADMIN') {
    studentBtn.classList.remove('active');
    adminBtn.classList.add('active');
    studentForm.style.display = 'none';
    adminForm.style.display = 'block';
  } else {
    adminBtn.classList.remove('active');
    studentBtn.classList.add('active');
    adminForm.style.display = 'none';
    studentForm.style.display = 'block';
  }
}

async function handleStudentLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-student-email').value.trim();
  if (!email) return;

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'STUDENT', contact: email })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = {
        role: 'STUDENT',
        contact: email,
        name: `Student (${email})`,
        token: ''
      };
      localStorage.setItem('smart_lost_found_user', JSON.stringify(currentUser));
      closeLoginModal();
      showToast(`Logged in as Student: ${email}`, 'success');
      switchView('dashboard');
    }
  } catch (e) {
    showToast('Login failed', 'error');
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const username = document.getElementById('login-admin-user').value.trim();
  const password = document.getElementById('login-admin-pass').value.trim();

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN', username, password })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = {
        role: 'ADMIN',
        contact: 'admin@university.edu',
        name: data.name,
        token: data.token
      };
      localStorage.setItem('smart_lost_found_user', JSON.stringify(currentUser));
      closeLoginModal();
      showToast('Admin Portal Unlocked! Full campus database accessible.', 'success');
      switchView('browse');
    } else {
      showToast(data.error || 'Invalid admin credentials', 'error');
    }
  } catch (e) {
    showToast('Failed to connect to authentication server', 'error');
  }
}

function handleSignOut() {
  currentUser = {
    role: 'STUDENT',
    contact: 'ali.raza@uni.edu',
    name: 'Student (ali.raza@uni.edu)',
    token: ''
  };
  localStorage.setItem('smart_lost_found_user', JSON.stringify(currentUser));
  showToast('Signed out of Admin mode. Switched to Student mode.', 'success');
  switchView('dashboard');
}

// ── Statistics & DSA Inspector (Admin Only) ────────────────────────────────
async function loadStatistics() {
  if (currentUser.role !== 'ADMIN') {
    switchView('dashboard');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/statistics`);
    if (res.ok) {
      const s = await res.json();
      document.getElementById('stats-total-lost').textContent = s.totalLost;
      document.getElementById('stats-total-found').textContent = s.totalFound;
      document.getElementById('stats-total-recovered').textContent = s.totalRecovered;
      document.getElementById('stats-top-category').textContent = s.mostLostCategory || 'None';

      // Technical metrics
      if (s.dsaMetrics) {
        document.getElementById('dsa-ht-cap').textContent = `${s.dsaMetrics.hashTableCapacity} prime buckets`;
        document.getElementById('dsa-ht-size').textContent = `${s.dsaMetrics.hashTableSize} items`;
        document.getElementById('dsa-ht-col').textContent = `${s.dsaMetrics.hashTableCollisions} (Separate Chaining chains: 0)`;
        const lf = (s.dsaMetrics.hashTableSize / s.dsaMetrics.hashTableCapacity).toFixed(4);
        document.getElementById('dsa-ht-lf').textContent = `${lf} (Load factor healthy < 0.75)`;
        document.getElementById('dsa-bst-nodes').textContent = `${s.dsaMetrics.bstNodeCount} nodes`;
        document.getElementById('dsa-bst-height').textContent = `${s.dsaMetrics.bstHeight} levels (O(log n) efficiency)`;
      }
    }

    // Fetch BST in-order traversal
    const bstRes = await fetch(`${API_BASE}/api/bst/inorder`);
    if (bstRes.ok) {
      const bstItems = await bstRes.json();
      const listEl = document.getElementById('bst-inorder-list');
      if (bstItems.length === 0) {
        listEl.textContent = 'BST is empty.';
      } else {
        listEl.innerHTML = bstItems.map((it, idx) => `
          <div style="padding:0.25rem 0; border-bottom:1px solid rgba(0,0,0,0.04);">
            <span style="color:var(--text-muted);">${String(idx + 1).padStart(2, '0')}.</span>
            <strong style="color:var(--primary);">${escapeHtml(it.name)}</strong>
            <span style="color:var(--text-secondary); font-size:0.75rem;">[${it.id}] &bull; ${it.category} &bull; ${it.date}</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Error loading statistics:', err);
  }
}

// ── Utility: HTML Escaping ─────────────────────────────────────────────────
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Initial Load ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set default date picker values to today
  const today = new Date().toISOString().split('T')[0];
  const lostDateInput = document.getElementById('lost-date');
  const foundDateInput = document.getElementById('found-date');
  if (lostDateInput) lostDateInput.value = today;
  if (foundDateInput) foundDateInput.value = today;

  updateRoleUI();
  loadDashboard();
});

