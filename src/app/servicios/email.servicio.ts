import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
    providedIn: 'root'
})
export class EmailServicio {
    // Credenciales de EmailJS
    private serviceID = 'service_ezyc52o';
    private templateID = 'template_hkv2dry'; // Auto-Reply plantilla
    private publicKey = 'gtJmEyPPBtyy3sUBw';

    constructor() {
        emailjs.init(this.publicKey);
    }

    async enviarNotificacionAsesoria(
        emailProgramador: string,
        nombreProgramador: string,
        nombreUsuario: string,
        fecha: string,
        hora: string,
        motivo: string
    ): Promise<void> {
        const templateParams = {
            to_email: emailProgramador,
            to_name: nombreProgramador,
            from_name: nombreUsuario,
            fecha_asesoria: fecha,
            hora_asesoria: hora,
            motivo_asesoria: motivo,
            message: `Hola ${nombreProgramador}, tienes una nueva solicitud de asesoría de ${nombreUsuario}.`
        };

        try {
            const response = await emailjs.send(
                this.serviceID,
                this.templateID,
                templateParams
            );
            console.log('Correo enviado con éxito!', response.status, response.text);
        } catch (error) {
            console.error('Error al enviar el correo:', error);
        }
    }
}
