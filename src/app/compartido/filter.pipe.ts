import { Pipe, PipeTransform } from '@angular/core';
import { Usuario } from '../modelos/usuario.modelo';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: Usuario[], rol: string): Usuario[] {
    if (!items || !rol) {
      return items;
    }
    return items.filter(item => item.rol === rol);
  }
}
