import { Component, signal, inject, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-user-dropdown',
    standalone: true,
    imports: [],
    template: `
    <div class="relative">
      <!-- Dropdown Trigger (Avatar) -->
      <button 
        (click)="toggle()" 
        type="button" 
        class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 transition-shadow"
        aria-expanded="false">
        <span class="sr-only">Open user menu</span>

        <img   class="size-8 rounded-full object-cover ring-1 ring-gray-200/50 shadow-sm antialiased" 
            [src]="auth.currentUser()?.photoURL || 'https://ui-avatars.com' + auth.currentUser()?.email + '&size=128'" 
            [alt]="auth.currentUser()?.displayName">
      </button>

      <!-- Dropdown Menu -->
      @if (isOpen()) {
        <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 origin-top-right animate-in fade-in zoom-in duration-100">
          
          <!-- User Details Header -->
          <div class="px-4 py-3 border-b border-gray-50">
            <p class="text-sm font-semibold text-gray-900 truncate">
              {{ auth.currentUser()?.displayName || 'User' }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ auth.currentUser()?.email }}
            </p>
          </div>

          <!-- Sign Out Action -->
          <div class="pt-1">
            <button 
              (click)="handleLogout()" 
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
              Sign out
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class UserDropdownComponent {
    auth = inject(AuthService);
    private el = inject(ElementRef);

    // Signal to manage open state
    isOpen = signal(false);

    toggle() {
        this.isOpen.update(v => !v);
    }

    close() {
        this.isOpen.set(false);
    }

    handleLogout() {
        this.close();
        this.auth.logout();
    }

    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
        if (!this.el.nativeElement.contains(event.target)) {
            this.close();
        }
    }
}
