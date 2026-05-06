import { Routes } from '@angular/router';

export const AGENT_ROUTES: Routes = [
    {
        path: 'new',
        loadComponent: () => import('./new-agent.component'),
    },
    {
        path: '',
        loadComponent: () => import('./agents.component'),
        children: [
            {
                path: ':id',
                loadComponent: () => import('../chats/chat-detail.component'),
            },
        ],
    },
];
