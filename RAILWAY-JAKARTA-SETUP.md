# 🚀 CONFIGURACIÓN RAILWAY - JAKARTA EE BACKEND

## 📋 PASOS PARA DESPLEGAR

### 1️⃣ Copiar archivos al proyecto Jakarta

Copia estos archivos a la raíz de tu repo `portafolio_backend`:

```
C:\Users\jordy\OneDrive\Documentos\NetBeansProjects\portafolio_backend\
├── backproyecto/          (tu código Jakarta)
├── Dockerfile             ← COPIAR Dockerfile-jakarta y renombrar
├── .dockerignore          ← COPIAR .dockerignore-jakarta y renombrar
└── .git/
```

**Comandos para copiar:**
```powershell
# Ir a la carpeta del repo
cd C:\Users\jordy\OneDrive\Documentos\NetBeansProjects\portafolio_backend

# Copiar Dockerfile
Copy-Item "C:\Users\jordy\Desktop\portafolio-programadores\Dockerfile-jakarta" -Destination ".\Dockerfile"

# Copiar .dockerignore
Copy-Item "C:\Users\jordy\Desktop\portafolio-programadores\.dockerignore-jakarta" -Destination ".\.dockerignore"
```

---

### 2️⃣ Hacer commit y push

```bash
git add Dockerfile .dockerignore
git commit -m "Add Dockerfile for Railway deployment"
git push origin main
```

---

### 3️⃣ Configurar Root Directory en Railway

En Railway → tu servicio `portafolio_backend` → Settings:
- **Root Directory:** `backproyecto` ❌ QUITAR ESTO
- Déjalo **VACÍO** (el Dockerfile ya maneja la ruta)

---

### 4️⃣ Configurar Variables de Entorno en Railway

Ve a tu servicio `portafolio_backend` → Variables → Add Variable

#### Opción A: Usar DATABASE_URL del MySQL de Railway

Railway crea automáticamente `DATABASE_URL` cuando conectas el servicio MySQL.

**Solo necesitas conectar:**
1. En tu servicio `portafolio_backend`, ve a **Settings**
2. Busca **"Connect to service"** o **"Add variable reference"**
3. Selecciona tu servicio **MySQL**
4. Railway agregará automáticamente `DATABASE_URL`

✅ **El Dockerfile extrae automáticamente**: user, pass, host, port, database

---

#### Opción B: Variables individuales (si no usas DATABASE_URL)

Si prefieres configurar manualmente:

```
DB_HOST = [copia MYSQL_HOST del servicio MySQL]
DB_PORT = [copia MYSQL_PORT del servicio MySQL]
DB_USER = [copia MYSQL_USER del servicio MySQL]
DB_PASSWORD = [copia MYSQL_PASSWORD del servicio MySQL]
DB_NAME = [copia MYSQL_DATABASE del servicio MySQL]
```

---

### 5️⃣ Redeploy

1. Railway detectará el Dockerfile
2. Compilará tu proyecto Maven
3. Instalará WildFly
4. Configurará el DataSource con MySQL de Railway
5. Desplegará `backproyecto.war`

---

## 🔍 VERIFICAR DEPLOYMENT

### Logs esperados:

```
[INFO] Building backproyecto 0.0.1-SNAPSHOT
[INFO] BUILD SUCCESS
WFLYSRV0025: WildFly 38.0.1.Final started in XXXms
WFLYSRV0010: Deployed "backproyecto.war"
```

### Probar endpoints:

Railway te dará una URL como: `https://portafolio-backend-production-xxx.up.railway.app`

Prueba:
```
https://tu-url.up.railway.app/backproyecto/api/asesorias/test
```

---

## ⚙️ CONFIGURACIÓN ADICIONAL (Opcional)

### Generar Dominio Público

En Railway → Settings → Networking:
- Click **"Generate Domain"**
- Obtendrás: `https://backproyecto.up.railway.app`

### Actualizar CORS (si hay problemas desde Vercel)

Si tu frontend en Vercel no puede acceder, agrega un filtro CORS en tu código Jakarta.

---

## 🐛 TROUBLESHOOTING

### Error: "Communications link failure"
✅ Verifica que las variables de MySQL estén correctas

### Error: "Datasource not found"
✅ Revisa los logs, el script debe crear `PortafolioDS`

### Error: "BUILD FAILED"
✅ Verifica que `pom.xml` esté en `backproyecto/pom.xml`

---

## 📝 RESUMEN

1. ✅ Copiar `Dockerfile` y `.dockerignore` al repo
2. ✅ Quitar Root Directory en Railway Settings
3. ✅ Conectar MySQL service o configurar variables
4. ✅ Push a GitHub → Railway autodespliega
5. ✅ Obtener URL de Railway
6. ✅ Actualizar frontend Angular en Vercel

---

**¿Listo para copiar los archivos y desplegar?** 🚀
