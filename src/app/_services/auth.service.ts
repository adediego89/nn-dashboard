import { inject, Injectable, signal } from '@angular/core';
import { ApiClient, AuthData, Models } from 'purecloud-platform-client-v2';
import { CLIENT_ID_KEY, ENV_KEY, LANG_KEY, PATH_KEY } from '../_models';
import { Params } from '@angular/router';
import { BehaviorSubject, from, mergeMap, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsersApiService } from './api/users-api.service';
import { PresenceApiService } from './api/presence-api.service';
import { TranslateService } from '@ngx-translate/core';
import { RoutingApiService } from './api/routing-api.service';


interface State {
  path?: string;
  params?: Params;
}

@Injectable({providedIn: 'root'})
export class AuthService {

  private readonly _isAuthorized = signal(false);
  isAuthorized = this._isAuthorized.asReadonly();
  userMe = new BehaviorSubject<Models.UserMe | null>(null);

  private readonly client = ApiClient.instance;
  // Authorization values
  private language: string = 'en-us';
  private environment: string = 'mypurecloud.de';
  private authData?: AuthData;
  // State params (QueryParams)
  private qParams?: Params;
  private readonly usersApiService = inject(UsersApiService);
  private readonly presenceApiService = inject(PresenceApiService);
  private readonly routingApiService = inject(RoutingApiService);
  private readonly translate = inject(TranslateService);

  login(qParams?: Params, url?: string) {
    this.initializeParams(qParams, url);

    this.client.setPersistSettings(true, 'agent-status-widget');
    this.client.setEnvironment(this.environment);

    const obj: State = {path: window.location.pathname, params: qParams};
    const state = btoa(JSON.stringify(obj));

    return this.loginPKCEGrant(state).pipe(
      mergeMap(() => this.presenceApiService.getPresenceDefinitions()),
      mergeMap(() => this.routingApiService.getAllQueues()),
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

  doAuth() {
    this.login(this.buildParams()).subscribe();
  }

  private loginPKCEGrant(state: string): Observable<AuthData> {
    return from(this.client.loginPKCEGrant(
      sessionStorage.getItem(CLIENT_ID_KEY)!,
      window.location.origin + sessionStorage.getItem(PATH_KEY),
      { state: state }
    )).pipe(
      map(data => {
        this.authData = data;
        this._isAuthorized.set(true);
        if (data.state) {
          const actualState: State = JSON.parse(atob(data.state));
          this.qParams = actualState.params;
        }
        return data;
      }),
      tap(() => {
        setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          url.searchParams.delete('state');
          window.history.replaceState({}, '', url.toString());
        }, 1000)
      })
    );
  }

  private initializeParams(qParams: Params = {}, url?: string) {
    sessionStorage.setItem(PATH_KEY, url ? "/" + url + "/" : "/");
    if (qParams[CLIENT_ID_KEY]) sessionStorage.setItem(CLIENT_ID_KEY, qParams[CLIENT_ID_KEY]);
    if (qParams[LANG_KEY]) this.language = qParams[LANG_KEY];
    if (qParams[ENV_KEY]) this.environment = qParams[ENV_KEY];
  }

  private buildParams(): Params {
    const qParams: Params = {};
    const clientId = sessionStorage.getItem(CLIENT_ID_KEY);

    if (clientId) qParams[CLIENT_ID_KEY] = clientId;
    if (this.language) qParams[LANG_KEY] = this.language;
    if (this.environment) qParams[ENV_KEY] = this.environment;
    return qParams;
  }

}
