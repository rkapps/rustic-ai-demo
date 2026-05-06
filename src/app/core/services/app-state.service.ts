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
    selectedAgentConversationId = signal<string>(this.loadFromStorage('selectedAgentConversationId', ''));
    showChatUsage = signal<boolean>(this.loadFromStorage('showChatUsage', false));
    showAgentUsage = signal<boolean>(this.loadFromStorage('showAgentUsage', false));
    selectedAgentLlm = signal<string[]>(this.loadFromStorage('selectedAgentLlm', []));

    // Actions
    updateSearchChatQuery(val: string) {
        this.searchChatQuery.set(val);
    }

    selectChat(id: string) {
        this.selectedChatId.set(id);
        localStorage.setItem('selectedChatId', JSON.stringify(id));
    }

    selectAgentConversation(id: string) {
        this.selectedAgentConversationId.set(id);
        localStorage.setItem('selectedAgentConversationId', JSON.stringify(id));
    }

    setShowChatUsage(v: boolean) {
        this.showChatUsage.set(v);
        localStorage.setItem('showChatUsage', JSON.stringify(v));
    }

    setShowAgentUsage(v: boolean) {
        this.showAgentUsage.set(v);
        localStorage.setItem('showAgentUsage', JSON.stringify(v));
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