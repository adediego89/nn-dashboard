import {inject, Injectable} from '@angular/core';
import {ApiClient, AuthData, Models} from 'purecloud-platform-client-v2';
import {CLIENT_ID_KEY, ENV_KEY, LANG_KEY} from '../_models';
import {Params} from '@angular/router';
import { BehaviorSubject, from, mergeMap, Observable, tap } from 'rxjs';
import {map} from 'rxjs/operators';
import { UsersApiService } from './api/users-api.service';
import { PresenceApiService } from './api/presence-api.service';
import { TranslateService } from '@ngx-translate/core';
import { GroupsApiService } from './api/groups-api.service';


interface State {
  path?: string;
  params?: Params;
}

@Injectable({providedIn: 'root'})
export class AuthService {

  isAuthorized = new BehaviorSubject<boolean>(false);
  userMe = new BehaviorSubject<Models.UserMe | null>(null);

  private readonly client = ApiClient.instance;
  // Authorization values
  private language: string = 'en-us';
  private environment: string = 'mypurecloud.de';
  private clientId: string = '';
  private authData?: AuthData;
  // State params (QueryParams)
  private path?: string;
  private qParams?: Params;
  private readonly usersApiService = inject(UsersApiService);
  private readonly presenceApiService = inject(PresenceApiService);
  private readonly groupsApiService = inject(GroupsApiService);
  private readonly translate = inject(TranslateService);

  login(path?: string, qParams?: Params) {

    this.initializeParams(qParams);

    this.client.setPersistSettings(true, 'agent-status-widget');
    this.client.setEnvironment(this.environment);

    const obj: State = {path: window.location.pathname, params: qParams};
    const state = btoa(JSON.stringify(obj));

    return this.loginImplicitGrant(state).pipe(
      mergeMap(() => this.presenceApiService.getPresenceDefinitions()),
      mergeMap(() => this.usersApiService.getUserMe()),
      tap<Models.UserMe>(data => {
        this.userMe.next(data);
        switch (data.languagePreference) {
          case 'en-us': this.translate.use('en'); break;
          default: this.translate.use(data.languagePreference ?? 'en'); break;
        }
      }),
      map<Models.UserMe, boolean>(() => true));
  }

  isTokenValid(): boolean {
    if (!this.authData) return false;
    return Date.now() < this.authData?.tokenExpiryTime;
  }

  getToken(): string | undefined {
    return this.authData?.accessToken
  }

  getMe() {
    return this.userMe.value;
  }

  doAuth() {
    const params = this.buildParams();
    this.login(undefined, params).subscribe();
  }

  private loginImplicitGrant(state: string): Observable<AuthData> {
    return from(this.client.loginImplicitGrant(
      this.clientId,
      window.location.origin + window.location.pathname,
      {state: state}))
      .pipe(
        map(data => {
          this.authData = data;
          this.isAuthorized.next(true);
          if (data.state) {
            const actualState: State = JSON.parse(atob(data.state));
            this.path = actualState.path;
            this.qParams = actualState.params;
            this.initializeParams(this.qParams);
            console.log(`[AuthService] ClientId: ${this.clientId}`);
          }
          return data;
        })
      );
  }

  private initializeParams(qParams?: Params) {
    if (!qParams) qParams = {};

    if (qParams[CLIENT_ID_KEY]) this.clientId = qParams[CLIENT_ID_KEY];
    if (qParams[LANG_KEY]) this.language = qParams[LANG_KEY];
    if (qParams[ENV_KEY]) this.environment = qParams[ENV_KEY];
  }

  private buildParams(): Params {
    const qParams: Params = {};

    if (this.clientId) qParams[CLIENT_ID_KEY] = this.clientId;
    if (this.language) qParams[LANG_KEY] = this.language;
    if (this.environment) qParams[ENV_KEY] = this.environment;
    return qParams;
  }

}
