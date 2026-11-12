# real-estate-manager

## Login y gestión de propiedades

Iniciar el backend en `http://localhost:3000` y este proyecto con `npm run dev`. Vite envía `/api` y `/uploads` al backend. Para otro servidor, definir `VITE_API_URL` con la URL completa terminada en `/api` y configurar `FRONT_URL` en el backend con el origen del frontend.

Ingresar con el nombre de usuario y contraseña de una cuenta activa. Un administrador o agente llega al listado de propiedades; desde allí puede crear, editar, borrar y abrir `/property/:id`. Las imágenes y PDF se cargan después de guardar la propiedad. Si falla un archivo, el formulario informa que los datos principales quedaron guardados.

## Registro, chat y agenda

Las invitaciones de propietarios e inquilinos abren `/activar?codigo=...`. El usuario ingresa el correo, una contraseña nueva y el DNI autorizado. `POST /api/auth/registro` comprueba los tres datos y limita a tres los intentos de DNI por invitación. En bases existentes, aplicar primero `../real-estate-manager-back/db/migrations/20261111_registro_dni.sql`. Una instalación nueva usa `db/db.sql` del backend con la columna incluida. Los usuarios que no tienen DNI cargado deben pedir a la inmobiliaria que complete ese dato antes de registrarse.

El chat usa `/api/chat` para conversaciones, contactos, mensajes y adjuntos. La agenda usa `/api/visitas` y `/api/visitas/clientes`; los agentes pueden crear clientes y programar, modificar o cancelar visitas. “Mis propiedades” toma los contratos asociados al usuario y los reportes de esas propiedades. El backend limita los reportes de propietarios e inquilinos a propiedades vinculadas a sus contratos.
A comprehensive real estate management platform for properties, clients, rentals, sales, contracts, payments, maintenance, and more.
