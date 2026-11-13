import { AccionesEntidad } from "../index";

export default function AccionesPropiedad({ onEdit, onDelete, name, className = "" }) {
  return (
    <AccionesEntidad
      entity="propiedad"
      name={name}
      onEdit={onEdit}
      onDelete={onDelete}
      variant="propiedad"
      className={className}
    />
  );
}
