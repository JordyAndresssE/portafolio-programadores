export interface Proyecto {
  id?: string;
  idProgramador: string; // UID del programador dueño del proyecto
  nombre: string;
  descripcion: string;
  tipo: 'academico' | 'laboral';
  participacion: 'Frontend' | 'Backend' | 'Base de Datos' | 'Fullstack';
  tecnologias: string[];
  repoUrl?: string;
  demoUrl?: string;
  imagenUrl?: string;
}
