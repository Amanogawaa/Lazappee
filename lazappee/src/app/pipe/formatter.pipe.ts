import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatter',
  standalone: true,
})
export class FormatterPipe implements PipeTransform {
  transform(value: number | string, ...args: any[]): string {
    if (value === null || value === undefined) {
      return '';
    }

    const numberValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numberValue)) {
      return value.toString();
    }

    return new Intl.NumberFormat('en-US').format(numberValue);
  }
}
