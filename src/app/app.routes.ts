import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { firebaseAuthGuard } from './core/guards/firebase-auth.guard';

export const routes: Routes = [
    { path: 'home', loadComponent: () => import('./pages/home/home.component'), data: { breadcrumb: 'Home' } },
    { path: 'login', loadComponent: () => import('./pages/login/login.component'), },
    // {
    //     path: 'dashboard',
    //     canActivate: [authGuard],
    //     // Points to a separate routes file for all dashboard sub-pages
    //     loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    //     data: { breadcrumb: 'Dashboard' }
    // },
    {
        path: 'chats',
        canActivate: [firebaseAuthGuard],
        loadChildren: () => import('./pages/chats/chat.routes').then(m => m.CHAT_ROUTES),
        data: { breadcrumb: 'Chats' }
    },
    {
        path: 'agents',
        canActivate: [firebaseAuthGuard],
        loadChildren: () => import('./pages/agents/agents.routes').then(m => m.AGENT_ROUTES),
        data: { breadcrumb: 'Agents' }
    },
    {
        path: 'usage',
        canActivate: [firebaseAuthGuard],
        loadComponent: () => import('./pages/usage/usage.component'),
        data: { breadcrumb: 'Usage' }
    },
    { path: 'settings', loadComponent: () => import('./pages/settings/settings.component'), canActivate: [authGuard] },
    { path: '', redirectTo: 'chats', pathMatch: 'full' }
];