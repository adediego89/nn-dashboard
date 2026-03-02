import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import build from '../build';
import { FilterService } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [TranslateModule, RouterOutlet],
  template: `<router-outlet/>`,
})
export class App {
  private readonly translate = inject(TranslateService);
  private readonly filterService = inject(FilterService);
  constructor() {
    this.filterService.register('inArray', (value: string[], filter: string[]): boolean => {
      if (filter === undefined || filter === null || filter.length === 0) {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      return filter.every(filterOpt => value.includes(filterOpt));
    })
    this.translate.addLangs(['en', 'pl']);
    this.translate.setDefaultLang('en');
    console.log(`Version: ${build.version}`);
  }
}
