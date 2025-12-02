export interface Asesoria {
  id?: string;
  idProgramador: string;
  idUsuario: string;
  nombreUsuario: string; // Para mostrar fácilmente quién solicita
  emailUsuario: string;
  fechaSolicitud: Date; // Fecha en que se creó la solicitud
  fechaAsesoria: string; // Fecha agendada (YYYY-MM-DD)
  horaAsesoria: string; // Hora agendada (HH:mm)
  motivo?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  mensajeRespuesta?: string; // Mensaje del programador al aprobar/rechazar
}
