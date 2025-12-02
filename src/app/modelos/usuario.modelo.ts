export interface Usuario {
  uid: string;
  email: string;
  nombre: string;
  fotoPerfil?: string;
  rol: 'administrador' | 'programador' | 'usuario';
  // Campos específicos para programadores
  especialidad?: string;
  descripcion?: string;
  tecnologias?: string[];
  redesSociales?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    sitioWeb?: string;
  };
  disponibilidad?: {
    dias: string[]; // Ej: ['Lunes', 'Martes']
    horaInicio: string; // Ej: '09:00'
    horaFin: string; // Ej: '17:00'
  };
}
