import { Component, inject, resource, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationsApiService } from '../../../_shared/services';
import { CONVERSATION_KEY } from '../../../_shared/models';
import { FormComponent } from '../form/form.component';


@Component({
  selector: 'app-email-widget-home',
  templateUrl: './home.component.html',
  imports: [
    CommonModule,
    FormComponent
  ],
  providers:[]
})
export class HomeComponent {

  conversationId: Signal<string>;
  conversationResource = resource({
    params: () => ({cId: this.conversationId}),
    loader: ({params}) => this.fetchConversation(params.cId())
  });
  messageResource = resource({
    params: () => {
      const conversation = this.conversationResource.value();
      const customerPart = conversation?.participants?.find(part => part.purpose === 'customer');
      return {
        cId: conversation?.id,
        mId: customerPart?.messageId
      };
    },
    loader: ({params}) => {
      if (!params.cId || !params.mId) return Promise.reject(new Error('No cId or mId params found'));
      return this.fetchMessage(params.cId, params.mId);
    }
  });

  private readonly conversationsService = inject(ConversationsApiService);

  constructor() {
    this.conversationId = signal(sessionStorage.getItem(CONVERSATION_KEY) ?? '')
  }

  fetchConversation(id: string) {
    return this.conversationsService.getConversationById(id);
  }

  fetchMessage(conversationId: string, messageId: string) {
    return this.conversationsService.getEmailMessage(conversationId, messageId);
  }

}
