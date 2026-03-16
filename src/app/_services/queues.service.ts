import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, forkJoin, of } from 'rxjs';
import { QueueStatus, QueueActivityEventBody } from '../_models';
import { RoutingApiService } from './api/routing-api.service';
import { UsersApiService } from './api/users-api.service';
import { map, switchMap } from 'rxjs/operators';
import { NotificationApiService } from './api/notification-api.service';

@Injectable({providedIn: 'root'})
export class QueuesService {

  $queues = new BehaviorSubject<QueueStatus[]>([]);
  private readonly usersApiSvc = inject(UsersApiService);
  private readonly routingApiSvc = inject(RoutingApiService);
  private readonly notificationsApiSvc = inject(NotificationApiService);

  constructor() {
    this.usersApiSvc.getUserMe()
      .pipe(
        switchMap(me => this.routingApiSvc.getQueuesByDivision(me.division?.id!)),
        map(queues => queues.map(queue => new QueueStatus(queue))),
        switchMap(data => forkJoin([of(data),this.routingApiSvc.queryObservations(data.map(queue => queue.id))]))
      ).subscribe(result => {
        const queues = result[0];
        const data = result[1];
        data.results?.filter(data => data.group && data.group['mediaType'] === 'voice').forEach(data => {
          const found = queues.find(e => data.group && e.id === data.group['queueId']);
          if (found) {
            const waiting = data.data?.find(m => m.metric === 'oWaiting');
            const longest = data.data?.find(m => m.metric === 'oLongestWaiting');
            found.waiting = waiting?.stats?.count ?? 0;
            found.longest = longest?.stats?.calculatedMetricValue ? new Date(longest?.stats?.calculatedMetricValue) : undefined;
          }
        });
        this.$queues.next(queues);
        this.addToMonitoring(queues.map(queue => queue.id))
    });
    this.notificationsApiSvc.$messages
      .pipe(
        filter(message => message.topicName.includes('v2.analytics.queues.')))
      .subscribe(event => {
        const split = event.topicName.split('.');
        const queueId = split[3];
        const queues = this.$queues.getValue();
        const found = queues.find(e => e.id === queueId);
        if (found) {
          const eventBody = event.eventBody as QueueActivityEventBody;
          const metrics = eventBody.results.find(ma => ma.mediaType === 'voice')?.data;
          if (!metrics) return;
          const waiting = metrics.find(m => m.metric === 'oWaiting');
          const longest = metrics.find(m => m.metric === 'oLongestWaiting');
          found.waiting = waiting?.count ?? 0;
          found.longest = longest?.calculatedMetricValue ? new Date(longest?.calculatedMetricValue) : undefined;
          this.$queues.next([...queues]);
          console.log(this.$queues.getValue().length);
        }
      });


  }

  addToMonitoring(ids: string[]) {
    this.notificationsApiSvc.addTopics(this.mapTopics(ids));
  }

  private mapTopics(ids: string[]): string[] {
    return ids.map(id => `v2.analytics.queues.${id}.activity`);
  }

}
