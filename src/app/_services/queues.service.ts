import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, forkJoin, of } from 'rxjs';
import { QueueStatus, QueueActivityEventBody, ConversationsQueueActivity, MetricCounter } from '../_models';
import { RoutingApiService } from './api/routing-api.service';
import { UsersApiService } from './api/users-api.service';
import { map, switchMap } from 'rxjs/operators';
import { NotificationApiService } from './api/notification-api.service';
import { ConversationsApiService } from './api/conversations-api.service';
import { ClockService } from './clock.service';

@Injectable({providedIn: 'root'})
export class QueuesService {

  $queues = new BehaviorSubject<QueueStatus[]>([]);
  private subExpiration?: number;
  private readonly usersApiSvc = inject(UsersApiService);
  private readonly routingApiSvc = inject(RoutingApiService);
  private readonly notificationsApiSvc = inject(NotificationApiService);
  private readonly conversationsApiSvc = inject(ConversationsApiService);
  private readonly clockSvc = inject(ClockService);

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
        const queueIds = queues.map(queue => queue.id);
        this.addToMonitoring(queueIds);
        this.initializeConversationMonitoring(queueIds);
    });
    this.notificationsApiSvc.$messages
      .pipe(
        filter(message => message.topicName.includes('v2.analytics.queues.') || message.topicName.includes('v2.analytics.conversations.activity.queue')))
      .subscribe(event => {
        const topicSplit = event.topicName.split('.');
        const queues = this.$queues.getValue();
        if (event.topicName.startsWith('v2.analytics.queues.')) {
          const queueId = topicSplit[3];
          const found = queues.find(e => e.id === queueId);
          if (found) {
            const eventBody = event.eventBody as QueueActivityEventBody;
            const metrics = eventBody.results.find(ma => ma.mediaType === 'voice')?.data;
            this.setMetricsToQueue(found, metrics);
          }
        } else if (event.topicName.startsWith('v2.analytics.conversations.activity.queue')) {
          // console.log(event.eventBody);
          const queueId = topicSplit[5];
          const found = queues.find(e => e.id === queueId);
          if (found) {
            const eventBody = event.eventBody as ConversationsQueueActivity;
            this.setMetricsToQueue(found, eventBody.data.filter(e => e.qualifier === 'voice'));
            found.interactions = eventBody.entities ?? [];
          }
        }
        this.$queues.next([...queues]);
      });

    this.clockSvc.now$.subscribe(now => {
      if (!this.subExpiration || this.subExpiration > now + 5000) return;
      console.log('ResetQueueConversationActivitySubscriptions');
      this.subExpiration = undefined;
      const queueIds = this.$queues.getValue().map(queueStatus => queueStatus.id);
      this.initializeConversationMonitoring(queueIds);
    });

  }

  setMetricsToQueue(queue: QueueStatus, metrics?: MetricCounter[]) {
    if (!metrics) return;
    const waiting = metrics.find(m => m.metric === 'oWaiting');
    const longest = metrics.find(m => m.metric === 'oLongestWaiting');
    queue.waiting = waiting?.count ?? 0;
    queue.longest = longest?.calculatedMetricValue ? new Date(longest?.calculatedMetricValue) : undefined;
  }

  addToMonitoring(ids: string[]) {
    this.notificationsApiSvc.addTopics(this.mapTopics(ids));
  }

  initializeConversationMonitoring(queueIds: string[]) {
    // Currently will monitor max 100 items. TODO: change this
    const ids = queueIds.slice(0, 99);

    this.conversationsApiSvc.queueConversationsQuery(ids).subscribe(data => {
      // Initialize queues from data
      const queues = this.$queues.getValue();
      if (data.results) {
        for (const queueData of data.results) {
          const queueId = queueData.group?.['queueId'];
          if (!queueId) return;

          const found = queues.find(e => e.id === queueId);
          if (found && queueData.entities) {
            found.interactions = queueData.entities.filter(e =>e.mediaType === 'voice');
          }
        }
        this.$queues.next([...queues]);
      }
      // For some reason, the response object type does not contain the subscription types so we are forced to cast it to a
      // custom type to avoid errors
      const response = data as any;
      if (response.subscriptionExpirationDate) {
        console.log(`[QueuesService] Subscription renew date: ${response.subscriptionExpirationDate}`);
        this.subExpiration = new Date(response.subscriptionExpirationDate).getTime();
      }
      this.notificationsApiSvc.replaceConversationActivityTopics(response.subscriptions?.map((e: any) => e.topic));
    });
  }

  assignInteraction(conversationId: string) {
    this.conversationsApiSvc.assignConversation(conversationId, this.usersApiSvc.me?.id!).subscribe(res => console.log(res));
  }

  isOnQueue(): boolean {
    return this.usersApiSvc.me?.routingStatus?.status !== undefined && this.usersApiSvc.me?.routingStatus?.status !== 'OFF_QUEUE';
  }

  hasPermission(mediaType: string): boolean {
    let foundPermission;
    switch (mediaType) {
      case 'voice':
        foundPermission = this.usersApiSvc.me?.authorization?.permissions?.find(e => e.startsWith('conversation:call:assign'));
        return !!foundPermission;
      case 'email':
        foundPermission = this.usersApiSvc.me?.authorization?.permissions?.find(e => e.startsWith('conversation:email:assign'));
        return !!foundPermission;
      case 'chat':
        foundPermission = this.usersApiSvc.me?.authorization?.permissions?.find(e => e.startsWith('conversation:message:assign'));
        return !!foundPermission;
      case 'callback':
        foundPermission = this.usersApiSvc.me?.authorization?.permissions?.find(e => e.startsWith('conversation:callback:assign'));
        return !!foundPermission;
      default: return false;
    }
  }

  private mapTopics(ids: string[]): string[] {
    return ids.map(id => `v2.analytics.queues.${id}.activity`);
  }

}
