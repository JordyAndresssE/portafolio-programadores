import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Servicio para consumir FastAPI - Notificaciones
 */
@Injectable({
    providedIn: 'root'
})
export class NotificacionesFastAPIServicio {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiFastAPIURL}/notificaciones`;

    /**
     * Enviar email individual
     */
    enviarEmail(data: {
        destinatario: string;
        asunto: string;
        mensaje: string;
        tipo_notificacion: string;
        datos_adicionales?: any;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/email`, data);
    }

    /**
     * Enviar WhatsApp
     */
    enviarWhatsApp(data: {
        numero: string;
        mensaje: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/whatsapp`, data);
    }

    /**
     * Notificar asesoría completa (email + whatsapp opcional)
     */
    notificarAsesoria(data: {
        id_asesoria: string;
        email_programador: string;
        nombre_programador: string;
        email_usuario: string;
        nombre_usuario: string;
        fecha_asesoria: string;
        hora_asesoria: string;
        motivo?: string;
        estado: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
        mensaje_respuesta?: string;
        tipo_notificacion?: 'email' | 'whatsapp' | 'ambos';
        telefono_programador?: string;
        telefono_usuario?: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/asesoria`, data);
    }

    /**
     * Programar recordatorio automático
     */
    programarRecordatorio(data: {
        id_asesoria: string;
        fecha_hora_asesoria: string;
        email_programador: string;
        email_usuario: string;
        minutos_antes?: number;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/recordatorio`, data);
    }

    /**
     * Obtener recordatorios pendientes
     */
    obtenerRecordatoriosPendientes(): Observable<any> {
        return this.http.get(`${this.apiUrl}/pendientes`);
    }
}
