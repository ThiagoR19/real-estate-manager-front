import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { linkIcon, penIcon, trashCanIcon } from "../../assets/icons";
import "./AccionesEntidad.css";

const menuWidth = 176;

export default function AccionesEntidad({ entidad, nombre, onEdit, onDelete, onGenerateActivation, className = "", variant = "table" }) {
  const [position, setPosition] = useState(null);
  const open = position !== null;
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const initialFocusRef = useRef(0);
  const menuId = useId();
  const actions = [
    { label: `Editar ${entidad}`, icon: penIcon, onClick: onEdit },
    ...(onGenerateActivation
      ? [{ label: "Generar enlace", icon: linkIcon, onClick: onGenerateActivation }]
      : []),
    { label: `Eliminar ${entidad}`, icon: trashCanIcon, onClick: onDelete },
  ];

  useEffect(() => {
    if (!position) return undefined;

    const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]');
    menuItems?.[initialFocusRef.current]?.focus({ preventScroll: true });

    function cerrarDesdeFuera(event) {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target))
        setPosition(null);
    }

    function cerrarAlDesplazar(event) {
      if (!menuRef.current?.contains(event.target)) setPosition(null);
    }

    function cerrarAlRedimensionar() {
      setPosition(null);
    }

    document.addEventListener("pointerdown", cerrarDesdeFuera);
    document.addEventListener("focusin", cerrarDesdeFuera);
    document.addEventListener("scroll", cerrarAlDesplazar, true);
    window.addEventListener("resize", cerrarAlRedimensionar);
    return () => {
      document.removeEventListener("pointerdown", cerrarDesdeFuera);
      document.removeEventListener("focusin", cerrarDesdeFuera);
      document.removeEventListener("scroll", cerrarAlDesplazar, true);
      window.removeEventListener("resize", cerrarAlRedimensionar);
    };
  }, [position]);

  function abrirMenu(focusIndex = 0) {
    const rect = triggerRef.current.getBoundingClientRect();
    initialFocusRef.current = focusIndex;
    setPosition({
      left: Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)),
      ...(window.innerHeight - rect.bottom >= 70
        ? { top: rect.bottom + 5 }
        : { bottom: window.innerHeight - rect.top + 5 }),
    });
  }

  function cerrarMenu() {
    setPosition(null);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function ejecutarAccion(action) {
    cerrarMenu();
    action();
  }

  function manejarTecladoMenu(event) {
    event.stopPropagation();
    const items = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const index = items.indexOf(document.activeElement);
    let next;

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        cerrarMenu();
        return;
      case "Tab":
        cerrarMenu();
        return;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
      case "ArrowDown":
        next = (index + 1) % items.length;
        break;
      case "ArrowUp":
        next = (index - 1 + items.length) % items.length;
        break;
      default:
        return;
    }

    event.preventDefault();
    items[next]?.focus({ preventScroll: true });
  }

  return (
    <div
      className={`acciones-entidad acciones-entidad--${variant} ${className}`.trim()}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        ref={triggerRef}
        className="acciones-entidad__trigger"
        type="button"
        aria-label={`Acciones de ${entidad}: ${nombre}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? cerrarMenu() : abrirMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            abrirMenu(event.key === "ArrowUp" ? actions.length - 1 : 0);
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            cerrarMenu();
          }
        }}
      >
        <span className="acciones-entidad__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            className="acciones-entidad__menu"
            role="menu"
            aria-label={`Acciones de ${entidad}: ${nombre}`}
            style={position}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={manejarTecladoMenu}
          >
            {actions.map(({ label, icon, onClick }) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => ejecutarAccion(onClick)}
              >
                <img src={icon} alt="" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
