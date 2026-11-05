import { briefcaseIcon, buildingColumnsIcon, calendarIcon, chartColumnIcon, circleInfoIcon, commentsIcon, fileLinesIcon, houseIcon, houseUserIcon, peopleIcon, walletIcon, userIcon, } from "../assets/icons";

export const primaryItems = [
  { href: "/dashboard", label: "Dashboard", icon: chartColumnIcon },
  { href: "/tenant-dashboard", label: "Dashboard inquilinos", breadcrumbLabel: "Dashboard", icon: houseUserIcon },
  { href: "/agent-dashboard", label: "Dashboard agente", breadcrumbLabel: "Dashboard", icon: chartColumnIcon },
  { href: "/owner-dashboard", label: "Dashboard propietarios", breadcrumbLabel: "Dashboard", icon: houseUserIcon },
  { href: "/my-properties", label: "Mis propiedades", breadcrumbLabel: "Tus propiedades", icon: houseIcon },
  { href: "/collections", label: "Cobros", breadcrumbLabel: "Zona de cobro", icon: walletIcon },
  { href: "/payments-collections", label: "Pagos y cobros", breadcrumbLabel: "Pagos", icon: walletIcon },
  { href: "/indec", label: "INDEC", icon: chartColumnIcon },
  { href: "/super-admin", label: "Panel superAdmin", breadcrumbLabel: "Panel administrativo", icon: buildingColumnsIcon },
  { href: "/owners", label: "Propietarios", icon: peopleIcon },
  { href: "/tenant", label: "Inquilinos", icon: peopleIcon },
  { href: "/professional", label: "Profesionales", icon: briefcaseIcon },
  { href: "/schedule", label: "Agenda", icon: calendarIcon },
  { href: "/chat", label: "Chat", icon: commentsIcon },
  { href: "/properties", label: "Propiedades", icon: houseIcon },
];

export const secondaryItems = [
  { href: "/reports-agent", label: "Reportes", icon: chartColumnIcon },
  { href: "/payments", label: "Pagos del inquilino", icon: walletIcon },
  { href: "/agents", label: "Agentes", icon: peopleIcon },
  { href: "/agency", label: "Mi Inmobiliaria", icon: buildingColumnsIcon },
  { href: "/profile", label: "Mi perfil", icon: userIcon },
  { href: "/terms", label: "Términos y condiciones", icon: fileLinesIcon },
  { href: "/about-us", label: "Acerca de nosotros", icon: circleInfoIcon },
];

export const allItems = [...primaryItems, ...secondaryItems];

export const pageLabels = {
  "/super-admin-dashboard": "Panel administrativo",
  "/property": "Propiedad",
  "/reports-agent": "Reportes",
  "/reports": "Reportes",
  "/payments": "Pagos",
  "/collections": "Zona de cobro",
  "/payments-collections": "Pagos",
  "/indec": "INDEC",
  "/my-properties": "Tus propiedades",
  "/super-admin": "Panel administrativo",
  "/about-us": "Acerca de nosotros",
};

export function accountRoleFor(pathname) {
  if (pathname.startsWith("/super-admin")) return "Super admin";
  if (["/dashboard", "/admin-dashboard", "/indec", "/chat", "/agency", "/agents"].includes(pathname)) return "Administrador";
  if (["/owner-dashboard", "/my-properties", "/collections"].includes(pathname)) return "Propietario";
  if (["/payments", "/tenant-dashboard", "/reports"].includes(pathname)) return "Inquilino";
  return "Agente";
}

export function isItemActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
