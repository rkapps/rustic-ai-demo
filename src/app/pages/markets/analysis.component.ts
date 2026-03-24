import { Component, signal, inject, OnInit, effect, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwangChatMessagesComponent, ChatMessage } from 'ngx-twang-ui';
import { TwangTextareaComponent, TwangButtonComponent } from 'ngx-twang-ui';
import { FinService } from '../../core/services/fin.services';
import { ChatChunkReponse, ChatRequest } from '../../models/chat';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [
    CommonModule,
    TwangChatMessagesComponent,
    TwangTextareaComponent,
    TwangButtonComponent
  ],
  templateUrl: './analysis.component.html'
})
export default class AnalysisComponent implements OnInit {
  private finService = inject(FinService);
  scrollContainer = viewChild<ElementRef>('scrollContainer');

  // State
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);
  lastResponseId = signal<string>('');
  count = 0;
  streaming = false;
  streaming_content = "";



  // set the chatprompt
  request = signal<ChatRequest>({
    id: '',
    prompt: '',
    previous_response_id: ''
  });


  // Form
  chatRequestForm = {
    // prompt: signal('Compare Apple with its peers')
    prompt: signal('Is Apple a buy')
  };

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
    // Load existing messages if any
    const chatId = 'some-chat-id'; // Get from route or storage
  }

  submitPrompt() {

    const prompt = this.chatRequestForm.prompt();
    if (!prompt.trim() || this.isLoading()) {
      return;
    }

    const previous_response_id = this.lastResponseId();

    this.count++;
    this.request.update(p => ({
      ...p,
      id: this.count.toString(),
      prompt: prompt,
      previous_response_id: previous_response_id
    }));

    this.appendToMessages("user", prompt, "");


    // this.postChatRequest(prompt);
    this.postChatRequestStreaming(prompt);

  }


  private postChatRequest(prompt: string) {

    this.finService.runStockAnalysis(this.request()).subscribe({
      next: (data) => {
        console.log(data);
        this.appendToMessages("assistant", data.content, data.response_id);
        // this.previous_response_id = data.response_id;
        this.lastResponseId.set(data.response_id);
        this.chatRequestForm.prompt.set('');
        this.request.update(p => ({
          ...p,
          prompt: "",
        }));
      }
    });
  }

  private postChatRequestStreaming(prompt: string) {

    this.streaming = true;
    this.streaming_content = "";
    let first_chunk = true;
    let save_prompt = this.request().prompt;
    console.log(this.request());
    this.finService.runStockAnalysisStreaming<ChatChunkReponse>(this.request()).subscribe({
      next: (data) => {
        
        // console.log(data);
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
            console.log(data);
            this.lastResponseId.set(data.response_id);

          }
        }

      },
      error: (err) => {
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


  //   const prompt = this.chatRequestForm.prompt();

  //   if (!prompt.trim() || this.isLoading()) {
  //     return;
  //   }

  //   // Add user message to UI immediately
  //   this.count++;
  //   const userMessage: ChatMessage = {
  //     id: this.count,
  //     role: 'user',
  //     content: prompt,
  //     timestamp: new Date(),
  //     response_id: ''
  //   };

  //   this.messages.update(msgs => [...msgs, userMessage]);
  //   this.chatRequestForm.prompt.set(''); // Clear input
  //   this.isLoading.set(true);

  //   // Send to backend
  //   // console.log(this.lastResponseId());
  //   this.finService.runStockAnalysis({ prev_response_id: this.lastResponseId(), prompt: prompt }).subscribe({
  //     next: (response) => {
  //       console.log(response);
  //       this.lastResponseId.set(response.response_id);

  //       this.count++;
  //       const assistantMessage: ChatMessage = {
  //         id: this.count,
  //         role: 'assistant',
  //         content: response.content,
  //         timestamp: new Date(),
  //         response_id: response.response_id
  //       };

  //       this.messages.update(msgs => [...msgs, assistantMessage]);
  //       this.isLoading.set(false);
  //     },
  //     error: (err) => {
  //       console.error('Error sending message:', err);

  //       // Optionally add error message
  //       this.count++;
  //       const errorMessage: ChatMessage = {
  //         id: this.count,
  //         role: 'system',
  //         content: 'Failed to send message. Please try again.',
  //         timestamp: new Date(),
  //         response_id: ''
  //       };

  //       this.messages.update(msgs => [...msgs, errorMessage]);
  //       this.isLoading.set(false);
  //     }
  //   });
  // }

  handleEnter(event: KeyboardEvent) {
    // Submit on Enter, but allow Shift+Enter for new line
    // if (!event.shiftKey) {
    // event.preventDefault();
    this.submitPrompt();
    // }
  }
}