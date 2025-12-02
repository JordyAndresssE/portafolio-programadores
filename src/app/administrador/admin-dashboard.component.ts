import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosServicio } from '../servicios/usuarios.servicio';
import { Usuario } from '../modelos/usuario.modelo';
import { FormsModule } from '@angular/forms';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';
import { FilterPipe } from '../compartido/filter.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuarioSeleccionado: Usuario | null = null;
  filtro = '';
  guardando = false;

  private usuariosService = inject(UsuariosServicio);
  private authService = inject(AutenticacionServicio);

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.obtenerTodosLosUsuarios().subscribe(users => {
      this.usuarios = users;
      this.usuariosFiltrados = users;
    });
  }

  filtrarUsuarios() {
    const termino = this.filtro.toLowerCase().trim();
    if (!termino) {
      this.usuariosFiltrados = this.usuarios;
      return;
    }

    this.usuariosFiltrados = this.usuarios.filter(usuario =>
      usuario.nombre.toLowerCase().includes(termino) ||
      usuario.email.toLowerCase().includes(termino) ||
      usuario.rol.toLowerCase().includes(termino)
    );
  }

  editarUsuario(usuario: Usuario) {
    this.usuarioSeleccionado = { ...usuario };
    if (!this.usuarioSeleccionado.redesSociales) {
      this.usuarioSeleccionado.redesSociales = {};
    }
    if (!this.usuarioSeleccionado.tecnologias) {
      this.usuarioSeleccionado.tecnologias = [];
    }
    if (!this.usuarioSeleccionado.disponibilidad) {
      this.usuarioSeleccionado.disponibilidad = {
        dias: [],
        horaInicio: '09:00',
        horaFin: '18:00'
      };
    }
  }

  toggleDia(dia: string) {
    if (!this.usuarioSeleccionado?.disponibilidad) return;

    const dias = this.usuarioSeleccionado.disponibilidad.dias;
    const index = dias.indexOf(dia);

    if (index >= 0) {
      dias.splice(index, 1);
    } else {
      dias.push(dia);
    }
  }

  esDiaSeleccionado(dia: string): boolean {
    return this.usuarioSeleccionado?.disponibilidad?.dias.includes(dia) || false;
  }

  actualizarTecnologias(valor: string) {
    if (this.usuarioSeleccionado) {
      this.usuarioSeleccionado.tecnologias = valor
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
    }
  }

  async guardarCambios() {
    if (this.usuarioSeleccionado) {
      this.guardando = true;
      try {
        await this.usuariosService.actualizarUsuario(this.usuarioSeleccionado);
        this.usuarioSeleccionado = null;
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        alert('Error al guardar cambios');
      } finally {
        this.guardando = false;
      }
    }
  }

  cancelarEdicion() {
    this.usuarioSeleccionado = null;
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
  }
}
