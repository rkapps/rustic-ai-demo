import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TwangButtonComponent, TwangInputComponent } from 'ngx-twang-ui';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../core/services/data.services';
import { AppStateService } from '../../core/services/app-state.service';
import { Chat } from '../../models/chat';

@Component({
  selector: 'app-chats-list',
  imports: [TwangButtonComponent, TwangInputComponent, LucideAngularModule, RouterOutlet],
  templateUrl: './chats-list.component.html',
})
export default class ChatsListComponent {

  private dataService = inject(DataService);
  appState = inject(AppStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  chatsSignal = toSignal(this.dataService.getChats(), { initialValue: [] });

  chats = computed<Chat[]>(() => {
    const query = this.appState.searchChatQuery().toLowerCase();
    return this.chatsSignal()
      .map(p => ({
        id: p.id,
        title: p.title,
        llm: p.llm,
        model: p.model,
        system: p.system,
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

  selectedChatId = this.appState.selectedChatId;

  selectedChat = computed(() => this.chats().find(c => c.id === this.selectedChatId()) ?? null);

  constructor() {
    effect(() => {
      const chats = this.chats();
      if (chats.length === 0) return;

      // Restore session selection if still valid, otherwise pick first
      const current = this.selectedChatId();
      const target = chats.find(c => c.id === current) ?? chats[0];
      this.selectChat(target);
    }, { allowSignalWrites: true });
  }

  onChatSelected(chat: Chat) {
    this.selectChat(chat);
  }

  onCreateChatSelected() {
    this.router.navigate(['new'], { relativeTo: this.route.parent });
  }

  private selectChat(chat: Chat) {
    this.appState.selectChat(chat.id);
    this.router.navigate([chat.id], { relativeTo: this.route });
  }

}
