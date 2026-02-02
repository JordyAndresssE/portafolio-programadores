import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from '../modelos/usuario.modelo';
import { environment } from '../../environments/environment';
import { convertirUsuarioDesdeBackend } from '../utils/usuario-dto.converter';

@Injectable({
    providedIn: 'root'
})
export class UsuariosBackendServicio {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiSpringURL}/usuarios`;

    /**
     * Obtener todos los usuarios
     */
    obtenerTodosLosUsuarios(): Observable<Usuario[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            map(usuarios => usuarios.map(u => convertirUsuarioDesdeBackend(u)))
        );
    }

    /**
     * Obtener solo programadores
     */
    obtenerProgramadores(): Observable<Usuario[]> {
        return this.http.get<any[]>(`${this.apiUrl}/programadores`).pipe(
            map(usuarios => usuarios.map(u => convertirUsuarioDesdeBackend(u)))
        );
    }

    /**
     * Obtener un usuario por su UID
     */
    obtenerUsuarioPorId(uid: string): Observable<Usuario> {
        return this.http.get<any>(`${this.apiUrl}/${uid}`).pipe(
            map(u => convertirUsuarioDesdeBackend(u))
        );
    }

    /**
     * Crear un nuevo usuario
     */
    crearUsuario(usuario: Usuario): Observable<Usuario> {
        return this.http.post<Usuario>(this.apiUrl, usuario);
    }

    /**
     * Actualizar un usuario existente (recibe DTO ya convertido)
     */
    actualizarUsuario(uid: string, usuarioDTO: any): Observable<Usuario> {
        return this.http.put<any>(`${this.apiUrl}/${uid}`, usuarioDTO).pipe(
            map(u => convertirUsuarioDesdeBackend(u))
        );
    }

    /**
     * Eliminar un usuario
     */
    eliminarUsuario(uid: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${uid}`);
    }
}
