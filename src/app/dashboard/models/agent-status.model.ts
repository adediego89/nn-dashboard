import { Models } from 'purecloud-platform-client-v2';

export class AgentStatus {
  id?: string;
  name?: string;
  email?: string;
  groups: string[]; // Maybe should be list of id + groupName objects
  presence?: Models.UserPresence;
  routingStatus?: Models.RoutingStatus;
  summary?: Models.UserConversationSummary;
  interactions: InteractionStatus[];

  constructor(user: Models.User, groups: string[]) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.groups = groups;
    this.presence = user.presence;
    this.routingStatus = user.routingStatus;
    this.summary = user.conversationSummary;
    this.interactions = [];
  }

}

export type StatusDefinitionType = 'System' | 'User';

export interface InteractionStatus {
  id: string;
  channel: string;
  direction: string;
  queue: string;
  startTime: string;
  participantId: string;
}
