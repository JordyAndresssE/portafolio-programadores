import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuariosBackendServicio } from '../../servicios/usuarios-backend.servicio';
import { Usuario } from '../../modelos/usuario.modelo';
import { convertirUsuario } from '../../utils/convertidores';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {
  programadores: Usuario[] = [];
  programadoresFiltrados: Usuario[] = [];
  terminoBusqueda = '';
  cargando = true;
  error: string | null = null;

  private usuariosBackend = inject(UsuariosBackendServicio);
  private router = inject(Router);

  ngOnInit() {
    this.cargarProgramadores();
  }

  cargarProgramadores() {
    this.cargando = true;
    this.error = null;

    this.usuariosBackend.obtenerProgramadores().subscribe({
      next: (programadores) => {
        // Convertir tecnologias de string a array usando helper
        this.programadores = programadores.map(prog => convertirUsuario(prog));
        this.programadoresFiltrados = this.programadores;
        this.cargando = false;
        console.log('Programadores cargados:', this.programadores);
      },
      error: (err) => {
        console.error('Error al cargar programadores:', err);
        this.error = 'Error al cargar los programadores. Verifica que el backend esté corriendo.';
        this.cargando = false;
      }
    });
  }

  filtrarProgramadores() {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    if (!termino) {
      this.programadoresFiltrados = this.programadores;
      return;
    }

    this.programadoresFiltrados = this.programadores.filter(dev => {
      const nombre = dev.nombre?.toLowerCase() || '';
      const especialidad = dev.especialidad?.toLowerCase() || '';

      // Manejar tecnologias como array
      const tecnologias = Array.isArray(dev.tecnologias)
        ? dev.tecnologias.join(' ').toLowerCase()
        : '';

      return nombre.includes(termino) ||
        especialidad.includes(termino) ||
        tecnologias.includes(termino);
    });
  }

  verPerfil(uid: string) {
    this.router.navigate(['/perfil', uid]);
  }
}
