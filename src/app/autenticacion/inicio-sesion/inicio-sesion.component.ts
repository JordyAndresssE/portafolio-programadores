import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio-sesion.component.html',
  styleUrls: ['./inicio-sesion.component.scss']
})
export class InicioSesionComponent {
  cargando = false;
  private authService = inject(AutenticacionServicio);

  async login() {
    this.cargando = true;
    try {
      await this.authService.iniciarSesionGoogle();
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    } finally {
      this.cargando = false;
    }
  }
}
