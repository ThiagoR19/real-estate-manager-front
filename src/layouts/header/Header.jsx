import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ModalOverlay, NotificationPanel } from "../../components";
import notifications from "../../data/notifications";
import { barsIcon as menuIcon, bellIcon, magnifyingGlassIcon as searchIcon, xIcon as closeIcon, } from "../../assets/icons";
import referenceImage from "../../assets/terms-reference.png";
import brandLogo from "../../assets/logoAGI.png";
import { accountRoleFor, allItems, isItemActive, pageLabels } from "../navigation";
import "./Header.css";

export default function Header({ menuOpen = false, onToggleMenu = () => { } }) {
  const [pathname] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const currentItem = allItems.find(({ href }) => isItemActive(pathname, href));
  const isPayments = pathname === "/payments" || pathname.startsWith("/payments/");
  const isProperties = pathname === "/properties" || pathname.startsWith("/properties/") || pathname === "/property" || pathname.startsWith("/property/");
  const isOwnerDashboard = pathname === "/owner-dashboard" || pathname === "/my-properties" || pathname === "/collections";
  const isAdminDashboard = pathname === "/admin-dashboard" || pathname === "/super-admin" || pathname === "/indec";
  const isChat = pathname === "/chat";
  const accountRole = accountRoleFor(pathname);
  const currentLabel = isPayments ? "Zona de pago" : currentItem?.breadcrumbLabel ?? currentItem?.label ?? pageLabels[pathname] ?? "Dashboard";
  const searchPlaceholder = isProperties ? "Buscar propiedades..." : "Buscar contacto...";
  const showSearch = isProperties || pathname === "/professional";

  return (
    <header className={`navbar__header${isPayments ? " navbar__header--payments" : ""}${isOwnerDashboard ? " navbar__header--dashboard-owner" : ""}${isAdminDashboard ? " navbar__header--dashboard" : ""}${isChat ? " navbar__header--chat" : ""}`}>
      <button
        className="navbar__menu-button"
        type="button"
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        onClick={onToggleMenu}
      >
        <img className="navbar__menu-icon" src={menuOpen ? closeIcon : menuIcon} alt="" />
      </button>

      <Link href="/dashboard" className="navbar__brand" aria-label="AGI, inicio">
        <img className="navbar__brand-icon" src={brandLogo} alt="" />
        <strong>AGI</strong>
        <small className="navbar__brand-caption">Propiedades</small>
      </Link>

      <nav className="navbar__breadcrumb" aria-label="Ubicación actual">
        <Link href="/properties">Propiedades</Link>
        <span aria-current="page">{currentLabel}</span>
      </nav>

      {showSearch && <label className="navbar__search">
        <img src={searchIcon} alt="" />
        <input type="search" placeholder={searchPlaceholder} aria-label={searchPlaceholder.replace("...", "")} />
      </label>}

      <aside className="navbar__account" aria-label="Cuenta de usuario">
        <div className="navbar__notifications">
          <button type="button" aria-label="Notificaciones" onClick={() => setNotificationsOpen(true)}>
            <img src={bellIcon} alt="" />
          </button>
        </div>
        <Link href="/profile" className="navbar__account-link">
          <span>
            Juan Pérez
            <small>{accountRole}</small>
          </span>
          <i
            className="navbar__account-avatar"
            style={{ backgroundImage: `url(${referenceImage})` }}
            aria-hidden="true"
          />
        </Link>
      </aside>
      <ModalOverlay abierto={notificationsOpen} onCerrar={() => setNotificationsOpen(false)} posicion="derecha" etiqueta="Notificaciones">
        <NotificationPanel notificaciones={notifications} onCerrar={() => setNotificationsOpen(false)} />
      </ModalOverlay>
    </header>
  );
}
