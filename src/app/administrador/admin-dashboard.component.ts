import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosBackendServicio } from '../servicios/usuarios-backend.servicio';
import { Usuario } from '../modelos/usuario.modelo';
import { FormsModule } from '@angular/forms';
import { AutenticacionServicio } from '../servicios/autenticacion.servicio';
import { NotificacionServicio } from '../servicios/notificacion.servicio';
import { FilterPipe } from '../compartido/filter.pipe';
import { ReportesFastAPIServicio } from '../servicios/reportes-fastapi.servicio';
import { convertirUsuarioABackend } from '../utils/usuario-dto.converter';
import { AsesoriasBackendServicio } from '../servicios/asesorias-backend.servicio';
import { Asesoria } from '../modelos/asesoria.modelo';
import { ProyectosBackendServicio } from '../servicios/proyectos-backend.servicio';
import { Proyecto } from '../modelos/proyecto.modelo';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('estadoChart') estadoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('programadorChart') programadorChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mensualChart') mensualChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('proyectoEstadoChart') proyectoEstadoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('proyectoUsuarioChart') proyectoUsuarioChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('proyectoMensualChart') proyectoMensualChartRef!: ElementRef<HTMLCanvasElement>;

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuarioSeleccionado: Usuario | null = null;
  filtro = '';
  guardando = false;
  generandoReporte = false;

  // Datos de asesorías
  asesorias: Asesoria[] = [];
  asesoriasFiltradasHistorial: Asesoria[] = [];
  filtroHistorial = '';

  // Datos de proyectos
  proyectos: Proyecto[] = [];
  proyectosFiltradasHistorial: Proyecto[] = [];
  filtroProyectos = '';

  vistaActiva: 'usuarios' | 'historial' | 'proyectos' = 'usuarios';

  // Charts
  private estadoChart?: Chart;
  private programadorChart?: Chart;
  private mensualChart?: Chart;
  private proyectoEstadoChart?: Chart;
  private proyectoUsuarioChart?: Chart;
  private proyectoMensualChart?: Chart;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  private usuariosBackend = inject(UsuariosBackendServicio);
  private authService = inject(AutenticacionServicio);
  private notificacionService = inject(NotificacionServicio);
  private reportesService = inject(ReportesFastAPIServicio);
  private asesoriasBackend = inject(AsesoriasBackendServicio);
  private proyectosBackend = inject(ProyectosBackendServicio);

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarAsesorias();
    this.cargarProyectos();
  }

  ngAfterViewInit() {
    // Esperar a que los datos estén cargados y la vista renderizada
    setTimeout(() => {
      if (this.asesorias.length > 0) {
        this.crearGraficos();
      }
    }, 500);
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

  cargarAsesorias() {
    this.asesoriasBackend.obtenerTodasLasAsesorias().subscribe({
      next: (asesorias) => {
        this.asesorias = asesorias;
        this.asesoriasFiltradasHistorial = asesorias;
        console.log('Asesorías cargadas:', asesorias.length);
        // Recrear gráficos cuando cambien los datos
        setTimeout(() => this.crearGraficos(), 300);
      },
      error: (error) => {
        console.error('Error al cargar asesorías:', error);
        this.asesorias = [];
        this.asesoriasFiltradasHistorial = [];
      }
    });
  }

  cambiarVista(vista: 'usuarios' | 'historial' | 'proyectos') {
    this.vistaActiva = vista;
    // Recrear gráficos al cambiar de vista
    if (vista === 'historial') {
      setTimeout(() => this.crearGraficos(), 100);
    } else if (vista === 'proyectos') {
      setTimeout(() => this.crearGraficosProyectos(), 100);
    }
  }

  cargarProyectos() {
    this.proyectosBackend.obtenerTodosLosProyectos().subscribe({
      next: (proyectos) => {
        this.proyectos = proyectos;
        this.proyectosFiltradasHistorial = proyectos;
        console.log('Proyectos cargados:', proyectos.length);
        setTimeout(() => this.crearGraficosProyectos(), 300);
      },
      error: (error) => {
        console.error('Error al cargar proyectos:', error);
        this.proyectos = [];
        this.proyectosFiltradasHistorial = [];
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

  filtrarProyectos() {
    const termino = this.filtroProyectos.toLowerCase().trim();
    if (!termino) {
      this.proyectosFiltradasHistorial = this.proyectos;
      return;
    }

    this.proyectosFiltradasHistorial = this.proyectos.filter(proyecto => {
      const programador = this.usuarios.find(u => u.uid === proyecto.idProgramador);

      return (
        programador?.nombre.toLowerCase().includes(termino) ||
        proyecto.nombre?.toLowerCase().includes(termino) ||
        proyecto.descripcion?.toLowerCase().includes(termino) ||
        proyecto.tipo?.toLowerCase().includes(termino) ||
        proyecto.participacion?.toLowerCase().includes(termino)
      );
    });
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

    // Validar campos obligatorios
    if (!this.usuarioSeleccionado.nombre?.trim()) {
      this.notificacionService.mostrarAdvertencia('El nombre es obligatorio');
      return;
    }

    if (!this.usuarioSeleccionado.email?.trim()) {
      this.notificacionService.mostrarAdvertencia('El email es obligatorio');
      return;
    }

    if (this.guardando) return;

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
      // Convertir usuario al formato del backend
      const usuarioDTO = convertirUsuarioABackend(this.usuarioSeleccionado);

      console.log('Enviando usuario al backend:', usuarioDTO);

      await this.usuariosBackend.actualizarUsuario(
        this.usuarioSeleccionado.uid,
        usuarioDTO
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
    if (this.generandoReporte) return;

    this.generandoReporte = true;
    this.notificacionService.mostrarInfo('Generando reporte PDF...');

    this.reportesService.descargarPDFAsesorias().subscribe({
      next: (blob) => {
        const fecha = new Date().toISOString().split('T')[0];
        this.reportesService.descargarArchivo(blob, `reporte_asesorias_${fecha}.pdf`);
        this.notificacionService.mostrarExito('Reporte PDF descargado');
        this.generandoReporte = false;
      },
      error: (error) => {
        console.error('Error al generar PDF:', error);
        this.notificacionService.mostrarError('Error al generar el reporte PDF');
        this.generandoReporte = false;
      }
    });
  }

  descargarReporteProyectosExcel() {
    if (this.generandoReporte) return;

    this.generandoReporte = true;
    this.notificacionService.mostrarInfo('Generando reporte Excel...');

    this.reportesService.descargarExcelProyectos().subscribe({
      next: (blob) => {
        const fecha = new Date().toISOString().split('T')[0];
        this.reportesService.descargarArchivo(blob, `reporte_proyectos_${fecha}.xlsx`);
        this.notificacionService.mostrarExito('Reporte Excel descargado');
        this.generandoReporte = false;
      },
      error: (error) => {
        console.error('Error al generar Excel:', error);
        this.notificacionService.mostrarError('Error al generar el reporte Excel');
        this.generandoReporte = false;
      }
    });
  }

  filtrarHistorial() {
    const termino = this.filtroHistorial.toLowerCase().trim();
    if (!termino) {
      this.asesoriasFiltradasHistorial = this.asesorias;
      return;
    }

    this.asesoriasFiltradasHistorial = this.asesorias.filter(asesoria => {
      const programador = this.usuarios.find(u => u.uid === asesoria.idProgramador);
      const usuario = this.usuarios.find(u => u.uid === asesoria.idUsuario);

      return (
        programador?.nombre.toLowerCase().includes(termino) ||
        usuario?.nombre.toLowerCase().includes(termino) ||
        asesoria.estado.toLowerCase().includes(termino) ||
        asesoria.fechaAsesoria.toLowerCase().includes(termino)
      );
    });
  }

  obtenerNombreUsuario(uid: string): string {
    const usuario = this.usuarios.find(u => u.uid === uid);
    return usuario?.nombre || 'Desconocido';
  }

  obtenerEstadoClase(estado: string): string {
    const estados: Record<string, string> = {
      'pendiente': 'pendiente',
      'aprobada': 'aprobada',
      'rechazada': 'rechazada',
      'cancelada': 'cancelada',
      'completada': 'completada'
    };
    return estados[estado.toLowerCase()] || '';
  }

  obtenerEstadoTexto(estado: string): string {
    const estados: Record<string, string> = {
      'pendiente': 'Pendiente',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'cancelada': 'Cancelada',
      'completada': 'Completada'
    };
    return estados[estado.toLowerCase()] || estado;
  }

  crearGraficos() {
    // Validar que la vista sea "historial" y que existan los elementos
    if (this.vistaActiva !== 'historial') {
      return;
    }

    if (!this.asesorias || this.asesorias.length === 0) {
      console.log('No hay asesorías para mostrar en gráficos');
      return;
    }

    // Validar que los ViewChild estén disponibles
    if (!this.estadoChartRef?.nativeElement ||
      !this.programadorChartRef?.nativeElement ||
      !this.mensualChartRef?.nativeElement) {
      console.log('Canvas elements no disponibles');
      return;
    }

    console.log('Creando gráficos con', this.asesorias.length, 'asesorías');

    try {
      this.crearGraficoEstados();
      this.crearGraficoProgramadores();
      this.crearGraficoMensual();
    } catch (error) {
      console.error('Error al crear gráficos:', error);
    }
  }

  crearGraficoEstados() {
    if (this.estadoChart) {
      this.estadoChart.destroy();
    }

    const estadoCounts = this.asesorias.reduce((acc, asesoria) => {
      const estado = asesoria.estado.toLowerCase();
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: Object.keys(estadoCounts).map(e => this.obtenerEstadoTexto(e)),
        datasets: [{
          data: Object.values(estadoCounts),
          backgroundColor: [
            'rgba(255, 193, 7, 0.8)',
            'rgba(40, 167, 69, 0.8)',
            'rgba(220, 53, 69, 0.8)',
            'rgba(108, 117, 125, 0.8)',
            'rgba(0, 123, 255, 0.8)'
          ],
          borderColor: '#1a1a1a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#fff', padding: 15, font: { size: 12 } }
          }
        }
      }
    };

    this.estadoChart = new Chart(this.estadoChartRef.nativeElement, config);
  }

  crearGraficoProgramadores() {
    if (this.programadorChart) {
      this.programadorChart.destroy();
    }

    const programadorCounts = this.asesorias.reduce((acc, asesoria) => {
      const nombre = this.obtenerNombreUsuario(asesoria.idProgramador);
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const top5 = Object.entries(programadorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: top5.map(([nombre]) => nombre),
        datasets: [{
          label: 'Asesorías',
          data: top5.map(([, count]) => count),
          backgroundColor: 'rgba(0, 123, 255, 0.7)',
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#fff', stepSize: 1 },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { display: false }
          }
        }
      }
    };

    this.programadorChart = new Chart(this.programadorChartRef.nativeElement, config);
  }

  crearGraficoMensual() {
    if (this.mensualChart) {
      this.mensualChart.destroy();
    }

    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesActual = new Date().getMonth();
    const ultimosMeses = Array.from({ length: 6 }, (_, i) => {
      const mes = (mesActual - 5 + i + 12) % 12;
      return { mes, nombre: mesesNombres[mes] };
    });

    const mesData = ultimosMeses.map(({ mes }) => {
      return this.asesorias.filter(a => {
        const fecha = new Date(a.fechaAsesoria);
        return fecha.getMonth() === mes;
      }).length;
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: ultimosMeses.map(m => m.nombre),
        datasets: [{
          label: 'Asesorías',
          data: mesData,
          borderColor: 'rgba(40, 167, 69, 1)',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: 'rgba(40, 167, 69, 1)',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#fff', stepSize: 1 },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { display: false }
          }
        }
      }
    };

    this.mensualChart = new Chart(this.mensualChartRef.nativeElement, config);
  }

  // ==========================================
  // GRÁFICOS DE PROYECTOS
  // ==========================================

  crearGraficosProyectos() {
    if (this.vistaActiva !== 'proyectos') {
      return;
    }

    if (!this.proyectos || this.proyectos.length === 0) {
      console.log('No hay proyectos para mostrar en gráficos');
      return;
    }

    if (!this.proyectoEstadoChartRef?.nativeElement ||
      !this.proyectoUsuarioChartRef?.nativeElement ||
      !this.proyectoMensualChartRef?.nativeElement) {
      console.log('Canvas de proyectos no disponibles');
      return;
    }

    console.log('Creando gráficos de proyectos con', this.proyectos.length, 'proyectos');

    try {
      this.crearGraficoProyectoEstados();
      this.crearGraficoProyectoUsuarios();
      this.crearGraficoProyectoMensual();
    } catch (error) {
      console.error('Error al crear gráficos de proyectos:', error);
    }
  }

  crearGraficoProyectoEstados() {
    if (this.proyectoEstadoChart) {
      this.proyectoEstadoChart.destroy();
    }

    // Agrupar por tipo de proyecto
    const tipoCounts = this.proyectos.reduce((acc, proyecto) => {
      const tipo = proyecto.tipo || 'sin tipo';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tiposTexto: Record<string, string> = {
      'academico': 'Académico',
      'laboral': 'Laboral',
      'sin tipo': 'Sin Tipo'
    };

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: Object.keys(tipoCounts).map(e => tiposTexto[e] || e),
        datasets: [{
          data: Object.values(tipoCounts),
          backgroundColor: [
            'rgba(0, 123, 255, 0.8)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(108, 117, 125, 0.8)'
          ],
          borderColor: '#1a1a1a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#fff', padding: 15, font: { size: 12 } }
          }
        }
      }
    };

    this.proyectoEstadoChart = new Chart(this.proyectoEstadoChartRef.nativeElement, config);
  }

  crearGraficoProyectoUsuarios() {
    if (this.proyectoUsuarioChart) {
      this.proyectoUsuarioChart.destroy();
    }

    const usuarioCounts = this.proyectos.reduce((acc, proyecto) => {
      const nombre = this.obtenerNombreUsuario(proyecto.idProgramador);
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const top5 = Object.entries(usuarioCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: top5.map(([nombre]) => nombre),
        datasets: [{
          label: 'Proyectos',
          data: top5.map(([, count]) => count),
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#fff', stepSize: 1 },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { display: false }
          }
        }
      }
    };

    this.proyectoUsuarioChart = new Chart(this.proyectoUsuarioChartRef.nativeElement, config);
  }

  crearGraficoProyectoMensual() {
    if (this.proyectoMensualChart) {
      this.proyectoMensualChart.destroy();
    }

    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mesActual = new Date().getMonth();
    const ultimosMeses = Array.from({ length: 6 }, (_, i) => {
      const mes = (mesActual - 5 + i + 12) % 12;
      return { mes, nombre: mesesNombres[mes] };
    });

    // Como no hay fecha de creación, distribuimos los proyectos en los últimos meses
    const totalProyectos = this.proyectos.length;
    const mesData = ultimosMeses.map((_, index) => {
      // Simulamos una distribución para visualización
      return Math.floor(totalProyectos / 6) + (index < totalProyectos % 6 ? 1 : 0);
    });

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: ultimosMeses.map(m => m.nombre),
        datasets: [{
          label: 'Proyectos',
          data: mesData,
          borderColor: 'rgba(76, 175, 80, 1)',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: 'rgba(76, 175, 80, 1)',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#fff', stepSize: 1 },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { display: false }
          }
        }
      }
    };

    this.proyectoMensualChart = new Chart(this.proyectoMensualChartRef.nativeElement, config);
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
  }
}
