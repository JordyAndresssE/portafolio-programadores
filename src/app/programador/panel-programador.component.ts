import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';
import { ProyectosServicio } from '../servicios/proyectos.servicio';
import { UsuariosServicio } from '../servicios/usuarios.servicio';
import { AsesoriasServicio } from '../servicios/asesorias.servicio';
import { Proyecto } from '../modelos/proyecto.modelo';
import { Usuario } from '../modelos/usuario.modelo';
import { Asesoria } from '../modelos/asesoria.modelo';

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
  private proyectosService = inject(ProyectosServicio);
  private usuariosService = inject(UsuariosServicio);
  private asesoriasService = inject(AsesoriasServicio);

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
    this.proyectosService.obtenerMisProyectos().subscribe(p => this.proyectos = p);
  }

  cargarAsesorias() {
    if (this.usuario?.uid) {
      this.asesoriasService.obtenerAsesoriasPorProgramador(this.usuario.uid).subscribe(a => {
        this.asesorias = a;
      });
    }
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
  }

  // --- Lógica de Asesorías ---
  async responderAsesoria(asesoria: Asesoria, estado: 'aprobada' | 'rechazada') {
    const mensaje = prompt(`Mensaje opcional para ${estado === 'aprobada' ? 'aprobar' : 'rechazar'} la solicitud:`);
    if (mensaje !== null) {
      try {
        await this.asesoriasService.actualizarEstado(asesoria.id!, estado, mensaje);
        this.cargarAsesorias(); // Recargar lista
        alert(`Solicitud ${estado} correctamente.`);
      } catch (error) {
        console.error('Error al responder asesoría:', error);
        alert('Error al procesar la solicitud.');
      }
    }
  }

  // --- Lógica de Perfil ---
  async guardarPerfil() {
    if (this.perfilForm) {
      try {
        await this.usuariosService.actualizarUsuario(this.perfilForm);
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
    this.tecnologiasInput = proyecto.tecnologias.join(', ');
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
      const datosProyecto = {
        ...this.proyectoForm,
        idProgramador: this.usuario.uid
      } as Proyecto;

      if (this.proyectoEditando && this.proyectoEditando.id) {
        // Actualizar
        await this.proyectosService.actualizarProyecto({ ...datosProyecto, id: this.proyectoEditando.id });
      } else {
        // Crear
        await this.proyectosService.crearProyecto(datosProyecto);
      }
      this.cerrarModalProyecto();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      alert('Error al guardar el proyecto');
    }
  }

  async eliminarProyecto(id: string) {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      try {
        await this.proyectosService.eliminarProyecto(id);
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
