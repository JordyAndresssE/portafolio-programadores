import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';
import { ProyectosBackendServicio } from '../servicios/proyectos-backend.servicio';
import { UsuariosBackendServicio } from '../servicios/usuarios-backend.servicio';
import { AsesoriasBackendServicio } from '../servicios/asesorias-backend.servicio';
import { NotificacionesFastAPIServicio } from '../servicios/notificaciones-fastapi.servicio';
import { Proyecto } from '../modelos/proyecto.modelo';
import { Usuario } from '../modelos/usuario.modelo';
import { Asesoria } from '../modelos/asesoria.modelo';
import { convertirProyecto } from '../utils/convertidores';
import { convertirUsuarioABackend } from '../utils/usuario-dto.converter';

@Component({
  selector: 'app-panel-programador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-programador.component.html',
  styleUrls: ['./panel-programador.component.scss']
})
export class PanelProgramadorComponent implements OnInit {
  usuario: Usuario | null = null;
  proyectos: Proyecto[] = [];
  asesorias: Asesoria[] = [];
  seccionActiva: 'proyectos' | 'perfil' | 'asesorias' = 'proyectos';

  // Estados de carga
  cargandoProyectos = true;
  cargandoAsesorias = true;

  // Perfil
  perfilForm: Usuario | null = null;

  // Modal y Formulario Proyecto
  mostrarModalProyecto = false;
  proyectoEditando: Proyecto | null = null;
  tecnologiasInput = '';

  proyectoForm: Partial<Proyecto> = {
    nombre: '',
    descripcion: '',
    tipo: 'academico',
    participacion: 'Fullstack',
    tecnologias: [],
    repoUrl: '',
    demoUrl: ''
  };

  private authService = inject(AutenticacionServicio);
  private proyectosBackend = inject(ProyectosBackendServicio);
  private usuariosBackend = inject(UsuariosBackendServicio);
  private asesoriasBackend = inject(AsesoriasBackendServicio);
  private notificacionesService = inject(NotificacionesFastAPIServicio);

  ngOnInit() {
    this.authService.usuario$.subscribe(u => {
      this.usuario = u;
      if (u) {
        // Clonamos el usuario para el formulario de perfil
        this.perfilForm = JSON.parse(JSON.stringify(u));
        // Aseguramos que exista el objeto redesSociales
        if (!this.perfilForm!.redesSociales) {
          this.perfilForm!.redesSociales = {};
        }
        // Cargar asesorías
        this.cargarAsesorias();
      }
    });
    this.cargarProyectos();
  }

  cargarProyectos() {
    if (!this.usuario?.uid) return;

    this.cargandoProyectos = true;
    this.proyectosBackend.obtenerProyectosPorProgramador(this.usuario.uid).subscribe({
      next: (p) => {
        // Convertir tecnologias de string a array
        this.proyectos = p.map(proyecto => convertirProyecto(proyecto));
        this.cargandoProyectos = false;
      },
      error: (error) => {
        console.error('Error al cargar proyectos:', error);
        this.cargandoProyectos = false;
      }
    });
  }

  cargarAsesorias() {
    if (this.usuario?.uid) {
      this.cargandoAsesorias = true;
      this.asesoriasBackend.obtenerAsesoriasPorProgramador(this.usuario.uid).subscribe({
        next: (a) => {
          this.asesorias = a;
          this.cargandoAsesorias = false;
        },
        error: (error) => {
          console.error('Error al cargar asesorías:', error);
          this.cargandoAsesorias = false;
        }
      });
    }
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
  }

  // Helper para convertir Timestamp de Firebase a Date
  convertirTimestamp(timestamp: any): Date {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return timestamp;
  }

  // --- Lógica de Asesorías ---
  async responderAsesoria(asesoria: Asesoria, estado: 'aprobada' | 'rechazada') {
    const mensaje = prompt(`Mensaje opcional para ${estado === 'aprobada' ? 'aprobar' : 'rechazar'} la solicitud:`);
    if (mensaje !== null) {
      try {
        // Actualizar estado en Jakarta
        if (estado === 'aprobada') {
          await this.asesoriasBackend.aprobarAsesoria(asesoria.id!, mensaje).toPromise();
        } else {
          await this.asesoriasBackend.rechazarAsesoria(asesoria.id!, mensaje).toPromise();
        }
        
        // Enviar notificación automática con FastAPI
        if (this.usuario) {
          this.notificacionesService.notificarAsesoria({
            id_asesoria: asesoria.id!,
            email_programador: this.usuario.email,
            nombre_programador: this.usuario.nombre,
            email_usuario: asesoria.emailUsuario,
            nombre_usuario: asesoria.nombreUsuario,
            fecha_asesoria: asesoria.fechaAsesoria,
            hora_asesoria: asesoria.horaAsesoria,
            motivo: asesoria.motivo,
            estado: estado,
            mensaje_respuesta: mensaje,
            tipo_notificacion: 'email'
          }).subscribe({
            next: () => console.log('✅ Notificación enviada'),
            error: (err) => console.error('❌ Error al enviar notificación:', err)
          });
        }
        
        this.cargarAsesorias();
        alert(`Solicitud ${estado} correctamente. Notificación enviada al usuario.`);
      } catch (error) {
        console.error('Error al responder asesoría:', error);
        alert('Error al procesar la solicitud.');
      }
    }
  }

  // --- Lógica de Perfil ---
  async guardarPerfil() {
    if (this.perfilForm && this.perfilForm.uid) {
      try {
        // ✅ Usar convertidor DTO para transformar datos al formato del backend
        const usuarioDTO = convertirUsuarioABackend(this.perfilForm);
        
        console.log('📤 Enviando perfil al backend:', usuarioDTO);
        
        await this.usuariosBackend.actualizarUsuario(this.perfilForm.uid, usuarioDTO).toPromise();
        alert('Perfil actualizado correctamente');
      } catch (error) {
        console.error('Error al actualizar perfil:', error);
        alert('Error al actualizar perfil');
      }
    }
  }

  // --- Lógica del Modal Proyecto ---

  abrirModalProyecto() {
    this.proyectoEditando = null;
    this.resetForm();
    this.mostrarModalProyecto = true;
  }

  editarProyecto(proyecto: Proyecto) {
    this.proyectoEditando = proyecto;
    this.proyectoForm = { ...proyecto };
    // Asegurar que tecnologias sea array antes de join
    const techs = Array.isArray(proyecto.tecnologias) ? proyecto.tecnologias : [];
    this.tecnologiasInput = techs.join(', ');
    this.mostrarModalProyecto = true;
  }

  cerrarModalProyecto() {
    this.mostrarModalProyecto = false;
    this.resetForm();
  }

  actualizarTecnologias(valor: string) {
    this.tecnologiasInput = valor;
    this.proyectoForm.tecnologias = valor.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  async guardarProyecto() {
    if (!this.usuario) return;

    try {
      // Transformar datos para que coincidan con el backend
      const datosProyecto: any = {
        ...this.proyectoForm,
        idProgramador: this.usuario.uid,
        // Convertir array de tecnologías a String separado por comas
        tecnologias: Array.isArray(this.proyectoForm.tecnologias) 
          ? this.proyectoForm.tecnologias.join(',') 
          : this.proyectoForm.tecnologias || null
      };

      if (this.proyectoEditando && this.proyectoEditando.id) {
        // Actualizar
        await this.proyectosBackend.actualizarProyecto(this.proyectoEditando.id, datosProyecto).toPromise();
      } else {
        // Crear - generar ID único
        const nuevoId = 'PRO' + Date.now();
        await this.proyectosBackend.crearProyecto({ ...datosProyecto, id: nuevoId }).toPromise();
      }
      this.cargarProyectos();
      this.cerrarModalProyecto();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      alert('Error al guardar el proyecto');
    }
  }

  async eliminarProyecto(id: string) {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      try {
        await this.proyectosBackend.eliminarProyecto(id).toPromise();
        this.cargarProyectos();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  }

  private resetForm() {
    this.proyectoForm = {
      nombre: '',
      descripcion: '',
      tipo: 'academico',
      participacion: 'Fullstack',
      tecnologias: [],
      repoUrl: '',
      demoUrl: ''
    };
    this.tecnologiasInput = '';
  }
}
