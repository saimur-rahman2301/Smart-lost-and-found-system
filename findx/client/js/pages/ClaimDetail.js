import { AppLayout } from '../components/AppLayout.js';
import { claimsApi } from '../api.js';

export async function renderClaimDetail() {
  const hash = window.location.hash;
  const id = hash.split('/claims/')[1];
  
  if (!id) {
    window.app.router.go('/');
    return;
  }

  const layout = new AppLayout('Claim Detail');
  document.getElementById('app').innerHTML = layout.wrap(`
    <div style="padding:2rem;max-width:800px;margin:0 auto" id="claim-detail-container">
      <div style="text-align:center;padding:3rem">
        <div class="spinner"></div>
        <div style="margin-top:1rem;color:var(--slate-500)">Loading claim details...</div>
      </div>
    </div>
  `, 'Claim Detail');
  layout.attachEventListeners();

  try {
    const res = await claimsApi.getById(id);
    if (!res.success) throw new Error(res.error || 'Failed to fetch claim');
    
    const claim = res.data;
    const container = document.getElementById('claim-detail-container');
    
    let statusBadge = '';
    if (claim.status === 'PENDING') statusBadge = '<span class="badge badge-warning">Pending Review</span>';
    else if (claim.status === 'APPROVED') statusBadge = '<span class="badge badge-success">Approved</span>';
    else if (claim.status === 'REJECTED') statusBadge = '<span class="badge badge-error">Rejected</span>';

    let contentHtml = \`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2rem">
        <h2 style="font-size:1.5rem;font-weight:700;color:var(--slate-100)">Claim for \${claim.itemCategory || 'Item'}</h2>
        \${statusBadge}
      </div>

      <div class="card" style="padding:1.5rem;margin-bottom:2rem">
        <h3 style="font-weight:600;margin-bottom:1rem;color:var(--slate-200)">Item Summary</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;font-size:.9375rem">
          <div><span style="color:var(--slate-400)">Category:</span> <span style="color:var(--slate-200)">\${claim.itemCategory || 'N/A'}</span></div>
          <div><span style="color:var(--slate-400)">Date:</span> <span style="color:var(--slate-200)">\${claim.itemDate ? new Date(claim.itemDate).toLocaleDateString() : 'N/A'}</span></div>
          <div style="grid-column:span 2"><span style="color:var(--slate-400)">Location:</span> <span style="color:var(--slate-200)">\${claim.itemLocation || 'N/A'}</span></div>
          <div style="grid-column:span 2"><span style="color:var(--slate-400)">Description:</span> <span style="color:var(--slate-200)">\${claim.itemDescription || 'N/A'}</span></div>
        </div>
      </div>
    \`;

    if (claim.status === 'APPROVED') {
      contentHtml += \`
        <div class="alert alert-success" style="margin-bottom:2rem">
          <strong>Your claim has been approved!</strong> Please contact campus lost & found to collect your item.
        </div>
      \`;
    } else if (claim.status === 'REJECTED') {
      contentHtml += \`
        <div class="alert alert-error" style="margin-bottom:2rem">
          <strong>Claim Rejected.</strong> \${claim.adminNote ? 'Reason: ' + claim.adminNote : ''}
        </div>
      \`;
    }

    if (claim.status === 'PENDING' && !claim.verificationScore) {
      contentHtml += \`
        <div class="card" style="padding:1.5rem">
          <h3 style="font-weight:700;margin-bottom:.25rem">Prove Your Ownership</h3>
          <p style="color:var(--slate-400);margin-bottom:1.5rem;font-size:.9375rem">
            Answer the following questions to verify you are the rightful owner.
            Your answers are scored automatically and reviewed by an admin.
          </p>
          <form id="verify-form" style="display:flex;flex-direction:column;gap:1.25rem">
            <div>
              <label class="label">Secret Identifying Detail</label>
              <input type="text" class="input" id="verify-hidden" placeholder="e.g., 'scratch on bottom right corner'" required>
            </div>
            <div>
              <label class="label">Where did you lose/find this?</label>
              <input type="text" class="input" id="verify-location" placeholder="e.g., Main Library" required>
            </div>
            <div>
              <label class="label">When did you lose/find it?</label>
              <input type="date" class="input" id="verify-date" required>
            </div>
            <div>
              <label class="label">Item Category</label>
              <input type="text" class="input" id="verify-category" placeholder="e.g., Electronics, Clothing" required>
            </div>
            <div>
              <label class="label">Describe the item in detail</label>
              <textarea class="input" id="verify-evidence" rows="3" placeholder="Color, brand, distinguishing features..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" id="verify-submit">Submit Verification</button>
          </form>
        </div>
      \`;
    } else if (claim.verificationScore) {
      const isLegit = claim.verificationScore.totalScore >= 70;
      const ringColor = isLegit ? '#10B981' : '#F43F5E';
      const verdictText = isLegit ? 'LIKELY_LEGITIMATE' : 'INSUFFICIENT';
      const verdictBg = isLegit ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)';
      const verdictColor = isLegit ? '#10B981' : '#F43F5E';
      const scoreNum = Math.round(claim.verificationScore.totalScore || 0);
      
      const factorCards = \`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1.5rem">
          <div class="card" style="padding:1rem">
            <div style="font-size:.875rem;color:var(--slate-400)">Hidden Detail</div>
            <div style="font-weight:600;color:var(--slate-200)">\${claim.verificationScore.factors?.hiddenDetail?.awarded || 0}/30 pts</div>
            <div style="font-size:.75rem;color:var(--slate-500)">Matched: \${claim.verificationScore.factors?.hiddenDetail?.matched ? '✓' : '✗'}</div>
          </div>
          <div class="card" style="padding:1rem">
            <div style="font-size:.875rem;color:var(--slate-400)">Location</div>
            <div style="font-weight:600;color:var(--slate-200)">\${claim.verificationScore.factors?.location?.awarded || 0}/20 pts</div>
          </div>
          <div class="card" style="padding:1rem">
            <div style="font-size:.875rem;color:var(--slate-400)">Date</div>
            <div style="font-weight:600;color:var(--slate-200)">\${claim.verificationScore.factors?.date?.awarded || 0}/15 pts</div>
          </div>
          <div class="card" style="padding:1rem">
            <div style="font-size:.875rem;color:var(--slate-400)">Category</div>
            <div style="font-weight:600;color:var(--slate-200)">\${claim.verificationScore.factors?.category?.awarded || 0}/15 pts</div>
          </div>
          <div class="card" style="padding:1rem;grid-column:span 2">
            <div style="font-size:.875rem;color:var(--slate-400)">Additional Evidence</div>
            <div style="font-weight:600;color:var(--slate-200)">\${claim.verificationScore.factors?.additionalEvidence?.awarded || 0}/20 pts</div>
            <div style="font-size:.75rem;color:var(--slate-500)">Similarity Score: \${claim.verificationScore.factors?.additionalEvidence?.similarityScore ? (claim.verificationScore.factors.additionalEvidence.similarityScore * 100).toFixed(1) + '%' : 'N/A'}</div>
          </div>
        </div>
      \`;

      contentHtml += \`
        <div class="card" style="padding:1.5rem">
          <h3 style="font-weight:700;margin-bottom:1.5rem">Verification Breakdown</h3>
          <div style="display:flex;align-items:center;gap:1.5rem;padding:1rem;background:\${verdictBg};border-radius:.5rem;border:1px solid \${ringColor}40">
            <div style="position:relative;width:64px;height:64px">
              <svg viewBox="0 0 36 36" style="width:100%;height:100%;transform:rotate(-90deg)">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="\${ringColor}" stroke-width="3" stroke-dasharray="\${scoreNum}, 100" />
              </svg>
              <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.875rem;color:\${ringColor}">
                \${scoreNum}
              </div>
            </div>
            <div>
              <div style="font-size:.875rem;color:var(--slate-400);text-transform:uppercase;letter-spacing:1px">Verdict</div>
              <div style="font-weight:700;font-size:1.125rem;color:\${verdictColor}">\${verdictText}</div>
            </div>
          </div>
          \${factorCards}
          \${claim.adminNote ? \`<div style="margin-top:1.5rem;padding:1rem;background:var(--slate-800);border-radius:.5rem;color:var(--slate-300);font-size:.875rem"><strong>Admin Note:</strong> \${claim.adminNote}</div>\` : ''}
          <div style="margin-top:1.5rem;font-size:.8125rem;color:var(--slate-500);text-align:center">
            A human admin will review this claim. Approval is never automatic.
          </div>
        </div>
      \`;
    }

    container.innerHTML = contentHtml;

    if (claim.status === 'PENDING' && !claim.verificationScore) {
      document.getElementById('verify-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('verify-submit');
        btn.disabled = true;
        btn.textContent = 'Submitting...';

        const answers = {
          hiddenDetail: document.getElementById('verify-hidden').value,
          approximateLocation: document.getElementById('verify-location').value,
          date: document.getElementById('verify-date').value,
          category: document.getElementById('verify-category').value,
          additionalEvidence: document.getElementById('verify-evidence').value
        };

        try {
          const vRes = await claimsApi.verify(id, answers);
          if (vRes.success) {
            window.app.toast.success('Verification submitted successfully');
            renderClaimDetail(); // reload page
          } else {
            throw new Error(vRes.error || 'Failed to submit verification');
          }
        } catch (err) {
          window.app.toast.error(err.message);
          btn.disabled = false;
          btn.textContent = 'Submit Verification';
        }
      });
    }
  } catch (err) {
    container.innerHTML = \`<div class="alert alert-error">Error loading claim: \${err.message}</div>\`;
  }
}

export default renderClaimDetail;
