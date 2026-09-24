import { AppLayout } from '../components/AppLayout.js';
import { notificationsApi } from '../api.js';

export async function renderNotifications() {
  const layout = new AppLayout('Notifications');
  document.getElementById('app').innerHTML = layout.wrap(`
    <div style="padding:2rem;max-width:800px;margin:0 auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem">
        <h2 style="font-size:1.5rem;font-weight:700;color:var(--slate-100)">
          Notifications <span id="unread-badge" class="badge badge-brand" style="display:none;margin-left:.5rem">0</span>
        </h2>
        <button class="btn btn-secondary btn-sm" id="btn-mark-all">Mark All Read</button>
      </div>
      <div id="notifications-list">
        <div style="text-align:center;padding:3rem">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  `, 'Notifications');
  layout.attachEventListeners();

  function relativeTime(dateStr) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;
    const elapsed = Date.now() - new Date(dateStr).getTime();
    
    if (elapsed < msPerMinute) return 'just now';
    if (elapsed < msPerHour) return Math.round(elapsed/msPerMinute) + ' minutes ago';
    if (elapsed < msPerDay) return Math.round(elapsed/msPerHour) + ' hours ago';
    if (elapsed < msPerMonth) return Math.round(elapsed/msPerDay) + ' days ago';
    if (elapsed < msPerYear) return Math.round(elapsed/msPerMonth) + ' months ago';
    return Math.round(elapsed/msPerYear) + ' years ago';
  }

  window.markRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      renderNotifications();
    } catch (e) {
      window.app.toast.error('Failed to mark read');
    }
  };

  document.getElementById('btn-mark-all').addEventListener('click', async () => {
    try {
      const res = await notificationsApi.markAllRead();
      if (res.success) {
        window.app.toast.success('All marked as read');
        renderNotifications();
      } else {
        throw new Error(res.error);
      }
    } catch (e) {
      window.app.toast.error(e.message || 'Error marking all as read');
    }
  });

  try {
    const res = await notificationsApi.list();
    if (!res.success) throw new Error(res.error || 'Failed to fetch notifications');
    
    const notifs = res.data || [];
    const unreadCount = notifs.filter(n => !n.isRead).length;
    
    const badge = document.getElementById('unread-badge');
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }

    const listEl = document.getElementById('notifications-list');
    if (notifs.length === 0) {
      listEl.innerHTML = \`<div class="card" style="padding:3rem;text-align:center;color:var(--slate-400)">You're all caught up! No notifications.</div>\`;
      return;
    }

    listEl.innerHTML = notifs.map(n => \`
      <div class="card \${!n.isRead ? 'unread' : ''}" style="padding:1rem;margin-bottom:1rem;display:flex;align-items:flex-start;gap:1rem;cursor:pointer;transition:all .2s" onclick="markRead('\${n.id}')">
        \${!n.isRead ? '<div style="width:.5rem;height:.5rem;border-radius:50%;background:var(--brand-500);margin-top:.4rem"></div>' : '<div style="width:.5rem"></div>'}
        <div style="flex:1">
          <div style="color:var(--slate-200);font-size:.9375rem;margin-bottom:.25rem">\${n.message}</div>
          <div style="color:var(--slate-500);font-size:.75rem">\${relativeTime(n.createdAt)}</div>
        </div>
      </div>
    \`).join('');

  } catch (err) {
    document.getElementById('notifications-list').innerHTML = \`
      <div class="alert alert-error">Failed to load notifications: \${err.message}</div>
    \`;
  }
}

export default renderNotifications;
