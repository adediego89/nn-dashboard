import { Models } from 'purecloud-platform-client-v2';

export class QueueStatus {
  id: string;
  name: string;
  interactions: QueueInteractions[];
  waiting: number = 0;
  longest?: Date;

  constructor(queue: Models.Queue) {
    this.id = queue.id!;
    this.name = queue.name!;
    this.interactions = [];
  }

}

export interface QueueInteractions {
  ani: string;
  dnis: string;
  direction: string;
  time: string;
}
