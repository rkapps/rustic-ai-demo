import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TwangButtonComponent, TwangInputComponent } from 'ngx-twang-ui';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../core/services/data.services';
import { NotificationService } from '../../core/services/notification.service';
import { Chat } from '../../models/chat';
import ChatDetailComponent from './chat-detail.component';


@Component({
  selector: 'app-chats-list',
  imports: [TwangButtonComponent, TwangInputComponent, LucideAngularModule, ChatDetailComponent],
  templateUrl: './chats-list.component.html',
})
export default class ChatsListComponent {

  private dataService = inject(DataService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  chatsSignal = toSignal(this.dataService.getChats(), { initialValue: [] });

  chats = computed<Chat[]>(() => {
    return this.chatsSignal().map(p => ({
      id: p.id,
      title: p.title,
      llm: p.llm,
      model: p.model,
      system: p.system,
      prompt: p.prompt,
      stream: p.stream,
      messages: p.messages
    }));
  });

  selectedChatId = signal<string>('');

  onChatSelected(chat: Chat) {
    this.selectedChatId.set(chat.id);
  }

  onCreateChatSelected() {
    this.router.navigate(['new'], { relativeTo: this.route.parent });
  }

}
