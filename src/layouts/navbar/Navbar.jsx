import { assetUrl } from "../../utils/assetUrl.js";
import { obtenerSesion } from "../../utils/sesion.js";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { xIcon } from "../../assets/icons";
import brandLogo from "../../assets/logoAGI.png";
import { elementoActivo, menuPorRol } from "../navegacion";
import { NOMBRE_ROL } from "../../utils/roles.js";
import { api } from "../../services/api.js";
import initials from "../../utils/initials.js";
import avatarClass from "../../utils/avatarClass.js";
import { mostrarAviso } from "../../components";
import "./Navbar.css";

function ElementoNavegacion({ item, pathname, onNavigate }) {
  const active = elementoActivo(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={`navbar__drawer-link${active ? " is-active" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
    >
      <img className="navbar__drawer-link-icon" src={item.icono} alt="" />
      <span>{item.etiqueta}</span>
    </Link>
  );
}

export default function Navbar({ menuOpen = false, onClose = () => {} }) {
  const [pathname] = useLocation();
  const [user, setUser] = useState(() => obtenerSesion()?.usuario);
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [rendered, setRendered] = useState(menuOpen);
  const closing = !menuOpen;

  if (menuOpen && !rendered) {
    setRendered(true);
  }

  useEffect(() => {
    const syncUser = () => {
      setUser(obtenerSesion()?.usuario);
      setPhotoLoadError(false);
    };
    window.addEventListener("session-updated", syncUser);
    return () => window.removeEventListener("session-updated", syncUser);
  }, []);
  const roleId = Number(user?.rol);
  const role = NOMBRE_ROL[roleId] ?? "Usuario";
  const desktopItems = menuPorRol(roleId);
  const mobileItems = menuPorRol(roleId, { movil: true });

  async function closeSession(event) {
    event.preventDefault();
    try {
      await api.cerrarSesion();
      onClose();
      window.location.assign("/login");
    } catch (error) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo cerrar la sesión", mensaje: error.message });
    }
  }
  useEffect(() => {
    if (menuOpen || !rendered) return undefined;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const closeTimer = window.setTimeout(() => {
      setRendered(false);
    }, reduceMotion ? 0 : 180);
    return () => window.clearTimeout(closeTimer);
  }, [menuOpen, rendered]);

  useEffect(() => {
    if (!rendered) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [rendered]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen, onClose]);

  if (!rendered) return null;

  return (
    <>
      <button
        className={`navbar__backdrop${closing ? " is-closing" : ""}`}
        type="button"
        aria-label="Cerrar menú"
        aria-hidden={!menuOpen}
        disabled={!menuOpen}
        tabIndex={menuOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={`navbar__drawer${closing ? " is-closing" : ""}`}
        id="main-navigation"
        aria-label="Navegación principal"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
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
            <img src={xIcon} alt="" />
          </button>
        </div>

        <nav className="navbar__drawer-nav navbar__drawer-nav--desktop">
          {desktopItems.principales.map((item) => (
            <ElementoNavegacion key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
          <span className="navbar__drawer-divider" aria-hidden="true" />
          {desktopItems.secundarios.map((item) => (
            <ElementoNavegacion key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
        </nav>
        <nav className="navbar__drawer-nav navbar__drawer-nav--mobile">
          {mobileItems.principales.map((item) => (
            <ElementoNavegacion key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
          <span className="navbar__drawer-divider" aria-hidden="true" />
          {mobileItems.secundarios.map((item) => (
            <ElementoNavegacion key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
        </nav>
        <Link href="/perfil" className="navbar__drawer-account" onClick={onClose}>
          {user?.urlFotoPerfil && !photoLoadError ? (
            <img className="navbar__drawer-avatar" src={assetUrl(user.urlFotoPerfil)} alt="" onError={() => setPhotoLoadError(true)} />
          ) : (
            <span className={`navbar__drawer-avatar ${avatarClass(user?.nombre, user?.apellido)}`} aria-hidden="true">
              {initials(user?.nombre, user?.apellido)}
            </span>
          )}
          <span>
            <strong>{user ? (`${user.nombre || ""} ${user.apellido || ""}`.trim() || user.usuario || "Cuenta") : "Cuenta"}</strong>
            <small>{role}</small>
          </span>
        </Link>
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
