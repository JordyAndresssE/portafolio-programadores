import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asesoria } from '../modelos/asesoria.modelo';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AsesoriasBackendServicio {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiJakartaURL}/asesorias`;

    /**
     * Obtener todas las asesorías
     */
    obtenerTodasLasAsesorias(): Observable<Asesoria[]> {
        return this.http.get<Asesoria[]>(this.apiUrl);
    }

    /**
     * Obtener una asesoría por ID
     */
    obtenerAsesoriaPorId(id: string): Observable<Asesoria> {
        return this.http.get<Asesoria>(`${this.apiUrl}/${id}`);
    }

    /**
     * Obtener asesorías de un programador específico
     */
    obtenerAsesoriasPorProgramador(idProgramador: string): Observable<Asesoria[]> {
        return this.http.get<Asesoria[]>(`${this.apiUrl}/programador/${idProgramador}`);
    }

    /**
     * Obtener asesorías de un usuario específico
     */
    obtenerAsesoriasPorUsuario(idUsuario: string): Observable<Asesoria[]> {
        return this.http.get<Asesoria[]>(`${this.apiUrl}/usuario/${idUsuario}`);
    }

    /**
     * Obtener asesorías por estado (pendiente, aprobada, rechazada, cancelada)
     */
    obtenerAsesoriasPorEstado(estado: string): Observable<Asesoria[]> {
        return this.http.get<Asesoria[]>(`${this.apiUrl}/estado/${estado}`);
    }

    /**
     * Crear una nueva solicitud de asesoría
     */
    crearAsesoria(asesoria: Asesoria): Observable<Asesoria> {
        return this.http.post<Asesoria>(this.apiUrl, asesoria);
    }

    /**
     * Actualizar una asesoría existente
     */
    actualizarAsesoria(id: string, asesoria: Asesoria): Observable<Asesoria> {
        return this.http.put<Asesoria>(`${this.apiUrl}/${id}`, asesoria);
    }

    /**
     * Aprobar una asesoría
     */
    aprobarAsesoria(id: string, mensajeRespuesta: string): Observable<Asesoria> {
        return this.http.put<Asesoria>(
            `${this.apiUrl}/${id}/aprobar`, 
            { mensajeRespuesta: mensajeRespuesta }
        );
    }

    /**
     * Rechazar una asesoría
     */
    rechazarAsesoria(id: string, mensajeRespuesta: string): Observable<Asesoria> {
        return this.http.put<Asesoria>(
            `${this.apiUrl}/${id}/rechazar`, 
            { mensajeRespuesta: mensajeRespuesta }
        );
    }

    /**
     * Cancelar una asesoría
     */
    cancelarAsesoria(id: string, motivoCancelacion: string): Observable<Asesoria> {
        return this.http.put<Asesoria>(
            `${this.apiUrl}/${id}/cancelar`, 
            { motivoCancelacion: motivoCancelacion }
        );
    }

    /**
     * Eliminar una asesoría
     */
    eliminarAsesoria(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
