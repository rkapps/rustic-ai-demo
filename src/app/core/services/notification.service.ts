import { Injectable, signal, computed } from '@angular/core';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    notifications = signal<Toast[]>([]);

    // New: Track number of active HTTP requests
    private activeRequests = signal(0);

    // New: Signal that returns true if any request is in progress
    isLoading = computed(() => this.activeRequests() > 0);

    // New: Helper methods for the interceptor
    startLoading() { this.activeRequests.update(count => count + 1); }
    stopLoading() { this.activeRequests.update(count => Math.max(0, count - 1)); }

    showSuccess(message: string) { this.addToast(message, 'success'); }
    showError(message: string) { this.addToast(message, 'error'); }
    showInfo(message: string) { this.addToast(message, 'info'); }

    private addToast(message: string, type: Toast['type']) {
        const id = Date.now();
        const newToast: Toast = { id, message, type };
        console.log(message);
        this.notifications.update(current => [...current, newToast]);
        if (type !== 'error') {
            setTimeout(() => {
                this.remove(id);
            }, 4000); // 4 seconds is the "sweet spot" for reading
        }
    }

    remove(id: number) {
        this.notifications.update(current => current.filter(t => t.id !== id));
    }
}
