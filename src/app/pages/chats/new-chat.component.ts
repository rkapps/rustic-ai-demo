import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from "@angular/core";
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs";
import { DataService } from "../../core/services/data.services";
import { AppStateService } from "../../core/services/app-state.service";
import { ChatTemplate } from "../../models/chat-template";
import { TwangButtonComponent } from "../../components/ui/twang-button/twang-button";
import { TwangTreeDropdownComponent } from "../../components/ui/twang-tree-dropdown/twang-tree-dropdown";
import { TwangTreeDropdownNode } from "../../components/ui/twang-tree-dropdown/twang-tree-dropdown.models";

const ICON_MAP: Record<string, string> = {
    'robot': 'smart_toy',
    'graduation-cap': 'school',
    'code': 'code',
    'code-2': 'code',
    'chart-bar': 'bar_chart',
    'book': 'menu_book',
    'briefcase': 'work',
    'brain': 'psychology',
    'globe': 'language',
    'chat': 'chat',
    'search': 'search',
    'flask': 'science',
    'pencil': 'edit',
    'calculator': 'calculate',
    'music': 'music_note',
    'image': 'image',
    'file': 'description',
    'translate': 'translate',
};

@Component({
    selector: 'app-new-chat',
    imports: [TwangButtonComponent, TwangTreeDropdownComponent],
    templateUrl: './new-chat.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NewChatComponent {

    private dataService = inject(DataService);
    private appState = inject(AppStateService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    templates = toSignal(
        this.dataService.getTemplates().pipe(map(r => r.templates.filter(t => t.template_type === 'chat'))),
        { initialValue: [] }
    );

    categories = computed(() => {
        const seen = new Set<string>();
        return this.templates()
            .map(t => t.category)
            .filter(c => { if (seen.has(c)) return false; seen.add(c); return true; });
    });

    templatesByCategory = computed(() => {
        const map = new Map<string, ChatTemplate[]>();
        for (const t of this.templates()) {
            const list = map.get(t.category) ?? [];
            list.push(t);
            map.set(t.category, list);
        }
        return map;
    });

    selectedTemplate = signal<ChatTemplate | null>(null);

    llmProviders = toSignal(this.dataService.getLlmProviders(), { initialValue: [] });

    treeNodes = computed<TwangTreeDropdownNode[]>(() =>
        this.llmProviders().map(p => ({
            id: `provider:${p.id}`,
            label: p.llm,
            children: p.models.map(m => ({ id: `${p.id}:${m}`, label: m }))
        }))
    );

    selectedLeaf = signal<string[]>([]);

    selectedLlmId = computed(() => {
        const leaf = this.selectedLeaf()[0];
        return leaf ? leaf.split(':')[0] : '';
    });

    selectedModel = computed(() => {
        const leaf = this.selectedLeaf()[0];
        return leaf ? leaf.substring(leaf.indexOf(':') + 1) : '';
    });

    title = signal('');
    stream = signal(false);
    system = signal('');

    constructor() {
        effect(() => {
            const first = this.templates()[0];
            if (first && !this.selectedTemplate()) this.onTemplateSelected(first);
        });
    }

    isValid = computed(() =>
        this.title().trim() !== '' &&
        this.selectedLlmId() !== '' &&
        this.selectedModel() !== ''
    );

    onTemplateSelected(template: ChatTemplate) {
        this.selectedTemplate.set(template);
        this.title.set(template.label);
        this.system.set(template.system_prompt ?? '');

        const recommended = template.recommended_llm.toLowerCase();
        const provider =
            this.llmProviders().find(p => p.llm.toLowerCase() === recommended) ??
            this.llmProviders().find(p => p.llm.toLowerCase().includes(recommended) || recommended.includes(p.llm.toLowerCase())) ??
            this.llmProviders()[0];
        if (provider && provider.models.length > 0) {
            this.selectedLeaf.set([`${provider.id}:${provider.models[0]}`]);
        }
    }

    onSuggestedPrompt(prompt: string) {
        // no-op — kept for future use (e.g. send as first message)
    }

    getIcon(iconName: string): string {
        return ICON_MAP[iconName] ?? 'chat_bubble';
    }

    submit() {
        if (!this.isValid()) return;
        this.dataService.createChat({
            id: '',
            title: this.title(),
            llm: this.selectedLlmId(),
            model: this.selectedModel(),
            system: this.system(),
            stream: this.stream(),
            prompt: '',
            messages: []
        }).subscribe({
            next: (chat) => {
                this.appState.selectChat(chat.id);
                this.router.navigate(['/chats']);
            }
        });
    }
}
