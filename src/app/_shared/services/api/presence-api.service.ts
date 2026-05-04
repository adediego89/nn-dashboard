import { Injectable } from '@angular/core';
import { Models, PresenceApi } from 'purecloud-platform-client-v2';
import { from, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { SystemPresenceType } from '../../models';

@Injectable({providedIn: 'root'})
export class PresenceApiService {

  presenceDefinitions: Array<Models.OrganizationPresenceDefinition> = [];
  private readonly apiInstance = new PresenceApi();

  getPresenceDefinitions() {
    return from(this.apiInstance.getPresenceDefinitions0()).pipe(
      map(listing => listing.entities ?? []),
      tap(definitions => this.presenceDefinitions = definitions));
  }

  findById(id: string) {
    return this.presenceDefinitions.find(e => e.id === id);
  }

  findBySystemPresenceRoot(systemPresence?: SystemPresenceType) {
    return this.presenceDefinitions.find(e => e.type === 'System' && e.systemPresence === systemPresence);
  }

}
