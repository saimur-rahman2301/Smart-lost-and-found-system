/**
 * MyClaims.js — User's claims list with tab filtering.
 */
import { AppLayout } from '../components/AppLayout.js';
import { claimsApi } from '../api.js';

const STATUS_TABS = ['All', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

const BADGE_CLASS = {
  PENDING: 'badge-PENDING',
  UNDER_REVIEW: 'badge-warning',
  APPROVED: 'badge-APPROVED',
  REJECTED: 'badge-REJECTED',
};

export default class MyClaimsPage {
  constructor() {
    this.claims = [];
    this.activeTab = 'All';
  }

  async render() {
    const layout = new AppLayout('My Claims');
    document.getElementById('app').innerHTML = layout.wrap(`
      <div class="page-header">
        <h2>My Claims</h2>
        <p style="color:var(--slate-400)">Track the status of your item claims and verification progress.</p>
      </div>

      <div class="tabs" id="claim-tabs">
        ${STATUS_TABS.map(tab => `
          <button class="tab ${tab === 'All' ? 'active' : ''}" data-tab="${tab}">${this.tabLabel(tab)}</button>
        `).join('')}
      </div>

      <div id="claims-list">
        <div class="loading-state"><div class="spinner"></div><p>Loading claims...</p></div>
      </div>
    `, 'My Claims');
    layout.attachEventListeners();

    // Tab click events
    document.getElementById('claim-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-tab]');
      if (!tab) return;
      this.activeTab = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      this.renderList();
    });

    await this.loadClaims();
  }

  async loadClaims() {
    try {
      const res = await claimsApi.getMyClaims();
      if (res.success) {
        this.claims = res.data || [];
        this.renderList();
      } else {
        this.showError(res.message || 'Failed to load claims');
      }
    } catch (err) {
      this.showError(err.message);
    }
  }

  renderList() {
    const filtered = this.activeTab === 'All'
      ? this.claims
      : this.claims.filter(c => c.status === this.activeTab);

    const container = document.getElementById('claims-list');
    if (!container) return;

    if (!filtered.length) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📋</span>
          <h3>No ${this.activeTab === 'All' ? '' : this.activeTab.toLowerCase() + ' '}claims</h3>
          <p>When you submit claims for found items, they'll appear here.</p>
          <button class="btn btn-primary" onclick="window.app.router.go('/items')">Browse Found Items</button>
        </div>`;
      return;
    }

    container.innerHTML = filtered.map(claim => {
      const item = claim.item || {};
      const desc = (item.description || '').slice(0, 70) + ((item.description || '').length > 70 ? '...' : '');
      const badgeClass = BADGE_CLASS[claim.status] || 'badge-neutral';
      const date = claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : '';
      const hasScore = claim.verificationScore != null;
      const score = Math.round(claim.verificationScore || 0);
      const scoreColor = score >= 70 ? 'var(--emerald-400)' : score >= 40 ? 'var(--amber-400)' : 'var(--rose-400)';

      return `
        <div class="card" style="padding:1.25rem;margin-bottom:1rem;cursor:pointer"
             onclick="window.app.router.go('/claims/${claim.id}')">
          <div style="display:flex;align-items:flex-start;gap:1rem">
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;margin-bottom:.25rem">${item.category || 'Unknown Item'}${item.brand ? ' · ' + item.brand : ''}</div>
              <div style="font-size:.875rem;color:var(--slate-400);margin-bottom:.625rem">${desc || 'No description'}</div>
              <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
                <span class="badge ${badgeClass}">${this.statusLabel(claim.status)}</span>
                ${hasScore ? `<span class="badge" style="background:rgba(255,255,255,0.06);color:${scoreColor}">Score: ${score}/100</span>` : ''}
                ${claim.verificationBreakdown ? `<span class="badge badge-${score >= 70 ? 'success' : 'error'}">${score >= 70 ? 'LIKELY LEGITIMATE' : 'INSUFFICIENT'}</span>` : ''}
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:.75rem;color:var(--slate-500);margin-bottom:.5rem">${date}</div>
              <button class="btn btn-ghost btn-sm">View →</button>
            </div>
          </div>
          ${hasScore ? `
            <div style="margin-top:.875rem">
              <div class="progress-bar">
                <div class="progress-fill" style="width:${score}%;background:${scoreColor}"></div>
              </div>
              <div style="font-size:.75rem;color:var(--slate-500);margin-top:.25rem">${score}/100 verification score</div>
            </div>` : ''}
        </div>`;
    }).join('');
  }

  showError(msg) {
    const container = document.getElementById('claims-list');
    if (container) container.innerHTML = `<div class="error-state"><h3>Error</h3><p>${msg}</p></div>`;
  }

  tabLabel(tab) {
    const labels = { All: 'All', PENDING: 'Pending', UNDER_REVIEW: 'Under Review', APPROVED: 'Approved', REJECTED: 'Rejected' };
    return labels[tab] || tab;
  }

  statusLabel(status) {
    const labels = { PENDING: 'Pending', UNDER_REVIEW: 'Under Review', APPROVED: 'Approved', REJECTED: 'Rejected' };
    return labels[status] || status;
  }
}

