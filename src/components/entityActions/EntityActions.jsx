import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { penIcon, trashCanIcon } from "../../assets/icons";
import "./EntityActions.css";

const menuWidth = 156;

export default function EntityActions({
  entity,
  name,
  onEdit,
  onDelete,
  className = "",
  variant = "table",
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const initialFocusRef = useRef(0);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]');
    menuItems?.[initialFocusRef.current]?.focus({ preventScroll: true });

    function dismissOutside(event) {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target))
        setOpen(false);
    }

    function dismissOnScroll(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }

    function dismissOnResize() {
      setOpen(false);
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
  }, [open]);

  function openMenu(focusIndex = 0) {
    const rect = triggerRef.current.getBoundingClientRect();
    initialFocusRef.current = focusIndex;
    setPosition({
      left: Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)),
      ...(window.innerHeight - rect.bottom >= 70
        ? { top: rect.bottom + 5 }
        : { bottom: window.innerHeight - rect.top + 5 }),
    });
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function runAction(action) {
    closeMenu();
    action();
  }

  function handleMenuKeyDown(event) {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    } else if (event.key === "Tab") {
      closeMenu();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const items = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
      const index = items.indexOf(document.activeElement);
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? items.length - 1
            : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next]?.focus({ preventScroll: true });
    }
  }

  return (
    <div
      ref={rootRef}
      className={`entity-actions entity-actions--${variant} ${className}`.trim()}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        ref={triggerRef}
        className="entity-actions__trigger"
        type="button"
        aria-label={`Acciones de ${entity}: ${name}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(event.key === "ArrowUp" ? 1 : 0);
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            closeMenu();
          }
        }}
      >
        <span className="entity-actions__dots" aria-hidden="true">
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
            className="entity-actions__menu"
            role="menu"
            aria-label={`Acciones de ${entity}: ${name}`}
            style={position}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={handleMenuKeyDown}
          >
            <button type="button" role="menuitem" tabIndex={-1} onClick={() => runAction(onEdit)}>
              <img src={penIcon} alt="" aria-hidden="true" />
              Editar {entity}
            </button>
            <button type="button" role="menuitem" tabIndex={-1} onClick={() => runAction(onDelete)}>
              <img src={trashCanIcon} alt="" aria-hidden="true" />
              Eliminar {entity}
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
