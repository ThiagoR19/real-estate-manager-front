# Frontend · Gestor inmobiliario AGI

Interfaz React del gestor inmobiliario. Incluye una landing pública para una inmobiliaria, catálogo de propiedades, activación de cuentas, acceso y paneles privados para superadministradores, administradores, agentes, propietarios e inquilinos.

## Contenido

- [Tecnologías y estructura](#tecnologías-y-estructura)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Rutas y roles](#rutas-y-roles)
- [Flujos principales](#flujos-principales)
- [Integración con la API](#integración-con-la-api)
- [Google y activación de cuentas](#google-y-activación-de-cuentas)
- [Compilación y comprobaciones](#compilación-y-comprobaciones)
- [Problemas frecuentes](#problemas-frecuentes)

## Tecnologías y estructura

- React 19 y React DOM.
- Vite 8 para desarrollo y compilación.
- Wouter para rutas; Axios para peticiones HTTP.
- CSS y componentes propios del proyecto.

```text
index.html               Documento de entrada
vite.config.js           Plugin React y proxy local hacia la API
public/                  Recursos estáticos públicos
src/App.jsx              Rutas públicas, activación y aplicación privada
src/pages/               Vistas de landing, dashboards y módulos operativos
src/layouts/             Layout público, header, navegación y permisos de vistas
src/components/          Componentes compartidos
src/services/            Llamadas HTTP por módulo y fachada `api.js`
src/utils/request.js     Cliente Axios, JWT y manejo de errores
src/utils/assetUrl.js    Resolución de URLs de imágenes del backend
src/hooks/               Hooks reutilizables
src/assets/              Imágenes, iconos y estilos fuente
```

La aplicación necesita Node.js `^20.19.0` o `>=22.12.0` (requisito de Vite 8), el [backend del proyecto](../real-estate-manager-back/README.md), una base MySQL preparada y al menos una inmobiliaria para mostrar datos reales en la landing. El esquema inicial no trae usuarios ni inmobiliarias de demostración.

## Puesta en marcha

Desde `real-estate-manager-front/`:

```powershell
Copy-Item .env.example .env
npm ci
npm run dev
```

Completá `VITE_ID_INMOBILIARIA` en `.env` con el ID real de la inmobiliaria que mostrará esta instancia. Abrí la URL que indique Vite, normalmente `http://localhost:5173`. El backend debe estar activo en `http://localhost:3000` con `FRONT_URL=http://localhost:5173`.

`vite.config.js` dirige `/api` y `/uploads` al backend local. Si la API está en otra dirección, configurá `VITE_API_URL`. Reiniciá Vite después de cambiar el `.env`.

## Variables de entorno

| Variable | Uso | Ejemplo |
| --- | --- | --- |
| `VITE_ID_INMOBILIARIA` | ID de la inmobiliaria de esta landing; necesario para consultas públicas. | `1` |
| `VITE_API_URL` | Base completa de la API si no se usa `/api` y el proxy local. | `https://api.ejemplo.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | ID de cliente OAuth web para mostrar el acceso con Google. | opcional |

Ejemplo para desarrollo local:

```dotenv
VITE_ID_INMOBILIARIA=1
VITE_GOOGLE_CLIENT_ID=
```

`VITE_API_URL` puede omitirse en local. Todas las variables `VITE_` se exponen al navegador: nunca guardar allí claves privadas, contraseñas ni el secreto de cliente de Google. El backend usa el mismo ID OAuth público en `GOOGLE_CLIENT_ID`, y su `FRONT_URL` debe indicar el origen exacto del frontend.

## Rutas y roles

`src/App.jsx` monta las vistas. Las rutas de la landing y de acceso no requieren sesión; las demás entran en el layout privado. La navegación visible se filtra por rol en `src/layouts/navegacion.js`, mientras que la API aplica los permisos efectivos.

| Ruta | Vista y acceso |
| --- | --- |
| `/`, `/inicio` | Landing pública de la inmobiliaria. |
| `/sobre-nosotros` | Información pública de la inmobiliaria. |
| `/propiedades-publicas`, `/propiedad-publica` | Catálogo y detalle público de propiedades publicadas. |
| `/login` | Inicio de sesión con usuario/contraseña o Google, si está configurado. |
| `/activar?codigo=...`, `/confirmar-registro` | Verificación de DNI de una invitación. |
| `/registro` | Alta de credenciales después de verificar una invitación. |
| `/dashboard` | Dashboard correspondiente al rol. |
| `/super-admin` | Gestión de inmobiliarias y administradores. |
| `/propiedades`, `/propiedad/:id` | Listado, formulario y detalle de propiedades. |
| `/agentes`, `/propietarios`, `/inquilinos`, `/profesionales` | Gestión de personas según permisos. |
| `/agenda` | Visitas y clientes de visitas. |
| `/pagos-cobros` | Administración de pagos y liquidaciones. |
| `/pagos` | Pagos del inquilino. |
| `/cobros` | Cobros del propietario. |
| `/mis-propiedades` | Propiedades y contratos asociados al propietario. |
| `/reportes-agente`, `/reportes` | Reportes de mantenimiento. |
| `/chat`, `/perfil`, `/terminos` | Conversaciones, perfil y términos. |

| Rol | ID | Secciones principales |
| --- | --- | --- |
| Superadministrador | `1` | Panel de plataforma y perfil. |
| Administrador | `2` | Dashboard, propiedades, equipo, personas, agenda, pagos/cobros y reportes. |
| Agente | `3` | Dashboard, propiedades, agenda, profesionales, chat y reportes. |
| Propietario | `4` | Dashboard, propiedades propias, cobros, chat y reportes. |
| Inquilino | `5` | Dashboard, pagos, chat y reportes. |

Los IDs definidos en `src/utils/roles.js` deben coincidir exactamente con `roles.id` en la base de datos y con `config/roles.js` del backend. El frontend usa esos valores fijos para elegir dashboards, rutas y navegación; el backend los usa para asignar roles y aplicar permisos. El esquema SQL solo garantiza esta numeración al importar los roles en una tabla vacía. En una base existente, comprobar la correspondencia con `SELECT id, nombre FROM roles ORDER BY id;`.

Las páginas pueden mostrar controles adicionales según el rol y el estado de los datos. La autorización final siempre se decide en el backend, incluida la pertenencia a la inmobiliaria.

## Flujos principales

### Landing y propiedades

La landing consulta `GET /api/infoInmobiliaria/:id`, las propiedades destacadas y el catálogo público. El ID proviene de `VITE_ID_INMOBILIARIA`. Solo se muestran propiedades publicadas y disponibles. En el espacio privado, administradores y agentes usan `GET /api/propiedades/catalogos` y el CRUD de `/api/propiedades`. Las imágenes y PDF se suben **después** de crear o actualizar los datos de la propiedad; si falla un archivo, la interfaz informa que los datos principales quedaron guardados.

### Invitaciones y perfil

Al dar de alta administradores, agentes, propietarios o inquilinos, el backend devuelve un enlace de activación. El titular abre `/activar?codigo=...`, verifica su DNI y completa el registro en `/registro`. Tiene hasta tres intentos de DNI. La contraseña exige al menos ocho caracteres, mayúscula, minúscula y número. El DNI de la invitación no se modifica desde el perfil.

Una persona registrada con Google puede crear su primera contraseña desde `/perfil` dejando vacía la contraseña actual. Para cambiarla después debe proporcionar la actual. Si un mismo usuario y contraseña, o una misma cuenta Google, corresponden a varias inmobiliarias, el login muestra una selección de cuenta.

### Operación diaria

- **Agenda:** administración y agentes ven visitas; los agentes pueden crear clientes de visita, programar, modificar y cancelar visitas.
- **Reportes:** los inquilinos crean reportes sobre su propiedad asignada o alquiler vigente y pueden adjuntar imágenes; propietarios consultan los de sus propiedades; administradores y agentes actualizan el estado.
- **Pagos y cobros:** el inquilino consulta sus pagos y entrega comprobantes; el propietario consulta sus cobros; el personal autorizado prepara y revisa las operaciones.
- **Chat y notificaciones:** las conversaciones usan `/api/chat` y Socket.IO para eventos de mensaje y lectura; la bandeja de notificaciones conserva el estado de lectura de cada usuario.
- **Profesionales:** los agentes pueden valorar una vez a cada profesional de su inmobiliaria con una puntuación de 1 a 5.

## Integración con la API

`src/utils/request.js` crea un cliente Axios con `baseURL` igual a `VITE_API_URL` o `/api`. Por defecto agrega `Authorization: Bearer <token>` desde la sesión. Espera el formato de respuesta del backend:

```json
{ "status": "success", "data": { "...": "..." } }
```

Si una ruta autenticada devuelve `401`, limpia la sesión y redirige a `/login`. `src/services/` organiza las llamadas por módulo y `src/services/api.js` las expone a las vistas. Los archivos se envían como `FormData`; no se debe fijar manualmente el `Content-Type` multipart.

La sesión se guarda en `localStorage` con la clave `agi-session`. El cierre de sesión llama a `POST /api/auth/logout` y luego la elimina localmente. Las imágenes que devuelve la API con rutas `/uploads/...` se convierten a URLs absolutas mediante `src/utils/assetUrl.js`.

### Paginación privada de propiedades

`propiedades({ pagina, limite, busqueda }, { signal })` consulta una sola página y devuelve `{ data, paginacion }`. El contrato actual, verificado en `api/propiedades/propiedades.schema.js` y `propiedades.service.js` del backend, admite exclusivamente `page` (desde 1), `limit` (1 a 12), `q` (hasta 255 caracteres) e `idInmobiliaria` (el usuario autenticado determina el alcance efectivo). La búsqueda se aplica sobre nombre, ubicación y descripción antes de `LIMIT/OFFSET`. La respuesta incluye:

```json
{
  "status": "success",
  "data": [],
  "paginacion": { "pagina": 1, "limite": 12, "total": 0, "paginas": 0 }
}
```

La pantalla usa esos metadatos, reinicia la página al buscar y espera 300 ms para agrupar cambios de búsqueda. Cancela solicitudes anteriores y descarta sus respuestas aunque la cancelación llegue tarde. Después de crear, editar o eliminar vuelve a consultar; si una página deja de existir, consulta la última válida. Los errores permiten reintentar y no se presentan como resultados vacíos.

Agenda e InquilinoModal usan `SelectorPropiedad`: búsqueda remota con páginas de 12 y conservación de la selección actual fuera de los resultados. No existe una ruta privada de opciones resumidas; por eso se usa el listado paginado existente, sin descargar todas las propiedades. Inquilinos consulta por ID únicamente las propiedades de sus filas visibles para obtener imágenes, sin condicionar la carga de inquilinos a esas consultas.

**Cambios pendientes del backend:**

- Ampliar `GET /api/propiedades`, su esquema estricto y las condiciones SQL para filtrar por tipo, estado comercial y ubicación. Los mismos predicados deben aplicarse al listado y al `COUNT(*)`, antes de paginar. Como propuesta de contrato (aún no implementada), usar `idTipo`, `idEstadoComercial` y `ubicacion`.
- Añadir un orden configurable validado contra una lista cerrada de columnas y sentidos; no interpolar texto libre en SQL. El orden actual es exclusivamente `p.fechaCreacion DESC`. Debe agregar `p.id DESC` como desempate estable para evitar saltos o duplicados entre páginas con fechas iguales. Cualquier otro orden también necesita un desempate por ID.
- Incorporar ubicaciones distintas de toda la inmobiliaria en `GET /api/propiedades/catalogos`, o una ruta de facetas equivalente; no se pueden obtener las opciones de ubicación solo de la página actual.
- Opcionalmente, incorporar `GET /api/propiedades/opciones` (ruta propuesta, actualmente inexistente), autenticada para los mismos roles y con el mismo alcance, que admita `q`, `page`, `limit` y devuelva `{ id, nombre, ubicacion }` más `paginacion`. Reduciría el contenido transferido en selectores. Otra mejora posible es incluir la primera imagen de la propiedad en el listado de inquilinos para evitar consultas por ID.

Hasta que existan esas capacidades, los filtros por tipo, ubicación y estado se muestran deshabilitados y se conserva el orden del servidor. El frontend no envía los parámetros propuestos ni filtra u ordena parcialmente una página.

### Otros listados privados

Los servicios de agentes, inquilinos, propietarios, profesionales, reportes, contratos, documentos, inmobiliarias, administradores, pagos y cobros también devuelven `{ data, paginacion }` de **una única página**. `crearListadoPaginado` comprueba límites y metadatos y admite solo los filtros expresamente configurados según los validadores del backend. `useListadoPaginado` centraliza cancelación, protección contra respuestas antiguas, búsqueda con espera de 300 ms, reinicio a página 1 al cambiar criterios, reintento y corrección de páginas que desaparecen tras una modificación. Las pantallas vuelven a consultar después de las mutaciones.

Contrato comprobado en los archivos `api/<módulo>/<módulo>.schema.js` del backend:

| Endpoint | Máximo por página | Búsqueda y filtros admitidos |
| --- | --- | --- |
| `/agentes`, `/propietarios`, `/profesionales`, `/reportes` | 10 | `q`, `idInmobiliaria`; la sesión limita el alcance salvo los roles autorizados. |
| `/inquilinos` | 10 | `q`. |
| `/inmobiliarias`, `/admins` | 10 | Solo `page`, `limit`. |
| `/contratos` | 10 | `tipo`, `estado`, `idPropiedad`, `desde`, `hasta`; no `q`. |
| `/documentos` | 10 | El servicio de contratos usa `idContrato`, `tipo=CONTRATO`. |
| `/visitas` | 10 | `desde`, `hasta`, `estado`, `idAgente`, `idCliente`, `idPropiedad`; no `q`. |
| `/pagos` | 12 | `idContrato`, `estado`, `anio`; no `q`. |
| `/cobros` | 12 | `idContrato`, `idPropietario`, `estado`, `anio`; no `q`. |

La búsqueda ahora tiene el alcance que implementa cada endpoint; ya no busca en todos los campos ensamblados por el frontend. El orden es el definido por cada servicio del backend, sin reordenar una página en el cliente.

- **Agenda:** `visitasDelPeriodo` es la única lectura que recorre páginas de entidades: exige `desde` y `hasta` y completa exclusivamente el período visible (incluidos los días contiguos del calendario mensual). Cancelar la consulta detiene también las páginas siguientes. Las próximas visitas programadas usan una consulta paginada independiente desde hoy. Nunca se descarga todo el historial.
- **Mis Propiedades:** usa el catálogo resumido y autorizado de `/reportes/catalogos` como opciones de propiedades; la paginación local que queda actúa solo sobre ese catálogo. Para cada propiedad consulta la primera página de contratos y el vigente, sin reconstruir propiedades ni estadísticas descargando contratos completos. Los documentos tienen su propia paginación. Como `/reportes` no admite `idPropiedad`, el panel de reportes muestra explícitamente los de **todas** las propiedades del usuario, con paginación remota.
- **Superadministración:** inmobiliarias, administradores y agentes tienen listados y páginas independientes. No se asocian usuarios a una inmobiliaria a partir de una página incompleta. Cada usuario identifica su inmobiliaria por ID; se mantienen las acciones de eliminación, cambio de rol e invitación. Los administradores no tienen búsqueda ni filtro por inmobiliaria porque `/admins` no los admite.
- **Pagos y Cobros:** el historial pagina contratos y períodos por separado; permite filtrar períodos por año y consulta el detalle seleccionado por ID. Los contratos son los autorizados por `/contratos`, incluidos aquellos sin movimientos, que muestran un estado vacío. Los conteos por estado usan `paginacion.total` de consultas de una fila para el contrato completo, sin contar solo los períodos visibles. La cola de pagos en revisión también tiene paginación remota y total del servidor. Los listados resumidos de personas y contratos disponibles para registrar pagos mantienen sus endpoints específicos existentes.
- **Resúmenes:** Propietarios conserva `/propietarios/resumen`; Agentes obtiene los totales de visitas de hoy y canceladas de los metadatos de consultas de una fila. Mis Propiedades obtiene los contratos y ventas vigentes de metadatos. Los indicadores sin una consulta global compatible se muestran como `—`, nunca como un conteo parcial de la página.

Pendientes adicionales del backend (son propuestas; el frontend **no envía** estos parámetros):

1. Ampliar `/agentes` con filtro por `idArea` y proporcionar `/agentes/resumen` para agentes activos y pendientes. Añadir ID como desempate al orden por apellido y nombre.
2. Ampliar `/inquilinos` con filtros por `idPropiedad`, `activo` y vencimiento contractual, y un resumen de activos, inactivos, contratos vigentes y vencimientos próximos. El vencimiento exige filtrar por fecha de fin del contrato, no por un rango de solapamiento. Añadir ID como desempate al orden actual.
3. Ampliar `/profesionales` con filtro por profesión y un catálogo global de profesiones de la inmobiliaria.
4. Ampliar `/reportes` con `idPropiedad` y `idEstado` y aplicar esos filtros también al conteo. Permitiría recuperar la vista de reportes de la propiedad seleccionada y contar pendientes sin descargar los reportes. Ninguno de esos parámetros está admitido por el esquema estricto actual.
5. Añadir `idInmobiliaria` a `/admins` y un total de personal por inmobiliaria para recuperar agrupaciones anidadas completas sin recorrer todos los administradores. La búsqueda de inmobiliarias y administradores también necesita soporte explícito de `q` en esquema y SQL.
6. Proveer un resumen de pagos por contrato que cuente comprobantes enviados con la misma regla del negocio. El listado actual no filtra por existencia/envío de comprobante; ese indicador permanece en `—`. Los demás conteos por estado sí se consultan completos.
7. Si el catálogo resumido de propiedades del propietario crece, agregar un endpoint paginado específico para sus propiedades/opciones, con los mismos permisos de `/reportes/catalogos`.

Para usar `VITE_API_URL` desde un servidor distinto, el backend debe permitir el origen del frontend mediante `FRONT_URL`. En producción, hay que publicar el contenido de `dist/` y configurar el servidor web para devolver `index.html` en rutas internas de la aplicación; el proxy de Vite solo existe durante `npm run dev`.

## Google y activación de cuentas

El botón de Google se habilita cuando está configurado `VITE_GOOGLE_CLIENT_ID`; si falta o es inválido, aparece deshabilitado con una explicación. Este valor debe ser un ID de cliente OAuth de tipo **Aplicación web** (termina en `.apps.googleusercontent.com`) y coincidir con `GOOGLE_CLIENT_ID` en el backend. En Google Cloud, agregar el origen exacto de esta interfaz a **Orígenes autorizados de JavaScript**; para desarrollo local, `http://localhost:5173`.

El registro con Google aparece únicamente después de verificar el DNI de una invitación. El frontend envía el ID token como `credential`; la verificación ocurre en la API. No se usa el secreto de cliente de Google en este flujo. Después de editar los `.env`, reiniciar ambos servidores.

## Compilación y comprobaciones

| Comando | Resultado |
| --- | --- |
| `npm run dev` | Servidor Vite con recarga y proxy local. |
| `npm run build` | Compila la aplicación en `dist/`. |
| `npm run preview` | Sirve una vista previa de `dist/`. |
| `npm run lint` | Ejecuta ESLint sobre el proyecto. |
| `npm test` | Pruebas de contrato de paginación, filtros, metadatos y cancelación, sin API ni dependencias adicionales. |

Las pruebas usan el ejecutor de Node y módulos VM para sustituir solo el transporte HTTP; Node muestra una advertencia de función experimental por `--experimental-vm-modules`. Para comprobar cambios de interfaz, ejecutar también `npm run build` y `npm run lint`, y revisar en el navegador los flujos afectados con el backend activo.

## Problemas frecuentes

| Síntoma | Revisar |
| --- | --- |
| La landing no muestra datos | `VITE_ID_INMOBILIARIA`, existencia de ese ID y disponibilidad de `/api/infoInmobiliaria/:id`. |
| `Network Error` o peticiones a otro servidor | `npm run dev` con backend en `localhost:3000`, o `VITE_API_URL` correctamente terminado en `/api`. |
| Error de CORS | `FRONT_URL` del backend debe coincidir exactamente con el origen del frontend. |
| El login devuelve `401` | Credenciales, activación de la cuenta y sesión vigente. |
| Google no aparece o rechaza el acceso | IDs coincidentes, origen autorizado y reinicio de Vite tras editar `.env`. |
| Un PDF o una imagen no carga | Confirmar que la ruta de archivos exista, que se hayan conservado los archivos del backend y que el documento se consulte con sesión si es privado. |
| Al recargar una ruta interna en producción aparece `404` | Configurar fallback a `index.html` en el servidor web. |

La documentación de entorno, endpoints, permisos, archivos y migraciones está en el [README del backend](../real-estate-manager-back/README.md).
