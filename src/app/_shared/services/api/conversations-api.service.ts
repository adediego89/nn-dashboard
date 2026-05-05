import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { ConversationsApi, Models } from 'purecloud-platform-client-v2';

@Injectable({providedIn: 'root'})
export class ConversationsApiService {

  private readonly apiInstance = new ConversationsApi();

  monitor(conversationId: string, participantId: string) {
    return from(this.apiInstance.postConversationsCallParticipantMonitor(conversationId, participantId));
  }

  queueConversationsQuery(queueIds: string[]) {

    const opts = {
      order: 'asc',
      filter: {
        type: 'or',
        predicates: queueIds.map(id => ({
          type: 'dimension',
          dimension: 'queueId',
          value: id
        }))
      },
      groupBy:['queueId'],
      metrics: [
        { metric: 'oWaiting', details: true }
      ],
      subscribe: true
    };

    return from(this.apiInstance.postAnalyticsConversationsActivityQuery(opts));
  }

  assignConversation(conversationId: string, userId: string) {
    return from(this.apiInstance.postConversationAssign(conversationId, {
      id: userId
    }));
  }

  getConversationById(conversationId: string) {
    return this.apiInstance.getConversationsEmail(conversationId);
  }

  getEmailMessage(conversationId: string, messageId: string) {
    return this.apiInstance.getConversationsEmailMessage(conversationId, messageId);
  }

  postMessage(conversationId: string, body: Models.EmailMessage) {
    return from(this.apiInstance.postConversationsEmailMessages(conversationId, body))
  }

}
