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

export const dashboardByRole = {
  1: "/super-admin",
  2: "/dashboard",
  3: "/agent-dashboard",
  4: "/owner-dashboard",
  5: "/tenant-dashboard",
};

export const primaryItems = [
  { href: "/dashboard", label: "Dashboard", icon: chartColumnIcon },
  {
    href: "/tenant-dashboard",
    label: "Dashboard inquilinos",
    breadcrumbLabel: "Dashboard",
    icon: chartColumnIcon,
  },
  {
    href: "/agent-dashboard",
    label: "Dashboard agente",
    breadcrumbLabel: "Dashboard",
    icon: chartColumnIcon,
  },
  {
    href: "/owner-dashboard",
    label: "Dashboard propietarios",
    breadcrumbLabel: "Dashboard",
    icon: chartColumnIcon,
  },
  {
    href: "/my-properties",
    label: "Mis propiedades",
    breadcrumbLabel: "Tus propiedades",
    icon: houseIcon,
  },
  { href: "/collections", label: "Cobros", breadcrumbLabel: "Zona de cobro", icon: walletIcon },
  {
    href: "/payments-collections",
    label: "Pagos y cobros",
    breadcrumbLabel: "Pagos",
    icon: walletIcon,
  },
  { href: "/indec", label: "INDEC", icon: chartColumnIcon },
  {
    href: "/super-admin",
    label: "Panel superAdmin",
    breadcrumbLabel: "Panel administrativo",
    icon: chartColumnIcon,
  },
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
];

export const allItems = [...primaryItems, ...secondaryItems];

const navigationRoles = {
  "/dashboard": [2],
  "/tenant-dashboard": [5],
  "/agent-dashboard": [3],
  "/owner-dashboard": [4],
  "/my-properties": [4],
  "/collections": [1, 4],
  "/payments-collections": [2, 3],
  "/indec": [2, 3],
  "/super-admin": [1],
  "/owners": [2, 3],
  "/tenant": [2, 3],
  "/professional": [2, 3],
  "/schedule": [2, 3],
  "/chat": [2, 3, 4, 5],
  "/properties": [2, 3],
  "/reports-agent": [2, 3, 4, 5],
  "/payments": [2, 3, 5],
  "/agents": [2],
  "/agency": [2],
  "/profile": [1, 2, 3, 4, 5],
  "/terms": [1, 2, 3, 4, 5],
};

export function navigationItemsForRole(role) {
  const roleId = Number(role);
  const canSee = ({ href }) => roleId === 1 || navigationRoles[href]?.includes(roleId);
  return {
    primary: primaryItems.filter(canSee),
    secondary: secondaryItems.filter(canSee),
  };
}

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
  if (
    ["/dashboard", "/admin-dashboard", "/indec", "/chat", "/agency", "/agents"].includes(pathname)
  )
    return "Administrador";
  if (["/owner-dashboard", "/my-properties", "/collections"].includes(pathname))
    return "Propietario";
  if (["/payments", "/tenant-dashboard", "/reports"].includes(pathname)) return "Inquilino";
  return "Agente";
}

export function isItemActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
