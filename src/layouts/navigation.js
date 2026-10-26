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
  percentIcon,
  userIcon,
} from "../assets/icons";

export const primaryItems = [
  { href: "/dashboard", label: "Dashboard", icon: chartColumnIcon },
  { href: "/dashboard_dueño", label: "Dashboard dueño", breadcrumbLabel: "Dashboard", icon: houseUserIcon },
  { href: "/owners", label: "Propietarios", icon: peopleIcon },
  { href: "/tenant", label: "Inquilinos", icon: peopleIcon },
  { href: "/professional", label: "Profesionales", icon: briefcaseIcon },
  { href: "/schedule", label: "Agenda", icon: calendarIcon },
  { href: "/chat", label: "Chat", icon: commentsIcon },
  { href: "/properties", label: "Propiedades", icon: houseIcon },
];

export const secondaryItems = [
  { href: "/reports", label: "Reportes", icon: chartColumnIcon },
  { href: "/payments", label: "Pagos", icon: percentIcon },
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
  "/aboutUs": "Acerca de nosotros",
};

export function isItemActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
