import { Usuario } from '../modelos/usuario.modelo';

/**
 * Convierte un Usuario del frontend al formato esperado por Spring Boot
 */
export function convertirUsuarioABackend(usuario: Usuario): any {
    const dto: any = {
        uid: usuario.uid,
        email: usuario.email,
        nombre: usuario.nombre,
        fotoPerfil: usuario.fotoPerfil || '',
        telefono: usuario.telefono || '', // 📱 Campo teléfono para WhatsApp
        rol: usuario.rol,
        especialidad: usuario.especialidad || '',
        descripcion: usuario.descripcion || '',
        
        // CONVERTIR TECNOLOGIAS: Array → String separado por comas
        tecnologias: Array.isArray(usuario.tecnologias) 
            ? usuario.tecnologias.join(',') 
            : usuario.tecnologias || '',
        
        // CONVERTIR REDES SOCIALES: Objeto → Campos planos
        linkedin: usuario.redesSociales?.linkedin || '',
        github: usuario.redesSociales?.github || '',
        twitter: usuario.redesSociales?.twitter || '',
        sitioWeb: usuario.redesSociales?.sitioWeb || '',
        
        // CONVERTIR MODALIDAD
        modalidad: usuario.disponibilidad?.modalidad || 'virtual',
        
        // CONVERTIR HORARIOS: Objeto → Campos planos por día
        horarioLunes: usuario.disponibilidad?.horariosPorDia?.['Lunes']?.activo
            ? `${usuario.disponibilidad.horariosPorDia['Lunes'].horaInicio}-${usuario.disponibilidad.horariosPorDia['Lunes'].horaFin}`
            : '',
        horarioMartes: usuario.disponibilidad?.horariosPorDia?.['Martes']?.activo
            ? `${usuario.disponibilidad.horariosPorDia['Martes'].horaInicio}-${usuario.disponibilidad.horariosPorDia['Martes'].horaFin}`
            : '',
        horarioMiercoles: usuario.disponibilidad?.horariosPorDia?.['Miércoles']?.activo
            ? `${usuario.disponibilidad.horariosPorDia['Miércoles'].horaInicio}-${usuario.disponibilidad.horariosPorDia['Miércoles'].horaFin}`
            : '',
        horarioJueves: usuario.disponibilidad?.horariosPorDia?.['Jueves']?.activo
            ? `${usuario.disponibilidad.horariosPorDia['Jueves'].horaInicio}-${usuario.disponibilidad.horariosPorDia['Jueves'].horaFin}`
            : '',
        horarioViernes: usuario.disponibilidad?.horariosPorDia?.['Viernes']?.activo
            ? `${usuario.disponibilidad.horariosPorDia['Viernes'].horaInicio}-${usuario.disponibilidad.horariosPorDia['Viernes'].horaFin}`
            : '',
        horarioSabado: usuario.disponibilidad?.horariosPorDia?.['Sábado']?.activo
            ? `${usuario.disponibilidad.horariosPorDia['Sábado'].horaInicio}-${usuario.disponibilidad.horariosPorDia['Sábado'].horaFin}`
            : '',
        horarioDomingo: usuario.disponibilidad?.horariosPorDia?.['Domingo']?.activo
            ? `${usuario.disponibilidad.horariosPorDia['Domingo'].horaInicio}-${usuario.disponibilidad.horariosPorDia['Domingo'].horaFin}`
            : ''
    };
    
    return dto;
}


/**
 * Convierte un Usuario del backend al formato del frontend
 */
export function convertirUsuarioDesdeBackend(usuarioBackend: any): Usuario {
    const usuario: Usuario = {
        uid: usuarioBackend.uid,
        email: usuarioBackend.email,
        nombre: usuarioBackend.nombre,
        fotoPerfil: usuarioBackend.fotoPerfil,
        telefono: usuarioBackend.telefono, // 📱 Campo teléfono desde backend
        rol: usuarioBackend.rol,
        especialidad: usuarioBackend.especialidad,
        descripcion: usuarioBackend.descripcion,
        
        // CONVERTIR TECNOLOGIAS: String → Array
        tecnologias: usuarioBackend.tecnologias 
            ? usuarioBackend.tecnologias.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
            : [],
        
        // CONVERTIR REDES SOCIALES: Campos planos → Objeto
        redesSociales: {
            linkedin: usuarioBackend.linkedin || '',
            github: usuarioBackend.github || '',
            twitter: usuarioBackend.twitter || '',
            sitioWeb: usuarioBackend.sitioWeb || ''
        },
        
        // CONVERTIR HORARIOS: Campos planos → Objeto por día
        disponibilidad: {
            modalidad: usuarioBackend.modalidad || 'virtual',
            horariosPorDia: {
                'Lunes': parsearHorario(usuarioBackend.horarioLunes),
                'Martes': parsearHorario(usuarioBackend.horarioMartes),
                'Miércoles': parsearHorario(usuarioBackend.horarioMiercoles),
                'Jueves': parsearHorario(usuarioBackend.horarioJueves),
                'Viernes': parsearHorario(usuarioBackend.horarioViernes),
                'Sábado': parsearHorario(usuarioBackend.horarioSabado),
                'Domingo': parsearHorario(usuarioBackend.horarioDomingo)
            }
        }
    };
    
    return usuario;
}

/**
 * Helper para parsear horario desde formato "09:00-17:00"
 */
function parsearHorario(horarioStr: string | undefined): any {
    if (!horarioStr || horarioStr.trim() === '') {
        return { activo: false, horaInicio: '09:00', horaFin: '18:00' };
    }
    
    const partes = horarioStr.split('-');
    if (partes.length === 2) {
        return {
            activo: true,
            horaInicio: partes[0].trim(),
            horaFin: partes[1].trim()
        };
    }
    
    return { activo: false, horaInicio: '09:00', horaFin: '18:00' };
}
