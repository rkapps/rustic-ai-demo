import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TwangButtonComponent } from '../../components/ui/twang-button/twang-button';
import { UsageTableComponent } from '../usage/usage-table.component';
import { LucideAngularModule } from 'lucide-angular';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, filter, finalize, map, startWith, switchMap } from 'rxjs';
import { DataService } from '../../core/services/data.services';
import { AppStateService } from '../../core/services/app-state.service';
import { Chat } from '../../models/chat';

@Component({
  selector: 'app-chats-list',
  imports: [TwangButtonComponent, RouterOutlet, LucideAngularModule, UsageTableComponent],
  templateUrl: './chats-list.component.html',
})
export default class ChatsListComponent {

  private dataService = inject(DataService);
  appState = inject(AppStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private refresh$ = new BehaviorSubject<void>(undefined);
  refreshing = signal(false);

  chatsSignal = toSignal(
    this.refresh$.pipe(switchMap(() => {
      this.refreshing.set(true);
      return this.dataService.getChats().pipe(finalize(() => this.refreshing.set(false)));
    })),
    { initialValue: [] }
  );

  chats = computed<Chat[]>(() => {
    const query = this.appState.searchChatQuery().toLowerCase();
    return this.chatsSignal()
      .map(p => ({
        id: p.id,
        title: p.title,
        llm: p.llm,
        model: p.model,
        system_prompt: p.system_prompt,
        prompt: p.prompt,
        stream: p.stream,
        messages: p.messages
      }))
      .filter(c => !query ||
        c.title.toLowerCase().includes(query) ||
        c.llm.toLowerCase().includes(query) ||
        c.model.toLowerCase().includes(query)
      );
  });

  panelOpen = signal(true);
  showDetail = signal(window.innerWidth >= 768);
  showUsage = this.appState.showChatUsage;
  selectedChatId = this.appState.selectedChatId;

  selectedChat = computed(() => this.chats().find(c => c.id === this.selectedChatId()) ?? null);

  // Re-fires the auto-select effect when the URL changes back to bare /chats
  private navUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  constructor() {
    this.appState.refresh$.pipe(takeUntilDestroyed()).subscribe(() => this.onRefresh());

    effect(() => {
      const chats = this.chats();
      this.navUrl(); // track URL changes so this re-runs on navigation back to /chats
      if (chats.length === 0) return;
      if (this.route.firstChild) return; // child route already active, no need to navigate
      const current = this.selectedChatId();
      const target = chats.find(c => c.id === current) ?? chats[0];
      this.selectChat(target);
      if (window.innerWidth >= 768) this.showDetail.set(true);
    }, { allowSignalWrites: true });
  }

  onChatSelected(chat: Chat) {
    this.selectChat(chat);
    this.showDetail.set(true);
  }

  backToList() {
    this.showDetail.set(false);
  }

  onCreateChatSelected() {
    this.router.navigate(['new'], { relativeTo: this.route.parent });
  }

  onRefresh() {
    this.refresh$.next();
  }

  onDeleteChat(chat: Chat) {
    this.dataService.deleteChat(chat.id).subscribe({
      next: () => {
        this.appState.selectChat('');
        this.refresh$.next();
      }
    });
  }

  private selectChat(chat: Chat) {
    this.appState.selectChat(chat.id);
    this.router.navigate([chat.id], { relativeTo: this.route });
  }

}
