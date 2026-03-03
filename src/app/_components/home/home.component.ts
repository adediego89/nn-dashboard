import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentsComponent } from '../agents/agents.component';
import { QueuesComponent } from '../queues/queues.component';
import { PanelStatusEnum } from '../../_models';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    CommonModule,
    AgentsComponent,
    QueuesComponent,
    DrawerModule,
  ]
})
export class HomeComponent {
  queueStatus: PanelStatusEnum = PanelStatusEnum.MINIMIZED;
  agentStatus: PanelStatusEnum = PanelStatusEnum.EXPANDED;
  isVisible = false;
  protected readonly panelStatus = PanelStatusEnum;

  toggleSidebar() {
    this.isVisible = !this.isVisible;
  }

  toggleQueueStatus() {
    if (this.queueStatus === PanelStatusEnum.COLLAPSED) {
      this.isVisible = false;
      this.queueStatus = PanelStatusEnum.MINIMIZED;
    } else {
      this.queueStatus = PanelStatusEnum.COLLAPSED;
    }
  }
}
