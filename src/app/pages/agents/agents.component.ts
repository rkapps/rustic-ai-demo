import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, filter, finalize, map, startWith, switchMap } from 'rxjs';
import { DataService } from '../../core/services/data.services';
import { AppStateService } from '../../core/services/app-state.service';
import { TwangButtonComponent } from '../../components/ui/twang-button/twang-button';
import { UsageTableComponent } from '../../components/common/usage-table/usage-table.component';
import { LucideAngularModule } from 'lucide-angular';
import { Chat } from '../../models/chat';

@Component({
    selector: 'app-agents',
    imports: [TwangButtonComponent, RouterOutlet, LucideAngularModule, UsageTableComponent],
    templateUrl: './agents.component.html',
})
export default class AgentsComponent {

    private dataService = inject(DataService);
    appState = inject(AppStateService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    private refresh$ = new BehaviorSubject<void>(undefined);
    refreshing = signal(false);

    conversationsSignal = toSignal(
        this.refresh$.pipe(switchMap(() => {
            this.refreshing.set(true);
            return this.dataService.getAgentConversations().pipe(finalize(() => this.refreshing.set(false)));
        })),
        { initialValue: [] }
    );

    conversations = computed<Chat[]>(() => this.conversationsSignal());

    panelOpen = signal(true);
    showDetail = signal(window.innerWidth >= 768);
    selectedConversationId = this.appState.selectedAgentConversationId;
    showUsage = this.appState.showAgentUsage;

    selectedConversation = computed(() =>
        this.conversations().find(c => c.id === this.selectedConversationId()) ?? null
    );

    private navUrl = toSignal(
        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            map(() => this.router.url),
            startWith(this.router.url)
        ),
        { initialValue: this.router.url }
    );

    constructor() {
        this.appState.setShowAgentUsage(false);
        this.appState.refresh$.pipe(takeUntilDestroyed()).subscribe(() => this.onRefresh());

        effect(() => {
            const conversations = this.conversations();
            this.navUrl();
            if (conversations.length === 0) return;

            const childRoute = this.route.firstChild;
            if (childRoute) {
                const routeId = childRoute.snapshot?.params?.['id'];
                if (routeId) {
                    const found = conversations.find(c => c.id === routeId);
                    if (found) this.appState.selectAgentConversation(found.id);
                }
                return;
            }

            if (window.innerWidth < 768) {
                this.showDetail.set(false);
                return;
            }
            const target = conversations.find(c => c.id === this.selectedConversationId()) ?? conversations[0];
            this.selectConversation(target);
            this.showDetail.set(true);
        }, { allowSignalWrites: true });
    }

    onConversationSelected(conv: Chat) {
        this.selectConversation(conv);
        this.showDetail.set(true);
    }

    onNewAgent() {
        this.router.navigate(['/agents/new']);
    }

    backToList() {
        this.showDetail.set(false);
    }

    onRefresh() {
        this.refresh$.next();
    }

    onDeleteConversation(conv: Chat) {
        this.dataService.deleteChat(conv.id).subscribe({
            next: () => {
                this.appState.selectAgentConversation('');
                this.refresh$.next();
            }
        });
    }

    private selectConversation(conv: Chat) {
        this.appState.selectAgentConversation(conv.id);
        this.router.navigate([conv.id], { relativeTo: this.route });
    }
}
