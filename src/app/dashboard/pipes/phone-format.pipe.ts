import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
})
export class PhoneFormatPipe implements PipeTransform {

  transform(value?: string): string {
    if (!value) return '';
    return value.startsWith('tel:') ? value.slice(4) : value;
  }


}
