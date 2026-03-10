import { Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { TwangButtonComponent} from "ngx-twang-ui";
import { UserStateService } from '../../core/services/user-state.service';


@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [ReactiveFormsModule, TwangButtonComponent],
    templateUrl: './settings.component.html'
})
export default class SettingsComponent {
    // auth = inject(AuthService);
    userState = inject(UserStateService); 
    private fb = inject(FormBuilder);
    private notify = inject(NotificationService);
    private router = inject(Router);

    isSaving = signal(false);

    // Track the current step (1, 2, or 3)
    currentStep = signal(1);

    // Calculate progress bar width based on step
    progressWidth = computed(() => ((this.currentStep() - 1) / 2) * 100 + '%');

    // Multi-step Form Group
    settingsForm = this.fb.group({
        profile: this.fb.group({
            displayName: ['', Validators.required],
            bio: ['', [Validators.required, Validators.minLength(10)]]
        }),
        preferences: this.fb.group({
            notifications: [true],
            theme: ['light']
        }),
        security: this.fb.group({
            twoFactor: [false]
        })
    });

    // nextStep() { if (this.currentStep() < 3) this.currentStep.update(s => s + 1); }
    // prevStep() { if (this.currentStep() > 1) this.currentStep.update(s => s - 1); }

    direction = signal<'right' | 'left'>('right');
    nextStep() {
        this.direction.set('right');
        this.currentStep.update(s => s + 1);
    }

    prevStep() {
        this.direction.set('left');
        this.currentStep.update(s => s - 1);
    }

    async finish() {
        // Call your API, update the auth.userSettings() signal, and unlock the app
        // await this.auth.saveAllSettings(this.settingsForm.value);
        this.isSaving.set(true);

        this.notify.showSuccess('Account verified! Welcome to the Dashboard.');

        setTimeout(() => {
            // 2. Unlock the app in AuthService
            this.userState.userSettings.set({ completed: true });
            // 3. Show the Top-Right Toast
            this.notify.showSuccess('Account verified! Welcome to the Dashboard.');

            // 4. Navigate away
            this.router.navigate(['/dashboard']);
            this.isSaving.set(false);
            
        }, 800);
    }
}
