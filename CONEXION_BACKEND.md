# 🔌 Conexión Frontend Angular ↔ Backend Jakarta

## ✅ Servicios Backend Creados

Se han creado 3 nuevos servicios que consumen tu API REST de Jakarta:

1. **`usuarios-backend.servicio.ts`** - Gestión de usuarios
2. **`proyectos-backend.servicio.ts`** - Gestión de proyectos  
3. **`asesorias-backend.servicio.ts`** - Gestión de asesorías

---

## 📝 Configuración Necesaria

### 1. Actualizar el archivo `environment.ts`

Copia la configuración de `environment.example.ts` a tu archivo `environment.ts` (que está en `.gitignore`):

```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/backproyecto/api', // ⚠️ AJUSTA ESTA URL
    firebase: {
        // ... tu configuración de Firebase
    }
};
```

**⚠️ IMPORTANTE:** Verifica que la URL coincida con tu backend:
- Si usas **WildFly**: `http://localhost:8080/backproyecto/api`
- Si usas **Payara**: `http://localhost:8080/backproyecto/api`
- Si usas **TomEE**: `http://localhost:8080/backproyecto/api`

---

## 🔄 Cómo Usar los Servicios

### Ejemplo 1: Obtener todos los programadores

**Antes (con Firestore):**
```typescript
import { UsuariosServicio } from './servicios/usuarios.servicio';

constructor(private usuariosService: UsuariosServicio) {}

async cargarProgramadores() {
  const programadores = await this.usuariosService.obtenerProgramadores();
}
```

**Ahora (con Backend):**
```typescript
import { UsuariosBackendServicio } from './servicios/usuarios-backend.servicio';

constructor(private usuariosBackend: UsuariosBackendServicio) {}

cargarProgramadores() {
  this.usuariosBackend.obtenerProgramadores().subscribe({
    next: (programadores) => {
      console.log('Programadores:', programadores);
      this.programadores = programadores;
    },
    error: (error) => {
      console.error('Error al cargar programadores:', error);
    }
  });
}
```

---

### Ejemplo 2: Crear un proyecto

```typescript
import { ProyectosBackendServicio } from './servicios/proyectos-backend.servicio';

constructor(private proyectosBackend: ProyectosBackendServicio) {}

crearNuevoProyecto() {
  const proyecto = {
    id: 'PRO004',
    idProgramador: 'prog001',
    nombre: 'Mi Proyecto',
    descripcion: 'Descripción del proyecto',
    tipo: 'academico',
    participacion: 'Fullstack',
    tecnologias: 'Angular,Java,PostgreSQL',
    repoUrl: 'https://github.com/usuario/proyecto',
    demoUrl: 'https://proyecto.vercel.app',
    imagenUrl: 'https://via.placeholder.com/400x200'
  };

  this.proyectosBackend.crearProyecto(proyecto).subscribe({
    next: (proyectoCreado) => {
      console.log('Proyecto creado:', proyectoCreado);
    },
    error: (error) => {
      console.error('Error al crear proyecto:', error);
    }
  });
}
```

---

### Ejemplo 3: Aprobar una asesoría

```typescript
import { AsesoriasBackendServicio } from './servicios/asesorias-backend.servicio';

constructor(private asesoriasBackend: AsesoriasBackendServicio) {}

aprobarSolicitud(idAsesoria: string) {
  const mensaje = 'Perfecto, nos vemos en la fecha acordada!';
  
  this.asesoriasBackend.aprobarAsesoria(idAsesoria, mensaje).subscribe({
    next: (asesoriaAprobada) => {
      console.log('Asesoría aprobada:', asesoriaAprobada);
    },
    error: (error) => {
      console.error('Error al aprobar:', error);
    }
  });
}
```

---

## 🚀 Pasos para Conectar Todo

### 1. **Inicia tu backend Jakarta**
   - Abre Eclipse
   - Inicia tu servidor (WildFly/Payara/TomEE)
   - Verifica que esté corriendo en: `http://localhost:8080`

### 2. **Verifica que los endpoints funcionen**
   Abre tu navegador y prueba:
   ```
   http://localhost:8080/backproyecto/api/usuarios/test
   http://localhost:8080/backproyecto/api/proyectos/test
   http://localhost:8080/backproyecto/api/asesorias/test
   ```
   
   Deberías ver: `"API funcionando correctamente!"`

### 3. **Actualiza tus componentes Angular**
   Reemplaza los servicios de Firestore por los servicios Backend:
   
   ```typescript
   // ❌ Elimina esto:
   import { UsuariosServicio } from './servicios/usuarios.servicio';
   
   // ✅ Usa esto:
   import { UsuariosBackendServicio } from './servicios/usuarios-backend.servicio';
   ```

### 4. **Inicia tu frontend Angular**
   ```bash
   npm start
   ```

---

## 🔍 Verificar que Funcione

### Prueba en la consola del navegador:

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Filtra por **XHR** o **Fetch**
4. Deberías ver peticiones a: `http://localhost:8080/backproyecto/api/...`

---

## ❗ Problemas Comunes

### Error: "CORS policy"
**Solución:** Tu backend ya tiene `CORSFilter.java` configurado ✅

### Error: "Connection refused"
**Solución:** Verifica que tu backend esté corriendo en Eclipse

### Error: "404 Not Found"
**Solución:** Verifica la URL en `environment.ts`. Debe coincidir con el contexto de tu aplicación.

### Error: "Failed to fetch"
**Solución:** Asegúrate de que ambos (frontend y backend) estén corriendo simultáneamente.

---

## 📚 Endpoints Disponibles

### **Usuarios**
- `GET /usuarios` - Todos los usuarios
- `GET /usuarios/programadores` - Solo programadores
- `GET /usuarios/{uid}` - Usuario por ID
- `POST /usuarios` - Crear usuario
- `PUT /usuarios/{uid}` - Actualizar usuario
- `DELETE /usuarios/{uid}` - Eliminar usuario

### **Proyectos**
- `GET /proyectos` - Todos los proyectos
- `GET /proyectos/{id}` - Proyecto por ID
- `GET /proyectos/programador/{idProgramador}` - Proyectos de un programador
- `GET /proyectos/tipo/{tipo}` - Proyectos por tipo (academico/laboral)
- `POST /proyectos` - Crear proyecto
- `PUT /proyectos/{id}` - Actualizar proyecto
- `DELETE /proyectos/{id}` - Eliminar proyecto

### **Asesorías**
- `GET /asesorias` - Todas las asesorías
- `GET /asesorias/{id}` - Asesoría por ID
- `GET /asesorias/programador/{idProgramador}` - Asesorías de un programador
- `GET /asesorias/usuario/{idUsuario}` - Asesorías de un usuario
- `GET /asesorias/estado/{estado}` - Asesorías por estado
- `POST /asesorias` - Crear asesoría
- `PUT /asesorias/{id}` - Actualizar asesoría
- `PUT /asesorias/{id}/aprobar` - Aprobar asesoría
- `PUT /asesorias/{id}/rechazar` - Rechazar asesoría
- `PUT /asesorias/{id}/cancelar` - Cancelar asesoría
- `DELETE /asesorias/{id}` - Eliminar asesoría

---

## 🎯 Próximos Pasos

1. ✅ Servicios backend creados
2. ⏳ Actualizar componentes para usar los nuevos servicios
3. ⏳ Probar la conexión frontend ↔ backend
4. ⏳ Migrar datos de Firestore a tu base de datos (si es necesario)

---

## 💡 Notas Importantes

- **Firebase Auth se mantiene:** Solo para autenticación de usuarios
- **Firestore se reemplaza:** Por tu backend Jakarta + PostgreSQL/MySQL
- **Los modelos deben coincidir:** Asegúrate de que los modelos TypeScript coincidan con las entidades Java

---

¿Necesitas ayuda para actualizar algún componente específico? ¡Avísame! 🚀
