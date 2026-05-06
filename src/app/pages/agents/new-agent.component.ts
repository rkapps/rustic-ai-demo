import { Component, computed, inject, signal } from "@angular/core";
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "../../core/services/data.services";
import { AppStateService } from "../../core/services/app-state.service";
import { Agent } from "../../models/agent";
import { TwangButtonComponent } from "../../components/ui/twang-button/twang-button";
import { TwangTreeDropdownComponent } from "../../components/ui/twang-tree-dropdown/twang-tree-dropdown";
import { TwangTreeDropdownNode } from "../../components/ui/twang-tree-dropdown/twang-tree-dropdown.models";
import { LucideAngularModule } from "lucide-angular";

@Component({
    selector: 'app-new-agent',
    imports: [TwangButtonComponent, TwangTreeDropdownComponent, LucideAngularModule],
    templateUrl: './new-agent.component.html',
})
export default class NewAgentComponent {

    private dataService = inject(DataService);
    private appState = inject(AppStateService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    agents = toSignal(this.dataService.getAgents(), { initialValue: [] });
    llmProviders = toSignal(this.dataService.getLlmProviders(), { initialValue: [] });

    treeNodes = computed<TwangTreeDropdownNode[]>(() =>
        this.llmProviders().map(p => ({
            id: `provider:${p.id}`,
            label: p.llm,
            children: p.models.map(m => ({ id: `${p.id}:${m}`, label: m }))
        }))
    );

    selectedAgent = signal<Agent | null>(null);
    showConfig = signal(false);
    selectedLeaf = signal<string[]>([]);
    title = signal('');
    stream = signal(true);

    selectedLlmId = computed(() => {
        const leaf = this.selectedLeaf()[0];
        return leaf ? leaf.split(':')[0] : '';
    });

    selectedModel = computed(() => {
        const leaf = this.selectedLeaf()[0];
        return leaf ? leaf.substring(leaf.indexOf(':') + 1) : '';
    });

    isValid = computed(() =>
        this.selectedAgent() !== null &&
        this.title().trim() !== '' &&
        this.selectedLlmId() !== '' &&
        this.selectedModel() !== ''
    );

    onAgentSelected(agent: Agent, navigate = false) {
        this.selectedAgent.set(agent);
        if (navigate) this.showConfig.set(true);
        this.title.set(agent.name);
        if (this.llmProviders().length > 0 && this.selectedLeaf().length === 0) {
            const p = this.llmProviders()[0];
            if (p.models.length > 0) this.selectedLeaf.set([`${p.id}:${p.models[0]}`]);
        }
    }

    goBack() {
        this.router.navigate(['/agents']);
    }

    submit() {
        if (!this.isValid()) return;
        this.dataService.createConversation({
            conversation_type: 'agent',
            title: this.title(),
            agent_id: this.selectedAgent()!.id,
            llm: this.selectedLlmId(),
            model: this.selectedModel(),
            stream: this.stream(),
        }).subscribe({
            next: (conv) => {
                this.appState.triggerRefresh();
                this.router.navigate(['/agents', conv.id]);
            }
        });
    }
}
