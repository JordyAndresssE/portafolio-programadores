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
    // Opción 1: Horario general para todos los días
    dias?: string[]; // Ej: ['Lunes', 'Martes'] 
    horaInicio?: string; // Ej: '09:00' 
    horaFin?: string; // Ej: '17:00'

    // Opción 2: Horarios personalizados por día (NUEVO)
    horariosPorDia?: {
      [dia: string]: {
        activo: boolean;
        horaInicio: string;
        horaFin: string;
      };
    };

    // Ejemplo:
    // {
    //   'Lunes': { activo: true, horaInicio: '09:00', horaFin: '12:00' },
    //   'Martes': { activo: true, horaInicio: '14:00', horaFin: '18:00' },
    //   'Miércoles': { activo: false, horaInicio: '', horaFin: '' }
    // }

  };
}
