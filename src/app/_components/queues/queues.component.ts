import { Component, inject, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ClockService, QueuesService } from '../../_services';
import { PanelStatusEnum } from '../../_models';
import { CustomTimePipe } from '../../_pipes';
import { Button } from 'primeng/button';
import { PhoneFormatPipe } from '../../_pipes/phone-format.pipe';
import { Models } from 'purecloud-platform-client-v2';
import { FilterMetadata } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-queues',
  templateUrl: './queues.component.html',
  styleUrl: './queues.component.scss',
  imports: [
    CommonModule,
    TableModule,
    CustomTimePipe,
    Button,
    PhoneFormatPipe,
    Tooltip,
    TranslatePipe
  ]
})
export class QueuesComponent {
  status = input.required<PanelStatusEnum>();
  public readonly queuesSvc = inject(QueuesService);
  public readonly clockSvc = inject(ClockService);
  toggleStatus = output();
  filters = model.required<{
    [s: string]: FilterMetadata | FilterMetadata[];
  }>();
  sortOrder = model.required<number>();


  protected readonly PanelStatusEnum = PanelStatusEnum;
  private readonly service = inject(QueuesService);

  onFilter(event: any) {
    if (JSON.stringify(this.filters()) !== JSON.stringify(event.filters)) {
      this.filters.set(event.filters);
    }
  }

  onSort(event: any) {
    if (this.sortOrder() !== event.order) {
      this.sortOrder.set(event.order);
    }
  }

  hasPermission(mediaType: string): boolean {
    return this.service.hasPermission(mediaType);
  }

  isOnQueue(): boolean {
    return this.service.isOnQueue();
  }

  assignToMe(interaction: Models.ConversationActivityEntityData) {
    if (!interaction.conversationId) return;
    this.service.assignInteraction(interaction.conversationId);
  }

}
