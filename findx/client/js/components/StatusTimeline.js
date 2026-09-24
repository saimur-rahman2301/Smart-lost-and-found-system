/**
 * StatusTimeline.js — Renders a vertical status history timeline.
 * Accepts an array of {status, note, changedAt, changedBy} objects.
 */

const STATUS_COLORS = {
  REPORTED:         'var(--brand-400)',
  UNDER_REVIEW:     'var(--amber-400)',
  MATCHED:          'var(--brand-500)',
  CLAIM_SUBMITTED:  'var(--amber-500)',
  VERIFIED:         'var(--emerald-400)',
  RETURNED:         'var(--emerald-500)',
  CLOSED:           'var(--slate-500)',
};

const STATUS_LABELS = {
  REPORTED:         'Reported',
  UNDER_REVIEW:     'Under Review',
  MATCHED:          'Match Found',
  CLAIM_SUBMITTED:  'Claim Submitted',
  VERIFIED:         'Verified',
  RETURNED:         'Returned to Owner',
  CLOSED:           'Closed',
};

const STATUS_ICONS = {
  REPORTED:         '📋',
  UNDER_REVIEW:     '🔍',
  MATCHED:          '🔗',
  CLAIM_SUBMITTED:  '📝',
  VERIFIED:         '✅',
  RETURNED:         '🎉',
  CLOSED:           '🔒',
};

export function renderStatusTimeline(history = [], currentStatus = '') {
  if (!history.length) {
    return `<div class="timeline">
      <div class="timeline-item">
        <div class="timeline-dot current"></div>
        <div class="timeline-status">${STATUS_ICONS[currentStatus] || '•'} ${STATUS_LABELS[currentStatus] || currentStatus}</div>
        <div class="timeline-time">Now</div>
      </div>
    </div>`;
  }

  const items = history.map((entry, i) => {
    const isCurrent = i === history.length - 1;
    const color = STATUS_COLORS[entry.status] || 'var(--brand-400)';
    const dt = entry.changedAt ? new Date(entry.changedAt).toLocaleString() : '';
    return `
      <div class="timeline-item">
        <div class="timeline-dot ${isCurrent ? 'current' : ''}" style="background:${color}"></div>
        <div class="timeline-status">${STATUS_ICONS[entry.status] || '•'} ${STATUS_LABELS[entry.status] || entry.status}</div>
        ${entry.note ? `<div class="timeline-note">${entry.note}</div>` : ''}
        <div class="timeline-time">${dt}</div>
      </div>`;
  }).join('');

  return `<div class="timeline">${items}</div>`;
}
