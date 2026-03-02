import { inject, Injectable } from '@angular/core';
import { Models, NotificationsApi } from 'purecloud-platform-client-v2';
import { catchError, from, Observable, Subject, Subscriber, switchMap, tap } from 'rxjs';
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

  private readonly apiInstance = new NotificationsApi();
  private ws?: WebSocket;
  private topics: string[] = [];
  private channel?: Models.Channel;
  private readonly authService = inject(AuthService);
  $messages = new Subject<NotificationEvent>();

  constructor() {
    this.createNotificationChannel()
      .pipe(
        tap(channel => this.channel = channel),
        switchMap(channel => this.create(channel.connectUri!)),
        map(messageEvent => JSON.parse(messageEvent.data)))
      .subscribe(data => {
        console.log(`[NotificationApi][Message]`, data);
        this.$messages.next(data);
    });
  }

  getSocketState(){
    return this.ws?.readyState;
  }

  // notificationStart(topics: string[]) {
  //   this.topics = topics;
  //   return this.createNotificationChannel().pipe(
  //     switchMap(channel => this.setNotificationSubscriptions(channel)),
  //     switchMap(channel => this.create(channel.connectUri!)),
  //     map(messageEvent => JSON.parse(messageEvent.data)),
  //     filter(eventData => this.topics.includes(eventData.topicName)),
  //     map(eventData => eventData.eventBody)
  //   );
  // }

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


