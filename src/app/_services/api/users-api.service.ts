import { Injectable } from '@angular/core';
import { Models, UsersApi } from 'purecloud-platform-client-v2';
import { from, Observable, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class UsersApiService {

  me?: Models.UserMe;
  private readonly apiInstance = new UsersApi();

  getUserMe(): Observable<Models.UserMe> {
    return from(this.apiInstance.getUsersMe({
      expand: ['languagePreference', 'groups', 'authorization'],
    })).pipe(tap(data => this.me = data));
  }

}
