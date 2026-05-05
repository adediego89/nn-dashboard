import { Component, inject, input, linkedSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectItem } from 'primeng/api';
import { FormService } from '../../services/form.service';
import { InitiatorEnum, SystemEnum, TypeEnum } from '../../models';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CreateCaseRequest } from '../../models/create-case-request';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { Models } from 'purecloud-platform-client-v2';

@Component({
  selector: 'app-email-widget-form',
  templateUrl: './form.component.html',
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    ButtonModule,
    TranslatePipe
  ],
  providers: [FormService]
})
export class FormComponent {
  conversationId = input.required<string>();
  customerParticipant = input.required<Models.EmailMediaParticipant>();
  message = input.required<Models.EmailMessage>();
  model = linkedSignal(() => {
    return new CreateCaseRequest(this.conversationId(), this.customerParticipant().id ?? '');
  });
  typeOpts: SelectItem[] = Object.values(TypeEnum).map(val => ({ label: val, value: val }));
  initiatorOpts: SelectItem[] = Object.values(InitiatorEnum).map(val => ({ label: val, value: val }));
  systemOpts: SelectItem[] = Object.values(SystemEnum).map(val => ({ label: val, value: val }));
  categoryOpts: SelectItem[] = [];

  private readonly formService = inject(FormService);

  onTypeChange(type: TypeEnum) {
    this.categoryOpts = this.formService.getCategoryOpts(type);
  }

  execute() {

    // TODO: Send request to NN API
    // Forward email to address
    this.formService.forwardEmail(this.conversationId(), this.message()).subscribe(data => console.log(data));
  }

}
