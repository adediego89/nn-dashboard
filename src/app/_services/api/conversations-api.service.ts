import { Injectable } from '@angular/core';
import { ConversationsApi } from 'purecloud-platform-client-v2';
import { from } from 'rxjs';

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

}
