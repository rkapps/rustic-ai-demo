// core/services/breadcrumb.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
    label: string;
    url: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);

    // Signal holding the current breadcrumb stack
    breadcrumbs = signal<Breadcrumb[]>([]);

    constructor() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            const root = this.activatedRoute.root;
            this.breadcrumbs.set(this.createBreadcrumbs(root));
        });
    }

    // core/services/breadcrumb.service.ts
    private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) return breadcrumbs;

        for (const child of children) {
            const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

            // Build the path for this segment
            const nextUrl = routeURL ? `${url}/${routeURL}` : url;

            const label = child.snapshot.data['breadcrumb'];

            // Only add if there's a label AND we haven't added this exact URL/Label combo yet
            if (label && !breadcrumbs.find(b => b.url === nextUrl)) {
                breadcrumbs.push({ label, url: nextUrl });
            }

            // Continue recursion with the updated URL
            return this.createBreadcrumbs(child, nextUrl, breadcrumbs);
        }

        return breadcrumbs;
    }

}
