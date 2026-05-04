import { Injectable } from '@angular/core';
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

@Injectable()
export class FormService {

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

}
