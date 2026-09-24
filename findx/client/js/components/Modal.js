/**
 * Modal.js — Animated modal dialog component.
 */
export class Modal {
  constructor() {
    this._overlay = null;
  }

  open({ title = '', content = '', buttons = [], size = 'md' } = {}) {
    this.close(); // close any existing
    const maxW = { sm: '400px', md: '560px', lg: '720px' }[size] || '560px';

    const btnsHtml = buttons.map(b =>
      `<button class="btn ${b.variant || 'btn-secondary'}" data-modal-action="${b.action || 'close'}">${b.label}</button>`
    ).join('');

    this._overlay = document.createElement('div');
    this._overlay.className = 'modal-overlay';
    this._overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.7);
      display:flex;align-items:center;justify-content:center;
      z-index:9999;padding:1rem;
      animation:fadeIn 0.15s ease;
    `;
    this._overlay.innerHTML = `
      <div class="modal" style="max-width:${maxW};width:100%;animation:slideUp 0.2s ease">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          <button class="btn btn-ghost btn-sm" data-modal-action="close">✕</button>
        </div>
        <div class="modal-body">${content}</div>
        ${btnsHtml ? `<div class="modal-footer">${btnsHtml}</div>` : ''}
      </div>
    `;

    document.body.appendChild(this._overlay);

    this._overlay.addEventListener('click', (e) => {
      const action = e.target.closest('[data-modal-action]')?.dataset.modalAction;
      if (action === 'close' || e.target === this._overlay) this.close();
      if (action && action !== 'close') {
        const btn = buttons.find(b => b.action === action);
        if (btn?.onClick) btn.onClick();
      }
    });

    return this;
  }

  close() {
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
  }

  /**
   * @param {string} message 
   * @returns {Promise<boolean>} true if confirmed
   */
  confirm(message) {
    return new Promise(resolve => {
      this.open({
        title: 'Confirm Action',
        content: `<p style="color:var(--slate-300)">${message}</p>`,
        buttons: [
          { label: 'Cancel', variant: 'btn-secondary', action: 'cancel', onClick: () => { this.close(); resolve(false); } },
          { label: 'Confirm', variant: 'btn-danger', action: 'confirm', onClick: () => { this.close(); resolve(true); } },
        ],
      });
    });
  }
}

export const modal = new Modal();
