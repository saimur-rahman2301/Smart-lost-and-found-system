/**
 * Landing.js — Marketing homepage with live stats.
 */
import { adminApi } from '../api.js';

export default class LandingPage {
  async render() {
    const app = document.getElementById('app');
    app.innerHTML = this.skeleton();
    this.loadStats();
  }

  skeleton() {
    return `
      <div class="landing">
        <nav class="landing-nav">
          <a class="landing-logo" href="#/">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#1e293b"/>
              <circle cx="13" cy="13" r="6" fill="none" stroke="#3B82F6" stroke-width="2.5"/>
              <line x1="17.5" y1="17.5" x2="24" y2="24" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            FindX
          </a>
          <div style="display:flex;gap:.75rem;align-items:center">
            <a href="#/items" class="btn btn-ghost">Browse Items</a>
            <a href="#/login" class="btn btn-secondary">Login</a>
            <a href="#/register" class="btn btn-primary">Get Started</a>
          </div>
        </nav>

        <section class="landing-hero">
          <div class="hero-badge">⚡ Algorithmic Smart Matching</div>
          <h1 class="hero-title">Find What's Lost.<br>Return What's Found.</h1>
          <p class="hero-subtitle">
            FindX is an algorithm-driven campus Lost &amp; Found platform that automatically
            discovers, analyzes, ranks, and verifies potential relationships between
            lost and found item reports.
          </p>
          <div class="hero-actions">
            <a href="#/register" class="btn btn-primary" style="padding:.75rem 1.75rem;font-size:1.0625rem">
              Report a Lost Item
            </a>
            <a href="#/items" class="btn btn-secondary" style="padding:.75rem 1.75rem;font-size:1.0625rem">
              Browse Found Items
            </a>
          </div>
          <div class="hero-stats" id="hero-stats">
            <div class="hero-stat"><div class="number" id="stat-lost">—</div><div class="label">Lost Reports</div></div>
            <div class="hero-stat"><div class="number" id="stat-found">—</div><div class="label">Found Reports</div></div>
            <div class="hero-stat"><div class="number" id="stat-matches">—</div><div class="label">Successful Matches</div></div>
            <div class="hero-stat"><div class="number" id="stat-returned">—</div><div class="label">Items Returned</div></div>
          </div>
        </section>

        <section class="features-section">
          <h2 class="section-title">How It Works</h2>
          <p class="section-subtitle">A multi-factor algorithmic pipeline — no guessing required.</p>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📝</div>
              <h3 style="font-weight:700;margin-bottom:.5rem">Report an Item</h3>
              <p style="color:var(--slate-400);font-size:.9375rem;line-height:1.6">
                Submit a detailed report with category, brand, location, date, description, and optional photo.
                Duplicate detection flags near-identical reports instantly.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔗</div>
              <h3 style="font-weight:700;margin-bottom:.5rem">Algorithmic Smart Matching</h3>
              <p style="color:var(--slate-400);font-size:.9375rem;line-height:1.6">
                A 5-factor weighted score (category + brand + location + date + description = 100 pts)
                ranks all possible matches. Uses Dijkstra's algorithm for location similarity.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🛡️</div>
              <h3 style="font-weight:700;margin-bottom:.5rem">Verification System</h3>
              <p style="color:var(--slate-400);font-size:.9375rem;line-height:1.6">
                Claimants answer verification questions checked against hidden fields known only to the
                finder. A scoring system flags likely legitimate claims for human admin review.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📊</div>
              <h3 style="font-weight:700;margin-bottom:.5rem">Live Analytics</h3>
              <p style="color:var(--slate-400);font-size:.9375rem;line-height:1.6">
                Real-time dashboard with match statistics, campus heatmap, and trend charts.
                Admin visualizer exposes the live state of all DSA engine structures.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🗺️</div>
              <h3 style="font-weight:700;margin-bottom:.5rem">Campus Graph</h3>
              <p style="color:var(--slate-400);font-size:.9375rem;line-height:1.6">
                15 campus buildings connected by weighted edges. Dijkstra's shortest path
                powers the location similarity factor in every match score.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">⚙️</div>
              <h3 style="font-weight:700;margin-bottom:.5rem">DSA Engine (C++17)</h3>
              <p style="color:var(--slate-400);font-size:.9375rem;line-height:1.6">
                Built on 11 hand-implemented data structures: Hash Table, Trie, BST, Max-Heap,
                Queue, Stack, Doubly Linked List, Sorting, Graph, String Matching.
              </p>
            </div>
          </div>
        </section>

        <footer style="text-align:center;padding:2rem;border-top:1px solid var(--navy-700);color:var(--slate-500);font-size:.875rem">
          © 2026 FindX · Algorithm-driven Campus Lost &amp; Found · Built with C++17
        </footer>
      </div>`;
  }

  async loadStats() {
    try {
      const res = await adminApi.getAnalytics();
      if (res.success && res.data) {
        const d = res.data;
        const set = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val ?? '—';
        };
        set('stat-lost', d.totalLost);
        set('stat-found', d.totalFound);
        set('stat-matches', d.successfulMatches);
        set('stat-returned', d.itemsReturned);
      }
    } catch (_) { /* stats are cosmetic, ignore errors */ }
  }
}
