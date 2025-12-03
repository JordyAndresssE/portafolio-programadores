import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-seleccion-rol-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './seleccion-rol-modal.component.html',
    styleUrls: ['./seleccion-rol-modal.component.scss']
})
export class SeleccionRolModalComponent {
    @Output() rolSeleccionado = new EventEmitter<'programador' | 'usuario'>();

    seleccionarRol(rol: 'programador' | 'usuario') {
        this.rolSeleccionado.emit(rol);
    }
}
