import { inject, Injectable } from '@angular/core';
import { UsersApiService } from './api/users-api.service';
import { map, switchMap } from 'rxjs/operators';
import { GroupsApiService } from './api/groups-api.service';
import { BehaviorSubject, filter, forkJoin, Observable} from 'rxjs';
import { Models } from 'purecloud-platform-client-v2';
import { NotificationApiService } from './api/notification-api.service';
import { AgentStatus, InteractionStatus } from '../_models';
import { ConversationsApiService } from './api/conversations-api.service';

@Injectable({providedIn: 'root'})
export class AgentsService {

  $agents = new BehaviorSubject<AgentStatus[]>([])
  private readonly usersApiSvc = inject(UsersApiService);
  private readonly groupsApiSvc = inject(GroupsApiService);
  private readonly conversationsApiSvc = inject(ConversationsApiService);
  private readonly notificationsApiSvc = inject(NotificationApiService);

  constructor() {
    this.usersApiSvc.getUserMe()
      .pipe(
        switchMap(me => this.groupsApiSvc.getGroupsByIds(me.groups!.map(e => e.id!))),
        map(groups => groups.map(group => ({
            id: group.id!,
            name: group.name,
            members: this.groupsApiSvc.getMembersById(group.id!)
        }))),
        switchMap(data => {
          let obj: {[K: string]: Observable<Models.UserEntityListing>} = {};
          for (const item of data) {
            obj[item.name] = item.members
          }
          return forkJoin(obj)
        }),
        map(result => {
          const agents: AgentStatus[] = [];
          for (const key of Object.keys(result)) {
            if (!result[key].entities) continue;
            agents.push(...result[key].entities.map(user => new AgentStatus(user, [key])))
          }
          return agents;
        }),
        map(agents => agents.filter(agent => agent.id !== this.usersApiSvc.me?.id)),
        map(agents => agents.reduce<AgentStatus[]>((acc, current) => {
          const found = acc.find(e => e.id === current.id)
          if (found && !current.groups.every(group => found.groups.includes(group))) {
            found.groups.push(...current.groups);
          } else {
            acc.push(current);
          }
          return acc;
        }, []))
      )
      .subscribe(data => {
        this.$agents.next(data);
        this.addAgentsToMonitoring(data.map(user => user.id!))
      });
    this.notificationsApiSvc.$messages
      .pipe(
        filter(message => message.topicName.includes('v2.users.')))
      .subscribe(event => {
        const split = event.topicName.split('.');
        const userId = split[2];
        const type = split[split.length - 1];
        const found = this.$agents.value.find(e => e.id === userId);

        const participants = event.eventBody.participants;
        const userPart = participants?.filter((p: any) => p.purpose === 'agent' || p.purpose === 'user').findLast((p: any) => p.user.id === userId);
        if (found) {
          const foundIntIndex = found.interactions.findIndex(interaction => interaction.id === event.eventBody.id);
          switch (type) {
            case 'presence': found.presence = event.eventBody; break;
            case 'routingStatus': found.routingStatus = event.eventBody.routingStatus; break;
            case 'conversationsummary': found.summary = event.eventBody; console.log('SummaryUpdate', found.summary); break;
            case 'calls':
              console.log('calls message received', foundIntIndex, userPart);
              if (foundIntIndex === -1 && userPart && !userPart.endTime) {
                console.log('calls add');
                found.interactions.push({
                  id: event.eventBody.id,
                  channel: 'voice',
                  direction: userPart.direction,
                  queue: userPart.queue?.id ?? '',
                  startTime: new Date().toISOString(),
                  participantId: userPart.id
                });
              } else if (foundIntIndex > -1 && userPart?.endTime) {
                console.log('calls remove');
                found.interactions.splice(foundIntIndex, 1);
              }
              break;
            case 'emails':
              if (foundIntIndex === -1 && userPart && !userPart.endTime) {
                found.interactions.push({
                  id: event.eventBody.id,
                  channel: 'email',
                  direction: userPart.direction,
                  queue: userPart.queue?.id ?? '',
                  startTime: new Date().toISOString(),
                  participantId: userPart.id
                });
              } else if (foundIntIndex > -1 && userPart?.endTime) {
                found.interactions.splice(foundIntIndex, 1);
              }
              break;
            case 'chats':
              if (foundIntIndex === -1 && userPart && !userPart.endTime) {
                found.interactions.push({
                  id: event.eventBody.id,
                  channel: 'chat',
                  direction: userPart.direction,
                  queue: userPart.queue?.id ?? '',
                  startTime: new Date().toISOString(),
                  participantId: userPart.id
                });
              } else if (foundIntIndex > -1 && userPart?.endTime) {
                found.interactions.splice(foundIntIndex, 1);
              }
              break;
            default: break;
          }
        } else if (userId === this.usersApiSvc.me?.id) {
          if (this.usersApiSvc.me.presence && type === 'presence') {
            this.usersApiSvc.me.presence.modifiedDate = event.eventBody.modifiedDate;
            this.usersApiSvc.me.presence.presenceDefinition = event.eventBody.presenceDefinition;
          }
          if (this.usersApiSvc.me.routingStatus && type === 'routingStatus') {
            this.usersApiSvc.me.routingStatus = event.eventBody;
          }
        }
      });
  }

  getGroupOpts() {
    return this.groupsApiSvc.groups;
  }

  addAgentsToMonitoring(ids: string[]) {
    this.notificationsApiSvc.addTopics(this.mapAgentTopics(ids));
  }

  startMonitoring(cId: string, pId: string) {
    this.conversationsApiSvc.monitor(cId, pId).subscribe();
  }

  showMonitoring(interaction: InteractionStatus): boolean {
    if (interaction.channel !== 'voice') return false;
    const found = this.usersApiSvc.me?.authorization?.permissions?.find(e => e.startsWith('conversation:call:monitor'));
    return !!found;

  }

  private mapAgentTopics(ids: string[]): string[] {
    const topics = ids.map(id => `v2.users.${id}?presence&routingStatus&conversations.calls&conversations.emails&conversations.chats&conversationsummary`);
    if (this.usersApiSvc.me?.id) {
      topics.push(`v2.users.${this.usersApiSvc.me?.id}?presence&routingStatus`);
    }
    return topics;
  }

}
