import { inject, Injectable } from '@angular/core';
import { SelectItem } from 'primeng/api';
import {
  TypeEnum,
  CategoryFinanseEnum,
  CategoryReklamacjaEnum,
  CategoryWyplatyEnum,
  CategoryGrupoweBaEnum,
  CategoryPozafinansoweEnum,
  CategoryZmianaDanychEnum,
  CategoryZmianaOblugiEnum,
  CategoryPozctaEnum,
  CategoryOcenaRyzykaEnum,
  CategoryOfeEnum
} from '../models';
import { CreateCaseRequest } from '../models/create-case-request';
import { ConversationsApiService } from '../../_shared/services';
import { Models } from 'purecloud-platform-client-v2';
import { EMAIL_API_ADDRESS, EMAIL_FORWARDING_ADDRESS } from '../../_shared/models';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class FormService {

  private readonly conversationsApiService = inject(ConversationsApiService);
  private readonly http = inject(HttpClient)

  getCategoryOpts(type: TypeEnum): SelectItem[] {
    switch (type) {
      case TypeEnum.FINANSE: return Object.values(CategoryFinanseEnum).map(val => ({ label: val, value: val }));
      case TypeEnum.REKLAMACJA: return Object.values(CategoryReklamacjaEnum).map(val => ({ label: val, value: val }));
      case TypeEnum.WYPLATY: return Object.values(CategoryWyplatyEnum).map(val => ({ label: val, value: val }));
      case TypeEnum.GRUPOWE_BA: return Object.values(CategoryGrupoweBaEnum).map(val => ({ label: val, value: val }));
      case TypeEnum.POZAFINANSOWE: return Object.values(CategoryPozafinansoweEnum).map(val => ({ label: val, value: val }));
      case TypeEnum.ZMIANA_DANYCH: return Object.values(CategoryZmianaDanychEnum).map(val => ({ label: val, value: val }));
      case TypeEnum.ZMIANA_OBSLUGI: return Object.values(CategoryZmianaOblugiEnum).map(val => ({ label: val, value: val }));
      case TypeEnum.POCZTA: return Object.values(CategoryPozctaEnum).map(val => ({ label: val, value: val }));
      case TypeEnum.OCENA_RYZYKA: return Object.values(CategoryOcenaRyzykaEnum).map(val => ({ label: val, value: val }));
      case TypeEnum.OFE: return Object.values(CategoryOfeEnum).map(val => ({ label: val, value: val }));
      default: return [];
    }
  }

  createCase(caseRequest: CreateCaseRequest) {
    const hostAddr = sessionStorage.getItem(EMAIL_API_ADDRESS) ?? '';
    // TODO: caseRequest.ToDto() once we clarify the details due to the Message-ID header problem
    return this.http.post(`${hostAddr}/api/v1/genesys/pega`, caseRequest);
    // return this.http.post(`${hostAddr}/api/v1/genesys/backoffice-cases`, caseRequest);
  }

  forwardEmail(conversationId: string, message: Models.EmailMessage){

    let fwdMessage: Models.EmailMessage = {...message};
    delete fwdMessage.id;
    delete fwdMessage.state;
    delete fwdMessage.time;
    delete fwdMessage.selfUri;

    const fwdAddress = sessionStorage.getItem(EMAIL_FORWARDING_ADDRESS) ?? '';
    fwdMessage.to = [{ email: fwdAddress }]
    fwdMessage.subject = `Fwd: ${message.subject}`;

    return this.conversationsApiService.postMessage(conversationId, fwdMessage);
  }

}
