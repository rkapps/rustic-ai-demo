import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import type { TwangDropdownOption } from './twang-dropdown.models';

export type TwangDropdownVariant =
  | 'primary'
  | 'primarySoft'
  | 'secondary'
  | 'accent'
  | 'outline'
  | 'default'
  | 'muted';
export type TwangDropdownSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'twang-dropdown',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './twang-dropdown.html',
  styleUrl: './twang-dropdown.css',
})
export class TwangDropdownComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Accepts readonly arrays from callers (`ReadonlyArray`, `as const`, etc.). */
  readonly options = input<ReadonlyArray<TwangDropdownOption>>([]);
  readonly placeholder = input('Select…');
  /** Current value (controlled). */
  readonly value = input<string>('');
  readonly valueChange = output<string>();
  readonly fieldId = input<string | undefined>(undefined);
  readonly disabled = input(false);
  readonly variant = input<TwangDropdownVariant>('muted');
  readonly size = input<TwangDropdownSize>('md');

  protected readonly open = signal(false);

  protected readonly currentLabel = computed(() => {
    const v = this.value();
    const opt = this.options().find((o) => o.value === v);
    return opt?.label ?? this.placeholder();
  });

  protected readonly triggerClasses = computed(() => {
    const base =
      'twang-dropdown-trigger flex w-full items-center justify-between gap-2 rounded-lg font-medium transition duration-200 focus:outline-none focus-visible:outline-none text-left';

    const variantMap: Record<TwangDropdownVariant, string> = {
      primary:
        'bg-primary-600 text-white shadow-sm hover:bg-primary-600/90 focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-surface,#fff)]',
      primarySoft:
        'border border-primary-500 bg-primary-50 text-primary-900 shadow-none hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-surface,#fff)]',
      secondary:
        'bg-secondary-600 text-white shadow-sm hover:bg-secondary-600/90 focus-visible:ring-2 focus-visible:ring-secondary-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-surface,#fff)]',
      accent:
        'bg-accent-600 text-white shadow-sm hover:bg-accent-600/90 focus-visible:ring-2 focus-visible:ring-accent-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-surface,#fff)]',
      outline:
        'border border-primary-500 bg-transparent text-primary-600 shadow-none hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-surface,#fff)]',
      default:
        'border-0 bg-transparent text-primary-700 shadow-none hover:bg-primary-50/80 focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-surface,#fff)]',
      muted:
        'border border-border bg-white text-text hover:bg-gray-50/80 focus-visible:ring-2 focus-visible:ring-primary-500/30',
    };

    const sizeMap: Record<TwangDropdownSize, string> = {
      xs: 'min-h-6 px-1.5 py-0.5 text-[11px] leading-tight',
      sm: 'min-h-7 px-2 py-0.5 text-xs leading-tight',
      md: 'min-h-10 px-3 py-2 text-sm',
      lg: 'min-h-11 px-4 py-2.5 text-base',
    };

    const disabledClass = this.disabled() ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';

    return [base, variantMap[this.variant()], sizeMap[this.size()], disabledClass]
      .filter(Boolean)
      .join(' ');
  });

  protected readonly chevronClass = computed(() => {
    const sizeMap: Record<TwangDropdownSize, string> = {
      xs: 'text-[14px]',
      sm: 'text-[16px]',
      md: 'text-[20px]',
      lg: 'text-[22px]',
    };
    return `material-symbol ${sizeMap[this.size()]} leading-none text-text-muted transition-transform duration-200`;
  });

  protected toggleOpen(): void {
    if (this.disabled()) return;
    this.open.update((o) => !o);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected select(opt: TwangDropdownOption, ev: Event): void {
    ev.stopPropagation();
    this.valueChange.emit(opt.value);
    this.close();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(ev: MouseEvent): void {
    if (!this.open()) return;
    const t = ev.target as Node;
    if (this.host.nativeElement.contains(t)) return;
    this.close();
  }
}
