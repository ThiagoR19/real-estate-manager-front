import { useEffect, useRef, useState } from "react";
import { penIcon, trashCanIcon } from "../../assets/icons";
import Button from "../button/Button";
import "./PropertyActions.css";

export default function PropertyActions({ onEdit, onDelete, name, className = "" }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    function dismiss(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  useEffect(() => {
    if (!confirmDelete) return;
    dialogRef.current.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [confirmDelete]);

  return (
    <div ref={rootRef} className={`property-actions ${className}`} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => {
      event.stopPropagation();
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    }}>
      <button ref={triggerRef} className="property-actions__trigger" type="button" aria-label={`Opciones de ${name}`} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((current) => !current)}>•••</button>
      {open && <div className="property-actions__menu" role="menu" aria-label={`Acciones de ${name}`}>
        <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(); }}><img src={penIcon} alt="" />Editar propiedad</button>
        <button type="button" role="menuitem" onClick={() => { setOpen(false); setConfirmDelete(true); }}><img src={trashCanIcon} alt="" />Eliminar propiedad</button>
      </div>}
      {confirmDelete && <dialog ref={dialogRef} className="property-actions__confirmation" aria-label="Confirmar eliminación de propiedad" onCancel={() => setConfirmDelete(false)} onClose={() => { setConfirmDelete(false); triggerRef.current?.focus(); }}>
        <h2>¿Seguro que desea eliminar esta propiedad?</h2>
        <div className="property-actions__confirmation-buttons">
          <button type="button" autoFocus className="property-actions__cancel" onClick={() => dialogRef.current.close()}>Cancelar</button>
          <Button text="Eliminar" onClick={() => { dialogRef.current.close(); onDelete(); }} />
        </div>
      </dialog>}
    </div>
  );
}
