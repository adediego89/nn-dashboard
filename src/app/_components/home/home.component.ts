import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentsComponent } from '../agents/agents.component';
import { QueuesComponent } from '../queues/queues.component';
import { SplitterModule } from 'primeng/splitter';
import { PanelStatusEnum } from '../../_models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    CommonModule,
    AgentsComponent,
    QueuesComponent,
    SplitterModule
  ]
})
export class HomeComponent {
  queueStatus: PanelStatusEnum = PanelStatusEnum.COLLAPSED;
  agentStatus: PanelStatusEnum = PanelStatusEnum.COLLAPSED;
}
