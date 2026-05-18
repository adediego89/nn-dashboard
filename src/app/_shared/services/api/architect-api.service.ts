import { Injectable } from '@angular/core';
import { ArchitectApi } from 'purecloud-platform-client-v2';
import { forkJoin, from, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class ArchitectApiService {

  private readonly api = new ArchitectApi();

  getDatatableRecords(datatableId: string) {
    return this.getDatatableRows(datatableId, 0).pipe(
      switchMap(response => {
        if (response.pageCount && response.pageCount > 1) {
          const observables = [
            of(response.entities!)
          ];
          for (let i = 1; i < response.pageCount; i++) {
            observables.push(this.getDatatableRows(datatableId, i).pipe(map(res => res.entities!)))
          }
          return forkJoin(observables).pipe(map(res => res.flat(1)));
        } else {
          return of(response.entities!)
        }
      }));
  }

  private getDatatableRows(id: string, pageNum: number) {
    const opts: ArchitectApi.getFlowsDatatableRowsOptions = {
      pageSize: 100,
      pageNumber: pageNum,
      showbrief: false,
    };

    return from(this.api.getFlowsDatatableRows(id, opts));
  }

}
