import { Injectable } from '@angular/core';
import { ConversationsApi } from 'purecloud-platform-client-v2';
import { from } from 'rxjs';

@Injectable({providedIn: 'root'})
export class ConversationsApiService {

  private readonly apiInstance = new ConversationsApi();

  monitor(conversationId: string, participantId: string) {
    return from(this.apiInstance.postConversationsCallParticipantMonitor(conversationId, participantId));
  }

}
