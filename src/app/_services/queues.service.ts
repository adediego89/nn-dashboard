import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';
import { QueueStatus } from '../_models/queue-status.model';
import { RoutingApiService } from './api/routing-api.service';
import { UsersApiService } from './api/users-api.service';
import { map, switchMap } from 'rxjs/operators';
import { NotificationApiService } from './api/notification-api.service';
import { QueueActivityEventBody } from '../_models/notification-events.interface';

@Injectable({providedIn: 'root'})
export class QueuesService {

  $queues = new BehaviorSubject<QueueStatus[]>([]);
  private readonly usersApiSvc = inject(UsersApiService);
  private readonly routingApiSvc = inject(RoutingApiService);
  private readonly notificationsApiSvc = inject(NotificationApiService);

  constructor() {
    this.usersApiSvc.getUserMe()
      .pipe(
        switchMap(me => this.routingApiSvc.getAllQueues(me.division?.id!)),
        map(queues => queues.map(queue => new QueueStatus(queue)))
      ).subscribe(data => {
        this.$queues.next(data);
        this.addToMonitoring(data.map(queue => queue.id))
    });
    this.notificationsApiSvc.$messages
      .pipe(
        filter(message => message.topicName.includes('v2.analytics.queues.')))
      .subscribe(event => {
        const split = event.topicName.split('.');
        const queueId = split[3];
        const found = this.$queues.value.find(e => e.id === queueId);
        if (found) {
          const eventBody = event.eventBody as QueueActivityEventBody;
          const metrics = eventBody.results.find(ma => ma.mediaType === 'voice')?.data;
          if (!metrics) return;
          const waiting = metrics.find(m => m.metric === 'oWaiting');
          const longest = metrics.find(m => m.metric === 'oLongestWaiting');
          found.waiting = waiting?.count ?? 0;
          found.longest = longest?.calculatedMetricValue ? new Date(longest?.calculatedMetricValue) : undefined;
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
