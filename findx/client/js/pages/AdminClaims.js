import { AppLayout } from '../components/AppLayout.js';
import { adminApi, claimsApi } from '../api.js';

export async function renderAdminClaims() {
  const layout = new AppLayout('Claims Queue');
  document.getElementById('app').innerHTML = layout.wrap(`
    <div style="padding:2rem;max-width:900px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
        <h2 style="font-size:1.5rem;font-weight:700">Claims Review Queue</h2>
        <button class="btn btn-secondary btn-sm" id="btn-undo">Undo Action</button>
      </div>
      <div class="alert alert-info" style="margin-bottom:2rem;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.2);padding:1rem;border-radius:.5rem;color:var(--sky-400)">
        ⚠️ <strong>Human Review Required:</strong> FindX never auto-approves claims regardless of verification score.
        Every approval is a deliberate admin decision.
      </div>
      <div id="claims-queue">
        <div style="text-align:center;padding:3rem"><div class="spinner"></div></div>
      </div>
    </div>
  `, 'Claims Queue');
  layout.attachEventListeners();

  document.getElementById('btn-undo').addEventListener('click', async () => {
    try {
      const res = await adminApi.undo();
      if (res.success) {
        window.app.toast.success('Action undone successfully');
        loadQueue();
      } else throw new Error(res.error);
    } catch(e) { window.app.toast.error(e.message || 'Undo failed'); }
  });

  window.approveClaim = async (id) => {
    try {
      const res = await claimsApi.updateStatus(id, { status: 'APPROVED', adminNote: '' });
      if (res.success) {
        window.app.toast.success('Claim approved');
        document.getElementById('claim-card-' + id).remove();
        checkEmpty();
      } else throw new Error(res.error);
    } catch(e) { window.app.toast.error(e.message || 'Failed to approve claim'); }
  };

  window.rejectClaim = (id) => {
    const card = document.getElementById('claim-card-' + id);
    const rejectHtml = \`
      <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--slate-700)">
        <label class="label">Reason for rejection (Admin Note)</label>
        <textarea class="input" id="reject-note-\${id}" rows="2"></textarea>
        <div style="margin-top:.5rem;display:flex;gap:.5rem;justify-content:flex-end">
          <button class="btn btn-secondary btn-sm" onclick="loadQueue()">Cancel</button>
          <button class="btn btn-error btn-sm" onclick="submitReject('\${id}')">Confirm Reject</button>
        </div>
      </div>
    \`;
    card.insertAdjacentHTML('beforeend', rejectHtml);
  };

  window.submitReject = async (id) => {
    const note = document.getElementById('reject-note-' + id).value;
    try {
      const res = await claimsApi.updateStatus(id, { status: 'REJECTED', adminNote: note });
      if (res.success) {
        window.app.toast.success('Claim rejected');
        document.getElementById('claim-card-' + id).remove();
        checkEmpty();
      } else throw new Error(res.error);
    } catch(e) { window.app.toast.error(e.message || 'Failed to reject claim'); }
  };

  function checkEmpty() {
    const container = document.getElementById('claims-queue');
    if (container.children.length === 0) {
      container.innerHTML = '<div class="card" style="padding:3rem;text-align:center;color:var(--slate-400)">No claims in queue.</div>';
    }
  }

  async function loadQueue() {
    try {
      const res = await adminApi.getQueue();
      if (!res.success) throw new Error(res.error);
      const claims = res.data || [];
      const container = document.getElementById('claims-queue');
      
      if (claims.length === 0) {
        container.innerHTML = '<div class="card" style="padding:3rem;text-align:center;color:var(--slate-400)">No claims in queue.</div>';
        return;
      }

      container.innerHTML = claims.map(c => {
        const score = c.verificationScore?.totalScore || 0;
        const isLegit = score >= 70;
        const ringColor = isLegit ? '#10B981' : '#F43F5E';
        const verdictText = isLegit ? 'LIKELY_LEGITIMATE' : 'INSUFFICIENT';
        const verdictBg = isLegit ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)';
        const verdictColor = isLegit ? '#10B981' : '#F43F5E';
        const scoreNum = Math.round(score);

        return \`
          <div class="card" id="claim-card-\${c.id}" style="padding:1.5rem;margin-bottom:1.5rem">
            <div style="display:flex;gap:1.5rem;align-items:flex-start">
              <div style="position:relative;width:60px;height:60px;flex-shrink:0">
                <svg viewBox="0 0 36 36" style="width:100%;height:100%;transform:rotate(-90deg)">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="\${ringColor}" stroke-width="3" stroke-dasharray="\${scoreNum}, 100" />
                </svg>
                <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.875rem;color:\${ringColor}">\${scoreNum}</div>
              </div>
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                  <div>
                    <h3 style="font-size:1.125rem;font-weight:700;margin-bottom:.25rem">\${c.itemCategory || 'Item'}</h3>
                    <div style="font-size:.875rem;color:var(--slate-400);margin-bottom:.5rem">Claimant: \${c.user?.name || 'Unknown User'}</div>
                    <div style="display:inline-block;padding:.25rem .5rem;border-radius:.25rem;background:\${verdictBg};color:\${verdictColor};font-size:.75rem;font-weight:600;margin-bottom:1rem">
                      \${verdictText}
                    </div>
                  </div>
                  <div style="display:flex;gap:.5rem">
                    <button class="btn btn-success btn-sm" onclick="approveClaim('\${c.id}')">Approve</button>
                    <button class="btn btn-error btn-sm" onclick="rejectClaim('\${c.id}')">Reject</button>
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;font-size:.8125rem;background:var(--slate-800);padding:1rem;border-radius:.5rem">
                  <div><span style="color:var(--slate-400)">Date:</span> \${c.itemDate ? new Date(c.itemDate).toLocaleDateString() : 'N/A'}</div>
                  <div><span style="color:var(--slate-400)">Location:</span> \${c.itemLocation || 'N/A'}</div>
                  <div style="grid-column:span 2"><span style="color:var(--slate-400)">Hidden Detail:</span> \${c.verificationScore?.factors?.hiddenDetail?.awarded || 0}/30 pts (\${c.verificationScore?.factors?.hiddenDetail?.matched ? 'Matched' : 'Missed'})</div>
                  <div style="grid-column:span 2"><span style="color:var(--slate-400)">Additional Evidence:</span> \${c.verificationScore?.factors?.additionalEvidence?.awarded || 0}/20 pts</div>
                </div>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    } catch(e) {
      document.getElementById('claims-queue').innerHTML = \`<div class="alert alert-error">Error loading queue: \${e.message}</div>\`;
    }
  }

  loadQueue();
}

export default renderAdminClaims;
