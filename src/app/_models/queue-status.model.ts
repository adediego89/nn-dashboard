import { Models } from 'purecloud-platform-client-v2';

export class QueueStatus {
  id: string;
  name: string;
  interactions: Models.ConversationActivityEntityData[];
  waiting: number = 0;
  longest?: Date;

  constructor(queue: Models.Queue) {
    this.id = queue.id!;
    this.name = queue.name!;
    this.interactions = [];
  }

}
