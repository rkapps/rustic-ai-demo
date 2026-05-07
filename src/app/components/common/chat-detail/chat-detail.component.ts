import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { forkJoin } from "rxjs";
import { input, signal, effect, computed, ElementRef, viewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Chat, ChatChunkReponse, ChatMessage, ChatRequest, Turn } from "../../../models/chat";
import { DataService } from "../../../core/services/data.services";
import { MarkdownModule } from 'ngx-markdown';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  host: { class: 'block h-full' },
  imports: [
    MarkdownModule,
    LucideAngularModule,
  ],
  templateUrl: './chat-detail.component.html',
  styleUrl: './chat-detail.component.css'
})
export default class ChatDetailComponent {
  id = input<string>('');
  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  scrollContainer = viewChild<ElementRef>('scrollContainer');

  // State
  private initialLoad = true;
  count = 0;
  streaming = false;
  streaming_content = "";
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);
  streamError = signal<string | null>(null);
  lastResponseId = signal<string>('');
  listening = signal(false);
  speechSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  private recognition: any = null;
  lastMessage = computed(() => {
    const length = this.messages().length;
    return (length > 0) ? this.messages().at(length - 1) : null;
  });


  chat = signal<Chat>({
    id: '',
    title: '',
    llm: '',
    model: '',
    system_prompt: null,
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
      const msgs = this.messages();
      if (this.initialLoad) {
        requestAnimationFrame(() => {
          const el = this.scrollContainer()?.nativeElement;
          if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'instant' });
          if (msgs.length > 0) this.initialLoad = false;
        });
      } else {
        setTimeout(() => {
          const el = this.scrollContainer()?.nativeElement;
          if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    });

    effect(() => {
      const id = this.id();
      if (id) {
        this.initialLoad = true;
        this.messages.set([]);
        this.isLoading.set(false);
        this.lastResponseId.set('');
        this.count = 0;
        this.streaming = false;
        this.streaming_content = '';
        this.chatRequestForm.prompt.set('');
        this.loadChatHistory();
      }
    });

  }

  ngOnInit() {}

  loadChatHistory() {
    forkJoin({
      chat: this.dataService.getChatDetails(this.id()),
      turns: this.dataService.getTurns(this.id())
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ chat, turns }) => {
        this.chat.set(chat);
        const messages: ChatMessage[] = [];
        turns.forEach((turn: Turn) => {
          this.count++;
          messages.push({ id: this.count, role: 'user', content: turn.user_prompt, response_id: '' });
          if (turn.response_content) {
            this.count++;
            messages.push({ id: this.count, role: 'assistant', content: turn.response_content, response_id: turn.response_id ?? '' });
          }
        });
        this.messages.set(messages);
      },
      error: () => this.router.navigate(['/chats'])
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
    this.streamError.set(null);
    this.isLoading.set(true);
    const previous_response_id = this.lastMessage()?.response_id ?? "";
    this.request.update(p => ({
      ...p,
      id: this.id(),
      prompt: prompt,
      previous_response_id: previous_response_id
    }));
    this.appendToMessages("user", prompt, "");

    if (this.chat().stream) {
      this.postStreamingChatCompletion();
    } else {
      this.postNonStreamingChatCompletion();
    }

  }


  private postNonStreamingChatCompletion() {

    this.dataService.chatCompletion(this.id(), this.request().prompt).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.appendToMessages(data.role, data.content, data.response_id);
        this.request.update(p => ({ ...p, prompt: "" }));
        this.chatRequestForm.prompt.set('');
        this.isLoading.set(false);
      },
      error: (err) => {
        this.streamError.set(err?.message ?? 'An error occurred. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  private postStreamingChatCompletion() {
    this.streaming = true;
    this.streaming_content = "";
    let first_chunk = true;

    this.dataService.chatCompletionStream(this.id(), this.request().prompt).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
              ? { ...msg, content: this.streaming_content, response_id: data.response_id }
              : msg
          ));

          if (data.is_final) {
            this.streaming = false;
            this.isLoading.set(false);
            this.chatRequestForm.prompt.set('');
          }

        }
      },
      error: (err) => {
        this.streaming = false;
        this.isLoading.set(false);
        this.streamError.set(err?.message ?? 'An error occurred. Please try again.');
      }

    });
  }

  appendToMessages(role: 'user' | 'assistant' | 'system', content: string, response_id: string) {

    let formattedContent = content
      .replace(/\n([A-D]\))/g, '  \n$1')
      .replace(/\n(\d+\.\s)/g, '\n\n$1')
      .replace(/\n\n/g, '\n\n')
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




  onMicrophoneClick() {
    if (this.listening()) {
      this.recognition?.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => this.listening.set(true);
    this.recognition.onend = () => this.listening.set(false);
    this.recognition.onerror = () => this.listening.set(false);
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.chatRequestForm.prompt.set(this.chatRequestForm.prompt() + transcript);
    };

    this.recognition.start();
  }

  handleEnter(_event: KeyboardEvent) {
    this.submitPrompt();
  }
}
