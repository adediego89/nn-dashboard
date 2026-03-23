import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentsComponent } from '../agents/agents.component';
import { QueuesComponent } from '../queues/queues.component';
import { PanelStatusEnum } from '../../_models';
import { DrawerModule } from 'primeng/drawer';
import { FilterMetadata } from 'primeng/api';
import { NotificationApiService } from '../../_services';

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
  filters: {
    [s: string]: FilterMetadata | FilterMetadata[];
  } = {};
  sortOrder: number = -1;
  private readonly notificationService = inject(NotificationApiService);

  @HostListener('document:visibilitychange')
  visibilitychange() {
    if (!document.hidden) {
      const state = this.notificationService.getSocketState();
      if (state !== 1) {
        console.log(`[Notifications][HealthCheck] Initializing WS`);
        this.notificationService.notificationInitialize();
      }
    }
  }

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
