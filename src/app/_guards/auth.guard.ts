import {ActivatedRouteSnapshot, CanActivateFn} from '@angular/router';
import {Location} from "@angular/common";
import {AuthService} from '../_services';
import {inject} from '@angular/core';

export const canActivateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const location = inject(Location);
  if (!authService.isAuthorized.value) {
    return authService.login(location.path(), route.queryParams);
  }
  return true;
}
