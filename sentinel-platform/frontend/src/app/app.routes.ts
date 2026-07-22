import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  {
    path: '',
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'workers', loadComponent: () => import('./pages/workers/workers').then((m) => m.Workers) },
      { path: 'sensors', loadComponent: () => import('./pages/sensors/sensors').then((m) => m.Sensors) },
      { path: 'heatmap', loadComponent: () => import('./pages/heatmap/heatmap').then((m) => m.Heatmap) },
      { path: 'permits', loadComponent: () => import('./pages/permits/permits').then((m) => m.Permits) },
      { path: 'incidents', loadComponent: () => import('./pages/incidents/incidents').then((m) => m.Incidents) },
      { path: 'predictions', loadComponent: () => import('./pages/predictions/predictions').then((m) => m.Predictions) },
      { path: 'reports', loadComponent: () => import('./pages/reports/reports').then((m) => m.Reports) },
      { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications').then((m) => m.Notifications) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
