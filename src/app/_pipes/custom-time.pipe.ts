import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customTime',
  pure: true
})
export class CustomTimePipe implements PipeTransform {
  transform(startDate: string | undefined, now: number| undefined | null): string {
    if (!startDate || !now) return '-';
    const diffMs = Math.max(now - new Date(startDate).getTime(), 0);
    const totalSeconds = Math.floor(diffMs / 1000);
    return this.processSeconds(totalSeconds);
  }

  private processSeconds(value: number): string {
    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');

    return days > 0
      ? `${days} days`
      : `${hh}:${mm}:${ss}`;
  }
}
