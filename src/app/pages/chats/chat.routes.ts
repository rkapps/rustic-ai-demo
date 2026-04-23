import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CHAT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./chats-list.component'),
    },
    {
        path: 'new',
        loadComponent: () => import('./new-chat.component'),
        data: { breadcrumb: 'New Chat' },
    },
];
