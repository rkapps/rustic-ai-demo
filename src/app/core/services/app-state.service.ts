import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AppStateService {
    private refreshSubject = new Subject<void>();
    refresh$ = this.refreshSubject.asObservable();
    triggerRefresh() { this.refreshSubject.next(); }

    // UI State
    selectedDashboardTab = signal<'overview' | 'reports'>('overview');
    searchChatQuery = signal('');
    selectedChatId = signal<string>(this.loadFromStorage('selectedChatId', ''));
    selectedAgentLlm = signal<string[]>(this.loadFromStorage('selectedAgentLlm', []));

    // Actions
    updateSearchChatQuery(val: string) {
        this.searchChatQuery.set(val);
    }

    selectChat(id: string) {
        this.selectedChatId.set(id);
        localStorage.setItem('selectedChatId', JSON.stringify(id));
    }

    selectAgentLlm(leaf: string[]) {
        this.selectedAgentLlm.set(leaf);
        localStorage.setItem('selectedAgentLlm', JSON.stringify(leaf));
    }

    private loadFromStorage<T>(key: string, defaultValue: T): T {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch {
            return defaultValue;
        }
    }
}