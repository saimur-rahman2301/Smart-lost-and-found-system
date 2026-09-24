/**
 * ReportFound.js — Simple, single-page found item report form.
 * Directly saves found item and matches against reported lost items.
 */
import { AppLayout } from '../components/AppLayout.js';
import { itemsApi, graphApi } from '../api.js';

export function renderReportFound() {
  const layout = new AppLayout('Report Found Item');

  const html = `
    <div style="max-width: 680px; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
        <span style="font-size: 2.25rem;">🟢</span>
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0;">Report a Found Item</h2>
          <p style="color: var(--slate-400); font-size: 0.95rem; margin-top: 0.25rem;">
            Help return an item to its owner! We will alert students whose lost reports match this item.
          </p>
        </div>
      </div>

      <!-- Main Simple Form -->
      <div class="card" style="padding: 2rem;">
        <form id="found-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Category & Brand -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="category">Category *</label>
              <select id="category" class="select" required>
                <option value="">Select Category</option>
                <option value="Electronics">Electronics (Phone, Laptop, Charger)</option>
                <option value="Keys & Wallets">Keys & Wallets</option>
                <option value="Books & Stationery">Books & Stationery</option>
                <option value="Clothing">Clothing & Shoes</option>
                <option value="Accessories">Accessories (Glasses, Watch, Bag)</option>
                <option value="Sports Equipment">Sports Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="label" for="brand">Brand / Model Name</label>
              <input id="brand" class="input" type="text" placeholder="e.g. Apple, Samsung, Nike, Wilson">
            </div>
          </div>

          <!-- Location & Date -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="location">Where was it found? *</label>
              <select id="location" class="select" required>
                <option value="">Select Campus Building</option>
                <option value="b1">Main Library</option>
                <option value="b4">Student Center</option>
                <option value="b7">Cafeteria</option>
                <option value="b9">Computer Labs</option>
                <option value="b2">Engineering Block A</option>
                <option value="b6">Sports Complex</option>
                <option value="b13">Auditorium</option>
                <option value="b12">Parking Area</option>
              </select>
            </div>
            <div class="form-group">
              <label class="label" for="date">When was it found? *</label>
              <input id="date" class="input" type="date" required value="${new Date().toISOString().split('T')[0]}">
            </div>
          </div>

          <!-- Color -->
          <div class="form-group">
            <label class="label" for="color">Color</label>
            <input id="color" class="input" type="text" placeholder="e.g. Silver, Black, Red">
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="label" for="description">Item Description *</label>
            <textarea id="description" class="textarea" rows="3" required placeholder="Describe where it was lying, condition, and any general visible characteristics..."></textarea>
          </div>

          <!-- Distinguishing detail -->
          <div class="form-group" style="background: rgba(16,185,129,0.06); padding: 1rem; border-radius: var(--radius-md); border: 1px solid rgba(16,185,129,0.2);">
            <label class="label" for="hiddenDetail" style="color: var(--emerald-400);">
              🔒 Distinctive Detail (For verification)
            </label>
            <input id="hiddenDetail" class="input" type="text" placeholder="e.g. 'lockscreen photo', 'keychain has a green frog', 'engraved text'" style="margin-top: 0.25rem;">
            <span style="font-size: 0.75rem; color: var(--slate-400); margin-top: 0.25rem; display: block;">
              Claimants must mention this detail to prove this item is truly theirs.
            </span>
          </div>

          <!-- Submit Button -->
          <button type="submit" id="submit-btn" class="btn btn-success btn-lg" style="margin-top: 0.5rem; font-weight: 700; width: 100%;">
            🟢 Post Found Item & Check Matches
          </button>
        </form>

        <!-- Dynamic Success / Match Result Box -->
        <div id="result-box" style="display: none; margin-top: 1.5rem;"></div>
      </div>
    </div>
  `;

  document.getElementById('app').innerHTML = layout.wrap(html, 'Report Found Item');
  layout.attachEventListeners();

  // Load campus buildings dynamically
  loadBuildings();

  // Handle form submission
  const form = document.getElementById('found-form');
  form.addEventListener('submit', handleFormSubmit);
}

async function loadBuildings() {
  try {
    const res = await graphApi.getBuildings();
    const buildings = res.data || res || [];
    if (Array.isArray(buildings) && buildings.length > 0) {
      const select = document.getElementById('location');
      select.innerHTML = '<option value="">Select Campus Building</option>' +
        buildings.map(b => `<option value="${b.id}">${b.name} (${b.shortCode})</option>`).join('');
    }
  } catch (_) { }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Matching with lost reports...';

  const formData = {
    type: 'FOUND',
    category: document.getElementById('category').value,
    brand: document.getElementById('brand').value.trim() || null,
    color: document.getElementById('color').value.trim() || null,
    locationNodeId: document.getElementById('location').value,
    date: document.getElementById('date').value,
    description: document.getElementById('description').value.trim(),
    hiddenDetail: document.getElementById('hiddenDetail').value.trim() || null,
  };

  try {
    const res = await itemsApi.createFound(formData);
    const resultBox = document.getElementById('result-box');
    resultBox.style.display = 'block';

    const item = res.data?.item || res.item || res.data || {};
    const topMatch = res.data?.topMatch || res.topMatch;

    if (topMatch && topMatch.score >= 50) {
      // Found a matching lost report!
      resultBox.innerHTML = `
        <div class="card" style="background: rgba(16,185,129,0.15); border: 2px solid var(--emerald-500); padding: 1.5rem; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎉</div>
          <h3 style="color: var(--emerald-400); font-weight: 800; margin-bottom: 0.5rem;">Owner Identified! (${Math.round(topMatch.score)}% Match)</h3>
          <p style="color: var(--slate-200); font-size: 0.95rem; margin-bottom: 1.25rem;">
            A student has already reported losing an item matching this description!
          </p>
          <a href="#/items/${item.id}/matches" class="btn btn-success btn-lg" style="font-weight: 800;">
            View Matching Report Details →
          </a>
        </div>
      `;
    } else {
      resultBox.innerHTML = `
        <div class="card" style="background: rgba(16,185,129,0.12); border: 2px solid var(--emerald-500); padding: 1.5rem; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🙏</div>
          <h3 style="color: var(--emerald-400); font-weight: 800; margin-bottom: 0.5rem;">Thank You for Reporting!</h3>
          <p style="color: var(--slate-200); font-size: 0.95rem; margin-bottom: 1.25rem;">
            Your found item has been recorded. When the owner submits a matching lost report, the algorithm will automatically connect both parties.
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center;">
            <a href="#/dashboard" class="btn btn-primary">Go to Dashboard</a>
            <a href="#/items" class="btn btn-secondary">Browse Campus Items</a>
          </div>
        </div>
      `;
    }

    window.app.toast?.success('Found item reported successfully!');
    form.reset();
  } catch (err) {
    window.app.toast?.error('Failed to submit report. Please try again.');
    btn.disabled = false;
    btn.textContent = '🟢 Post Found Item & Check Matches';
  }
}

export default renderReportFound;
