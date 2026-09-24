/**
 * MatchResults.js — Smart Lost & Found
 * "Find It. Match It. Return It."
 *
 * Interactive Max-Heap Match Engine Visualizer.
 * Transparent 100-Point Rule Scoring Matrix & Candidate Ranking.
 */
import { AppLayout } from '../components/AppLayout.js';
import { itemsApi } from '../api.js';

export async function renderMatchResults() {
  const layout = new AppLayout('Find Matches');

  // Extract item ID from URL hash query or param
  const hash = window.location.hash;
  const urlParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  let selectedId = urlParams.get('itemId');

  const html = `
    <div style="max-width: 960px; margin: 0 auto;">
      <!-- Page Title & Explanation -->
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.85rem; font-weight: 800; color: #fff; margin: 0 0 0.35rem;">
              ⚡ Smart Match Engine
            </h2>
            <p style="color: var(--slate-300); font-size: 0.95rem; margin: 0;">
              Matches are ranked automatically using our <strong>100-Point Transparent Scoring Rule</strong> and extracted via a custom <strong>Max Heap</strong>.
            </p>
          </div>
          <a href="#/dashboard" class="btn btn-secondary btn-sm">← Back to Dashboard</a>
        </div>
      </div>

      <!-- Item Selector Card -->
      <div class="card" style="padding: 1.5rem; margin-bottom: 2rem; background: #131d2e; border: 1px solid rgba(59,130,246,0.3);">
        <label class="label" for="select-item" style="font-size: 0.95rem; color: #fff; margin-bottom: 0.5rem; display: block;">
          Select an Item to Run Matching Against:
        </label>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <select id="select-item" class="select" style="flex: 1; min-width: 280px; font-weight: 600;">
            <option value="">Loading items...</option>
          </select>
          <button id="btn-re-evaluate" class="btn btn-primary" style="font-weight: 700;">
            ⚡ Run Max-Heap Match
          </button>
        </div>
      </div>

      <!-- Target Item Card Header -->
      <div id="target-item-card" style="margin-bottom: 2rem;"></div>

      <!-- Ranked Results Container -->
      <div id="matches-container">
        <div style="text-align: center; padding: 3rem; color: var(--slate-400);">
          <div class="spinner spinner-lg" style="margin-bottom: 1rem;"></div>
          <div>Evaluating candidates across campus records...</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('app').innerHTML = layout.wrap(html, 'Find Matches & Rank Candidates');
  layout.attachEventListeners();

  // Load all items to populate dropdown
  loadDropdownAndMatches(selectedId);
}

async function loadDropdownAndMatches(preselectedId) {
  const select = document.getElementById('select-item');
  if (!select) return;

  try {
    const res = await itemsApi.list({ limit: 50 });
    const items = res?.items || res?.data?.items || (Array.isArray(res?.data) ? res.data : []) || [];

    if (!items.length) {
      select.innerHTML = '<option value="">No items available</option>';
      return;
    }

    select.innerHTML = items.map(i => `
      <option value="${i.id}" ${i.id === preselectedId ? 'selected' : ''}>
        ${i.type === 'LOST' ? '🔴 LOST' : '🟢 FOUND'}: ${i.name} (${i.locationName})
      </option>
    `).join('');

    // Default to first item if none specified
    const activeId = preselectedId || select.value;
    if (activeId) {
      runMatchingFor(activeId);
    }

    // Change listener
    select.addEventListener('change', () => {
      runMatchingFor(select.value);
    });

    document.getElementById('btn-re-evaluate')?.addEventListener('click', () => {
      runMatchingFor(select.value);
    });

  } catch (e) {
    select.innerHTML = '<option value="">Error loading items</option>';
  }
}

async function runMatchingFor(itemId) {
  const targetCard = document.getElementById('target-item-card');
  const container = document.getElementById('matches-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 3rem; color: var(--slate-400);">
      <div class="spinner spinner-lg" style="margin-bottom: 1rem;"></div>
      <div>Running rule-based scoring and inserting into Max Heap...</div>
    </div>
  `;

  try {
    const res = await fetch(`http://localhost:3000/api/v1/items/${itemId}/matches`).then(r => r.json());
    if (!res.success) throw new Error(res.message);

    const { targetItem, matches } = res.data;

    // Render Target Item Preview
    const isLost = targetItem.type === 'LOST';
    targetCard.innerHTML = `
      <div class="card" style="padding: 1.5rem; background: rgba(15,23,42,0.9); border-left: 5px solid ${isLost ? 'var(--rose-500)' : 'var(--emerald-500)'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div>
            <span class="badge ${isLost ? 'badge-error' : 'badge-success'}" style="margin-bottom: 0.5rem;">
              TARGET ${targetItem.type}: ${targetItem.category}
            </span>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0 0 0.35rem;">
              ${targetItem.name}
            </h3>
            <div style="font-size: 0.85rem; color: var(--slate-300);">
              📍 <strong>Location:</strong> ${targetItem.locationName} &bull; 
              📅 <strong>Date:</strong> ${targetItem.date} &bull; 
              🏷️ <strong>Brand:</strong> ${targetItem.brand || 'N/A'} &bull; 
              🎨 <strong>Color:</strong> ${targetItem.color || 'N/A'}
            </div>
            <p style="color: var(--slate-400); font-size: 0.85rem; margin: 0.5rem 0 0; line-height: 1.5;">
              ${targetItem.description}
            </p>
          </div>
          <div style="text-align: right;">
            <span class="badge badge-info" style="font-size: 0.8rem;">
              Comparing with ${targetItem.type === 'LOST' ? 'FOUND' : 'LOST'} Pool
            </span>
          </div>
        </div>
      </div>
    `;

    // Filter to positive matches
    const viableMatches = matches.filter(m => m.score >= 50);

    if (!viableMatches.length) {
      container.innerHTML = `
        <div class="card" style="padding: 3rem; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔎</div>
          <h3 style="font-weight: 700; color: #fff; margin-bottom: 0.5rem;">No strong matches found yet</h3>
          <p style="color: var(--slate-400); font-size: 0.95rem; max-width: 500px; margin: 0 auto 1.5rem;">
            None of the recorded items on campus scored above 50% for this item.
            Our algorithm will automatically re-evaluate as new items are turned in.
          </p>
          <a href="#/dashboard" class="btn btn-secondary">Return to Dashboard</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="margin-bottom: 1rem; font-size: 0.85rem; color: var(--slate-400); display: flex; justify-content: space-between; align-items: center;">
        <span>Found <strong>${viableMatches.length}</strong> matching candidate(s) (Extracted from Max-Heap in Descending Order)</span>
        <span class="badge badge-warning">Max Score: ${viableMatches[0].score}%</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${viableMatches.map((m, idx) => {
      const item = m.foundItem;
      const score = m.score;
      const b = m.breakdown;

      let tierBadge = 'badge-neutral';
      let borderAccent = 'rgba(255,255,255,0.1)';
      if (m.tier === 'Very Strong Match') {
        tierBadge = 'badge-success';
        borderAccent = 'rgba(16,185,129,0.5)';
      } else if (m.tier === 'Strong Match') {
        tierBadge = 'badge-info';
        borderAccent = 'rgba(59,130,246,0.5)';
      } else if (m.tier === 'Possible Match') {
        tierBadge = 'badge-warning';
        borderAccent = 'rgba(245,158,11,0.5)';
      }

      return `
            <div class="card" style="padding: 1.75rem; border: 2px solid ${borderAccent}; background: #131d2e;">
              <!-- Header Row -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
                    <span class="badge badge-warning" style="font-weight: 800;">Rank #${idx + 1} (Root Extracted)</span>
                    <span class="badge ${tierBadge}" style="font-weight: 800;">${m.tier}</span>
                  </div>
                  <h4 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0 0 0.25rem;">
                    ${item.name}
                  </h4>
                  <div style="font-size: 0.85rem; color: var(--slate-300);">
                    📍 Found at: <strong>${item.locationName}</strong> &bull; 
                    📅 Date: <strong>${item.date}</strong> &bull; 
                    🏷️ Brand: <strong>${item.brand || 'N/A'}</strong> &bull; 
                    🎨 Color: <strong>${item.color || 'N/A'}</strong>
                  </div>
                </div>

                <!-- Big Score Gauge -->
                <div style="text-align: center; background: #0d1524; padding: 0.75rem 1.5rem; border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.08);">
                  <div style="font-size: 2.25rem; font-weight: 900; color: ${score >= 85 ? 'var(--emerald-400)' : 'var(--brand-400)'}; line-height: 1;">
                    ${score}%
                  </div>
                  <div style="font-size: 0.7rem; color: var(--slate-400); text-transform: uppercase; font-weight: 700; margin-top: 0.25rem;">
                    Match Score
                  </div>
                </div>
              </div>

              <!-- Transparent 7-Factor Score Breakdown Table -->
              <div style="background: #0d1524; border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.25rem; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">
                  Exact 100-Point Rule Breakdown:
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; font-size: 0.825rem;">
                  <div>
                    <span style="color: var(--slate-400);">Category:</span>
                    <strong style="color: ${b.category.awarded > 0 ? 'var(--emerald-400)' : 'var(--slate-500)'}; float: right;">
                      +${b.category.awarded}/20
                    </strong>
                  </div>
                  <div>
                    <span style="color: var(--slate-400);">Name Sim:</span>
                    <strong style="color: ${b.name.awarded > 10 ? 'var(--emerald-400)' : 'var(--slate-500)'}; float: right;">
                      +${b.name.awarded}/20
                    </strong>
                  </div>
                  <div>
                    <span style="color: var(--slate-400);">Brand:</span>
                    <strong style="color: ${b.brand.awarded > 0 ? 'var(--emerald-400)' : 'var(--slate-500)'}; float: right;">
                      +${b.brand.awarded}/15
                    </strong>
                  </div>
                  <div>
                    <span style="color: var(--slate-400);">Color:</span>
                    <strong style="color: ${b.color.awarded > 0 ? 'var(--emerald-400)' : 'var(--slate-500)'}; float: right;">
                      +${b.color.awarded}/10
                    </strong>
                  </div>
                  <div>
                    <span style="color: var(--slate-400);">Location:</span>
                    <strong style="color: ${b.location.awarded > 0 ? 'var(--emerald-400)' : 'var(--slate-500)'}; float: right;">
                      +${b.location.awarded}/20
                    </strong>
                  </div>
                  <div>
                    <span style="color: var(--slate-400);">Keywords:</span>
                    <strong style="color: ${b.keywords.awarded > 5 ? 'var(--emerald-400)' : 'var(--slate-500)'}; float: right;">
                      +${b.keywords.awarded}/10
                    </strong>
                  </div>
                  <div>
                    <span style="color: var(--slate-400);">Date Prox:</span>
                    <strong style="color: ${b.date.awarded > 0 ? 'var(--emerald-400)' : 'var(--slate-500)'}; float: right;">
                      +${b.date.awarded}/5
                    </strong>
                  </div>
                </div>
              </div>

              <!-- Finder Contact & Recovery Action Row -->
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; padding-top: 0.5rem;">
                <div style="font-size: 0.85rem; color: var(--slate-300);">
                  ✉️ <strong>Finder Contact:</strong> <a href="mailto:${item.contact}" style="color: var(--brand-400);">${item.contact}</a>
                </div>
                <div style="display: flex; gap: 0.75rem;">
                  <button class="btn btn-success btn-claim-match" data-lost-id="${targetItem.id}" data-found-id="${item.id}" data-name="${targetItem.name.replace(/"/g, '&quot;')}" style="font-weight: 700;">
                    ✅ Verify & Mark as Recovered
                  </button>
                </div>
              </div>
            </div>
          `;
    }).join('')}
      </div>
    `;

    // Attach Recovery / Claim Handlers
    document.querySelectorAll('.btn-claim-match').forEach(btn => {
      btn.addEventListener('click', async () => {
        const lostId = btn.dataset.lostId;
        const foundId = btn.dataset.foundId;
        const name = btn.dataset.name;

        if (!confirm(`Mark "${name}" as successfully recovered and returned to owner?`)) return;

        try {
          btn.disabled = true;
          btn.textContent = 'Recovering...';
          // Mark both lost and found item as recovered
          await Promise.all([
            fetch(`http://localhost:3000/api/v1/items/${lostId}/recover`, { method: 'PATCH' }),
            fetch(`http://localhost:3000/api/v1/items/${foundId}/recover`, { method: 'PATCH' })
          ]);
          alert(`Success! "${name}" has been marked as RECOVERED! Both reports have been updated.`);
          window.location.hash = '#/dashboard';
        } catch (e) {
          alert('Failed to mark item as recovered');
          btn.disabled = false;
        }
      });
    });

  } catch (err) {
    container.innerHTML = `
      <div class="card" style="padding: 2rem; text-align: center; color: var(--rose-400);">
        Could not execute match algorithm: ${err.message}
      </div>
    `;
  }
}

export default renderMatchResults;
