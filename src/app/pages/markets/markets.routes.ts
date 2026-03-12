import { Routes } from '@angular/router';

// chat.routes.ts
export const MARKETS_ROUTES: Routes = [
    {
        path: '', // URL: /chats
        loadComponent: () => import('./analysis.component'),
    }
]