import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Servicio para consumir FastAPI - Reportes y Dashboards
 */
@Injectable({
    providedIn: 'root'
})
export class ReportesFastAPIServicio {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiFastAPIURL}/reportes`;

    /**
     * Obtener dashboard de asesorías con estadísticas
     */
    obtenerDashboardAsesorias(filtros?: {
        fecha_inicio?: string;
        fecha_fin?: string;
        id_programador?: string;
        estado?: string;
    }): Observable<any> {
        let params = new HttpParams();
        
        if (filtros?.fecha_inicio) {
            params = params.set('fecha_inicio', filtros.fecha_inicio);
        }
        if (filtros?.fecha_fin) {
            params = params.set('fecha_fin', filtros.fecha_fin);
        }
        if (filtros?.id_programador) {
            params = params.set('id_programador', filtros.id_programador);
        }
        if (filtros?.estado) {
            params = params.set('estado', filtros.estado);
        }
        
        return this.http.get(`${this.apiUrl}/asesorias/dashboard`, { params });
    }

    /**
     * Obtener dashboard de proyectos con estadísticas
     */
    obtenerDashboardProyectos(filtros?: {
        id_programador?: string;
        tipo?: string;
    }): Observable<any> {
        let params = new HttpParams();
        
        if (filtros?.id_programador) {
            params = params.set('id_programador', filtros.id_programador);
        }
        if (filtros?.tipo) {
            params = params.set('tipo', filtros.tipo);
        }
        
        return this.http.get(`${this.apiUrl}/proyectos/dashboard`, { params });
    }

    /**
     * Descargar reporte PDF de asesorías
     */
    descargarPDFAsesorias(filtros?: {
        fecha_inicio?: string;
        fecha_fin?: string;
        id_programador?: string;
        estado?: string;
    }): Observable<Blob> {
        let params = new HttpParams();
        
        if (filtros?.fecha_inicio) {
            params = params.set('fecha_inicio', filtros.fecha_inicio);
        }
        if (filtros?.fecha_fin) {
            params = params.set('fecha_fin', filtros.fecha_fin);
        }
        if (filtros?.id_programador) {
            params = params.set('id_programador', filtros.id_programador);
        }
        if (filtros?.estado) {
            params = params.set('estado', filtros.estado);
        }
        
        return this.http.get(`${this.apiUrl}/asesorias/pdf`, {
            params,
            responseType: 'blob'
        });
    }

    /**
     * Descargar reporte Excel de proyectos
     */
    descargarExcelProyectos(filtros?: {
        id_programador?: string;
        tipo?: string;
    }): Observable<Blob> {
        let params = new HttpParams();
        
        if (filtros?.id_programador) {
            params = params.set('id_programador', filtros.id_programador);
        }
        if (filtros?.tipo) {
            params = params.set('tipo', filtros.tipo);
        }
        
        return this.http.get(`${this.apiUrl}/proyectos/excel`, {
            params,
            responseType: 'blob'
        });
    }

    /**
     * Obtener estadísticas generales de la plataforma
     */
    obtenerEstadisticasGenerales(): Observable<any> {
        return this.http.get(`${this.apiUrl}/estadisticas`);
    }

    /**
     * Helper para descargar archivo
     */
    descargarArchivo(blob: Blob, nombreArchivo: string) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        link.click();
        window.URL.revokeObjectURL(url);
    }
}
