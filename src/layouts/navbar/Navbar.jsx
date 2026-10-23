import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { xIcon as closeIcon } from "../../assets/icons";
import brandLogo from "../../assets/logoAGI.png";
import { isItemActive, primaryItems, secondaryItems } from "../navigation";
import "./Navbar.css";

function NavigationItem({ item, pathname, onNavigate }) {
  const active = isItemActive(pathname, item.href);

  return (
    <Link href={item.href} className={`navbar__drawer-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined} onClick={onNavigate}>
      <img className="navbar__drawer-link-icon" src={item.icon} alt="" />
      <span>{item.label}</span>
    </Link>
  );
}

export default function Navbar({ menuOpen = false, onClose = () => { } }) {
  const [pathname] = useLocation();

  useEffect(() => {
    if (!menuOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [menuOpen, onClose]);

  if (!menuOpen) return null;

  return (
    <>
      <button className="navbar__backdrop" type="button" aria-label="Cerrar menú" onClick={onClose} />
      <aside className="navbar__drawer" id="main-navigation" aria-label="Navegación principal">
        <div className="navbar__drawer-brand">
          <Link href="/dashboard" className="navbar__brand" aria-label="AGI, inicio" onClick={onClose}>
            <img className="navbar__brand-icon" src={brandLogo} alt="" />
            <strong>AGI</strong>
          </Link>
          <button className="navbar__drawer-close" type="button" aria-label="Cerrar menú" onClick={onClose}>
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <nav className="navbar__drawer-nav">
          {primaryItems.map((item) => (
            <NavigationItem key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
          <span className="navbar__drawer-divider" aria-hidden="true" />
          {secondaryItems.map((item) => (
            <NavigationItem key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
        </nav>
      </aside>
    </>
  );
}
