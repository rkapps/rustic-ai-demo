import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { TwangButtonComponent } from '../../components/ui/twang-button/twang-button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, TwangButtonComponent],
  template: `
    <section class="h-full flex flex-col items-center justify-center bg-white px-4">

      <div class="w-full max-w-md">

        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-gray-900">{{ isSignUp() ? 'Create account' : 'Welcome back' }}</h1>
          <p class="mt-2 text-sm text-gray-500">
            {{ isSignUp() ? 'Already have an account?' : 'New here?' }}
            <button type="button" class="font-medium text-primary-600 hover:text-primary-500" (click)="toggleMode()">
              {{ isSignUp() ? 'Sign in' : 'Create an account' }}
            </button>
          </p>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-8">
          <form (submit)="handleSubmit($event)" class="space-y-5">

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input id="email" name="email" type="email" autocomplete="email" required
                [(ngModel)]="email"
                class="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500">
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required
                [(ngModel)]="password"
                class="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500">
            </div>

            @if (isSignUp()) {
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required
                  [(ngModel)]="confirmPassword"
                  class="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500">
              </div>
            }

            <twang-button
              type="submit"
              [label]="isSignUp() ? 'Create account' : 'Sign in'"
              variant="primary"
              size="md"
              [fluid]="true"
              [loading]="loading()">
            </twang-button>

          </form>

          @if (!isSignUp()) {
            <div class="my-6 flex items-center gap-3">
              <div class="flex-1 border-t border-gray-200"></div>
              <span class="text-xs text-gray-400">or</span>
              <div class="flex-1 border-t border-gray-200"></div>
            </div>

            <twang-button
              label="Continue with Google"
              variant="outline"
              size="md"
              [fluid]="true"
              (buttonClick)="signInWithGoogle()">
            </twang-button>
          }
        </div>

      </div>
    </section>
  `
})
export default class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  isSignUp = signal(false);

  toggleMode() {
    this.isSignUp.update(v => !v);
    this.password = '';
    this.confirmPassword = '';
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    if (this.isSignUp()) {
      if (this.password !== this.confirmPassword) {
        this.notify.showError('Passwords do not match.');
        return;
      }
      this.loading.set(true);
      try {
        await this.auth.registerWithEmail(this.email, this.password);
        this.notify.showSuccess('Account created!');
        this.router.navigate(['/chats']);
      } catch (error: any) {
        this.notify.showError(this.firebaseErrorMessage(error.code));
      } finally {
        this.loading.set(false);
      }
    } else {
      this.loading.set(true);
      try {
        await this.auth.loginWithEmail(this.email, this.password);
        this.notify.showSuccess('Welcome back!');
        this.router.navigate(['/chats']);
      } catch (error: any) {
        this.notify.showError(this.firebaseErrorMessage(error.code));
      } finally {
        this.loading.set(false);
      }
    }
  }

  private firebaseErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':         return 'Invalid email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':    return 'Incorrect email or password.';
      case 'auth/email-already-in-use':  return 'An account with this email already exists.';
      case 'auth/weak-password':         return 'Password must be at least 6 characters.';
      case 'auth/user-disabled':         return 'This account has been disabled.';
      case 'auth/too-many-requests':     return 'Too many failed attempts. Try again later.';
      default:                           return 'Something went wrong. Please try again.';
    }
  }

  async signInWithGoogle() {
    try {
      await this.auth.loginWithGoogle();
      this.router.navigate(['/chats']);
    } catch (error) {
      this.notify.showError('Google sign-in failed.');
    }
  }
}
