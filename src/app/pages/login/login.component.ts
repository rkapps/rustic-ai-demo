import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or <a routerLink="/home" class="font-medium text-blue-600 hover:text-blue-500">go back home</a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form (submit)="handleLogin($event)" class="space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 text-left">Email address</label>
              <div class="mt-1">
                <input id="email" name="email" type="email" autocomplete="email" required
                  [(ngModel)]="email"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              </div>
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 text-left">Password</label>
              <div class="mt-1">
                <input id="password" name="password" type="password" autocomplete="current-password" required
                  [(ngModel)]="password"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              </div>
            </div>

            <!-- Submit Button -->
            <div>
              <button type="submit" [disabled]="loading()"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                @if (loading()) { <span>Signing in...</span> } @else { <span>Sign in</span> }
              </button>
            </div>
          </form>

          <!-- Social Login Divider -->
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-300"></div></div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Quick access</span>
              </div>
            </div>
            
            <div class="mt-6">
              <button (click)="signInWithGoogle()"
                class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">Sign in with Google</span>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export default class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  // Use Signals for form state
  email = signal('');
  password = signal('');
  loading = signal(false);

  async handleLogin(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    
    try {
      // Logic would call your Firebase AuthService
      await this.auth.loginWithEmail(this.email(), this.password());
      this.notify.showSuccess('Welcome back!');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.notify.showError(error.message || 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }

  async signInWithGoogle() {
    try {
      await this.auth.loginWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.notify.showError('Social login failed');
    }
  }
}
