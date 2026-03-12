import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { CommonModule } from '@angular/common';
import { UserDropdownComponent } from './components/user-dropdown/user-dropdown.component';
import { BreadcrumbService } from './core/services/breadcrumb.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, UserDropdownComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  auth = inject(AuthService);
  notify = inject(NotificationService);
  public bcService = inject(BreadcrumbService);

  protected readonly title = signal('RusticAI');

  constructor() {
  }

  isOpen = signal(false);
  toggleMenu() { this.isOpen.update(v => !v); }
  close() { this.isOpen.set(false); }

}

