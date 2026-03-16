import { Injectable } from '@angular/core';
import { Models, RoutingApi } from 'purecloud-platform-client-v2';
import { forkJoin, from, of, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class RoutingApiService {

  private myDivisionQueues: Models.Queue[] = [];
  queues: Models.Queue[] = [];
  private readonly apiInstance = new RoutingApi();

  getAllQueues(force: boolean = false) {
    if (this.queues.length > 0 && !force) return of(this.queues);

    return this.getQueuesPage(0).pipe(
      switchMap(listing => {
        if (listing.pageCount && listing.pageCount > 1) {
          const observables = [
            of(listing.entities!)
          ];
          for (let i = 1; i < listing.pageCount; i++) {
            observables.push(this.getQueuesPage(i).pipe(map(res => res.entities!)))
          }
          return forkJoin(observables).pipe(map(res => res.flat(1)));
        } else {
          return of (listing.entities!)
        }
      }),
      tap(queues => this.queues = queues)
    );
  }

  getQueuesByDivision(divisionId: string, force: boolean = false) {
    if (this.myDivisionQueues.length > 0 && !force) return of(this.myDivisionQueues);

    return this.getQueuesByDivisionPage([divisionId], 0).pipe(
      switchMap(listing => {
        if (listing.pageCount && listing.pageCount > 1) {
          const observables = [
            of(listing.entities!)
          ];
          for (let i = 1; i < listing.pageCount; i++) {
            observables.push(this.getQueuesByDivisionPage([divisionId], i).pipe(map(res => res.entities!)))
          }
          return forkJoin(observables).pipe(map(res => res.flat(1)));
        } else {
          return of (listing.entities!)
        }
      }),
      tap(queues => this.myDivisionQueues = queues)
    );
  }

  queryObservations(queueIds: string[]) {
    const opts: Models.QueueObservationQuery = {
      filter: {
        type: 'and',
        clauses:[
          {
            type: 'or',
            predicates: queueIds.map(queueId => ({
              dimension: 'queueId',
              value: queueId
            }))
          }
        ]
      },
      metrics: ['oWaiting', 'oLongestWaiting']
    };
    return from(this.apiInstance.postAnalyticsQueuesObservationsQuery(opts));
  }


  private getQueuesByDivisionPage(divisionIds: string[], pageNum: number) {
    const opts = {
      divisionId: divisionIds,
      pageSize: 100,
      pageNumber: pageNum
    };
    return from(this.apiInstance.getRoutingQueuesDivisionviews(opts))
  }

  private getQueuesPage(pageNum: number) {
    const opts = {
      pageSize: 100,
      pageNumber: pageNum
    };
    return from(this.apiInstance.getRoutingQueuesDivisionviews(opts))
  }

}
