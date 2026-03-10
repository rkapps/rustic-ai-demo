import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

// chat.routes.ts
export const CHAT_ROUTES: Routes = [
    {
        path: '', // URL: /chats
        loadComponent: () => import('./chats-list.component'),
        // canActivate: [authGuard], // Protect the List
        // No breadcrumb here = trail is just "App > Chats"
    },
    {
        path: 'new', // URL: /chats/new
        loadComponent: () => import('./new-chat.component'),
        data: { breadcrumb: 'New Message' }, // trail: "App > Chats > New Message"

    },
    {
        path: ':id', // URL: /chats/123
        loadComponent: () => import('./chat-detail.component'),
        data: { breadcrumb: 'Conversation' }, // trail: "App > Chats > Conversation"

    },
    
];
