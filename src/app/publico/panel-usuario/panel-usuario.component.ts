import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { UsuariosServicio } from '../../servicios/usuarios.servicio';
import { AsesoriasServicio } from '../../servicios/asesorias.servicio';
import { NotificacionServicio } from '../../servicios/notificacion.servicio';
import { Usuario } from '../../modelos/usuario.modelo';
import { Asesoria } from '../../modelos/asesoria.modelo';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-panel-usuario',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './panel-usuario.component.html',
    styleUrls: ['./panel-usuario.component.scss']
})
export class PanelUsuarioComponent implements OnInit {
    private authService = inject(AutenticacionServicio);
    private usuariosService = inject(UsuariosServicio);
    private asesoriasService = inject(AsesoriasServicio);
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
            this.programadores = await this.usuariosService.obtenerProgramadores();
        } catch (error) {
            console.error('Error al cargar programadores:', error);
        } finally {
            this.cargando = false;
        }
    }

    async cargarSolicitudes() {
        const usuario = await this.authService.obtenerUsuarioActual();
        if (usuario?.uid) {
            this.asesoriasService.obtenerAsesoriasPorUsuario(usuario.uid).subscribe({
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
        return this.asesoriasService.puedeCancelar(asesoria).puede;
    }

    async cancelarAsesoria(asesoria: Asesoria) {
        if (!asesoria.id) return;

        // Validar si puede cancelar
        const validacion = this.asesoriasService.puedeCancelar(asesoria);

        if (!validacion.puede) {
            this.notificacionService.mostrarAdvertencia(validacion.razon || 'No puedes cancelar esta asesoría');
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
            await this.asesoriasService.cancelarAsesoria(asesoria.id, motivoCancelacion);
            this.notificacionService.mostrarExito('Asesoría cancelada correctamente');
            await this.cargarSolicitudes(); // Recargar lista
        } catch (error) {
            console.error('Error al cancelar asesoría:', error);
            this.notificacionService.mostrarError('Error al cancelar la asesoría. Intenta nuevamente.');
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
