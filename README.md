# real-estate-manager

## Login y gestión de propiedades

Para habilitar los botones de Google en Login y Registro, definir `VITE_GOOGLE_CLIENT_ID` con el ID de cliente OAuth de tipo **Aplicación web** (termina en `.apps.googleusercontent.com`) y usar el mismo valor como `GOOGLE_CLIENT_ID` en el backend. No usar el secreto de cliente (`GOCSPX-...`): Vite expone las variables `VITE_` al navegador. En Google Cloud, agregar el origen exacto del frontend (por ejemplo, `http://localhost:5173`) a **Orígenes autorizados de JavaScript** y reiniciar Vite después de editar `.env`. El registro con Google solo aparece después de verificar DNI desde una invitación. Si una cuenta Google corresponde a varias inmobiliarias, el login solicita elegir una.

Iniciar el backend en `http://localhost:3000` y este proyecto con `npm run dev`. Vite envía `/api` y `/uploads` al backend. Para otro servidor, definir `VITE_API_URL` con la URL completa terminada en `/api` y configurar `FRONT_URL` en el backend con el origen del frontend.

Ingresar con el nombre de usuario y contraseña de una cuenta activa. Un administrador o agente llega al listado de propiedades; desde allí puede crear, editar, borrar y abrir `/propiedad/:id`. Las imágenes y PDF se cargan después de guardar la propiedad. Si falla un archivo, el formulario informa que los datos principales quedaron guardados.

## Registro, chat y agenda

Las invitaciones abren `/activar?codigo=...`. El titular verifica el DNI autorizado (hasta tres intentos) y continúa a `/registro`, donde puede elegir usuario y contraseña o Google. El registro con Google genera un usuario y permite crear una contraseña más adelante desde `/perfil` sin volver a verificar Google; el inicio de sesión con Google sigue disponible. En bases existentes deben estar aplicadas las migraciones de invitación y DNI indicadas en el README del backend. Los usuarios sin DNI cargado deben pedir a la inmobiliaria que complete ese dato antes de registrarse.

El chat usa `/api/chat` para conversaciones, contactos y mensajes de texto. La agenda usa `/api/visitas` y `/api/visitas/clientes`; los agentes pueden crear clientes y programar, modificar o cancelar visitas. “Mis propiedades” toma los contratos asociados al usuario y los reportes de esas propiedades. La vista de reportes consulta `/api/reportes` y `/api/reportes/catalogos`, permite crear reportes con fotos en las propiedades autorizadas y deja que agentes y administradores cambien su estado. El backend limita los reportes del propietario a sus propiedades y los del inquilino a su propiedad asignada o, si no tiene asignación, al alquiler vigente.
A comprehensive real estate management platform for properties, clients, rentals, sales, contracts, payments, maintenance, and more.
