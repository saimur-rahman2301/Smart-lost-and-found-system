import { AppLayout } from '../components/AppLayout.js';
import { itemsApi } from '../api.js';
import { authStore } from '../auth.js';

export async function renderItemDetail() {
  const hash = window.location.hash;
  const id = hash.split('/items/')[1]?.split('/')[0];

  const layout = new AppLayout('Item Details');
  document.getElementById('app').innerHTML = layout.wrap(`
    <div id="item-detail-content" style="padding: 2rem; text-align: center; color: var(--slate-500);">
      Loading item details...
    </div>
  `, 'Item Details');
  layout.attachEventListeners();

  if (!id) {
    document.getElementById('item-detail-content').innerHTML = '<div class="card" style="padding: 2rem; text-align: center; color: var(--rose-500);">Invalid Item ID</div>';
    return;
  }

  try {
    // Dynamic import to fix the authStore if needed, or just import at top correctly
    const { authStore } = await import('../auth.js');
    const { renderStatusTimeline } = await import('../components/StatusTimeline.js');

    const item = await itemsApi.getById(id);
    const user = authStore.getUser() || {};

    const categoryEmojiMap = {
      'Electronics': '💻', 'Clothing': '👕', 'Accessories': '👜',
      'Books & Stationery': '📚', 'Keys & Wallets': '🔑', 'Sports Equipment': '⚽',
      'Musical Instruments': '🎸', 'Jewelry': '💍', 'Other': '📦'
    };

    const emoji = categoryEmojiMap[item.category] || '📦';
    const typeClass = item.type === 'LOST' ? 'badge-rose' : 'badge-emerald';
    let statusClass = 'badge-slate';
    if (item.status === 'MATCHED') statusClass = 'badge-primary';
    if (item.status === 'RETURNED') statusClass = 'badge-indigo';

    const title = item.brand ?\`\${item.category} · \${item.brand}\` : item.category;
    
    let photoHtml = \`
      <div style="background: var(--slate-100); height: 240px; display: flex; align-items: center; justify-content: center; font-size: 5rem; border-radius: 0.5rem; margin-bottom: 2rem;">
        \${emoji}
      </div>
    \`;
    if (item.photoUrl) {
      photoHtml = \`
        <div style="height: 240px; margin-bottom: 2rem; border-radius: 0.5rem; overflow: hidden; background: var(--slate-100);">
          <img src="\${item.photoUrl}" alt="\${title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      \`;
    }

    let actionButtonsHtml = '';
    const canEdit = user.role === 'ADMIN' || item.reporterId === user.id;
    const canClaim = item.type === 'FOUND' && user.id !== item.reporterId && item.status === 'REPORTED';
    
    if (canEdit) {
      actionButtonsHtml += \`<button class="btn btn-secondary" onclick="window.app.router.go('/items/\${id}/edit')">Edit</button> \`;
    }
    if (canClaim) {
      actionButtonsHtml += \`<button class="btn btn-primary" onclick="window.app.router.go('/claims?itemId=\${id}')">Submit a Claim</button> \`;
    }
    actionButtonsHtml += \`<button class="btn btn-primary" onclick="window.app.router.go('/items/\${id}/matches')">View Matches</button>\`;

    const html = \`
      <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <span class="badge \${typeClass}">\${item.type}</span>
            <span class="badge \${statusClass}">\${item.status}</span>
          </div>
          <h1 style="font-size: 2rem; font-weight: 800;">\${title}</h1>
        </div>
        
        \${photoHtml}
        
        <div class="card" style="padding: 1.5rem;">
          <h3 style="font-weight: 700; margin-bottom: 1rem;">Details</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div><strong style="color:var(--slate-600)">Category:</strong> \${item.category}</div>
            <div><strong style="color:var(--slate-600)">Brand:</strong> \${item.brand || 'N/A'}</div>
            <div><strong style="color:var(--slate-600)">Color:</strong> \${item.color || 'N/A'}</div>
            <div><strong style="color:var(--slate-600)">Location:</strong> \${item.locationName || 'Unknown'}</div>
            <div><strong style="color:var(--slate-600)">Date \${item.type === 'LOST' ? 'Lost' : 'Found'}:</strong> \${new Date(item.dateLost || item.dateFound || item.createdAt).toLocaleDateString()}</div>
            <div><strong style="color:var(--slate-600)">Reporter:</strong> \${item.reporter?.name || 'Anonymous'}</div>
          </div>
        </div>
        
        <div class="card" style="padding: 1.5rem;">
          <h3 style="font-weight: 700; margin-bottom: 1rem;">Description</h3>
          <p style="white-space: pre-wrap; color: var(--slate-700);">\${item.description || 'No description provided.'}</p>
        </div>
        
        <div class="card" style="padding: 1.5rem;">
          <h3 style="font-weight: 700; margin-bottom: 1rem;">Status Timeline</h3>
          <div id="status-timeline-container"></div>
        </div>
        
        <div class="card" style="padding: 1.5rem;">
          <h3 style="font-weight: 700; margin-bottom: 1rem;">Top Match</h3>
          <div id="top-match-container">
            <div style="color: var(--slate-500);">Checking matches...</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 1rem; padding-bottom: 2rem;">
          \${actionButtonsHtml}
        </div>
      </div>
    \`;

    document.getElementById('item-detail-content').outerHTML = html;
    
    // Render timeline if available
    const timelineContainer = document.getElementById('status-timeline-container');
    if (item.statusHistory && item.statusHistory.length > 0 && typeof renderStatusTimeline === 'function') {
      timelineContainer.innerHTML = renderStatusTimeline(item.statusHistory);
    } else {
      timelineContainer.innerHTML = '<p style="color:var(--slate-500)">No timeline available.</p>';
    }

    // Load matches
    try {
      const matches = await itemsApi.getMatches(id);
      const matchContainer = document.getElementById('top-match-container');
      if (matches && matches.length > 0) {
        const topMatch = matches[0];
        matchContainer.innerHTML = \`
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--slate-50); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--slate-200);">
            <div>
              <div style="font-weight: 600;">Match Score: \${Math.round(topMatch.score * 100)}%</div>
              <div style="font-size: 0.875rem; color: var(--slate-500);">Potential match found.</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.app.router.go('/items/\${id}/matches')">View Details</button>
          </div>
        \`;
      } else {
        matchContainer.innerHTML = '<p style="color:var(--slate-500)">No strong matches found yet.</p>';
      }
    } catch (err) {
      document.getElementById('top-match-container').innerHTML = '<p style="color:var(--rose-500)">Failed to load matches.</p>';
    }

  } catch (err) {
    document.getElementById('item-detail-content').innerHTML = \`
      <div class="card" style="padding: 2rem; text-align: center; color: var(--rose-500);">
        Failed to load item: \${err.message}
      </div>
    \`;
  }
}

export default renderItemDetail;
