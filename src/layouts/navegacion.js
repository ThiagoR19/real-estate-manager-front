import {
  briefcaseIcon,
  buildingColumnsIcon,
  calendarIcon,
  chartColumnIcon,
  commentsIcon,
  fileLinesIcon,
  houseIcon,
  peopleIcon,
  walletIcon,
  userIcon,
} from "../assets/icons";

export const dashboardPorRol = {
  1: "/super-admin",
  2: "/dashboard",
  3: "/dashboard",
  4: "/dashboard",
  5: "/dashboard",
};

export const elementosPrincipales = [
  { href: "/dashboard", etiqueta: "Dashboard", icono: chartColumnIcon },
  {
    href: "/mis-propiedades",
    etiqueta: "Mis propiedades",
    etiquetaRuta: "Tus propiedades",
    icono: houseIcon,
  },
  { href: "/cobros", etiqueta: "Cobros", etiquetaRuta: "Zona de cobro", icono: walletIcon },
  {
    href: "/pagos-cobros",
    etiqueta: "Pagos y cobros",
    etiquetaRuta: "Pagos",
    icono: walletIcon,
  },
  { href: "/indec", etiqueta: "INDEC", icono: chartColumnIcon },
  {
    href: "/super-admin",
    etiqueta: "Panel superAdmin",
    etiquetaRuta: "Panel administrativo",
    icono: chartColumnIcon,
  },
  { href: "/propietarios", etiqueta: "Propietarios", icono: peopleIcon },
  { href: "/inquilinos", etiqueta: "Inquilinos", icono: peopleIcon },
  { href: "/profesionales", etiqueta: "Profesionales", icono: briefcaseIcon },
  { href: "/agenda", etiqueta: "Agenda", icono: calendarIcon },
  { href: "/chat", etiqueta: "Chat", icono: commentsIcon },
  { href: "/propiedades", etiqueta: "Propiedades", icono: houseIcon },
];

export const elementosSecundarios = [
  { href: "/reportes-agente", etiqueta: "Reportes", icono: chartColumnIcon },
  { href: "/pagos", etiqueta: "Pagos del inquilino", icono: walletIcon },
  { href: "/agentes", etiqueta: "Agentes", icono: peopleIcon },
  { href: "/inmobiliaria", etiqueta: "Mi Inmobiliaria", icono: buildingColumnsIcon },
  { href: "/perfil", etiqueta: "Mi perfil", icono: userIcon },
  { href: "/terminos", etiqueta: "Términos y condiciones", icono: fileLinesIcon },
];

export const todosLosElementos = [...elementosPrincipales, ...elementosSecundarios];

const rolesNavegacion = {
  "/dashboard": [2, 3, 4, 5],
  "/dashboard-inquilino": [5],
  "/dashboard-agente": [3],
  "/dashboard-propietario": [4],
  "/mis-propiedades": [4],
  "/cobros": [1, 4],
  "/pagos-cobros": [2, 3],
  "/indec": [2, 3],
  "/super-admin": [1],
  "/propietarios": [2, 3],
  "/inquilinos": [2, 3],
  "/profesionales": [2, 3],
  "/agenda": [2, 3],
  "/chat": [2, 3, 4, 5],
  "/propiedades": [2, 3],
  "/reportes-agente": [2, 3, 4, 5],
  "/pagos": [2, 3, 5],
  "/agentes": [2],
  "/inmobiliaria": [2],
  "/perfil": [1, 2, 3, 4, 5],
  "/terminos": [1, 2, 3, 4, 5],
};

export function elementosNavegacionPorRol(rol) {
  const idRol = Number(rol);
  const puedeVer = ({ href }) => idRol === 1 || rolesNavegacion[href]?.includes(idRol);
  return {
    principales: elementosPrincipales.filter(puedeVer),
    secundarios: elementosSecundarios.filter(puedeVer),
  };
}

export const etiquetasPagina = {
  "/super-admin-dashboard": "Panel administrativo",
  "/propiedad": "Propiedad",
  "/reportes-agente": "Reportes",
  "/reportes": "Reportes",
  "/pagos": "Pagos",
  "/cobros": "Zona de cobro",
  "/pagos-cobros": "Pagos",
  "/indec": "INDEC",
  "/mis-propiedades": "Tus propiedades",
  "/super-admin": "Panel administrativo",
  "/sobre-nosotros": "Acerca de nosotros",
};

export function rolCuentaParaRuta(rutaActual) {
  if (rutaActual.startsWith("/super-admin")) return "Super admin";
  if (
    ["/dashboard", "/admin-dashboard", "/indec", "/chat", "/inmobiliaria", "/agentes"].includes(rutaActual)
  )
    return "Administrador";
  if (["/dashboard-propietario", "/mis-propiedades", "/cobros"].includes(rutaActual))
    return "Propietario";
  if (["/pagos", "/dashboard-inquilino", "/reportes"].includes(rutaActual)) return "Inquilino";
  return "Agente";
}

export function elementoActivo(rutaActual, href) {
  return rutaActual === href || rutaActual.startsWith(`${href}/`);
}
