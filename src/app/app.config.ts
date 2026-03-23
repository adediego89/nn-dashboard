import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from "@ngx-translate/core";
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from '../myPreset';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideTranslateService({
      fallbackLang: 'en',
      lang: 'en'
    }),
    providePrimeNG({
      theme: {
        preset: MyPreset
      }
    })
  ]
};
