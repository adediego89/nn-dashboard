import { Routes } from '@angular/router';
import { canActivateGuard } from './_shared/guards/auth.guard';
import { NotFoundComponent } from './_shared/components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    pathMatch: 'full',
    loadComponent: () =>
      import('./dashboard/components/home/home.component').then(m => m.HomeComponent),
    canActivate: [canActivateGuard],
  },
  {
    path: 'email-widget',
    pathMatch: 'full',
    loadComponent: () =>
      import('./email-widget/components/home/home.component').then(m => m.HomeComponent),
    canActivate: [canActivateGuard],
  },
  // TODO: Replace ** route with a notFoundComponent
  { path: '**', pathMatch: 'full', component: NotFoundComponent, canActivate: [canActivateGuard] },
];
