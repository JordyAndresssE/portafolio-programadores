import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuariosServicio } from '../../servicios/usuarios.servicio';
import { Usuario } from '../../modelos/usuario.modelo';

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

  private usuariosService = inject(UsuariosServicio);
  private router = inject(Router);

  ngOnInit() {
    this.usuariosService.obtenerTodosLosUsuarios().subscribe(usuarios => {
      this.programadores = usuarios.filter(u => u.rol === 'programador');
      this.programadoresFiltrados = this.programadores;
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
      const tecnologias = dev.tecnologias?.join(' ').toLowerCase() || '';

      return nombre.includes(termino) ||
        especialidad.includes(termino) ||
        tecnologias.includes(termino);
    });
  }

  verPerfil(uid: string) {
    this.router.navigate(['/perfil', uid]);
  }
}
