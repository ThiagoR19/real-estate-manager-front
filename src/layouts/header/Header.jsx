import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ModalOverlay, NotificationPanel } from "../../components";
import {
  barsIcon as menuIcon,
  bellIcon,
  magnifyingGlassIcon as searchIcon,
  xIcon as closeIcon,
} from "../../assets/icons";
import brandLogo from "../../assets/logoAGI.png";
import { accountRoleFor, allItems, isItemActive, pageLabels } from "../navigation";
import { api } from "../../services/api.js";
import initials from "../../utils/initials.js";
import "./Header.css";

export default function Header({ menuOpen = false, onToggleMenu = () => { } }) {
  const [pathname] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [user, setUser] = useState(() => api.getSession()?.usuario);
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const notificationsRequest = useRef(0);
  const notificationsIdentity = useRef(`${user?.id}:${user?.rol}`);

  const loadNotifications = useCallback(async () => {
    const requestId = ++notificationsRequest.current;
    setNotificationsLoading(true);
    try {
      const items = await api.notifications();
      if (requestId !== notificationsRequest.current) return;
      setNotifications(Array.isArray(items) ? items : []);
      setNotificationsError("");
    } catch (error) {
      if (requestId === notificationsRequest.current) setNotificationsError(error.message);
    } finally {
      if (requestId === notificationsRequest.current) setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const syncUser = () => {
      const nextUser = api.getSession()?.usuario;
      const nextIdentity = `${nextUser?.id}:${nextUser?.rol}`;
      if (nextIdentity !== notificationsIdentity.current) {
        notificationsIdentity.current = nextIdentity;
        notificationsRequest.current += 1;
        setNotifications([]);
        setNotificationsLoading(false);
        setNotificationsError("");
      }
      setUser(nextUser);
      setPhotoLoadError(false);
    };
    window.addEventListener("session-updated", syncUser);
    return () => window.removeEventListener("session-updated", syncUser);
  }, []);

  useEffect(() => {
    let active = true;
    const initialSession = api.getSession();
    const userId = initialSession?.usuario?.id;
    if (!initialSession?.token || userId == null) return undefined;

    api.profile().then((profile) => {
      if (!active) return;
      const currentSession = api.getSession();
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
        api.saveSession({ ...currentSession, usuario: updatedUser });
      }
    }).catch(() => {
      // El header conserva el nombre y las iniciales aunque el perfil no esté disponible.
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    notificationsRequest.current += 1;
    if (![2, 3, 4, 5].includes(Number(user?.rol))) return undefined;

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
  }, [user?.id, user?.rol, loadNotifications]);

  const markNotificationRead = async (id) => {
    notificationsRequest.current += 1;
    setNotificationsLoading(false);
    try {
      const updated = await api.markNotificationRead(id);
      if (!updated) throw new Error("La notificación no se pudo marcar como leída.");
      setNotifications((items) => items.map((item) =>
        item.id === id ? { ...item, leida: true } : item,
      ));
      setNotificationsError("");
    } catch (error) {
      setNotificationsError(error.message);
    }
  };

  const markAllNotificationsRead = async () => {
    const unread = notifications.filter((item) => !item.leida);
    if (!unread.length) return;
    notificationsRequest.current += 1;
    setNotificationsLoading(false);
    const results = await Promise.allSettled(unread.map((item) => api.markNotificationRead(item.id)));
    const updatedIds = new Set(unread.filter((_, index) =>
      results[index].status === "fulfilled" && results[index].value,
    ).map((item) => item.id));
    setNotifications((items) => items.map((item) =>
      updatedIds.has(item.id) ? { ...item, leida: true } : item,
    ));
    setNotificationsError(updatedIds.size === unread.length ? "" : "Algunas notificaciones no se pudieron marcar como leídas.");
  };
  const currentItem = allItems.find(({ href }) => isItemActive(pathname, href));
  const isPayments = pathname === "/payments" || pathname.startsWith("/payments/");
  const isProperties =
    pathname === "/properties" ||
    pathname.startsWith("/properties/") ||
    pathname === "/property" ||
    pathname.startsWith("/property/");
  const isPaymentsAndCollections =
    pathname === "/payments-collections" || pathname.startsWith("/payments-collections/");
  const isOwnerDashboard =
    pathname === "/owner-dashboard" || pathname === "/my-properties" || pathname === "/collections";
  const isAdminDashboard =
    pathname === "/admin-dashboard" || pathname === "/super-admin" || pathname === "/indec";
  const isSuperAdmin = pathname === "/super-admin";
  const isChat = pathname === "/chat";
  const accountRole = accountRoleFor(pathname);
  const roleName =
    { 1: "Super admin", 2: "Administrador", 3: "Agente", 4: "Propietario", 5: "Inquilino" }[
    user?.rol
    ] || accountRole;
  const accountName = user
    ? (`${user.nombre || ""} ${user.apellido || ""}`.trim() || user.usuario || "Cuenta")
    : "Cuenta";
  const userInitials = initials(user?.nombre, user?.apellido);
  const currentLabel = isPayments
    ? "Zona de pago"
    : pathname.startsWith("/property/")
      ? "Propiedad"
      : (currentItem?.breadcrumbLabel ?? currentItem?.label ?? pageLabels[pathname] ?? "Dashboard");
  const searchPlaceholder = isPaymentsAndCollections
    ? "Buscar propietario/locatario"
    : isProperties
      ? "Buscar propiedades..."
      : "Buscar contacto...";
  const showSearch =
    isPaymentsAndCollections || pathname === "/properties" || pathname === "/professional";

  return (
    <header
      className={`navbar__header${isPayments ? " navbar__header--payments" : ""}${isOwnerDashboard ? " navbar__header--dashboard-owner" : ""}${isAdminDashboard ? " navbar__header--dashboard" : ""}${isChat ? " navbar__header--chat" : ""}${isSuperAdmin ? " navbar__header--super-admin" : ""}`}
    >
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

      <Link
        href={isSuperAdmin ? "/super-admin" : "/dashboard"}
        className="navbar__brand"
        aria-label="AGI, inicio"
      >
        <img className="navbar__brand-icon" src={brandLogo} alt="" />
        <strong>AGI</strong>
        <small className="navbar__brand-caption">Propiedades</small>
      </Link>

      <nav className="navbar__breadcrumb" aria-label="Ubicación actual">
        <Link href="/properties">Propiedades</Link>
        <span aria-current="page">{currentLabel}</span>
      </nav>

      {showSearch && (
        <label className="navbar__search">
          <img src={searchIcon} alt="" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder.replace("...", "")}
            onChange={
              isProperties
                ? (event) =>
                  window.dispatchEvent(
                    new CustomEvent("property-search", { detail: event.target.value }),
                  )
                : undefined
            }
          />
        </label>
      )}

      <aside className="navbar__account" aria-label="Cuenta de usuario">
        {!isSuperAdmin && Number(user?.rol) !== 1 && (
          <div className="navbar__notifications">
            <button
              type="button"
              aria-label="Notificaciones"
              onClick={() => {
                setNotificationsOpen(true);
                loadNotifications();
              }}
            >
              <img src={bellIcon} alt="" />
            </button>
          </div>
        )}
        <Link
          href="/profile"
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
              src={api.assetUrl(user.urlFotoPerfil)}
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
      <ModalOverlay
        abierto={notificationsOpen}
        onCerrar={() => setNotificationsOpen(false)}
        posicion="derecha"
        etiqueta="Notificaciones"
      >
        <NotificationPanel
          notificaciones={notifications}
          cargando={notificationsLoading}
          error={notificationsError}
          onReintentar={loadNotifications}
          onMarcarLeida={markNotificationRead}
          onMarcarTodas={markAllNotificationsRead}
          onCerrar={() => setNotificationsOpen(false)}
        />
      </ModalOverlay>
    </header>
  );
}
