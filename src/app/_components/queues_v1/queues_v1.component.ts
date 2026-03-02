import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { ClockService, QueuesService } from '../../_services';
import { PanelStatusEnum } from '../../_models';
import { CustomTimePipe } from '../../_pipes';

@Component({
  selector: 'app-queues_v1',
  templateUrl: './queues_v1.component.html',
  styleUrl: './queues_v1.component.scss',
  imports: [
    CommonModule,
    TableModule,
    Button,
    Ripple,
    CustomTimePipe
  ]
})
export class Queues_v1Component {
  status = input.required<PanelStatusEnum>();
  public readonly queuesSvc = inject(QueuesService);
  public readonly clockSvc = inject(ClockService);
}
