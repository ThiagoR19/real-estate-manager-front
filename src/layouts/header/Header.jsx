import { Link, useLocation } from "wouter";
import { barsIcon as menuIcon, bellIcon, magnifyingGlassIcon as searchIcon, xIcon as closeIcon, } from "../../assets/icons";
import referenceImage from "../../assets/terms-reference.png";
import brandLogo from "../../assets/logoAGI.png";
import { allItems, isItemActive, pageLabels } from "../navigation";
import "./Header.css";

export default function Header({ menuOpen = false, onToggleMenu = () => { } }) {
  const [pathname] = useLocation();
  const currentItem = allItems.find(({ href }) => isItemActive(pathname, href));
  const isPayments = pathname === "/payments" || pathname.startsWith("/payments/");
  const isProperties = pathname === "/properties" || pathname.startsWith("/properties/");
  const currentLabel = isPayments ? "Pagos" : currentItem?.label ?? pageLabels[pathname] ?? "Dashboard";
  const searchPlaceholder = isProperties ? "Buscar propiedades..." : "Buscar contacto...";

  return (
    <header className={`navbar__header${isPayments ? " navbar__header--payments" : ""}`}>
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
      </Link>

      <nav className="navbar__breadcrumb" aria-label="Ubicación actual">
        <Link href="/properties">Propiedades</Link>
        <span aria-current="page">{currentLabel}</span>
      </nav>

      <label className="navbar__search">
        <img src={searchIcon} alt="" />
        <input type="search" placeholder={searchPlaceholder} aria-label={searchPlaceholder.replace("...", "")} />
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
            <small>{isPayments ? "Inquilino" : "Agente"}</small>
          </span>
          <i
            className="navbar__account-avatar"
            style={{ backgroundImage: `url(${referenceImage})` }}
            aria-hidden="true"
          />
        </Link>
      </aside>
    </header>
  );
}
