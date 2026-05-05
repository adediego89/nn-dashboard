import { inject, Injectable, signal } from '@angular/core';
import { Params } from '@angular/router';
import { BehaviorSubject, from, mergeMap, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ApiClient, AuthData, Models } from 'purecloud-platform-client-v2';
import { CLIENT_ID_KEY, CONVERSATION_KEY, EMAIL_API_ADDRESS, EMAIL_FORWARDING_ADDRESS, ENV_KEY, LANG_KEY, PATH_KEY } from '../models';
import { UsersApiService, PresenceApiService, RoutingApiService } from './api';

interface State {
  path?: string;
  params?: Params;
}

@Injectable({ providedIn: 'root' })
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

    this.client.setPersistSettings(true, 'nn-gc-addins');
    this.client.setEnvironment(this.environment);

    const obj: State = {path: globalThis.location.pathname, params: qParams};
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
      globalThis.location.origin + sessionStorage.getItem(PATH_KEY),
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
          const url = new URL(globalThis.location.href);
          url.searchParams.delete('code');
          url.searchParams.delete('state');
          globalThis.history.replaceState({}, '', url.toString());
        }, 1000)
      })
    );
  }

  private initializeParams(qParams: Params = {}, url?: string) {
    sessionStorage.setItem(PATH_KEY, url ? "/" + url + "/" : "/");
    if (qParams[CLIENT_ID_KEY]) sessionStorage.setItem(CLIENT_ID_KEY, qParams[CLIENT_ID_KEY]);
    if (qParams[CONVERSATION_KEY]) sessionStorage.setItem(CONVERSATION_KEY, qParams[CONVERSATION_KEY]);
    if (qParams[EMAIL_FORWARDING_ADDRESS]) sessionStorage.setItem(EMAIL_FORWARDING_ADDRESS, qParams[EMAIL_FORWARDING_ADDRESS]);
    if (qParams[EMAIL_API_ADDRESS]) sessionStorage.setItem(EMAIL_API_ADDRESS, qParams[EMAIL_API_ADDRESS]);
    if (qParams[LANG_KEY]) this.language = qParams[LANG_KEY];
    if (qParams[ENV_KEY]) this.environment = qParams[ENV_KEY];
  }

  private buildParams(): Params {
    const qParams: Params = {};
    const clientId = sessionStorage.getItem(CLIENT_ID_KEY);
    const conversationId = sessionStorage.getItem(CONVERSATION_KEY);
    const emailAddress = sessionStorage.getItem(EMAIL_FORWARDING_ADDRESS);
    const apiHostAddress = sessionStorage.getItem(EMAIL_API_ADDRESS);

    if (clientId) qParams[CLIENT_ID_KEY] = clientId;
    if (conversationId) qParams[CONVERSATION_KEY] = conversationId;
    if (emailAddress) qParams[EMAIL_FORWARDING_ADDRESS] = emailAddress;
    if (apiHostAddress) qParams[EMAIL_API_ADDRESS] = apiHostAddress;
    if (this.language) qParams[LANG_KEY] = this.language;
    if (this.environment) qParams[ENV_KEY] = this.environment;
    return qParams;
  }

}
