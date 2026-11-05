import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Button, DropdownSelect } from "../index";
import "./ManagementModal.css";

export default function ManagementModal({ isOpen = true, onClose, title, subtitle, variant = "", children }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusable = () => [...dialog.querySelectorAll('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex="0"]')]
      .filter((element) => element.getClientRects().length > 0);
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
      } else if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
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
    <div className="management-modal__overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        ref={dialogRef}
        className={`management-modal${variant ? ` management-modal--${variant}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? descriptionId : undefined}
        tabIndex={-1}
      >
        <header className="management-modal__header">
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p id={descriptionId}>{subtitle}</p>}
        </header>
        {children}
      </section>
    </div>, document.body,
  );
}

export function ModalActions({ onClose, submitText = "Guardar cambios" }) {
  return (
    <footer className="management-modal__actions">
      <button className="management-modal__cancel" type="button" onClick={onClose}>Cancelar</button>
      <Button className="management-modal__submit" type="submit" text={submitText} />
    </footer>
  );
}

export function ModalField({ label, children }) {
  return <label className="management-modal__field"><span className="management-modal__label">{label}</span>{children}</label>;
}

export function ModalInput({ icon, ...props }) {
  return <span className="management-modal__input-wrap">{icon && <img src={icon} alt="" aria-hidden="true" />}<input {...props} /></span>;
}

export function ModalSelect({ label, icon, options, value, onChange }) {
  return <DropdownSelect label={label} placeholder={options[0]} icon={icon} options={options} value={value} onChange={onChange}
    className="management-modal__select" triggerClassName="management-modal__select-trigger"
    iconClassName="management-modal__select-icon" valueClassName="management-modal__select-value"
    chevronClassName="management-modal__select-arrow" optionsClassName="management-modal__select-options" />;
}
