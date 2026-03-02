import { Routes } from '@angular/router';
import { canActivateGuard } from './_guards/auth.guard';
import { HomeComponent } from './_components/home/home.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent, canActivate: [canActivateGuard] },
];
