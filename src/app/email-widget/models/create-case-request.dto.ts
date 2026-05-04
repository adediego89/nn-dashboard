export interface CreateCaseRequestDto {
  processType?: 'GENESYS_PROCESS';
  requestId: string;
  conversationId: string;
  participantId: string;
  system?: string;
  category: string;
  initiator: string;
  type: string;
  email: {
    id: string;
    address: string;
    directoryId: string;
  };
  agreement?: {
    type: 'POLICY' | 'ACCESSION' | 'POLICY_LINE';
    number: string;
  }
}
