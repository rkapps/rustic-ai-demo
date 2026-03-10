import { Routes } from '@angular/router';
import DashboardComponent from './dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '', // This matches '/dashboard'
    component: DashboardComponent,
    data: { breadcrumb: 'Dashboard' }, 
    children: [
      {
        path: 'analytics', // Becomes '/dashboard/analytics'
        loadComponent: () => import('./analytics/analytics.component'),
        data: { breadcrumb: 'Analytics' }
      },
      {
        path: 'reports', // Becomes '/dashboard/reports'
        loadComponent: () => import('./reports/reports.component'),
        data: { breadcrumb: 'Reports' }
      },
      { path: '', redirectTo: 'analytics', pathMatch: 'full' }
    ]
  }
];
