import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'profile',
        loadComponent: () => 
          import('../profile/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'tasks',
        loadChildren: () => 
          import('../tasks/tasks.routes').then(m => m.TASKS_ROUTES)
      },
      {
        path: 'references',
        loadComponent: () => 
          import('../references/reference-list/reference-list.component')
            .then(m => m.ReferenceListComponent)
      }
    ]
  }
];