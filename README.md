# Portafolio Devs – Plataforma para Programadores

Bienvenido a **Portafolio Devs**. Esta aplicación nace con una idea sencilla: conectar a desarrolladores con personas que buscan soluciones reales, en un entorno visual moderno y bien cuidado.
No es un simple listado. Es una plataforma completa, rápida y lista para escalar, construida con **Angular 20** y **Firebase**.

---

## Tecnologías utilizadas

El proyecto está armado con un stack pensado para rendimiento y mantenimiento:

* **Angular 20**: Aprovecha componentes standalone, signals y SSR para una carga inicial más rápida.
* **Firebase**: Autenticación y base de datos con Firestore.
* **Vercel**: Despliegue simple y eficiente.
* **SCSS (Sass)**: Estilos modulares y controlados.
* **EmailJS**: Notificaciones por correo sin levantar backend adicional.
* **Diseño propio en UI**: Todo el CSS está escrito a mano, con un tema **dark premium** basado en rojo y negro.

---

## Estructura del proyecto (`src/app`)

La organización está pensada para ubicar cada parte sin perder tiempo:

### Autenticación (`/autenticacion`)

Módulo dedicado al login.

* `inicio-sesion`: Login con Google y asignación de rol a nuevos usuarios.

### Público (`/publico`)

Vista general para cualquier visitante.

* `inicio`: Landing page con buscador de programadores.
* `perfil-publico`: Vista individual de un desarrollador.
* `panel-usuario`: Panel para clientes donde manejan sus solicitudes.

### Programador (`/programador`)

Zona exclusiva para los desarrolladores registrados.

* `panel-programador`: Gestión de perfil, proyectos y solicitudes recibidas.

### Administrador (`/administrador`)

* `admin-dashboard`: Panel para controlar usuarios y revisar estadísticas.

### Compartido (`/compartido`)

Componentes usados en toda la aplicación:

* `notificacion`: Sistema propio de toasts.
* `seleccion-rol-modal`: Modal que aparece cuando un usuario entra por primera vez.

## Servicios (`/servicios`)

Lógica principal del proyecto:

* `autenticacion.servicio.ts`: Manejo de roles y autenticación vía Firebase.
* `usuarios.servicio.ts`: CRUD completo de perfiles.
* `email.servicio.ts`: Envío de correos con EmailJS.

---

## Estilos y configuración visual

El diseño se controla desde `src/styles.scss`.
Los colores principales se ajustan modificando las variables en `:root`:

```scss
:root {
  --primary-color: #A10000;
  --background-color: #000000;
  /* ... */
}
```

Cambias un valor y el tema entero se adapta.

---

## Cómo correr el proyecto

### 1. Requisitos

Node.js 18 o superior.

### 2. Instalación de dependencias

```bash
npm install
```

### 3. Configura tus entornos

En la carpeta `src/environments` encontrarás un archivo de ejemplo.
Debes crear:

* `environment.ts`
* `environment.development.ts`

Con tus credenciales:

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROJECT.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT.appspot.com",
    messagingSenderId: "...",
    appId: "..."
  },
  emailjs: {
    serviceId: 'TU_SERVICE_ID',
    templateId: 'TU_TEMPLATE_ID',
    publicKey: 'TU_PUBLIC_KEY'
  }
};
```

* En Firebase debes habilitar Google Auth y Firestore.
* En EmailJS obtienes las claves desde su panel.

### 4. Iniciar el servidor

```bash
ng serve
```

Luego abre:
`http://localhost:4200`

---

## Comandos útiles

* `npm start` – Inicia el servidor en modo desarrollo.
* `npm run build` – Genera el build de producción.

---

Proyecto construido con dedicación y con la intención de ofrecer una experiencia limpia, útil y bien organizada. Disfrútalo.
