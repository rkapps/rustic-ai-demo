import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from "@angular/core";
import { form, required } from '@angular/forms/signals';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectionModel } from '@angular/cdk/collections';
import { map, startWith } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { DataService } from "../../core/services/data.services";
import { NotificationService } from "../../core/services/notification.service";
import { Chat } from "../../models/chat";
import { LlmProvider } from "../../models/llm_provider";
import { TwangButtonComponent, TwangTextareaComponent, TwangDropDownComponent, TwangInputComponent, TwangCheckboxComponent, TwangSelectionNode } from "ngx-twang-ui";

@Component({
    selector: 'app-new-chat',
    imports: [FormsModule, TwangButtonComponent, TwangTextareaComponent, TwangDropDownComponent, TwangInputComponent, TwangCheckboxComponent],
    templateUrl: './new-chat.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export default class NewChatComponent {

    private dataService = inject(DataService);
    private notify = inject(NotificationService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    llmProviders = toSignal(this.dataService.getLlmProviders(), { initialValue: [] });
    llmNodes = computed<TwangSelectionNode[]>(() => {
        // Extract providers from inventory
        return this.llmProviders().map(p => ({
            id: p.id,
            label: p.llm
        }));
    });

    //llm selections
    llmSelectionModel = new SelectionModel<string | number>(false, []);
    selectedLlmId = toSignal(
        this.llmSelectionModel.changed.pipe(
            map(s => s.source.selected[0]), // Get the first ID from the selection
            startWith(this.llmSelectionModel.selected[0]) // Initialize with current selection
        )
    );


    modelSelectionModel = new SelectionModel<string | number>(false, []);
    modelNodes = computed<TwangSelectionNode[]>(() => {

        const selectedLlmId = this.selectedLlmId();
        const llmProviders = this.llmProviders();
        if (!selectedLlmId) return [];
        const provider = llmProviders.find(p => p.id === selectedLlmId);

        return provider ? provider.models.map(model => ({
            id: model,
            label: model
        })) : [];
    });


    chatConfigModel = signal<Chat>({
        id: '',
        llm: '',
        model: '',
        title: 'School Quiz',
        prompt: '',
        system: '',
        stream: false,
        messages: []
    });

    // // 2. Define the form with validation
    // chatForm = form(this.chatConfigModel as any, (path) => {
    //     required(path.title, { message: 'A Title is required' });
    //     required(path.system, { message: 'A system prompt is required' });
    //     // required(path.prompt, { message: 'A prompt is required' });
    //     required(path.llm);
    //     required(path.model);
    // });

    //   chatForm = form<Chat>(this.chatConfigModel, (path) => {
    //     required(path.title, { message: 'A Title is required' });
    //     required(path.system, { message: 'A system prompt is required' });
    //     required(path.llm);
    //     required(path.model);
    // });

    chatForm = {
        title: signal(''),
        system: signal(''),
        stream: signal(false),
        llm: signal(''),
        model: signal('')
    };

    constructor() {
    }

    onLlmProviderSelected(provider: TwangSelectionNode) {
        this.llmSelectionModel.select(provider.id);
        this.chatForm.llm.set(provider.label);
        this.chatConfigModel.update(current => ({
            ...current,
            llm: provider.label
        }));
    }

    onLlmModelSelected(provider: TwangSelectionNode) {
        console.log(provider);
        this.chatForm.model.set(provider.label);
        this.chatConfigModel.update(current => ({
            ...current,
            model: provider.label
        }));


    }

    isValid = computed(() => {
        return this.chatForm.title().trim() !== '' &&
            this.chatForm.system().trim() !== '' &&
            this.chatForm.llm() !== '' &&
            this.chatForm.model() !== '';
    });


    submit() {
        console.log(this.isValid());
        if (this.isValid()) {
            this.chatConfigModel.update(current => ({
                ...current,
                title: this.chatForm.title(),
                llm: this.chatForm.llm(),
                model: this.chatForm.model(),
                system: this.chatForm.system(),
                stream: this.chatForm.stream(),
            }));
    
            this.createChat(this.chatConfigModel());
        }
    }
    createChat(data: any) {

        console.log(data);
        this.dataService.createChat(data).subscribe({
            next: (chat) => {
                this.router.navigate([chat.id], { relativeTo: this.route.parent })
            },
            error: (err) => {
                // this.notify.setError(err.message);
                // this.notify.
            }
        });
    }



}