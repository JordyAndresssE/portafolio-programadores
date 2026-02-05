import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { UsuariosBackendServicio } from '../../servicios/usuarios-backend.servicio';
import { AsesoriasBackendServicio } from '../../servicios/asesorias-backend.servicio';
import { NotificacionServicio } from '../../servicios/notificacion.servicio';
import { Usuario } from '../../modelos/usuario.modelo';
import { Asesoria } from '../../modelos/asesoria.modelo';
import { Observable } from 'rxjs';
import { convertirUsuario } from '../../utils/convertidores';

@Component({
    selector: 'app-panel-usuario',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './panel-usuario.component.html',
    styleUrls: ['./panel-usuario.component.scss']
})
export class PanelUsuarioComponent implements OnInit {
    private authService = inject(AutenticacionServicio);
    private usuariosBackend = inject(UsuariosBackendServicio);
    private asesoriasBackend = inject(AsesoriasBackendServicio);
    private notificacionService = inject(NotificacionServicio);
    private router = inject(Router);

    usuario$: Observable<Usuario | null>;
    programadores: Usuario[] = [];
    solicitudes: Asesoria[] = [];
    cargando = true;
    vistaActual: 'programadores' | 'solicitudes' = 'programadores';

    constructor() {
        this.usuario$ = this.authService.usuario$;
    }

    async ngOnInit() {
        await this.cargarProgramadores();
        await this.cargarSolicitudes();
    }

    async cargarProgramadores() {
        this.cargando = true;
        try {
            this.usuariosBackend.obtenerProgramadores().subscribe({
                next: (programadores) => {
                    // Convertir tecnologias de string a array
                    this.programadores = programadores.map(p => convertirUsuario(p));
                    this.cargando = false;
                },
                error: (error) => {
                    console.error('Error al cargar programadores:', error);
                    this.cargando = false;
                }
            });
        } catch (error) {
            console.error('Error al cargar programadores:', error);
            this.cargando = false;
        }
    }

    async cargarSolicitudes() {
        const usuario = await this.authService.obtenerUsuarioActual();
        if (usuario?.uid) {
            this.asesoriasBackend.obtenerAsesoriasPorUsuario(usuario.uid).subscribe({
                next: (solicitudes) => {
                    this.solicitudes = solicitudes;
                },
                error: (error) => {
                    console.error('Error al cargar solicitudes:', error);
                }
            });
        }
    }

    cambiarVista(vista: 'programadores' | 'solicitudes') {
        this.vistaActual = vista;
    }

    verPerfil(programadorId: string) {
        this.router.navigate(['/perfil', programadorId]);
    }

    puedeCancelar(asesoria: Asesoria): boolean {
        // Validación básica - el backend también validará
        if (asesoria.estado === 'rechazada' || asesoria.estado === 'cancelada') {
            return false;
        }
        return true;
    }

    async cancelarAsesoria(asesoria: Asesoria) {
        if (!asesoria.id) return;

        // Validar si puede cancelar
        if (!this.puedeCancelar(asesoria)) {
            this.notificacionService.mostrarAdvertencia('No puedes cancelar esta asesoría');
            return;
        }

        // Mensaje de confirmación diferente según el estado
        let mensajeConfirmacion = '';
        let requiereMotivo = false;

        if (asesoria.estado === 'pendiente') {
            mensajeConfirmacion = '¿Estás seguro de que deseas cancelar esta solicitud de asesoría?';
            requiereMotivo = false;
        } else if (asesoria.estado === 'aprobada') {
            mensajeConfirmacion = 'Esta asesoría ya fue aprobada. ¿Estás seguro de que deseas cancelarla?\n\nDeberás proporcionar un motivo de cancelación.';
            requiereMotivo = true;
        }

        const confirmar = confirm(mensajeConfirmacion);
        if (!confirmar) {
            this.notificacionService.mostrarInfo('Cancelación abortada');
            return;
        }

        let motivoCancelacion = '';

        if (requiereMotivo) {
            motivoCancelacion = prompt('Por favor indica el motivo de la cancelación:') || '';

            if (!motivoCancelacion.trim()) {
                this.notificacionService.mostrarAdvertencia('Debes proporcionar un motivo para cancelar');
                return;
            }
        } else {
            motivoCancelacion = 'Cancelado por el usuario';
        }

        // Confirmar una vez más si es asesoría aprobada
        if (asesoria.estado === 'aprobada') {
            const confirmarFinal = confirm(
                `¿Confirmas la cancelación?\n\nMotivo: ${motivoCancelacion}\n\nEsta acción no se puede deshacer.`
            );

            if (!confirmarFinal) {
                this.notificacionService.mostrarInfo('Cancelación abortada');
                return;
            }
        }

        try {
            await this.asesoriasBackend.cancelarAsesoria(asesoria.id, motivoCancelacion).toPromise();
            this.notificacionService.mostrarExito('Asesoría cancelada correctamente');
            await this.cargarSolicitudes(); // Recargar lista
        } catch (error) {
            console.error('Error al cancelar asesoría:', error);
            this.notificacionService.mostrarError('Error al cancelar la asesoría. Intenta nuevamente.');
        }
    }

    // Helper para convertir Timestamp de forma segura
    convertirTimestamp(timestamp: any): Date {
        // Si ya es un Date válido
        if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
            return timestamp;
        }

        // Si es un Timestamp de Firebase
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }

        // Si es null o undefined, retornar fecha actual
        if (!timestamp) {
            return new Date();
        }

        // Si es un número (milisegundos desde epoch)
        if (typeof timestamp === 'number') {
            return new Date(timestamp);
        }

        // Si es un string, intentar parsearlo
        if (typeof timestamp === 'string') {
            // Remover [UTC] o cualquier zona horaria entre corchetes
            const cleanedString = timestamp.replace(/\[.*?\]/g, '');
            const parsed = new Date(cleanedString);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        // Si es un array de Java LocalDateTime [year, month, day, hour, minute, second, nano]
        if (Array.isArray(timestamp) && timestamp.length >= 3) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = timestamp;
            return new Date(year, month - 1, day, hour, minute, second);
        }

        console.error('No se pudo convertir timestamp:', timestamp);
        return new Date(); // Fallback
    }

    // Helper para obtener fecha formateada
    obtenerFechaFormateada(fecha: any): string {
        try {
            const date = this.convertirTimestamp(fecha);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha no disponible';
        }
    }

    obtenerEstadoClase(estado: string): string {
        switch (estado) {
            case 'aprobada':
                return 'estado-aprobada';
            case 'rechazada':
                return 'estado-rechazada';
            case 'cancelada':
                return 'estado-cancelada';
            default:
                return 'estado-pendiente';
        }
    }

    obtenerEstadoTexto(estado: string): string {
        switch (estado) {
            case 'aprobada':
                return 'Aprobada';
            case 'rechazada':
                return 'Rechazada';
            case 'cancelada':
                return 'Cancelada';
            default:
                return 'Pendiente';
        }
    }

    async cerrarSesion() {
        await this.authService.cerrarSesion();
    }
}
