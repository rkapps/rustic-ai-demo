import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { AppStateService } from './core/services/app-state.service';
import { CommonModule } from '@angular/common';
import { UserDropdownComponent } from './components/user-dropdown/user-dropdown.component';
import { BreadcrumbService } from './core/services/breadcrumb.service';
import { LucideAngularModule } from 'lucide-angular';

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

  pullDistance = signal(0);
  readonly PULL_THRESHOLD = 60;
  private pullStartY = 0;
  private pullScrollEl: HTMLElement | null = null;

  onTouchStart(e: TouchEvent) {
    this.pullScrollEl = (e.target as HTMLElement).closest<HTMLElement>('.overflow-y-auto');
    this.pullStartY = e.touches[0].clientY;
  }

  onTouchMove(e: TouchEvent) {
    if (!this.pullScrollEl) return;
    if (this.pullScrollEl.scrollTop > 0) { this.pullDistance.set(0); return; }
    const delta = e.touches[0].clientY - this.pullStartY;
    if (delta > 0) this.pullDistance.set(Math.min(delta * 0.5, 80));
  }

  onTouchEnd() {
    if (this.pullDistance() >= this.PULL_THRESHOLD) this.appState.triggerRefresh();
    this.pullDistance.set(0);
    this.pullScrollEl = null;
  }
}

