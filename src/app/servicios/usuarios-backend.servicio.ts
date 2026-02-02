import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../modelos/usuario.modelo';
import { environment } from '../../environments/environment';

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
        return this.http.get<Usuario[]>(this.apiUrl);
    }

    /**
     * Obtener solo programadores
     */
    obtenerProgramadores(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(`${this.apiUrl}/programadores`);
    }

    /**
     * Obtener un usuario por su UID
     */
    obtenerUsuarioPorId(uid: string): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.apiUrl}/${uid}`);
    }

    /**
     * Crear un nuevo usuario
     */
    crearUsuario(usuario: Usuario): Observable<Usuario> {
        return this.http.post<Usuario>(this.apiUrl, usuario);
    }

    /**
     * Actualizar un usuario existente
     */
    actualizarUsuario(uid: string, usuario: Usuario): Observable<Usuario> {
        return this.http.put<Usuario>(`${this.apiUrl}/${uid}`, usuario);
    }

    /**
     * Eliminar un usuario
     */
    eliminarUsuario(uid: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${uid}`);
    }
}
