import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class AppStateService {
    // UI State
    selectedDashboardTab = signal<'overview' | 'reports'>('overview');
    searchQuery = signal('');
    
    // Actions
    updateSearch(val: string) {
        this.searchQuery.set(val);
    }
}