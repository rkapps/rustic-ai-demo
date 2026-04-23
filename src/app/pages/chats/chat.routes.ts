import { Routes } from '@angular/router';

export const CHAT_ROUTES: Routes = [
    {
        path: 'new',
        loadComponent: () => import('./new-chat.component'),
        data: { breadcrumb: 'New Chat' },
    },
    {
        path: '',
        loadComponent: () => import('./chats-list.component'),
        children: [
            {
                path: ':id',
                loadComponent: () => import('./chat-detail.component'),
            },
        ],
    },
];
