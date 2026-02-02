import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosBackendServicio } from '../servicios/usuarios-backend.servicio';
import { Usuario } from '../modelos/usuario.modelo';
import { FormsModule } from '@angular/forms';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';
import { NotificacionServicio } from '../servicios/notificacion.servicio';
import { FilterPipe } from '../compartido/filter.pipe';
import { ReportesFastAPIServicio } from '../servicios/reportes-fastapi.servicio';

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

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  private usuariosBackend = inject(UsuariosBackendServicio);
  private authService = inject(AutenticacionServicio);
  private notificacionService = inject(NotificacionServicio);
  private reportesService = inject(ReportesFastAPIServicio);

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosBackend.obtenerTodosLosUsuarios().subscribe({
      next: (users) => {
        this.usuarios = users;
        this.usuariosFiltrados = users;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.notificacionService.mostrarError('Error al cargar usuarios');
      }
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
        horariosPorDia: this.inicializarHorariosPorDia()
      };
    } else if (!this.usuarioSeleccionado.disponibilidad.horariosPorDia) {
      // Migrar del sistema antiguo al nuevo
      this.usuarioSeleccionado.disponibilidad.horariosPorDia = this.inicializarHorariosPorDia();
    }
  }

  // Inicializar estructura de horarios por día
  inicializarHorariosPorDia() {
    const horarios: any = {};
    this.diasSemana.forEach(dia => {
      horarios[dia] = {
        activo: false,
        horaInicio: '09:00',
        horaFin: '18:00'
      };
    });
    return horarios;
  }

  // Verificar si un día está activo
  esDiaActivo(dia: string): boolean {
    return this.usuarioSeleccionado?.disponibilidad?.horariosPorDia?.[dia]?.activo || false;
  }

  // Toggle día personalizado
  toggleDiaPersonalizado(dia: string) {
    if (!this.usuarioSeleccionado?.disponibilidad?.horariosPorDia) return;

    const horario = this.usuarioSeleccionado.disponibilidad.horariosPorDia[dia];
    if (horario) {
      horario.activo = !horario.activo;
    }
  }

  // Obtener hora de inicio de un día
  getHoraInicio(dia: string): string {
    return this.usuarioSeleccionado?.disponibilidad?.horariosPorDia?.[dia]?.horaInicio || '09:00';
  }

  // Obtener hora de fin de un día
  getHoraFin(dia: string): string {
    return this.usuarioSeleccionado?.disponibilidad?.horariosPorDia?.[dia]?.horaFin || '18:00';
  }

  // Establecer hora de inicio
  setHoraInicio(dia: string, event: any) {
    if (!this.usuarioSeleccionado?.disponibilidad?.horariosPorDia?.[dia]) return;
    this.usuarioSeleccionado.disponibilidad.horariosPorDia[dia].horaInicio = event.target.value;
  }

  // Establecer hora de fin
  setHoraFin(dia: string, event: any) {
    if (!this.usuarioSeleccionado?.disponibilidad?.horariosPorDia?.[dia]) return;
    this.usuarioSeleccionado.disponibilidad.horariosPorDia[dia].horaFin = event.target.value;
  }

  // Métodos antiguos - mantener por compatibilidad pero ya no se usan
  toggleDia(dia: string) {
    if (!this.usuarioSeleccionado?.disponibilidad?.dias) return;
    const dias = this.usuarioSeleccionado.disponibilidad.dias;
    const index = dias.indexOf(dia);
    if (index >= 0) {
      dias.splice(index, 1);
    } else {
      dias.push(dia);
    }
  }

  esDiaSeleccionado(dia: string): boolean {
    return this.usuarioSeleccionado?.disponibilidad?.dias?.includes(dia) || false;
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
    if (!this.usuarioSeleccionado || !this.usuarioSeleccionado.uid) return;

    // Confirmación antes de guardar
    const confirmar = confirm(
      `¿Estás seguro de que deseas guardar los cambios para ${this.usuarioSeleccionado.nombre}?\n\n` +
      `Rol: ${this.usuarioSeleccionado.rol}`
    );

    if (!confirmar) {
      this.notificacionService.mostrarInfo('Cambios cancelados');
      return;
    }

    this.guardando = true;
    try {
      await this.usuariosBackend.actualizarUsuario(
        this.usuarioSeleccionado.uid,
        this.usuarioSeleccionado
      ).toPromise();

      this.notificacionService.mostrarExito(
        `Usuario ${this.usuarioSeleccionado.nombre} actualizado correctamente`
      );
      this.usuarioSeleccionado = null;
      this.cargarUsuarios();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      this.notificacionService.mostrarError(
        'Error al guardar los cambios. Por favor intenta nuevamente.'
      );
    } finally {
      this.guardando = false;
    }
  }

  cancelarEdicion() {
    this.usuarioSeleccionado = null;
  }

  // ==========================================
  // MÉTODOS DE REPORTES (FastAPI)
  // ==========================================

  descargarReporteAsesoriasPDF() {
    this.notificacionService.mostrarInfo('Generando reporte PDF...');
    
    this.reportesService.descargarPDFAsesorias().subscribe({
      next: (blob) => {
        const fecha = new Date().toISOString().split('T')[0];
        this.reportesService.descargarArchivo(blob, `reporte_asesorias_${fecha}.pdf`);
        this.notificacionService.mostrarExito('Reporte PDF descargado');
      },
      error: (error) => {
        console.error('Error al generar PDF:', error);
        this.notificacionService.mostrarError('Error al generar el reporte PDF');
      }
    });
  }

  descargarReporteProyectosExcel() {
    this.notificacionService.mostrarInfo('Generando reporte Excel...');
    
    this.reportesService.descargarExcelProyectos().subscribe({
      next: (blob) => {
        const fecha = new Date().toISOString().split('T')[0];
        this.reportesService.descargarArchivo(blob, `reporte_proyectos_${fecha}.xlsx`);
        this.notificacionService.mostrarExito('Reporte Excel descargado');
      },
      error: (error) => {
        console.error('Error al generar Excel:', error);
        this.notificacionService.mostrarError('Error al generar el reporte Excel');
      }
    });
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
  }
}
