import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proyecto } from '../modelos/proyecto.modelo';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProyectosBackendServicio {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiURL}/proyectos`;

    /**
     * Obtener todos los proyectos
     */
    obtenerTodosLosProyectos(): Observable<Proyecto[]> {
        return this.http.get<Proyecto[]>(this.apiUrl);
    }

    /**
     * Obtener un proyecto por ID
     */
    obtenerProyectoPorId(id: string): Observable<Proyecto> {
        return this.http.get<Proyecto>(`${this.apiUrl}/${id}`);
    }

    /**
     * Obtener proyectos de un programador específico
     */
    obtenerProyectosPorProgramador(idProgramador: string): Observable<Proyecto[]> {
        return this.http.get<Proyecto[]>(`${this.apiUrl}/programador/${idProgramador}`);
    }

    /**
     * Obtener proyectos por tipo (academico o laboral)
     */
    obtenerProyectosPorTipo(tipo: string): Observable<Proyecto[]> {
        return this.http.get<Proyecto[]>(`${this.apiUrl}/tipo/${tipo}`);
    }

    /**
     * Crear un nuevo proyecto
     */
    crearProyecto(proyecto: Proyecto): Observable<Proyecto> {
        return this.http.post<Proyecto>(this.apiUrl, proyecto);
    }

    /**
     * Actualizar un proyecto existente
     */
    actualizarProyecto(id: string, proyecto: Proyecto): Observable<Proyecto> {
        return this.http.put<Proyecto>(`${this.apiUrl}/${id}`, proyecto);
    }

    /**
     * Eliminar un proyecto
     */
    eliminarProyecto(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
