import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { Models } from 'purecloud-platform-client-v2';
import { PanelStatusEnum, AgentStatus, InteractionStatus } from '../../models';
import { Tooltip } from 'primeng/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { CustomTimePipe, QueueNamePipe, StatusNamePipe } from '../../pipes';
import { AgentsService } from '../../services';
import { ClockService } from '../../../_shared/services';
import { SystemPresenceType } from '../../../_shared/models';


@Component({
  selector: 'app-agents',
  templateUrl: './agents.component.html',
  imports: [
    CommonModule,
    TableModule,
    StatusNamePipe,
    CustomTimePipe,
    Button,
    FormsModule,
    MultiSelectModule,
    QueueNamePipe,
    Tooltip,
    TranslatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentsComponent {
  status = input.required<PanelStatusEnum>();
  queueStatus = input.required<PanelStatusEnum>();
  public readonly agentsSvc = inject(AgentsService);
  public readonly clockSvc = inject(ClockService);
  toggleSidebar = output();
  protected readonly panelStatus = PanelStatusEnum;

  getTagColor (systemPresence: SystemPresenceType) {
    switch (systemPresence.toLowerCase()) {
      case 'available': return '#5ec409';
      case 'idle':
      case 'away':
      case 'training':
      case 'meal':
      case 'break': return '#ffbb33';
      case 'meeting':
      case 'busy': return '#ff0000';
      case 'onqueue':
      case 'on queue':
      case 'on_queue': return '#39b5df';
      case 'offline': return 'gray';
      default: return null;
    }
  }

  getMediaNumber(mediaSummary?: Models.MediaSummary) {
    const enterprise = mediaSummary?.enterprise?.active ?? 0;
    const contactCenter = mediaSummary?.contactCenter?.active ?? 0;
    return enterprise + contactCenter;
  }

  getGroupNames(groupNames: string[]) {
    return groupNames.join(', ');
  }

  getVoiceQueue(agent: AgentStatus): string | undefined {
    const foundVoice = agent.interactions.find(e => e.channel.includes('voice'));
    return foundVoice ? foundVoice.queue : undefined;
  }

  monitor(interaction: InteractionStatus) {
    this.agentsSvc.startMonitoring(interaction.id, interaction.participantId);
  }

}
