import { Component, inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectItem } from 'primeng/api';
import { FormService } from '../../services/form.service';
import { InitiatorEnum, SystemEnum, TypeEnum } from '../../models';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CreateCaseRequest } from '../../models/create-case-request';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-email-widget-form',
  templateUrl: './form.component.html',
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    CardModule,
    ButtonModule,
    TranslatePipe
  ],
  providers: [FormService]
})
export class FormComponent {
  model = model<CreateCaseRequest>(new CreateCaseRequest())
  typeOpts: SelectItem[] = Object.values(TypeEnum).map(val => ({ label: val, value: val }));
  initiatorOpts: SelectItem[] = Object.values(InitiatorEnum).map(val => ({ label: val, value: val }));
  systemOpts: SelectItem[] = Object.values(SystemEnum).map(val => ({ label: val, value: val }));
  categoryOpts: SelectItem[] = [];

  private readonly formService = inject(FormService);

  onTypeChange(type: TypeEnum) {
    this.categoryOpts = this.formService.getCategoryOpts(type);
  }


}
