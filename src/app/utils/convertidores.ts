/**
 * Helper para convertir datos del backend a formato del frontend
 */

// Exportar funciones de conversión DTO
export { convertirUsuarioABackend, convertirUsuarioDesdeBackend } from './usuario-dto.converter';

/**
 * Convierte tecnologias de string (backend) a array (frontend)
 */
export function convertirTecnologias(tecnologias: any): string[] {
    if (!tecnologias) return [];
    if (Array.isArray(tecnologias)) return tecnologias;
    if (typeof tecnologias === 'string') {
        return tecnologias.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
    }
    return [];
}

/**
 * Convierte un usuario del backend al formato del frontend
 * @deprecated Usar convertirUsuarioDesdeBackend en su lugar
 */
export function convertirUsuario(usuario: any): any {
    if (!usuario) return null;
    return {
        ...usuario,
        tecnologias: convertirTecnologias(usuario.tecnologias),
        // Construir redesSociales desde campos individuales del backend
        redesSociales: {
            linkedin: usuario.linkedin || usuario.redesSociales?.linkedin || '',
            github: usuario.github || usuario.redesSociales?.github || '',
            twitter: usuario.twitter || usuario.redesSociales?.twitter || '',
            sitioWeb: usuario.sitioWeb || usuario.redesSociales?.sitioWeb || ''
        }
    };
}

/**
 * Convierte un proyecto del backend al formato del frontend
 */
export function convertirProyecto(proyecto: any): any {
    if (!proyecto) return null;
    return {
        ...proyecto,
        tecnologias: convertirTecnologias(proyecto.tecnologias)
    };
}
