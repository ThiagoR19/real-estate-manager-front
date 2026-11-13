import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Boton, SelectDesplegable } from "../index";
import "./GestionModal.css";

export default function GestionModal({
  isOpen = true,
  onClose,
  title,
  subtitle,
  variant = "",
  children,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusable = () =>
      [
        ...dialog.querySelectorAll(
          'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex="0"]',
        ),
      ].filter((element) => element.getClientRects().length > 0);
    (focusable()[0] || dialog).focus();

    function handleKeyDown(event) {
      if (event.key === "Escape" && !event.defaultPrevented) closeRef.current?.();
      if (event.key !== "Tab") return;
      const controls = focusable();
      const first = controls[0];
      const last = controls.at(-1);
      if (!first) {
        event.preventDefault();
        dialog.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="gestion-modal__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className={`gestion-modal${variant ? ` gestion-modal--${variant}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? descriptionId : undefined}
        tabIndex={-1}
      >
        <header className="gestion-modal__header">
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p id={descriptionId}>{subtitle}</p>}
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}

export function AccionesModal({ onClose, submitText = "Guardar cambios", disabled = false }) {
  return (
    <footer className="gestion-modal__actions">
      <button className="gestion-modal__cancel" type="button" onClick={onClose}>
        Cancelar
      </button>
      <Boton className="gestion-modal__submit" type="submit" text={submitText} disabled={disabled} />
    </footer>
  );
}

export function CampoModal({ label, children }) {
  return (
    <label className="gestion-modal__field">
      <span className="gestion-modal__label">{label}</span>
      {children}
    </label>
  );
}

export function EntradaModal({ icon, ...props }) {
  return (
    <span className="gestion-modal__input-wrap">
      {icon && <img src={icon} alt="" aria-hidden="true" />}
      <input {...props} />
    </span>
  );
}

export function ModalSelect({ label, icon, options, value, onChange }) {
  return (
    <SelectDesplegable
      label={label}
      placeholder={options[0]}
      icon={icon}
      options={options}
      value={value}
      onChange={onChange}
      className="gestion-modal__select"
      triggerClassName="gestion-modal__select-trigger"
      iconClassName="gestion-modal__select-icon"
      valueClassName="gestion-modal__select-value"
      chevronClassName="gestion-modal__select-arrow"
      optionsClassName="gestion-modal__select-options"
    />
  );
}
