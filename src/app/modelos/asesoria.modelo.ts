import { Timestamp } from '@angular/fire/firestore';

export interface Asesoria {
  id?: string;
  idProgramador: string;
  idUsuario: string;
  nombreUsuario: string; // Para mostrar fácilmente quién solicita
  emailUsuario: string;
  fechaSolicitud: Timestamp | any; // Fecha en que se creó la solicitud
  fechaAsesoria: string; // Fecha agendada (YYYY-MM-DD)
  horaAsesoria: string; // Hora agendada (HH:mm)
  motivo?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
  mensajeRespuesta?: string; // Mensaje del programador al aprobar/rechazar
  motivoCancelacion?: string; // Motivo de cancelación por el usuario
  fechaCancelacion?: Timestamp | any; // Fecha en que se canceló
}
