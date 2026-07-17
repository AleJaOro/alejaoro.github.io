# PagoFácil

Sitio y paneles para gestión de **pagos de facturas asistidos** y **citas**.  
Datos en **Firebase** (Authentication + Firestore). Los pagos no son en línea: el equipo los gestiona manualmente.

## Estructura del repositorio

```
pago-citas-online/
├── index.html              # Sitio público
├── login.html              # Login unificado (admin o cliente)
├── cliente.html            # Panel del cliente
├── admin.html              # Admin · catálogo de trámites
├── admin-clientes.html     # Admin · lista de clientes
├── admin-cliente.html      # Admin · detalle (servicios, citas, historial)
├── instrucciones.html      # Admin · instrucciones internas
├── styles.css              # Estilos del sitio público
├── admin.css               # Estilos de paneles
├── script.js               # JS del sitio público
├── iniciar-servidor.bat    # Servidor local (Windows)
├── js/
│   ├── firebase-init.js    # Config del proyecto Firebase
│   ├── auth-service.js     # Login, roles, alta de clientes
│   ├── data-service.js     # Firestore en tiempo real
│   └── utils.js            # Utilidades UI
└── docs/
    └── FIREBASE-REGLAS.md  # Reglas y cómo crear admins (consola)
```

No subas contraseñas de admin al repositorio. Los admins se crean solo en la **consola de Firebase** (ver `docs/FIREBASE-REGLAS.md`).

## Requisitos Firebase

1. Authentication → **Email/Password**  
2. Firestore → reglas de `docs/FIREBASE-REGLAS.md`  
3. Crear admins en consola (Auth + documento en `users` con `role: "admin"`)  
4. No se usa Storage  

## Desarrollo local

Los módulos ES de Firebase **no funcionan** abriendo el HTML con doble clic (`file://`).

```bash
# Opción A (Windows): doble clic en
iniciar-servidor.bat

# Opción B
python -m http.server 8080
```

Luego abre: [http://localhost:8080](http://localhost:8080)

## Publicar (GitHub Pages u otro hosting estático)

1. Sube esta carpeta al repositorio (contenido como está).  
2. Activa hosting estático (GitHub Pages, Netlify, Firebase Hosting, etc.).  
3. En Firebase Console → Authentication → **Settings → Authorized domains**, agrega tu dominio (ej. `tuusuario.github.io`).  
4. Abre la URL del hosting (siempre por `https://`, no `file://`).

### GitHub Pages (rápido)

- Repo → **Settings → Pages**  
- Source: branch `main`, carpeta `/ (root)`  
- URL típica: `https://TU_USUARIO.github.io/NOMBRE_REPO/`

Si el sitio queda en una subruta (`/NOMBRE_REPO/`), las rutas relativas actuales (`login.html`, `js/...`) funcionan bien.

## Roles

| Rol     | Acceso                                      |
|---------|---------------------------------------------|
| admin   | Trámites, clientes, citas, instrucciones    |
| client  | Solo su panel (facturas, citas, historial)  |

## Seguridad

- La API key web de Firebase es pública por diseño; la seguridad está en las **reglas de Firestore**.  
- No publiques contraseñas de admin en el README ni en issues.  
- Cambia las contraseñas de admin en Authentication cuando sea necesario.
