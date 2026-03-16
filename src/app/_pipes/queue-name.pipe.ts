import { Pipe, PipeTransform, inject } from '@angular/core';
import { RoutingApiService } from '../_services/api/routing-api.service';

@Pipe({
  name: 'queueName',
})
export class QueueNamePipe implements PipeTransform {

  private readonly routingApiService = inject(RoutingApiService);

  transform(value?: string): string {
    if (!value) return '-';
    const found = this.routingApiService.queues.find(e => e.id === value);
    return found?.name ? found.name : value;
  }


}
