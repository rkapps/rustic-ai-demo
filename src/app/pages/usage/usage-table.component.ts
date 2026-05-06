import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { DataService } from '../../core/services/data.services';
import { ConversationUsage, TurnUsage } from '../../models/usage';
import { TwangButtonComponent } from '../../components/ui/twang-button/twang-button';
import { TwangTreeTableComponent } from '../../components/ui/twang-tree-table/twang-tree-table';
import { TwangTreeTableColumn, TwangTreeTableNode } from '../../components/ui/twang-tree-table/twang-tree-table.models';
import { TwangTableFooterCell } from '../../components/ui/twang-table/twang-table';
import { LucideAngularModule } from 'lucide-angular';

interface UsageRow {
    label?: string;
    convType?: string;
    llm?: string;
    model?: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
}

@Component({
    selector: 'app-usage-table',
    host: { class: 'flex flex-col flex-1 min-h-0 overflow-hidden min-w-0' },
    imports: [TwangButtonComponent, TwangTreeTableComponent, LucideAngularModule],
    templateUrl: './usage-table.component.html',
})
export class UsageTableComponent {

    private dataService = inject(DataService);
    private destroyRef = inject(DestroyRef);

    filterType = input<string>('all');
    filterLlm = input<string>('all');
    filterStartDate = input<string>('');
    filterEndDate = input<string>('');
    /** When set, shows usage for that specific conversation only (ignores filter inputs). */
    conversationId = input<string | null>(null);

    treeNodes = signal<TwangTreeTableNode<UsageRow>[]>([]);
    loading = signal(false);

    readonly columns: TwangTreeTableColumn<UsageRow>[] = [
        {
            id: 'title',
            header: 'Conversation',
            isLabelColumn: true,
            value: r => r.label ?? '',
            fillRemaining: true,
            minWidth: '200px',
        },
        { id: 'convType', header: 'Type', value: r => r.convType ?? '', width: '80px' },
        { id: 'llm', header: 'LLM', value: r => r.llm ?? '', width: '100px' },
        { id: 'model', header: 'Model', value: r => r.model ?? '', width: '180px', cellTruncate: false },
        {
            id: 'inputTokens', header: 'In Tokens', value: r => r.inputTokens,
            format: v => Number(v).toLocaleString(), align: 'right', width: '100px',
        },
        {
            id: 'inputCost', header: 'In Cost', value: r => r.inputCost,
            format: v => '$' + Number(v).toFixed(4), align: 'right', width: '96px',
        },
        {
            id: 'outputTokens', header: 'Out Tokens', value: r => r.outputTokens,
            format: v => Number(v).toLocaleString(), align: 'right', width: '100px',
        },
        {
            id: 'outputCost', header: 'Out Cost', value: r => r.outputCost,
            format: v => '$' + Number(v).toFixed(4), align: 'right', width: '96px',
        },
        {
            id: 'totalTokens', header: 'Total Tokens', value: r => r.totalTokens,
            format: v => Number(v).toLocaleString(), align: 'right', width: '120px',
        },
        {
            id: 'totalCost', header: 'Total Cost', value: r => r.totalCost,
            format: v => '$' + Number(v).toFixed(4), align: 'right', width: '96px',
        },
    ];

    footer = computed<TwangTableFooterCell[]>(() => {
        const nodes = this.treeNodes();
        const t = nodes.reduce((acc, n) => {
            const row = (n.summary ?? n.data) as UsageRow | null;
            if (!row) return acc;
            return {
                inputTokens: acc.inputTokens + row.inputTokens,
                outputTokens: acc.outputTokens + row.outputTokens,
                totalTokens: acc.totalTokens + row.totalTokens,
                inputCost: acc.inputCost + row.inputCost,
                outputCost: acc.outputCost + row.outputCost,
                totalCost: acc.totalCost + row.totalCost,
            };
        }, { inputTokens: 0, outputTokens: 0, totalTokens: 0, inputCost: 0, outputCost: 0, totalCost: 0 });
        return [
            { text: `Total (${nodes.length})`, colspan: 4 },
            { text: t.inputTokens.toLocaleString(), align: 'right' },
            { text: '$' + t.inputCost.toFixed(4), align: 'right' },
            { text: t.outputTokens.toLocaleString(), align: 'right' },
            { text: '$' + t.outputCost.toFixed(4), align: 'right' },
            { text: t.totalTokens.toLocaleString(), align: 'right' },
            { text: '$' + t.totalCost.toFixed(4), align: 'right' },
        ];
    });

    constructor() {
        effect(() => {
            const convId = this.conversationId();
            this.filterType();
            this.filterLlm();
            this.filterStartDate();
            this.filterEndDate();
            // empty string = "no conversation selected yet" — skip load
            if (convId === '') return;
            this.load();
        });
    }

    load() {
        this.loading.set(true);
        const convId = this.conversationId();

        if (convId) {
            this.loadSingleConversation(convId);
        } else {
            this.loadFiltered();
        }
    }

    private loadSingleConversation(convId: string) {
        this.dataService.getUsageConversations()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (convs) => {
                    const conv = convs.find(c => c.id === convId);
                    if (!conv) { this.treeNodes.set([]); this.loading.set(false); return; }
                    this.dataService.getUsageTurns(conv.id)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe({
                            next: (turns) => {
                                this.treeNodes.set([this.buildNode(conv, turns)]);
                                this.loading.set(false);
                            },
                            error: () => this.loading.set(false),
                        });
                },
                error: () => this.loading.set(false),
            });
    }

    private loadFiltered() {
        const type = this.filterType();
        const llm = this.filterLlm();
        this.dataService.getUsageConversations({
            conversationType: type === 'all' ? undefined : type,
            llm: llm === 'all' ? undefined : llm,
            startDate: this.filterStartDate() || undefined,
            endDate: this.filterEndDate() || undefined,
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (convs) => {
                if (convs.length === 0) { this.treeNodes.set([]); this.loading.set(false); return; }
                forkJoin(convs.map(c => this.dataService.getUsageTurns(c.id)))
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                        next: (turnsPerConv) => {
                            this.treeNodes.set(convs.map((c, i) => this.buildNode(c, turnsPerConv[i])));
                            this.loading.set(false);
                        },
                        error: () => this.loading.set(false),
                    });
            },
            error: () => this.loading.set(false),
        });
    }

    private buildNode(conv: ConversationUsage, turns: TurnUsage[]): TwangTreeTableNode<UsageRow> {
        const u = conv.usage;
        const convRow: UsageRow = {
            label: conv.title,
            convType: conv.conversation_type,
            llm: conv.llm,
            model: conv.model,
            inputTokens: (u?.input_tokens ?? 0) + (u?.cached_read_tokens ?? 0) + (u?.cached_write_tokens ?? 0),
            outputTokens: u?.output_tokens ?? 0,
            totalTokens: u?.total_tokens ?? 0,
            inputCost: (conv.input_tokens_cost ?? 0) + (conv.cached_read_tokens_cost ?? 0) + (conv.cached_write_tokens_cost ?? 0),
            outputCost: conv.output_tokens_cost ?? 0,
            totalCost: conv.total_tokens_cost ?? 0,
        };
        if (turns.length === 0) {
            return { id: conv.id, label: conv.title, depth: 0, data: convRow };
        }
        return {
            id: conv.id,
            label: conv.title,
            depth: 0,
            summary: convRow,
            children: turns.map(t => ({
                id: t.id,
                label: `Turn ${t.sequence}`,
                depth: 1,
                data: (() => {
                    const u = t.usage;
                    return {
                        label: `Turn ${t.sequence}`,
                        inputTokens: (u?.input_tokens ?? 0) + (u?.cached_read_tokens ?? 0) + (u?.cached_write_tokens ?? 0),
                        outputTokens: u?.output_tokens ?? 0,
                        totalTokens: u?.total_tokens ?? 0,
                        inputCost: (t.input_tokens_cost ?? 0) + (t.cached_read_tokens_cost ?? 0) + (t.cached_write_tokens_cost ?? 0),
                        outputCost: t.output_tokens_cost ?? 0,
                        totalCost: t.total_tokens_cost ?? 0,
                    };
                })(),
            })),
        };
    }
}
