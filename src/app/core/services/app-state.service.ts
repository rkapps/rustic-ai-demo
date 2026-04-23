import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class AppStateService {
    // UI State
    selectedDashboardTab = signal<'overview' | 'reports'>('overview');
    searchChatQuery = signal('');
    selectedChatId = signal<string>('');

    // Actions
    updateSearchChatQuery(val: string) {
        this.searchChatQuery.set(val);
    }

    selectChat(id: string) {
        this.selectedChatId.set(id);
    }
}