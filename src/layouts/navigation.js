import {
  briefcaseIcon,
  buildingColumnsIcon,
  calendarIcon,
  chartColumnIcon,
  circleInfoIcon,
  commentsIcon,
  fileLinesIcon,
  houseIcon,
  houseUserIcon,
  peopleIcon,
  walletIcon,
  userIcon,
} from "../assets/icons";

export const primaryItems = [
  { href: "/dashboard", label: "Dashboard", icon: chartColumnIcon },
  { href: "/dashboard_inquilinos", label: "Dashboard inquilinos", breadcrumbLabel: "Dashboard", icon: houseUserIcon },
  { href: "/dashboard_agente", label: "Dashboard agente", breadcrumbLabel: "Dashboard", icon: chartColumnIcon },
  { href: "/dashboard_propietarios", label: "Dashboard propietarios", breadcrumbLabel: "Dashboard", icon: houseUserIcon },
  { href: "/mis-propiedades", label: "Mis propiedades", breadcrumbLabel: "Tus propiedades", icon: houseIcon },
  { href: "/cobros", label: "Cobros", breadcrumbLabel: "Zona de cobro", icon: walletIcon },
  { href: "/pagos-cobros", label: "Pagos y cobros", breadcrumbLabel: "Pagos", icon: walletIcon },
  { href: "/indec", label: "INDEC", icon: chartColumnIcon },
  { href: "/superadmin", label: "Panel superAdmin", breadcrumbLabel: "Panel administrativo", icon: buildingColumnsIcon },
  { href: "/owners", label: "Propietarios", icon: peopleIcon },
  { href: "/tenant", label: "Inquilinos", icon: peopleIcon },
  { href: "/professional", label: "Profesionales", icon: briefcaseIcon },
  { href: "/schedule", label: "Agenda", icon: calendarIcon },
  { href: "/chat", label: "Chat", icon: commentsIcon },
  { href: "/properties", label: "Propiedades", icon: houseIcon },
];

export const secondaryItems = [
  { href: "/reports", label: "Reportes", icon: chartColumnIcon },
  { href: "/payments", label: "Pagos del inquilino", icon: walletIcon },
  { href: "/agents", label: "Agentes", icon: peopleIcon },
  { href: "/agency", label: "Mi Inmobiliaria", icon: buildingColumnsIcon },
  { href: "/profile", label: "Mi perfil", icon: userIcon },
  { href: "/terms", label: "Términos y condiciones", icon: fileLinesIcon },
  { href: "/aboutUs", label: "Acerca de nosotros", icon: circleInfoIcon },
];

export const allItems = [...primaryItems, ...secondaryItems];

export const pageLabels = {
  "/property": "Propiedad",
  "/reports": "Reportes",
  "/payments": "Pagos",
  "/cobros": "Zona de cobro",
  "/pagos-cobros": "Pagos",
  "/indec": "INDEC",
  "/mis-propiedades": "Tus propiedades",
  "/superadmin": "Panel administrativo",
  "/aboutUs": "Acerca de nosotros",
};

export function isItemActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
