import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ClockService, QueuesService } from '../../_services';
import { PanelStatusEnum } from '../../_models';
import { CustomTimePipe } from '../../_pipes';

@Component({
  selector: 'app-queues',
  templateUrl: './queues.component.html',
  styleUrl: './queues.component.scss',
  imports: [
    CommonModule,
    TableModule,
    CustomTimePipe
  ]
})
export class QueuesComponent {
  status = input.required<PanelStatusEnum>();
  public readonly queuesSvc = inject(QueuesService);
  public readonly clockSvc = inject(ClockService);
}
