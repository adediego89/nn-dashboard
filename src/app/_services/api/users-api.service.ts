import { Injectable } from '@angular/core';
import { Models, UsersApi } from 'purecloud-platform-client-v2';
import { from, Observable, of, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class UsersApiService {

  me?: Models.UserMe;
  private readonly apiInstance = new UsersApi();

  getUserMe(force = false): Observable<Models.UserMe> {
    if (this.me && !force) return of(this.me);
    return from(this.apiInstance.getUsersMe({
      expand: ['languagePreference', 'groups', 'authorization', 'presence', 'routingStatus'],
    })).pipe(tap(data => this.me = data));
  }

}
