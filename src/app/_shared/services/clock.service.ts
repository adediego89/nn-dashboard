import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ClockService {
  readonly now$: Observable<number> = interval(1000).pipe(
    startWith(0),
    map(() => Date.now()),
    shareReplay(1)
  );
}
