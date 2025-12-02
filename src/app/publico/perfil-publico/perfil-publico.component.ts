import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UsuariosServicio } from '../../servicios/usuarios.servicio';
import { ProyectosServicio } from '../../servicios/proyectos.servicio';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { AsesoriasServicio } from '../../servicios/asesorias.servicio';
import { Usuario } from '../../modelos/usuario.modelo';
import { Proyecto } from '../../modelos/proyecto.modelo';
import { Asesoria } from '../../modelos/asesoria.modelo';

@Component({
  selector: 'app-perfil-publico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil-publico.component.html',
  styleUrls: ['./perfil-publico.component.scss']
})
export class PerfilPublicoComponent implements OnInit {
  programador: Usuario | null = null;
  proyectos: Proyecto[] = [];
  usuarioActual: Usuario | null = null;

  solicitud: Partial<Asesoria> = {
    motivo: '',
    fechaAsesoria: '',
    horaAsesoria: ''
  };

  private route = inject(ActivatedRoute);
  private usuariosService = inject(UsuariosServicio);
  private proyectosService = inject(ProyectosServicio);
  private authService = inject(AutenticacionServicio);
  private asesoriasService = inject(AsesoriasServicio);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProgramador(id);
      this.cargarProyectos(id);
    }

    this.authService.usuario$.subscribe(u => this.usuarioActual = u);
  }

  cargarProgramador(id: string) {
    this.usuariosService.obtenerUsuarioPorId(id).subscribe(u => this.programador = u || null);
  }

  cargarProyectos(id: string) {
    this.proyectosService.obtenerProyectosPorProgramador(id).subscribe(p => this.proyectos = p);
  }

  async enviarSolicitud() {
    if (!this.usuarioActual || !this.programador) return;

    if (!this.solicitud.motivo || !this.solicitud.fechaAsesoria || !this.solicitud.horaAsesoria) {
      alert('Por favor completa todos los campos de la solicitud.');
      return;
    }

    // Validar disponibilidad
    if (this.programador.disponibilidad) {
      const fecha = new Date(this.solicitud.fechaAsesoria + 'T00:00:00');
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const diaSolicitado = diasSemana[fecha.getDay()];

      if (!this.programador.disponibilidad.dias.includes(diaSolicitado)) {
        alert(`El programador no está disponible los ${diaSolicitado}. Días disponibles: ${this.programador.disponibilidad.dias.join(', ')}.`);
        return;
      }

      const horaInicio = this.programador.disponibilidad.horaInicio;
      const horaFin = this.programador.disponibilidad.horaFin;
      const horaSolicitada = this.solicitud.horaAsesoria;

      if (horaSolicitada < horaInicio || horaSolicitada > horaFin) {
        alert(`La hora solicitada está fuera del horario de atención (${horaInicio} - ${horaFin}).`);
        return;
      }
    }

    try {
      const nuevaAsesoria: Asesoria = {
        idProgramador: this.programador.uid!,
        idUsuario: this.usuarioActual.uid!,
        nombreUsuario: this.usuarioActual.nombre,
        emailUsuario: this.usuarioActual.email,
        motivo: this.solicitud.motivo!,
        fechaAsesoria: this.solicitud.fechaAsesoria!,
        horaAsesoria: this.solicitud.horaAsesoria!,
        estado: 'pendiente',
        fechaSolicitud: new Date()
      };

      await this.asesoriasService.crearSolicitud(nuevaAsesoria);
      alert('Solicitud enviada con éxito.');
      this.solicitud = { motivo: '', fechaAsesoria: '', horaAsesoria: '' };
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert('Error al enviar la solicitud.');
    }
  }
}
