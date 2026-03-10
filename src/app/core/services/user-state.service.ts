import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';

export interface UserSettings {
  completed: boolean;
  theme: 'light' | 'dark';
  notifications: boolean;
  displayName: string;
  bio?: string;
}

@Injectable({ providedIn: 'root' })
export class UserStateService {
    private auth = inject(AuthService);
    private http = inject(HttpClient);
    private router = inject(Router);
    private notify = inject(NotificationService);

    userSettings = signal<any>(null);
    isLoading = signal(false);

    constructor() {
        // Watch the Auth signal. When it changes, fetch settings.
        effect(() => {
            const user = this.auth.currentUser();
            if (user) {
                this.fetchSettings();
            } else {
                this.userSettings.set(null);
            }
        }, { allowSignalWrites: true });
    }

    private fetchSettings() {
        this.isLoading.set(true);
        this.http.get('/api/user/settings').subscribe({
            next: (data) => {
                this.userSettings.set(data);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.router.navigate(['/settings']);
                this.notify.showError('Please complete your profile');
            }
        });
    }
}
