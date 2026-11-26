# Umbral · Autenticación con cookies httpOnly

Proyecto académico de autenticación con Next.js 16, App Router, TypeScript y Supabase Auth + PostgreSQL. Permite registrarse, confirmar el correo mediante un código, iniciar y cerrar sesión, consultar un perfil privado y recuperar la contraseña.

**Aplicación en producción:** pendiente de publicar. Después del despliegue, reemplazá esta línea por la URL HTTPS asignada a tu proyecto.

## 1. Preparar Supabase

1. Creá un proyecto de Supabase para la actividad. En **SQL Editor → New query**, pegá el contenido de [schema.sql](supabase/schema.sql) y presioná **Run**. El script crea las tablas, las políticas de acceso y el trigger que genera un perfil por usuario. Podés volver a ejecutarlo.
2. En **Authentication → Sign In / Providers**, habilitá **Email**, el registro de usuarios nuevos y **Confirm email**. Configurá la longitud mínima de contraseña en **12** para que coincida con el formulario.
3. En **Authentication → Email Templates** (en algunas versiones, **Emails → Templates**), copiá **todo el HTML** de cada archivo en su plantilla y guardá los cambios.

   | Plantilla de Supabase | Archivo que debés copiar |
   | --- | --- |
   | Confirm signup | [confirm-signup.html](supabase/confirm-signup.html) |
   | Reset password | [reset-password.html](supabase/reset-password.html) |

   Ambas usan `{{ .Token }}`. El usuario escribe el código en la aplicación. Si el correo solo trae un botón o un enlace, revisá la plantilla.
4. En **Authentication → URL Configuration**, usá `http://localhost:3000` como **Site URL** mientras probás localmente. Los flujos de este proyecto usan códigos que se ingresan manualmente.
5. Para recibir los mensajes de prueba con el servicio de correo predeterminado, usá una dirección del equipo de tu organización de Supabase. Para permitir que un docente u otro usuario se registre con su propio correo, configurá un proveedor en **Authentication → SMTP Settings** y verificá el remitente. Consultá también **Rate Limits** y la caducidad del código en tu proyecto. [Documentación de SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
6. En **Connect** o en **Project Settings → API Keys**, copiá la **Project URL** y la clave **publishable** (`sb_publishable_…`). También se admite la clave pública heredada **anon**. Las claves secretas y `service_role` otorgan privilegios que esta aplicación no necesita.

## 2. Iniciar en Windows

Instalá Node.js 24 LTS con npm. Descomprimí el ZIP y abrí la carpeta `umbral`, donde está `package.json`, en VS Code. En su terminal de PowerShell ejecutá estos comandos.

```powershell
npm ci
Copy-Item .env.example .env.local
```

Editá `.env.local` con tus valores. La URL es la base del proyecto, sin `/rest/v1` ni `/auth/v1`.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica
APP_URL=http://localhost:3000
```

```powershell
npm run dev
```

Abrí **http://localhost:3000**. Si cambiás el puerto, actualizá `APP_URL`, reiniciá el servidor y abrí exactamente ese origen. Para Linux o macOS, reemplazá `Copy-Item .env.example .env.local` por `cp .env.example .env.local`.

Las cookies llevan `Secure` también en desarrollo. Chrome y Brave admiten el acceso desde `localhost`. Para probar desde otro equipo, usá un origen HTTPS. Si usás el HTTPS local de Next, ejecutá `npm run dev -- --experimental-https`, configurá `APP_URL=https://localhost:3000` y abrí esa misma dirección.

## 3. Comprobar el funcionamiento

| Prueba | Pasos | Resultado esperado |
| --- | --- | --- |
| Ruta privada | Abrí una ventana de incógnito y visitá `/dashboard`. | Redirige a `/login`. |
| Registro | En `/registro`, ingresá un nombre, un correo habilitado y una contraseña de 12 o más caracteres. | Se abre `/verificar` con el correo precargado. |
| Verificación | Copiá el código del último correo y confirmalo. | Se abre el dashboard con nombre, correo, fecha de registro e ID. |
| Navegación | Con sesión abierta, visitá `/login` y `/registro`. | Ambas rutas vuelven al dashboard. El menú muestra **Mi perfil** y **Cerrar sesión**. |
| Database y cliente público | En el dashboard, desplegá **Guías de seguridad**. | Aparecen tres guías de PostgreSQL. El nombre del perfil se consulta en el servidor. |
| Cookies | En DevTools → Application → Cookies, elegí el origen de la aplicación y localizá las cookies `sb-…-auth-token`. | Cada parte de la sesión tiene **HttpOnly**, **Secure**, **SameSite=Lax** y **Path=/**. |
| Almacenamiento | Revisá **Local Storage** y ejecutá `document.cookie` en la consola del sitio. | El almacenamiento local no contiene tokens de sesión. Las cookies de autenticación no aparecen en el resultado de JavaScript. |
| Route Handler | Abrí `/api/mi-cuenta` en el navegador con sesión y luego en incógnito. | Con sesión devuelve JSON con ID, correo y verificación. Sin sesión devuelve HTTP 401. |
| Cierre de sesión | Presioná **Cerrar sesión**, recargá y visitá `/dashboard`. | Se vuelve a pedir acceso. |
| Recuperación | En login elegí **¿La olvidaste?**, solicitá el código y escribilo junto con la nueva contraseña. | Regresa a login con confirmación. La contraseña anterior falla y la nueva permite entrar. |
| Validaciones | Probá contraseñas que no coincidan, un código incorrecto y credenciales inválidas. | La interfaz explica qué revisar y mantiene protegidos los datos del perfil. |
| Renovación | Dejá una pestaña inactiva más allá de la vigencia del JWT configurada en Supabase, conservando una sesión con refresh token válido. Volvé a cargar el dashboard. | El servidor renueva la sesión y devuelve cookies actualizadas sin pedir otra vez la contraseña. |

Para entregar evidencia, podés capturar el dashboard y las columnas de atributos de las cookies. Ocultá el valor de las cookies y usá una cuenta de prueba.

### Verificación por comandos

```powershell
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

`npm test` comprueba validaciones y comparación de origen sin conectar con Supabase. Detené `npm run dev` antes de ejecutar la compilación y el servidor de producción local.

