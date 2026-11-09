# real-estate-manager

## Login y gestión de propiedades

Iniciar el backend en `http://localhost:3000` y este proyecto con `npm run dev`. Vite envía `/api` y `/uploads` al backend. Para otro servidor, definir `VITE_API_URL` con la URL completa terminada en `/api` y configurar `FRONT_URL` en el backend con el origen del frontend.

Ingresar con el nombre de usuario y contraseña de una cuenta activa. Un administrador o agente llega al listado de propiedades; desde allí puede crear, editar, borrar y abrir `/property/:id`. Las imágenes y PDF se cargan después de guardar la propiedad. Si falla un archivo, el formulario informa que los datos principales quedaron guardados.
A comprehensive real estate management platform for properties, clients, rentals, sales, contracts, payments, maintenance, and more.
