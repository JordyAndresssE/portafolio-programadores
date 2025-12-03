import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { UsuariosServicio } from '../../servicios/usuarios.servicio';
import { AsesoriasServicio } from '../../servicios/asesorias.servicio';
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

    obtenerEstadoClase(estado: string): string {
        switch (estado) {
            case 'aprobada':
                return 'estado-aprobada';
            case 'rechazada':
                return 'estado-rechazada';
            default:
                return 'estado-pendiente';
        }
    }

    obtenerEstadoTexto(estado: string): string {
        switch (estado) {
            case 'aprobada':
                return '✅ Aprobada';
            case 'rechazada':
                return '❌ Rechazada';
            default:
                return '⏳ Pendiente';
        }
    }

    async cerrarSesion() {
        await this.authService.cerrarSesion();
    }
}
