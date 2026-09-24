export class ToastManager {
    show(type, message, duration = 5000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, duration);
    }
    success(msg) { this.show('success', msg); }
    error(msg) { this.show('error', msg); }
    warning(msg) { this.show('warning', msg); }
    info(msg) { this.show('info', msg); }
}
