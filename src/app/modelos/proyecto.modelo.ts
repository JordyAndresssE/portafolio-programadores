export interface Proyecto {
  id?: string;
  idProgramador: string; // UID del programador dueño del proyecto
  nombre: string;
  descripcion: string;
  tipo: 'academico' | 'laboral';
  participacion: 'Frontend' | 'Backend' | 'Base de Datos' | 'Fullstack';
  tecnologias: string[]; // Array de strings, ej: ['Angular', 'Firebase']
  repoUrl?: string;
  demoUrl?: string;
  imagenUrl?: string;
}
