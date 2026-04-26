import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../core/services/data.services';
import { AppStateService } from '../../core/services/app-state.service';
import { TwangButtonComponent } from '../../components/ui/twang-button/twang-button';
import { LucideAngularModule } from 'lucide-angular';
import { TwangTreeDropdownComponent } from '../../components/ui/twang-tree-dropdown/twang-tree-dropdown';
import { TwangTreeDropdownNode } from '../../components/ui/twang-tree-dropdown/twang-tree-dropdown.models';
import { MarkdownModule } from 'ngx-markdown';
import { ChatChunkReponse, ChatMessage } from '../../models/chat';

interface Agent {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-agents',
  imports: [TwangButtonComponent, TwangTreeDropdownComponent, MarkdownModule, LucideAngularModule],
  templateUrl: './agents.component.html',
})
export default class AgentsComponent {

  private dataService = inject(DataService);
  private appState = inject(AppStateService);
  scrollContainer = viewChild<ElementRef>('scrollContainer');

  readonly agents: Agent[] = [
    { id: 'ticker-analysis', name: 'Ticker Analysis', description: 'Analyse stock tickers with AI' }
  ];

  panelOpen = signal(true);
  selectedAgent = signal<Agent | null>(this.agents[0]);

  llmProviders = toSignal(this.dataService.getLlmProviders(), { initialValue: [] });

  treeNodes = computed<TwangTreeDropdownNode[]>(() =>
    this.llmProviders().map(p => ({
      id: `provider:${p.id}`,
      label: p.llm,
      children: p.models.map(m => ({ id: `${p.id}:${m}`, label: m }))
    }))
  );

  selectedLeaf = signal<string[]>(this.appState.selectedAgentLlm());

  selectedLlm = computed(() => {
    const leaf = this.selectedLeaf()[0];
    if (!leaf) return '';
    return leaf.split(':')[0];
  });

  selectedModel = computed(() => {
    const leaf = this.selectedLeaf()[0];
    if (!leaf) return '';
    return leaf.substring(leaf.indexOf(':') + 1);
  });

  messages = signal<ChatMessage[]>([]);
  lastResponseId = signal('');
  prompt = signal('Compare NVIDIA to peers');
  isLoading = signal(false);
  private streaming = false;
  private streamingContent = '';

  isValid = computed(() => this.prompt().trim() !== '');

  constructor() {
    effect(() => this.appState.selectAgentLlm(this.selectedLeaf()));

    effect(() => {
      this.messages();
      setTimeout(() => {
        const el = this.scrollContainer()?.nativeElement;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }, 50);
    });
  }

  onAgentSelected(agent: Agent) {
    this.selectedAgent.set(agent);
    this.messages.set([]);
    this.lastResponseId.set('');
    this.prompt.set('Compare NVIDIA to peers');
    this.isLoading.set(false);
    this.streaming = false;
  }

  submit() {
    if (!this.isValid() || this.isLoading()) return;
    if (!this.selectedLlm() || !this.selectedModel()) return;

    const userPrompt = this.prompt();
    this.messages.update(m => [...m, { id: m.length, role: 'user', content: userPrompt, response_id: '' }]);
    this.isLoading.set(true);
    this.streaming = true;
    this.streamingContent = '';

    this.dataService.analyseTickersStreaming({
      llm: this.selectedLlm(),
      model: this.selectedModel(),
      prompt: userPrompt,
      prev_response_id: this.lastResponseId() || undefined
    }).subscribe({
      next: (chunk: ChatChunkReponse) => {
        if (!this.streaming) return;

        if (this.streamingContent === '') {
          this.messages.update(m => [...m, { id: m.length, role: 'assistant', content: '', response_id: '' }]);
        }
        this.streamingContent += chunk.content;
        this.messages.update(msgs =>
          msgs.map((msg, i) => i === msgs.length - 1 ? { ...msg, content: this.streamingContent, response_id: chunk.response_id } : msg)
        );

        if (chunk.is_final) {
          this.lastResponseId.set(chunk.response_id);
          this.streaming = false;
          this.isLoading.set(false);
          this.prompt.set('');
        }
      },
      error: (err) => {
        this.streaming = false;
        this.isLoading.set(false);
        const message = this.extractError(err);
        this.messages.update(m => [...m, { id: m.length, role: 'system', content: message, response_id: '' }]);
      }
    });
  }

  private extractError(err: any): string {
    if (!err) return 'Something went wrong. Please try again.';

    // HTTP error response body
    const body = err.error;
    if (body?.error?.message) return body.error.message;
    if (body?.message) return body.message;
    if (typeof body === 'string' && body.trim()) return body;
    if (err.status) return `Error ${err.status}: ${err.statusText ?? 'Unknown error'}`;

    // SSE stream errors arrive as Error objects with message like:
    // "Invalid JSON: Network error: Invalid request: {\"type\":\"error\",\"error\":{...}}"
    const raw = err.message ?? '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed?.error?.message) return parsed.error.message;
        if (parsed?.message) return parsed.message;
      } catch {}
    }

    return raw || 'Something went wrong. Please try again.';
  }

  handleEnter(event: KeyboardEvent) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }
}
