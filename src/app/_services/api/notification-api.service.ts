import { inject, Injectable } from '@angular/core';
import { Models, NotificationsApi } from 'purecloud-platform-client-v2';
import { catchError, from, Observable, Subject, Subscriber, Subscription, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth.service';

interface NotificationEvent {
  eventBody: any;
  metadata: any;
  topicName: string;
  version: string;
}

@Injectable({providedIn: 'root'})
export class NotificationApiService {

  static readonly CONVERSATIONS_ACTIVITY_TOPIC = 'v2.analytics.conversations.activity.queue';

  private readonly apiInstance = new NotificationsApi();
  private ws?: WebSocket;
  private topics: string[] = [];
  private channel?: Models.Channel;
  private readonly authService = inject(AuthService);
  $messages = new Subject<NotificationEvent>();
  private notificationsSub?: Subscription;

  constructor() {
    this.notificationInitialize();
  }

  getSocketState(){
    return this.ws?.readyState;
  }

  notificationInitialize() {

    if (this.notificationsSub) {
      this.notificationsSub.unsubscribe();
    }

    this.notificationsSub = this.createNotificationChannel()
      .pipe(
        tap(channel => this.channel = channel),
        switchMap(() => this.updateNotificationSubscriptions()),
        switchMap(() => this.create(this.channel?.connectUri!)),
        map(messageEvent => JSON.parse(messageEvent.data)))
      .subscribe(data => {
        console.log(`[NotificationApi][Message]`, data);
        this.$messages.next(data);
      });
  }

  addTopics(topics: string[]) {
    for (const topic of topics) {
      if (!this.topics.includes(topic)) {
        this.topics.push(topic)
      }
    }
    this.updateNotificationSubscriptions();
  }

  removeTopics(topics: string[]) {
    this.topics = this.topics.filter(topic => !topics.includes(topic))
  }

  replaceConversationActivityTopics(topics: string[]) {
    this.topics = this.topics.filter(topic => !topic.startsWith(NotificationApiService.CONVERSATIONS_ACTIVITY_TOPIC));
    this.addTopics(topics);
  }

  private createNotificationChannel() {
    return from(this.apiInstance.postNotificationsChannels()).pipe(catchError((err) => {
      if (err.status === 401) {
        this.authService.doAuth();
      } else {
        console.error(err);
      }
      throw new Error('Error creating notification channel');
    }));
  }

  private updateNotificationSubscriptions() {
    if (!this.channel?.id) throw new Error(`No channel found.`);

    return from(this.apiInstance.putNotificationsChannelSubscriptions(
      this.channel.id,
      this.topics.map(topic => ({ id: topic})))
    ).pipe(
      catchError((err) => {
        if (err.status === 401) {
          this.authService.doAuth();
        } else {
          console.error(err);
        }
        throw new Error('Error setting notification subscription');
      }));
  }

  private create(url: string): Observable<MessageEvent> {
    this.ws = new WebSocket(url);
    return new Observable((observer: Subscriber<MessageEvent>) => {
      this.ws!.onmessage = observer.next.bind(observer);
      this.ws!.onerror = observer.error.bind(observer);
      this.ws!.onclose = observer.complete.bind(observer);
      return this.ws!.close.bind(this.ws);
    });
  }

}


