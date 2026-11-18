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
import { PERSONAL, ROLES, TODOS_LOS_ROLES } from "../utils/roles.js";

export const dashboardPorRol = {
  [ROLES.SUPERADMIN]: "/super-admin",
  [ROLES.ADMIN]: "/dashboard",
  [ROLES.AGENTE]: "/dashboard",
  [ROLES.PROPIETARIO]: "/dashboard",
  [ROLES.INQUILINO]: "/dashboard",
};

const SIN_SUPERADMIN = [ROLES.ADMIN, ROLES.AGENTE, ROLES.PROPIETARIO, ROLES.INQUILINO];

export const elementosMenu = [
  { href: "/dashboard", etiqueta: "Dashboard", icono: chartColumnIcon, roles: SIN_SUPERADMIN, grupo: "principal", movil: "principal" },
  { href: "/mis-propiedades", etiqueta: "Mis propiedades", etiquetaRuta: "Tus propiedades", icono: houseIcon, roles: [ROLES.PROPIETARIO], grupo: "principal", movil: "principal" },
  { href: "/cobros", etiqueta: "Cobros", etiquetaRuta: "Zona de cobro", icono: walletIcon, roles: [ROLES.PROPIETARIO], grupo: "principal", movil: "principal" },
  { href: "/pagos-cobros", etiqueta: "Pagos y cobros", etiquetaRuta: "Pagos", icono: walletIcon, roles: PERSONAL, grupo: "principal", movil: false },
  { href: "/indec", etiqueta: "INDEC", icono: chartColumnIcon, roles: PERSONAL, grupo: "principal", movil: false },
  { href: "/super-admin", etiqueta: "Panel superAdmin", etiquetaRuta: "Panel administrativo", icono: chartColumnIcon, roles: [ROLES.SUPERADMIN], grupo: "principal", movil: "principal" },
  { href: "/propietarios", etiqueta: "Propietarios", icono: peopleIcon, roles: PERSONAL, grupo: "principal", movil: "principal" },
  { href: "/inquilinos", etiqueta: "Inquilinos", icono: peopleIcon, roles: PERSONAL, grupo: "principal", movil: "principal" },
  { href: "/profesionales", etiqueta: "Profesionales", icono: briefcaseIcon, roles: PERSONAL, grupo: "principal", movil: "principal" },
  { href: "/agenda", etiqueta: "Agenda", icono: calendarIcon, roles: PERSONAL, grupo: "principal", movil: "principal" },
  { href: "/chat", etiqueta: "Chat", icono: commentsIcon, roles: SIN_SUPERADMIN, grupo: "principal", movil: "principal" },
  { href: "/propiedades", etiqueta: "Propiedades", icono: houseIcon, roles: PERSONAL, grupo: "principal", movil: "principal" },
  { href: "/reportes-agente", etiqueta: "Reportes", icono: chartColumnIcon, roles: [ROLES.ADMIN, ROLES.AGENTE, ROLES.PROPIETARIO], grupo: "principal", movil: "principal" },
  { href: "/reportes", etiqueta: "Reportes", icono: chartColumnIcon, roles: [ROLES.INQUILINO], grupo: "principal", movil: "principal" },
  { href: "/pagos", etiqueta: "Pagos", icono: walletIcon, roles: [ROLES.INQUILINO], grupo: "principal", movil: "principal" },
  { href: "/agentes", etiqueta: "Agentes", icono: peopleIcon, roles: [ROLES.ADMIN], grupo: "secundario", movil: "secundario" },
  { href: "/inmobiliaria", etiqueta: "Mi Inmobiliaria", icono: buildingColumnsIcon, roles: [ROLES.ADMIN], grupo: "secundario", movil: "secundario" },
  { href: "/perfil", etiqueta: "Mi perfil", icono: userIcon, roles: TODOS_LOS_ROLES, grupo: "secundario", movil: "secundario" },
  { href: "/terminos", etiqueta: "Términos y condiciones", icono: fileLinesIcon, roles: TODOS_LOS_ROLES, grupo: "secundario", movil: "secundario" },
];

export const todosLosElementos = elementosMenu;

const rutasSinMenu = {
  "/admin-dashboard": SIN_SUPERADMIN,
  "/dashboard-agente": [ROLES.AGENTE],
  "/dashboard-inquilino": [ROLES.INQUILINO],
  "/dashboard-propietario": [ROLES.PROPIETARIO],
  "/propiedad": PERSONAL,
};

function rolesDeRuta(ruta) {
  return elementosMenu.find((item) => item.href === ruta)?.roles ?? rutasSinMenu[ruta] ?? [];
}

export function puedeEntrar(rol, ruta) {
  return rolesDeRuta(ruta).includes(Number(rol));
}

export function menuPorRol(rol, { movil = false } = {}) {
  const visibles = elementosMenu.filter((item) => item.roles.includes(Number(rol)));
  const grupoDe = (item) => (movil ? item.movil : item.grupo);
  return {
    principales: visibles.filter((item) => grupoDe(item) === "principal"),
    secundarios: visibles.filter((item) => grupoDe(item) === "secundario"),
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
