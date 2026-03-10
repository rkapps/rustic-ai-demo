import { Component } from "@angular/core";
import { rxResource, toObservable, toSignal } from "@angular/core/rxjs-interop";
import { input, signal, effect, computed, linkedSignal, ElementRef, inject, viewChild } from "@angular/core";
import { Chat, ChatChunkReponse, ChatRequest, ChatStreamingMessage } from "../../models/chat";
import { DataService } from "../../core/services/data.services";
import { NotificationService } from "../../core/services/notification.service";
import { TwangChatMessagesComponent, ChatMessage, TwangTextareaComponent, TwangButtonComponent } from 'ngx-twang-ui';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  host: { class: 'block h-full' },  // 👈 add this
  imports: [
    CommonModule,
    TwangChatMessagesComponent,
    TwangTextareaComponent,
    TwangButtonComponent
  ],
  templateUrl: './chat-detail.component.html'
})
export default class ChatDetailComponent {
  id = input<string>('');
  private dataService = inject(DataService);
  scrollContainer = viewChild<ElementRef>('scrollContainer');

  // State
  count = 0;
  streaming = false;
  streaming_content = "";
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);
  lastResponseId = signal<string>('');
  lastMessage = computed(() => {
    const length = this.messages().length;
    return (length > 0) ? this.messages().at(length - 1) : null;
  });


  chat = signal<Chat>({
    id: '',
    title: '',
    llm: '',
    model: '',
    system: '',
    prompt: '',
    stream: false,
    messages: []
  });


  // Form
  chatRequestForm = {
    prompt: signal('')
  };

  // set the chatprompt
  request = signal<ChatRequest>({
    id: '',
    prompt: '',
    previous_response_id: ''
  });


  constructor() {

    effect(() => {
      const messages = this.messages();

      setTimeout(() => {
        const container = this.scrollContainer();

        if (container?.nativeElement) {
          const el = container.nativeElement;
          el.scrollTo({
            top: el.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    });

  }
  ngOnInit() {
    this.loadChatHistory();
  }

  loadChatHistory() {
    // console.log(this.id());
    this.dataService.getChatDetails(this.id()).subscribe({
      next: (data) => {
        const messagesWithIds = data.messages.map((msg) => {
          this.count++; // Increment the global counter
          return {
            ...msg,
            id: this.count // Assign the newly incremented value
          };
        });

        console.log(data);
        data.messages = messagesWithIds;
        this.chat.set(data);
        this.messages.set(data.messages);

        if (this.messages().length == 0 && this.chat().system.length > 0) {
          this.postChatRequest(this.chat().system);
        }
      },
      error: (err) => console.error('Error loading history:', err)
    });
  }

  submitPrompt() {
    const prompt = this.chatRequestForm.prompt();
    if (!prompt.trim() || this.isLoading()) {
      return;
    }

    this.postChatRequest(prompt);
  }


  private postChatRequest(prompt: string) {

    const previous_response_id = this.lastMessage()?.response_id ?? "";
    this.request.update(p => ({
      ...p,
      id: this.id(),
      prompt: prompt,
      previous_response_id: previous_response_id
    }));

    if (this.chat().stream) {
      this.postStreamingChatCompletion();
    } else {
      this.postNonStreamingChatCompletion();
    }

  }


  private postNonStreamingChatCompletion() {

    this.dataService.chatCompletion(this.request()).subscribe({
      next: (data) => {
        console.log(data);
        this.appendToMessages(data.role, data.content, data.response_id);
        // this.previous_response_id = data.response_id;
        this.request.update(p => ({
          ...p,
          prompt: "",
        }));
      }
    });
  }

  private postStreamingChatCompletion() {
    this.streaming = true;
    this.streaming_content = "";
    let first_chunk = true;
    let save_prompt = this.request().prompt;

    this.dataService.chatCompletionStream<ChatChunkReponse>(this.request()).subscribe({
      next: (data) => {

        if (first_chunk) {
          this.appendToMessages("assistant", "", "");
          this.request.update(p => ({
            ...p,
            prompt: ""
          }));
          first_chunk = false;
        }
        if (this.streaming) {

          this.streaming_content += data.content;
          this.messages.update(messages => messages.map((msg, index) =>
            index === messages.length - 1
              ? { ...msg, content: this.streaming_content, response_id: data.response_id } // Update last item
              : msg                          // Keep others as-is
          ));

          if (data.is_final) {
            this.streaming = false;
            let message = <ChatStreamingMessage>{
              id: this.chat().id,
              user_content: save_prompt,
              assistant_content: this.streaming_content,
              response_id: this.lastMessage()?.response_id ?? ""
            }
            this.dataService.saveChatStreamingMessage(message).subscribe();
          }

        }
      },
      error: (err) => {
        this.streaming = false;
      }

    });
  }

  appendToMessages(role: 'user' | 'assistant' | 'system', content: string, response_id: string) {

    // console.log('Raw content:', JSON.stringify(content));
    let formattedContent = content
      .replace(/\n([A-D]\))/g, '  \n$1')     // Line break before A), B), C), D)
      .replace(/\n(\d+\.\s)/g, '\n\n$1')    // Paragraph break before numbered lists
      .replace(/\n\n/g, '\n\n')              // Keep double newlines as paragraph breaks
      .trim();

    this.count = this.count + 1;
    const data: ChatMessage = {
      id: this.count,
      role: role,
      content: formattedContent,
      response_id: response_id

    }
    this.messages.update(p => [
      ...p,
      data
    ]);

  }




  handleEnter(event: KeyboardEvent) {
    // Submit on Enter, but allow Shift+Enter for new line
    // if (!event.shiftKey) {
    // event.preventDefault();
    this.submitPrompt();
    // }
  }
}
