import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import { UsuariosServicio } from '../../servicios/usuarios.servicio';
import { Usuario } from '../../modelos/usuario.modelo';
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
    private router = inject(Router);

    usuario$: Observable<Usuario | null>;
    programadores: Usuario[] = [];
    cargando = true;

    constructor() {
        this.usuario$ = this.authService.usuario$;
    }

    async ngOnInit() {
        await this.cargarProgramadores();
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

    verPerfil(programadorId: string) {
        this.router.navigate(['/perfil', programadorId]);
    }

    async cerrarSesion() {
        await this.authService.cerrarSesion();
    }
}
