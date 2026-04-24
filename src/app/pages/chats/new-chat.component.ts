import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "../../core/services/data.services";
import { AppStateService } from "../../core/services/app-state.service";
import { TwangButtonComponent } from "../../components/ui/twang-button/twang-button";
import { TwangDropdownComponent } from "../../components/ui/twang-dropdown/twang-dropdown";
import { TwangDropdownOption } from "../../components/ui/twang-dropdown/twang-dropdown.models";

@Component({
    selector: 'app-new-chat',
    imports: [TwangButtonComponent, TwangDropdownComponent],
    templateUrl: './new-chat.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export default class NewChatComponent {

    private dataService = inject(DataService);
    private appState = inject(AppStateService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    llmProviders = toSignal(this.dataService.getLlmProviders(), { initialValue: [] });

    selectedLlmValue = signal('');
    selectedModelValue = signal('');

    llmNodes = computed<TwangDropdownOption[]>(() =>
        this.llmProviders().map(p => ({ value: String(p.id), label: p.llm }))
    );

    modelNodes = computed<TwangDropdownOption[]>(() => {
        const selectedId = this.selectedLlmValue();
        if (!selectedId) return [];
        const provider = this.llmProviders().find(p => String(p.id) === selectedId);
        return provider ? provider.models.map(m => ({ value: m, label: m })) : [];
    });


    chatForm = {
        title: signal('School Quiz'),
        system: signal(this.build_system_prompt()),
        stream: signal(false),
        llm: signal(''),
        model: signal('')
    };

    constructor() {
    }

    onLlmProviderSelected(value: string) {
        this.selectedLlmValue.set(value);
        this.selectedModelValue.set('');
        this.chatForm.llm.set(value);
        this.chatForm.model.set('');
    }

    onLlmModelSelected(value: string) {
        this.selectedModelValue.set(value);
        this.chatForm.model.set(value);
    }

    isValid = computed(() => {
        return this.chatForm.title().trim() !== '' &&
            this.chatForm.system().trim() !== '' &&
            this.chatForm.llm() !== '' &&
            this.chatForm.model() !== '';
    });


    submit() {
        if (!this.isValid()) return;
        this.createChat({
            id: '',
            title: this.chatForm.title(),
            llm: this.chatForm.llm(),
            model: this.chatForm.model(),
            system: this.chatForm.system(),
            stream: this.chatForm.stream(),
            prompt: '',
            messages: []
        });
    }
    createChat(data: any) {

        console.log(data);
        this.dataService.createChat(data).subscribe({
            next: (chat) => {
                this.appState.selectChat(chat.id);
                this.router.navigate(['/chats']);
            },
            error: (err) => {
                // this.notify.setError(err.message);
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