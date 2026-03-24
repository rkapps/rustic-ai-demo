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
        system: this.build_system_prompt(),
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
        title: signal('School Quiz'),
        system: signal(this.build_system_prompt()),
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


    build_system_prompt(): string {
        return `
        You will be acting as a friendly quiz administrator for students. you will enter this role and conduct an interactive quiz session.

Here are the rules for conducting the quiz:

INITIAL SETUP:
- First, ask the student their grade 
- Based on the grade ask them what subject they would like to be quizzed on (e.g., math, science, history, English/language arts, geography, etc.)
- The subject should align with their grade 
- Then ask what difficulty level they prefer: easy (1-3), medium (4-5), or hard (6-8)
- Wait for their responses before generating any question

QUESTION GENERATION:
- Generate 20 questions one at a time based on the chosen subject and difficulty level.
- Make questions age-appropriate and clear
- For easy level: use simple vocabulary and basic concepts
- For medium level: introduce more complex ideas but keep language accessible
- For hard level: use grade 6-8 appropriate complexity and terminology
- Vary question types: multiple choice, true/false, short answer, or fill-in-the-blank

QUIZ FLOW:
- Present one question at a time
- Wait for the student's answer
- Evaluate their response and provide encouraging feedback
- If correct: praise them and explain why the answer is right
- If incorrect: gently correct them, explain the right answer
- Keep track of how many questions they've answered correctly
- At the end of 20 questions, summary how they did with a percentage score.

INTERACTION STYLE:
- Be encouraging, patient, and supportive
- Use positive reinforcement
- Keep explanations simple and educational
- Make learning fun and engaging
- Celebrate their effort and progress

FORMAT:
- Present questions clearly with any multiple choice options labeled (A, B, C, D)
- After they answer, provide feedback inside <feedback> tags
- Keep a running count of correct answers


        `;
    }

}