import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import bellIcon from "../assets/icons/bell-solid-full.svg";
import briefcaseIcon from "../assets/icons/briefcase-solid-full.svg";
import buildingIcon from "../assets/icons/building-columns-solid-full.svg";
import calendarIcon from "../assets/icons/calendar-regular-full.svg";
import chartIcon from "../assets/icons/chart-column-solid-full.svg";
import chatIcon from "../assets/icons/comments-solid-full.svg";
import closeIcon from "../assets/icons/x-solid-full.svg";
import fileIcon from "../assets/icons/file-lines-regular-full.svg";
import gearIcon from "../assets/icons/gear-solid-full.svg";
import houseIcon from "../assets/icons/house-solid-full.svg";
import houseUserIcon from "../assets/icons/house-user-solid-full.svg";
import searchIcon from "../assets/icons/magnifying-glass-solid-full.svg";
import menuIcon from "../assets/icons/bars-solid-full.svg";
import peopleIcon from "../assets/icons/people.svg";
import userIcon from "../assets/icons/user-solid-full.svg";
import referenceImage from "../assets/terms-reference.png";
import brandLogo from "/logo.png";
import "./Navbar.css";

const primaryItems = [
  { href: "/dashboard", label: "Dashboard", icon: chartIcon },
  { href: "/owners", label: "Propietarios", icon: peopleIcon },
  { href: "/tenant", label: "Inquilinos", icon: houseUserIcon },
  { href: "/professional", label: "Profesionales", icon: briefcaseIcon },
  { href: "/schedule", label: "Agenda", icon: calendarIcon },
  { href: "/chat", label: "Chat", icon: chatIcon },
  { href: "/properties", label: "Propiedades", icon: houseIcon },
];

const secondaryItems = [
  { href: "/agents", label: "Agentes", icon: userIcon },
  { href: "/agency", label: "Mi Inmobiliaria", icon: buildingIcon },
  { href: "/profile", label: "Mi perfil", icon: userIcon },
  { href: "/terms", label: "Términos y condiciones", icon: fileIcon },
  { href: "/settings", label: "Configuración", icon: gearIcon },
];

const allItems = [...primaryItems, ...secondaryItems];

const pageLabels = {
  "/reports": "Reportes",
  "/payments": "Pagos",
  "/earnings": "Ganancias",
  "/about": "Acerca de nosotros",
  "/aboutUs": "Acerca de nosotros",
  "/about-us": "Acerca de nosotros",
};

function isItemActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationItem({ item, pathname, onNavigate }) {
  const active = isItemActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={`navbar__drawer-link${active ? " is-active" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
    >
      <img className="navbar__drawer-link-icon" src={item.icon} alt="" />
      <span>{item.label}</span>
    </Link>
  );
}

export default function Navbar() {
  const [pathname] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentItem = allItems.find(({ href }) => isItemActive(pathname, href));
  const currentLabel = currentItem?.label ?? pageLabels[pathname] ?? "Dashboard";

  useEffect(() => {
    if (!menuOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="navbar__header">
        <button
          className="navbar__menu-button"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <img className="navbar__menu-icon" src={menuOpen ? closeIcon : menuIcon} alt="" />
        </button>

        <Link href="/dashboard" className="navbar__brand" aria-label="AGI, inicio">
          <img className="navbar__brand-icon" src={brandLogo} alt="" />
          <strong>AGI</strong>
        </Link>

        <nav className="navbar__breadcrumb" aria-label="Ubicación actual">
          <Link href="/properties">Propiedades</Link>
          <span aria-current="page">{currentLabel}</span>
        </nav>

        <label className="navbar__search">
          <img src={searchIcon} alt="" />
          <input type="search" placeholder="Buscar contacto..." aria-label="Buscar contacto" />
        </label>

        <aside className="navbar__account" aria-label="Cuenta de usuario">
          <details className="navbar__notifications">
            <summary aria-label="Notificaciones">
              <img src={bellIcon} alt="" />
            </summary>
            <p>No tenés notificaciones nuevas.</p>
          </details>
          <Link href="/profile" className="navbar__account-link">
            <span>
              Juan Pérez
              <small>Agente</small>
            </span>
            <i
              className="navbar__account-avatar"
              style={{ backgroundImage: `url(${referenceImage})` }}
              aria-hidden="true"
            />
          </Link>
        </aside>
      </header>

      {menuOpen && (
        <>
          <button
            className="navbar__backdrop"
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="navbar__drawer" id="main-navigation" aria-label="Navegación principal">
            <div className="navbar__drawer-brand">
              <Link href="/dashboard" className="navbar__brand" aria-label="AGI, inicio" onClick={() => setMenuOpen(false)}>
                <img className="navbar__brand-icon" src={brandLogo} alt="" />
                <strong>AGI</strong>
              </Link>
              <button
                className="navbar__drawer-close"
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMenuOpen(false)}
              >
                <img src={closeIcon} alt="" />
              </button>
            </div>

            <nav className="navbar__drawer-nav">
              {primaryItems.map((item) => (
                <NavigationItem key={item.href} item={item} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
              ))}
              <span className="navbar__drawer-divider" aria-hidden="true" />
              {secondaryItems.map((item) => (
                <NavigationItem key={item.href} item={item} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
