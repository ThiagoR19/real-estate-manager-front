import {
  briefcaseIcon,
  buildingColumnsIcon,
  calendarIcon,
  chartColumnIcon,
  commentsIcon,
  fileLinesIcon,
  houseIcon,
  peopleIcon,
  userIcon,
} from "../assets/icons";

export const primaryItems = [
  { href: "/dashboard", label: "Dashboard", icon: chartColumnIcon },
  { href: "/owners", label: "Propietarios", icon: peopleIcon },
  { href: "/tenant", label: "Inquilinos", icon: peopleIcon },
  { href: "/professional", label: "Profesionales", icon: briefcaseIcon },
  { href: "/schedule", label: "Agenda", icon: calendarIcon },
  { href: "/chat", label: "Chat", icon: commentsIcon },
  { href: "/properties", label: "Propiedades", icon: houseIcon },
];

export const secondaryItems = [
  { href: "/agents", label: "Agentes", icon: peopleIcon },
  { href: "/agency", label: "Mi Inmobiliaria", icon: buildingColumnsIcon },
  { href: "/profile", label: "Mi perfil", icon: userIcon },
  { href: "/terms", label: "Términos y condiciones", icon: fileLinesIcon },
];

export const allItems = [...primaryItems, ...secondaryItems];

export const pageLabels = {
  "/reports": "Reportes",
  "/payments": "Pagos",
  "/earnings": "Ganancias",
  "/about": "Acerca de nosotros",
  "/about-us": "Acerca de nosotros",
};

export function isItemActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
