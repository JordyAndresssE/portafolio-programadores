/**
 * Helper para convertir datos del backend a formato del frontend
 */

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
 */
export function convertirUsuario(usuario: any): any {
    if (!usuario) return null;
    return {
        ...usuario,
        tecnologias: convertirTecnologias(usuario.tecnologias)
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
