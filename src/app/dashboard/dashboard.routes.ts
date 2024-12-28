// src/app/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'tasks',
        loadChildren: () => import('../tasks/tasks.routes').then(m => m.TASKS_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.routes').then(m => m.PROFILE_ROUTES)
      },
      {
        path: 'references',
        loadChildren: () => import('../references/references.routes').then(m => m.REFERENCES_ROUTES)
      },
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full'
      }
    ]
  }
];