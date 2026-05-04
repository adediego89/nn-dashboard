export class CreateCaseRequest {
  processType = 'GENESYS_PROCESS';
  requestId?: string;
  conversationId?: string;
  participantId?: string;
  system?: string;
  category?: string;
  initiator?: string;
  type?: string;
  emailId?: string;
  emailAddress?: string;
  emailDirectoryId?: string;
}
