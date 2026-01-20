import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UsuariosBackendServicio } from '../../servicios/usuarios-backend.servicio';
import { ProyectosBackendServicio } from '../../servicios/proyectos-backend.servicio';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { AsesoriasBackendServicio } from '../../servicios/asesorias-backend.servicio';
import { EmailServicio } from '../../servicios/email.servicio';
import { Usuario } from '../../modelos/usuario.modelo';
import { Proyecto } from '../../modelos/proyecto.modelo';
import { Asesoria } from '../../modelos/asesoria.modelo';
import { convertirUsuario, convertirProyecto } from '../../utils/convertidores';

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
  private usuariosBackend = inject(UsuariosBackendServicio);
  private proyectosBackend = inject(ProyectosBackendServicio);
  private authService = inject(AutenticacionServicio);
  private asesoriasBackend = inject(AsesoriasBackendServicio);
  private emailService = inject(EmailServicio);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProgramador(id);
      this.cargarProyectos(id);
    }

    this.authService.usuario$.subscribe(u => this.usuarioActual = u);
  }

  cargarProgramador(id: string) {
    this.usuariosBackend.obtenerUsuarioPorId(id).subscribe({
      next: (u) => {
        this.programador = u ? convertirUsuario(u) : null;
      },
      error: (err) => console.error('Error al cargar programador:', err)
    });
  }

  cargarProyectos(id: string) {
    this.proyectosBackend.obtenerProyectosPorProgramador(id).subscribe({
      next: (proyectos) => {
        this.proyectos = proyectos.map(p => convertirProyecto(p));
      },
      error: (err) => console.error('Error al cargar proyectos:', err)
    });
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

      // Verificar si usa el nuevo sistema de horarios personalizados
      if (this.programador.disponibilidad.horariosPorDia) {
        const horarioDia = this.programador.disponibilidad.horariosPorDia[diaSolicitado];

        if (!horarioDia || !horarioDia.activo) {
          alert(`El programador no está disponible los ${diaSolicitado}.`);
          return;
        }

        const horaSolicitada = this.solicitud.horaAsesoria;
        if (horaSolicitada < horarioDia.horaInicio || horaSolicitada > horarioDia.horaFin) {
          alert(`La hora solicitada está fuera del horario de atención para ${diaSolicitado} (${horarioDia.horaInicio} - ${horarioDia.horaFin}).`);
          return;
        }
      }
      // Sistema antiguo (compatibilidad)
      else if (this.programador.disponibilidad.dias && this.programador.disponibilidad.dias.length > 0) {
        if (!this.programador.disponibilidad.dias.includes(diaSolicitado)) {
          alert(`El programador no está disponible los ${diaSolicitado}. Días disponibles: ${this.programador.disponibilidad.dias.join(', ')}.`);
          return;
        }

        const horaInicio = this.programador.disponibilidad.horaInicio;
        const horaFin = this.programador.disponibilidad.horaFin;
        const horaSolicitada = this.solicitud.horaAsesoria;

        if (horaInicio && horaFin && (horaSolicitada < horaInicio || horaSolicitada > horaFin)) {
          alert(`La hora solicitada está fuera del horario de atención (${horaInicio} - ${horaFin}).`);
          return;
        }
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

      await this.asesoriasBackend.crearAsesoria(nuevaAsesoria).toPromise();

      // Enviar notificación por correo
      await this.emailService.enviarNotificacionAsesoria(
        this.programador.email,
        this.programador.nombre,
        this.usuarioActual.nombre,
        this.solicitud.fechaAsesoria!,
        this.solicitud.horaAsesoria!,
        this.solicitud.motivo!
      );

      alert('Solicitud enviada con éxito.');
      this.solicitud = { motivo: '', fechaAsesoria: '', horaAsesoria: '' };
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert('Error al enviar la solicitud.');
    }
  }
}
