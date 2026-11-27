import { assetUrl } from "../../utils/assetUrl.js";
import { obtenerSesion, guardarSesion } from "../../utils/sesion.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { CapaModal, PanelNotificaciones } from "../../components";
import { barsIcon, bellIcon, magnifyingGlassIcon, xIcon } from "../../assets/icons";
import brandLogo from "../../assets/logoAGI.png";
import { NOMBRE_ROL, ROLES, TODOS_LOS_ROLES } from "../../utils/roles.js";
import { rolCuentaParaRuta, todosLosElementos, elementoActivo, etiquetasPagina, inicioDelRol } from "../navegacion";
import { api } from "../../services/api.js";
import initials from "../../utils/initials.js";
import "./Header.css";

const identidadSesion = (sesion) => sesion?.token ?? null;

export default function Header({ menuOpen = false, onToggleMenu = () => { } }) {
  const [pathname] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [session, setSession] = useState(() => obtenerSesion());
  const user = session?.usuario;
  const role = Number(user?.rol);
  const sessionToken = identidadSesion(session);
  const canReceiveNotifications = Boolean(sessionToken) && TODOS_LOS_ROLES.includes(role);
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const notificationsRequest = useRef(0);
  const notificationsIdentity = useRef(sessionToken);

  const loadNotifications = useCallback(async () => {
    const requestId = ++notificationsRequest.current;
    setNotificationsLoading(true);
    try {
      const items = await api.notificaciones();
      if (requestId !== notificationsRequest.current) return;
      setNotifications(Array.isArray(items) ? items : []);
      setNotificationsLoaded(true);
      setNotificationsError("");
    } catch (error) {
      if (requestId === notificationsRequest.current) setNotificationsError(error.message);
    } finally {
      if (requestId === notificationsRequest.current) setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const syncUser = () => {
      const nextSession = obtenerSesion();
      const nextIdentity = identidadSesion(nextSession);
      if (nextIdentity !== notificationsIdentity.current) {
        notificationsIdentity.current = nextIdentity;
        notificationsRequest.current += 1;
        setNotifications([]);
        setNotificationsLoaded(false);
        setNotificationsLoading(false);
        setNotificationsError("");
        setNotificationsOpen(false);
      }
      setSession(nextSession);
      setPhotoLoadError(false);
    };
    const syncStorage = (event) => {
      if (event.key === "agi-session" || event.key === null) syncUser();
    };
    window.addEventListener("session-updated", syncUser);
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener("session-updated", syncUser);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const initialSession = obtenerSesion();
    const userId = initialSession?.usuario?.id;
    if (!initialSession?.token || userId == null) return undefined;

    api.perfil().then((profile) => {
      if (!active) return;
      const currentSession = obtenerSesion();
      if (
        !currentSession?.token ||
        String(currentSession.usuario?.id) !== String(userId)
      ) return;

      const currentUser = currentSession.usuario;
      const updatedUser = {
        ...currentUser,
        nombre: profile?.nombre ?? currentUser.nombre,
        apellido: profile?.apellido ?? currentUser.apellido,
        urlFotoPerfil: profile?.urlFotoPerfil ?? null,
      };
      if (
        updatedUser.nombre !== currentUser.nombre ||
        updatedUser.apellido !== currentUser.apellido ||
        updatedUser.urlFotoPerfil !== currentUser.urlFotoPerfil
      ) {
        guardarSesion({ ...currentSession, usuario: updatedUser });
      }
    }).catch(() => {

    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    notificationsRequest.current += 1;
    if (!canReceiveNotifications) return undefined;

    const initialLoad = window.setTimeout(loadNotifications, 0);
    const interval = window.setInterval(loadNotifications, 30000);
    const refreshOnFocus = () => loadNotifications();
    window.addEventListener("focus", refreshOnFocus);
    return () => {
      notificationsRequest.current += 1;
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [sessionToken, canReceiveNotifications, loadNotifications]);

  useEffect(() => {
    if (role !== ROLES.INQUILINO || !notificationsLoaded) return;
    const items = notifications.filter((item) => !item.leida);
    window.dispatchEvent(new CustomEvent("notificaciones-actualizadas", {
      detail: { total: items.length, items: items.slice(0, 5) },
    }));
  }, [role, notificationsLoaded, notifications]);

  const markNotificationsRead = async (ids) => {
    const results = await Promise.allSettled(ids.map((id) => api.marcarNotificacionLeida(id)));
    if (sessionToken !== notificationsIdentity.current) return;
    notificationsRequest.current += 1;
    setNotificationsLoading(false);
    const updatedIds = new Set(ids.filter((_, index) =>
      results[index].status === "fulfilled" && results[index].value,
    ));
    setNotifications((items) => items.map((item) =>
      updatedIds.has(item.id) ? { ...item, leida: true } : item,
    ));
    setNotificationsError(updatedIds.size === ids.length ? "" : "No se pudieron marcar todos los avisos seleccionados como leídos.");
  };
  const unread = notifications.filter((item) => !item.leida);
  const currentItem = todosLosElementos.find(({ href }) => elementoActivo(pathname, href));
  const isPayments = pathname === "/pagos" || pathname.startsWith("/pagos/");
  const isProperties = pathname === "/propiedades" || pathname.startsWith("/propiedades/") || pathname === "/propiedad" || pathname.startsWith("/propiedad/");
  const isPaymentsAndCollections = pathname === "/pagos-cobros" || pathname.startsWith("/pagos-cobros/");
  const isOwnerDashboard = pathname === "/dashboard-propietario" || pathname === "/mis-propiedades" || pathname === "/cobros";
  const isAdminDashboard = pathname === "/admin-dashboard" || pathname === "/super-admin" || pathname === "/indec";
  const isSuperAdmin = pathname === "/super-admin";
  const isChat = pathname === "/chat";
  const accountRole = rolCuentaParaRuta(pathname);
  const roleName = NOMBRE_ROL[role] || accountRole;
  const accountName = user ? (`${user.nombre || ""} ${user.apellido || ""}`.trim() || user.usuario || "Cuenta") : "Cuenta";
  const userInitials = initials(user?.nombre, user?.apellido);
  const currentLabel = isPayments ? "Zona de pago" : pathname.startsWith("/propiedad/") ? "Propiedad" : (currentItem?.etiquetaRuta ?? currentItem?.etiqueta ?? etiquetasPagina[pathname] ?? "Dashboard");
  const searchPlaceholder = isPaymentsAndCollections ? "Buscar propietario/locatario" : isProperties ? "Buscar propiedades..." : "Buscar contacto...";
  const showSearch = isPaymentsAndCollections || pathname === "/propiedades" || pathname === "/profesionales";

  return (
    <header className={`navbar__header${isPayments ? " navbar__header--pagos" : ""}${isOwnerDashboard ? " navbar__header--dashboard-owner" : ""}${isAdminDashboard ? " navbar__header--dashboard" : ""}${isChat ? " navbar__header--chat" : ""}${isSuperAdmin ? " navbar__header--super-admin" : ""}`}>
      <button
        className="navbar__menu-button"
        type="button"
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        onClick={onToggleMenu}
      >
        <img className="navbar__menu-icon" src={menuOpen ? xIcon : barsIcon} alt="" />
      </button>

      <Link
        href={inicioDelRol(role)}
        className="navbar__brand"
        aria-label="AGI, inicio"
      >
        <img className="navbar__brand-icon" src={brandLogo} alt="" />
        <strong>AGI</strong>
        <small className="navbar__brand-caption">Propiedades</small>
      </Link>

      <nav className="navbar__breadcrumb" aria-label="Ubicación actual">
        <Link href="/propiedades">Propiedades</Link>
        <span aria-current="page">{currentLabel}</span>
      </nav>

      {showSearch && (
        <label className="navbar__search">
          <img src={magnifyingGlassIcon} alt="" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder.replace("...", "")}
            onChange={
              isProperties || isPaymentsAndCollections
                ? (event) =>
                  window.dispatchEvent(
                    new CustomEvent(isProperties ? "propiedad-search" : "personas-search", {
                      detail: event.target.value,
                    }),
                  )
                : undefined
            }
          />
        </label>
      )}

      <aside className="navbar__account" aria-label="Cuenta de usuario">
        {canReceiveNotifications && (
          <div className="navbar__notifications">
            <button
              type="button"
              aria-label={unread.length ? `Notificaciones, ${unread.length} sin leer` : "Notificaciones"}
              aria-haspopup="dialog"
              aria-expanded={notificationsOpen}
              onClick={() => {
                setNotificationsOpen(true);
                loadNotifications();
              }}
            >
              <img src={bellIcon} alt="" />
              {unread.length > 0 && (
                <span className="navbar__notifications-count" aria-hidden="true">
                  {unread.length > 99 ? "99+" : unread.length}
                </span>
              )}
            </button>
          </div>
        )}
        <Link
          href="/perfil"
          className="navbar__account-link"
          aria-label={`Mi perfil: ${accountName}`}
          title="Mi perfil"
        >
          <span>
            {accountName}
            <small>{roleName}</small>
          </span>
          {user?.urlFotoPerfil && !photoLoadError ? (
            <img
              className="navbar__account-avatar navbar__account-avatar--photo"
              src={assetUrl(user.urlFotoPerfil)}
              alt=""
              onError={() => setPhotoLoadError(true)}
            />
          ) : (
            <span className="navbar__account-avatar" aria-hidden="true">
              {userInitials || "U"}
            </span>
          )}
        </Link>
      </aside>
      <CapaModal
        abierto={notificationsOpen}
        onCerrar={() => setNotificationsOpen(false)}
        posicion="derecha"
        etiqueta="Notificaciones"
      >
        <PanelNotificaciones
          rol={role}
          notificaciones={notifications}
          cargando={notificationsLoading}
          error={notificationsError}
          onReintentar={loadNotifications}
          onMarcarLeida={(id) => markNotificationsRead([id])}
          onMarcarTodas={() => markNotificationsRead(unread.map((item) => item.id))}
          onCerrar={() => setNotificationsOpen(false)}
        />
      </CapaModal>
    </header>
  );
}
