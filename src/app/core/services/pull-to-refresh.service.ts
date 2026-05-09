import { DOCUMENT, inject, Injectable } from '@angular/core';

const THRESHOLD = 72;
const ENGAGE = 12;
const RING_R = 10;
const RING_C = 2 * Math.PI * RING_R;

@Injectable({ providedIn: 'root' })
export class PullToRefreshService {
  private readonly doc = inject(DOCUMENT);

  private startY = 0;
  private pulling = false;
  private pendingDy = 0;
  private rafId = 0;
  private indicator: HTMLElement | null = null;
  private progressArc: SVGCircleElement | null = null;

  init(): void {
    this.doc.addEventListener('touchstart', this.onStart, { passive: true });
    this.doc.addEventListener('touchmove', this.onMove, { passive: false });
    this.doc.addEventListener('touchend', this.onEnd, { passive: true });
    this.doc.addEventListener('touchcancel', this.onEnd, { passive: true });
  }

  private readonly onStart = (e: TouchEvent): void => {
    this.startY = e.touches[0].clientY;
    this.pendingDy = 0;
    this.pulling = this.isScrolledToTop(e.target as Element);
    // Pre-create indicator in touchstart (passive, outside animation loop) so
    // the DOM insertion doesn't cause jank on the first animation frame.
    if (this.pulling) this.ensureIndicator();
  };

  private readonly onMove = (e: TouchEvent): void => {
    if (!this.pulling) return;
    const dy = e.touches[0].clientY - this.startY;
    if (dy <= 0) {
      this.pulling = false;
      this.cancelRaf();
      this.dismissIndicator();
      return;
    }
    if (dy >= ENGAGE) e.preventDefault();
    this.pendingDy = dy;
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this.applyFrame);
    }
  };

  private readonly applyFrame = (): void => {
    this.rafId = 0;
    const dy = this.pendingDy;
    const visual = 44 * Math.log1p(dy / 44);
    this.updateIndicator(visual, dy / THRESHOLD);
  };

  private readonly onEnd = (): void => {
    if (!this.pulling) return;
    this.pulling = false;
    this.cancelRaf();
    const ratio = this.indicator ? parseFloat(this.indicator.dataset['ratio'] ?? '0') : 0;
    if (ratio >= 1) {
      this.showSpinner();
      window.location.reload();
    } else {
      this.dismissIndicator();
    }
  };

  private cancelRaf(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private isScrolledToTop(el: Element | null): boolean {
    let node = el;
    while (node && node !== this.doc.documentElement) {
      const oy = getComputedStyle(node).overflowY;
      if (oy === 'auto' || oy === 'scroll') {
        return (node as HTMLElement).scrollTop === 0;
      }
      node = node.parentElement;
    }
    return true;
  }

  private ensureIndicator(): HTMLElement {
    if (!this.indicator) {
      const el = this.doc.createElement('div');
      el.dataset['ratio'] = '0';
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="32" height="32">
          <circle cx="20" cy="20" r="18" fill="#1f2937"/>
          <circle cx="20" cy="20" r="${RING_R}" fill="none" stroke="#374151" stroke-width="2.5"/>
          <circle class="ptr-arc" cx="20" cy="20" r="${RING_R}" fill="none"
            stroke="#f97316" stroke-width="2.5" stroke-linecap="round"
            stroke-dasharray="${RING_C}" stroke-dashoffset="${RING_C}"
            transform="rotate(-90 20 20)"/>
        </svg>`;
      Object.assign(el.style, {
        position: 'fixed',
        top: '0',
        left: '50%',
        zIndex: '9999',
        transform: 'translateX(-50%) translateY(-50px)',
        opacity: '0',
        willChange: 'transform, opacity',
        pointerEvents: 'none',
        lineHeight: '0',
      });
      this.doc.body.appendChild(el);
      this.indicator = el;
      this.progressArc = el.querySelector('.ptr-arc');
    }
    return this.indicator;
  }

  private updateIndicator(visual: number, ratio: number): void {
    const el = this.ensureIndicator();
    el.dataset['ratio'] = String(ratio);
    el.style.transform = `translateX(-50%) translateY(${visual - 6}px)`;
    el.style.opacity = String(Math.min(ratio * 1.6, 1));
    if (this.progressArc) {
      const offset = RING_C * (1 - Math.min(ratio, 1));
      this.progressArc.setAttribute('stroke-dashoffset', String(offset));
    }
  }

  private showSpinner(): void {
    const el = this.indicator;
    if (!el) return;
    el.style.transform = 'translateX(-50%) translateY(10px)';
    el.style.opacity = '1';
    if (this.progressArc) {
      this.progressArc.setAttribute('stroke-dasharray', `${RING_C * 0.75} ${RING_C * 0.25}`);
      this.progressArc.setAttribute('stroke-dashoffset', '0');
      this.progressArc.style.animation = 'ptr-spin 0.7s linear infinite';
      this.progressArc.style.transformOrigin = '20px 20px';
      this.progressArc.removeAttribute('transform');
    }
  }

  private dismissIndicator(): void {
    const el = this.indicator;
    if (!el) return;
    this.indicator = null;
    this.progressArc = null;
    el.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
    el.style.transform = 'translateX(-50%) translateY(-50px)';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 220);
  }
}
