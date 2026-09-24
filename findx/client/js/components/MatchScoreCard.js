/**
 * MatchScoreCard.js — Renders a match score with per-factor breakdown bars.
 */
export function renderMatchScoreCard(match) {
  const breakdown = match.scoreBreakdown || match.breakdown || {};
  const total = match.score ?? breakdown.total ?? 0;
  const pct = Math.round(total);
  const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
  const circumference = 2 * Math.PI * 18; // r=18
  const offset = circumference - (pct / 100) * circumference;

  const factors = [
    { key: 'category',    label: 'Category',    max: 25 },
    { key: 'brand',       label: 'Brand',       max: 20 },
    { key: 'location',    label: 'Location',    max: 20 },
    { key: 'date',        label: 'Date',        max: 15 },
    { key: 'description', label: 'Description', max: 20 },
  ];

  const rows = factors.map(f => {
    const factor = breakdown[f.key] || {};
    const pts = Math.round(factor.contribution ?? factor.awarded ?? 0);
    const pctFill = ((pts / f.max) * 100).toFixed(0);
    const fillColor = pts >= f.max * 0.7 ? '#10B981' : pts >= f.max * 0.4 ? '#3B82F6' : '#EF4444';
    return `
      <div class="breakdown-row">
        <span class="breakdown-label">${f.label}</span>
        <div class="breakdown-bar">
          <div class="breakdown-fill" style="width:${pctFill}%;background:${fillColor}"></div>
        </div>
        <span class="breakdown-pts" style="color:${fillColor}">${pts}/${f.max}</span>
      </div>`;
  }).join('');

  const foundItem = match.foundItem || match.lostItem || {};

  return `
    <div class="match-card">
      <div class="match-header">
        <svg class="score-ring" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#1e293b" stroke-width="4"/>
          <circle cx="20" cy="20" r="18" fill="none" stroke="${color}" stroke-width="4"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            stroke-linecap="round" transform="rotate(-90 20 20)"/>
          <text x="20" y="20" text-anchor="middle" dominant-baseline="central"
            font-size="9" font-weight="800" fill="${color}">${pct}%</text>
        </svg>
        <div>
          <div style="font-weight:700">${foundItem.category || 'Unknown Category'}</div>
          <div style="font-size:.875rem;color:var(--slate-400)">${foundItem.brand || ''} · ${foundItem.locationName || ''}</div>
          <div style="font-size:.8125rem;color:var(--slate-500)">${foundItem.date || ''}</div>
        </div>
        <div style="margin-left:auto">
          <button class="btn btn-primary btn-sm" 
            onclick="window.app.router.go('/items/${match.foundItemId || match.lostItemId}')">
            View Item
          </button>
        </div>
      </div>
      <div class="match-body">
        <div style="font-size:.75rem;font-weight:600;color:var(--slate-400);margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.05em">
          Score Breakdown
        </div>
        ${rows}
      </div>
    </div>`;
}

/**
 * renderScoreDonut(score) — standalone donut for inline use
 */
export function renderScoreDonut(score, size = 60) {
  const r = (size / 2) - 5;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#1e293b" stroke-width="4"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="4"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        stroke-linecap="round" transform="rotate(-90 ${size/2} ${size/2})"/>
      <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central"
        font-size="${size*0.22}px" font-weight="800" fill="${color}">${Math.round(score)}%</text>
    </svg>`;
}
