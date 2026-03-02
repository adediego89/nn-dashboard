import { Pipe, PipeTransform, inject } from '@angular/core';
import { PresenceApiService, UsersApiService } from '../_services';

@Pipe({
  name: 'statusName',
})
export class StatusNamePipe implements PipeTransform {

  private readonly presenceApiService = inject(PresenceApiService);
  private readonly usersApiService = inject(UsersApiService);

  transform(value: string): string {
    const found = this.presenceApiService.presenceDefinitions.find(e => e.id === value);
    let lang;
    switch (this.usersApiService.me!.languagePreference!) {
      case 'en-us': lang = 'en_US'; break;
      default: lang = this.usersApiService.me!.languagePreference! ?? 'en_US'; break;
    }
    // Exception for Idle status
    if (!found) {
      return value;
    }

    if (found.systemPresence?.toLowerCase() === 'idle') {

      switch (lang) {
        case 'en_US': return 'Away (System)';
        case 'pl': return 'Poza stanowiskiem pracy (System)';
        default: return found.languageLabels[lang];
      }

    } else {
      return found.languageLabels[lang]
    }
  }


}
