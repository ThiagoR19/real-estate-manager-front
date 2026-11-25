import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { linkIcon, penIcon, trashCanIcon } from "../../assets/icons";
import "./AccionesEntidad.css";

const menuWidth = 176;

export default function AccionesEntidad({ entity, name, onEdit, onDelete, onGenerateActivation, className = "", variant = "table" }) {
  const [position, setPosition] = useState(null);
  const open = position !== null;
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const initialFocusRef = useRef(0);
  const menuId = useId();
  const actions = [
    { label: `Editar ${entity}`, icon: penIcon, onClick: onEdit },
    ...(onGenerateActivation
      ? [{ label: "Generar enlace", icon: linkIcon, onClick: onGenerateActivation }]
      : []),
    { label: `Eliminar ${entity}`, icon: trashCanIcon, onClick: onDelete },
  ];

  useEffect(() => {
    if (!position) return undefined;

    const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]');
    menuItems?.[initialFocusRef.current]?.focus({ preventScroll: true });

    function dismissOutside(event) {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target))
        setPosition(null);
    }

    function dismissOnScroll(event) {
      if (!menuRef.current?.contains(event.target)) setPosition(null);
    }

    function dismissOnResize() {
      setPosition(null);
    }

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("scroll", dismissOnScroll, true);
    window.addEventListener("resize", dismissOnResize);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("scroll", dismissOnScroll, true);
      window.removeEventListener("resize", dismissOnResize);
    };
  }, [position]);

  function openMenu(focusIndex = 0) {
    const rect = triggerRef.current.getBoundingClientRect();
    initialFocusRef.current = focusIndex;
    setPosition({
      left: Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)),
      ...(window.innerHeight - rect.bottom >= 70
        ? { top: rect.bottom + 5 }
        : { bottom: window.innerHeight - rect.top + 5 }),
    });
  }

  function closeMenu() {
    setPosition(null);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function runAction(action) {
    closeMenu();
    action();
  }

  function handleMenuKeyDown(event) {
    event.stopPropagation();
    const items = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const index = items.indexOf(document.activeElement);
    let next;

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        closeMenu();
        return;
      case "Tab":
        closeMenu();
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
        aria-label={`Acciones de ${entity}: ${name}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(event.key === "ArrowUp" ? actions.length - 1 : 0);
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            closeMenu();
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
            aria-label={`Acciones de ${entity}: ${name}`}
            style={position}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={handleMenuKeyDown}
          >
            {actions.map(({ label, icon, onClick }) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => runAction(onClick)}
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
