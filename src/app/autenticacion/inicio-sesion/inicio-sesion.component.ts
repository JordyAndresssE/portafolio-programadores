import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { SeleccionRolModalComponent } from '../../compartido/seleccion-rol-modal/seleccion-rol-modal.component';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, SeleccionRolModalComponent],
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.scss']
})
export class InicioSesionComponent {
  cargando = false;
  mostrarModalRol = false;
  private authService = inject(AutenticacionServicio);

  async login() {
    this.cargando = true;
    try {
      const esNuevoUsuario = await this.authService.iniciarSesionGoogle();

      // Si es un nuevo usuario, mostrar el modal de selección de rol
      if (esNuevoUsuario) {
        this.mostrarModalRol = true;
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    } finally {
      this.cargando = false;
    }
  }

  async onRolSeleccionado(rol: 'programador' | 'usuario') {
    this.mostrarModalRol = false;
    this.cargando = true;

    try {
      await this.authService.establecerRolYRedirigir(rol);
    } catch (error) {
      console.error('Error al establecer el rol:', error);
    } finally {
      this.cargando = false;
    }
  }
}
