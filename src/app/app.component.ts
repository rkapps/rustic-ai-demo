import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { AppStateService } from './core/services/app-state.service';
import { CommonModule } from '@angular/common';
import { UserDropdownComponent } from './components/user-dropdown/user-dropdown.component';
import { BreadcrumbService } from './core/services/breadcrumb.service';
import { LucideAngularModule } from 'lucide-angular';
import { PullToRefreshService } from './core/services/pull-to-refresh.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, UserDropdownComponent, LucideAngularModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  auth = inject(AuthService);
  notify = inject(NotificationService);
  appState = inject(AppStateService);
  public bcService = inject(BreadcrumbService);

  protected readonly title = signal('RusticAI');

  isOpen = signal(false);
  toggleMenu() { this.isOpen.update(v => !v); }
  close() { this.isOpen.set(false); }

  constructor() {
    inject(PullToRefreshService).init();
  }
}

