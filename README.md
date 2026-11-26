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

## 4. Subir a GitHub y desplegar en Vercel

1. Subí el contenido de `umbral` a tu repositorio público. Dejá `package.json`, `package-lock.json` y `README.md` en la raíz. El `.gitignore` excluye `.env.local`, certificados, dependencias y compilaciones.
2. En Vercel, elegí **Add New → Project** e importá tu repositorio. Seleccioná **Next.js**, la carpeta donde esté `package.json` y Node.js **24.x**. Mantené los comandos predeterminados.
3. Agregá las dos variables públicas de Supabase y `APP_URL` al entorno **Production**. En `APP_URL` usá el origen HTTPS del proyecto (copiá el dominio de Vercel y anteponé `https://`). Si el dominio definitivo se asigna en el primer despliegue, ajustá la variable después y ejecutá **Redeploy**.
4. En Supabase cambiá **Site URL** al mismo origen HTTPS. Abrí esa URL de producción y probá registro, verificación, recuperación, acceso privado y salida. Cada entorno de vista previa necesita su propio `APP_URL` si vas a probar formularios allí.
5. Pegá la URL real al inicio de este README y subí el cambio. Entregá al docente el enlace al repositorio público y el enlace al dominio de producción. [Variables de Vercel](https://vercel.com/docs/environment-variables/managing-environment-variables)

## 5. Arquitectura y seguridad

| Requisito | Implementación |
| --- | --- |
| Server Components | `lib/supabase/server.ts` lee las cookies por solicitud. El layout verifica el usuario y adapta su navegación. El dashboard vuelve a exigir una identidad verificada. |
| Client Components | `lib/supabase/client.ts` crea un cliente público con Auth deshabilitado mediante `accessToken`. Solo consulta el catálogo público de guías. Los formularios envían los datos a Server Actions. |
| Middleware de Next.js | En Next.js 16 la convención se llama **Proxy**. `proxy.ts` usa `@supabase/ssr`, verifica al usuario con `getUser()`, actualiza la petición y conserva las cookies en la respuesta, incluso al redirigir. [Documentación de Next.js](https://nextjs.org/docs/app/getting-started/proxy) |
| Server Actions | `app/actions.ts` valida origen, correo, nombre, código y contraseña según la operación. La verificación de identidad y las escrituras de cookies ocurren en el servidor. |
| Route Handler | `app/api/mi-cuenta/route.ts` vuelve a validar al usuario, responde con datos mínimos y aplica `private, no-store`. Se puede consultar con el navegador. |
| Cookies y caché | `lib/supabase/ssr.ts` fuerza los atributos de sesión. El Proxy conserva los encabezados de caché del SDK. Las rutas con sesión se renderizan por petición. [Guía SSR de Supabase](https://supabase.com/docs/guides/auth/server-side/advanced-guide) |
| Recuperación | La acción valida el código de tipo `recovery` con un cliente efímero en el servidor, actualiza la contraseña y cierra esa sesión. El usuario ingresa de nuevo desde login. |
| XSS | React escapa el nombre y el resto del texto renderizado. La política CSP asigna un nonce nuevo a los scripts de cada respuesta. La aplicación sirve las fuentes localmente. |
| CSRF | Las mutaciones usan Server Actions por POST, la verificación de origen de Next.js, la comparación estricta con `APP_URL` y cookies SameSite=Lax. Un origen ausente o diferente se rechaza. [Documentación de Server Actions](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions) |
| PostgreSQL y RLS | Cada usuario autenticado solo puede leer su fila en `umbral_profiles`. El trigger crea la fila al registrarse. `umbral_guides` permite lectura pública. Los roles del navegador carecen de permisos de escritura en ambas tablas. |
| SEO | La portada tiene título, descripción, URL canónica y entrada en `sitemap.xml`. Las páginas de cuenta y el dashboard usan `noindex`. |

### Problemas frecuentes

- **No llega el código.** Revisá spam, las dos plantillas, el remitente SMTP y los límites de envío. En Supabase, consultá **Authentication → Logs** para distinguir una dirección no autorizada de un límite temporal.
- **El formulario rechaza el origen.** Compará protocolo, dominio y puerto del navegador con `APP_URL`. Después de editar variables, reiniciá Next.js o volvé a desplegar.
- **El perfil o las guías dan error.** Verificá que ejecutaste `supabase/schema.sql` en el mismo proyecto de la Project URL. Si tu proyecto tiene deshabilitada la **Data API**, habilitala y exponé el esquema `public`. Conservá las políticas RLS.
- **La cookie aparece en DevTools.** DevTools permite inspeccionar sus atributos. La prueba de acceso desde la página es `document.cookie`.
