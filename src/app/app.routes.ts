import { Routes } from '@angular/router';
import { canActivateGuard } from './_shared/guards/auth.guard';
import { NotFoundComponent } from './_shared/components/not-found/not-found.component';
import { HomeComponent } from './dashboard/components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [canActivateGuard],
  },
  { path: '**', pathMatch: 'full', component: NotFoundComponent, canActivate: [canActivateGuard] },
];
