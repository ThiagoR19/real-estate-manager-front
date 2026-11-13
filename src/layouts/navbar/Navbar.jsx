import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { xIcon as closeIcon } from "../../assets/icons";
import brandLogo from "../../assets/logoAGI.png";
import {
  todosLosElementos,
  elementoActivo,
  elementosNavegacionPorRol,
  elementosPrincipales,
  elementosSecundarios,
} from "../navegacion";
import { api } from "../../services/api.js";
import initials from "../../utils/initials.js";
import avatarClass from "../../utils/avatarClass.js";
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
  const [logoutError, setLogoutError] = useState("");
  const [user, setUser] = useState(() => api.obtenerSesion()?.usuario);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUser(api.obtenerSesion()?.usuario);
      setPhotoLoadError(false);
    };
    window.addEventListener("session-updated", syncUser);
    return () => window.removeEventListener("session-updated", syncUser);
  }, []);
  const roleId = Number(user?.rol);
  const role = {
    1: "Super admin",
    2: "Administrador",
    3: "Agente",
    4: "Propietario",
    5: "Inquilino",
  }[roleId] ?? "Usuario";
  const desktopItems = elementosNavegacionPorRol(roleId);

  async function closeSession(event) {
    event.preventDefault();
    setLogoutError("");
    try {
      await api.cerrarSesion();
      onClose();
      window.location.assign("/login");
    } catch (error) {
      setLogoutError(error.message);
    }
  }
  const mobilePaths =
    roleId === 4
      ? ["/dashboard", "/mis-propiedades", "/cobros", "/reportes-agente", "/chat"]
      : roleId === 5
        ? ["/dashboard", "/pagos", "/reportes", "/chat"]
        : [2, 3].includes(roleId)
          ? [
              "/dashboard",
              "/propietarios",
              "/inquilinos",
              "/profesionales",
              "/agenda",
              "/chat",
              "/propiedades",
              "/reportes-agente",
            ]
          : [];
  const mobilePrimary = roleId === 1 ? elementosPrincipales.filter(({ href }) => href === "/super-admin") : mobilePaths.map((href) => {
    const item =
      todosLosElementos.find((entry) => entry.href === href) ??
      todosLosElementos.find((entry) => entry.href === "/reportes-agente");
    return { ...item, href, etiqueta: href === "/dashboard" ? "Dashboard" : item.etiqueta };
  });
  const mobileSecondary = roleId === 1
    ? elementosSecundarios.filter(({ href }) => ["/perfil", "/terminos"].includes(href))
    : desktopItems.secundarios.filter(({ href }) =>
        ["/perfil", "/terminos", "/agentes", "/inmobiliaria"].includes(href),
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
          {desktopItems.principales.map((item) => (
            <ElementoNavegacion key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
          <span className="navbar__drawer-divider" aria-hidden="true" />
          {desktopItems.secundarios.map((item) => (
            <ElementoNavegacion key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
        </nav>
        <nav className="navbar__drawer-nav navbar__drawer-nav--mobile">
          {mobilePrimary.map((item) => (
            <ElementoNavegacion key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
          <span className="navbar__drawer-divider" aria-hidden="true" />
          {mobileSecondary.map((item) => (
            <ElementoNavegacion key={item.href} item={item} pathname={pathname} onNavigate={onClose} />
          ))}
        </nav>
        <Link href="/perfil" className="navbar__drawer-account" onClick={onClose}>
          {user?.urlFotoPerfil && !photoLoadError ? (
            <img className="navbar__drawer-avatar" src={api.urlRecurso(user.urlFotoPerfil)} alt="" onError={() => setPhotoLoadError(true)} />
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
