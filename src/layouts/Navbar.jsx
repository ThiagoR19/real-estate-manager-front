import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import addressCardIcon from "../assets/icons/address-card-regular-full.svg";
import buildingIcon from "../assets/icons/building-columns-solid-full.svg";
import clockIcon from "../assets/icons/clock-regular-full.svg";
import fireIcon from "../assets/icons/fire-flame-simple-solid-full.svg";
import phoneIcon from "../assets/icons/phone-solid-full.svg";
import percentIcon from "../assets/icons/percent-solid-full.svg";
import referenceImage from "../assets/terms-reference.png";
import "./Navbar.css";

const primaryItems = [
  { href: "/dashboard", label: "Dashboard", icon: percentIcon },
  { href: "/owner", label: "Propietarios", icon: addressCardIcon },
  { href: "/tenant", label: "Inquilinos", icon: addressCardIcon },
  { href: "/professional", label: "Profesionales", icon: buildingIcon },
  { href: "/agenda", label: "Agenda", icon: clockIcon },
  { href: "/chat", label: "Chat", icon: phoneIcon },
  { href: "/properties", label: "Propiedades", icon: buildingIcon },
];

const secondaryItems = [
  { href: "/agents", label: "Agentes", icon: addressCardIcon },
  { href: "/agency", label: "Mi Inmobiliaria", icon: buildingIcon },
  { href: "/profile", label: "Mi perfil", icon: addressCardIcon },
  { href: "/terms", label: "Términos y condiciones", icon: addressCardIcon },
  { href: "/settings", label: "Configuración", icon: fireIcon },
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
          <span className="navbar__menu-icon" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>

        <Link href="/dashboard" className="navbar__brand" aria-label="AGI, inicio">
          <img className="navbar__brand-icon" src={buildingIcon} alt="" />
          <strong>AGI</strong>
        </Link>

        <nav className="navbar__breadcrumb" aria-label="Ubicación actual">
          <Link href="/properties">Propiedades</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{currentLabel}</span>
        </nav>

        <aside className="navbar__account" aria-label="Cuenta de usuario">
          <details className="navbar__notifications">
            <summary aria-label="Notificaciones">
              <img src={clockIcon} alt="" />
            </summary>
            <p>No tenés notificaciones nuevas.</p>
          </details>
          <Link href="/profile" className="navbar__account-link">
            <span>
              Juan Pérez
              <small>Administrador</small>
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
                <img className="navbar__brand-icon" src={buildingIcon} alt="" />
                <strong>AGI</strong>
              </Link>
              <button
                className="navbar__drawer-close"
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMenuOpen(false)}
              >
                <span aria-hidden="true">×</span>
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
