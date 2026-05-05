import { v4 as uuidv4 } from "uuid";

export class CreateCaseRequest {
  processType = 'GENESYS_PROCESS';
  requestId: string;
  conversationId: string;
  participantId: string;
  system?: string;
  category?: string;
  initiator?: string;
  type?: string;
  emailId?: string;
  emailAddress?: string;
  emailDirectoryId?: string;

  constructor(cId: string, pId: string) {
    this.requestId = uuidv4();
    this.conversationId = cId;
    this.participantId = pId;
  }

}
