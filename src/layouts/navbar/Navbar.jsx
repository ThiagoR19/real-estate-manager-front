import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { xIcon as closeIcon } from "../../assets/icons";
import brandLogo from "../../assets/logoAGI.png";
import {
  allItems,
  isItemActive,
  navigationItemsForRole,
  primaryItems,
  secondaryItems,
} from "../navigation";
import { api } from "../../services/api.js";
import initials from "../../utils/initials.js";
import avatarClass from "../../utils/avatarClass.js";
import "./Navbar.css";

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

export default function Navbar({ menuOpen = false, onClose = () => {} }) {
  const [pathname] = useLocation();
  const [logoutError, setLogoutError] = useState("");
  const [user, setUser] = useState(() => api.getSession()?.usuario);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUser(api.getSession()?.usuario);
      setPhotoLoadError(false);
    };
    window.addEventListener("session-updated", syncUser);
    return () => window.removeEventListener("session-updated", syncUser);
  }, []);
<<<<<<< HEAD
  const roleId = Number(user?.rol);
  const role = {
    1: "Super admin",
    2: "Administrador",
    3: "Agente",
    4: "Propietario",
    5: "Inquilino",
  }[roleId] ?? "Usuario";
  const desktopItems = navigationItemsForRole(roleId);
=======
  const role =
    { 1: "Super admin", 2: "Administrador", 3: "Agente", 4: "Propietario", 5: "Inquilino" }[
      user?.rol
    ] || accountRoleFor(pathname);
>>>>>>> develop-nahuel

  async function closeSession(event) {
    event.preventDefault();
    setLogoutError("");
    try {
      await api.logout();
      onClose();
      window.location.assign("/login");
    } catch (error) {
      setLogoutError(error.message);
    }
  }
  const mobilePaths =
<<<<<<< HEAD
    roleId === 4
      ? ["/owner-dashboard", "/my-properties", "/collections", "/reports-agent", "/chat"]
      : roleId === 5
        ? ["/tenant-dashboard", "/payments", "/reports", "/chat"]
        : [2, 3].includes(roleId)
          ? [
              roleId === 3 ? "/agent-dashboard" : "/dashboard",
=======
    role === "Propietario"
      ? ["/dashboard", "/my-properties", "/collections", "/reports-agent", "/chat"]
      : role === "Inquilino"
        ? ["/dashboard", "/payments", "/reports", "/chat"]
        : role === "Super admin"
          ? ["/super-admin"]
          : [
              "/dashboard",
>>>>>>> develop-nahuel
              "/owners",
              "/tenant",
              "/professional",
              "/schedule",
              "/chat",
              "/properties",
              "/reports-agent",
            ]
          : [];
  const mobilePrimary = roleId === 1 ? primaryItems : mobilePaths.map((href) => {
    const item =
      allItems.find((entry) => entry.href === href) ??
      allItems.find((entry) => entry.href === "/reports-agent");
    return { ...item, href, label: href.endsWith("dashboard") ? "Dashboard" : item.label };
  });
  const mobileSecondary = roleId === 1
    ? secondaryItems
    : desktopItems.secondary.filter(({ href }) =>
        ["/profile", "/terms", "/agents", "/agency"].includes(href),
      );

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
      <button
        className="navbar__backdrop"
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <aside className="navbar__drawer" id="main-navigation" aria-label="Navegación principal">
        <div className="navbar__drawer-brand">
          <Link
            href="/dashboard"
            className="navbar__brand"
            aria-label="AGI, inicio"
            onClick={onClose}
          >
            <img className="navbar__brand-icon" src={brandLogo} alt="" />
            <strong>AGI</strong>
          </Link>
          <button
            className="navbar__drawer-close"
            type="button"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            <img src={closeIcon} alt="" />
          </button>
        </div>

        <nav className="navbar__drawer-nav navbar__drawer-nav--desktop">
          {desktopItems.primary.map((item) => (
            <NavigationItem key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
          <span className="navbar__drawer-divider" aria-hidden="true" />
          {desktopItems.secondary.map((item) => (
            <NavigationItem key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
        </nav>
        <nav className="navbar__drawer-nav navbar__drawer-nav--mobile">
          {mobilePrimary.map((item) => (
            <NavigationItem key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
          <span className="navbar__drawer-divider" aria-hidden="true" />
          {mobileSecondary.map((item) => (
            <NavigationItem key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
        </nav>
        <Link href="/profile" className="navbar__drawer-account" onClick={onClose}>
          {user?.urlFotoPerfil && !photoLoadError ? (
            <img className="navbar__drawer-avatar" src={api.assetUrl(user.urlFotoPerfil)} alt="" onError={() => setPhotoLoadError(true)} />
          ) : (
            <span className={`navbar__drawer-avatar ${avatarClass(user?.nombre, user?.apellido)}`} aria-hidden="true">
              {initials(user?.nombre, user?.apellido)}
            </span>
          )}
          <span>
            <strong>{user ? `${user.nombre} ${user.apellido}` : "Cuenta"}</strong>
            <small>{role}</small>
          </span>
        </Link>
        {logoutError && (
          <p className="navbar__logout-error" role="alert">
            {logoutError}
          </p>
        )}
        <button
          type="button"
          className="navbar__drawer-account navbar__drawer-logout"
          onClick={closeSession}
        >
          Cerrar sesión
        </button>
      </aside>
    </>
  );
}
