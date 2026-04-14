import {ActivatedRouteSnapshot, CanActivateFn} from '@angular/router';
import {AuthService} from '../_services';
import {inject} from '@angular/core';

export const canActivateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  if (!authService.isAuthorized()) {
    return authService.login(route.queryParams, route.url.toString());
  }
  return true;
}
