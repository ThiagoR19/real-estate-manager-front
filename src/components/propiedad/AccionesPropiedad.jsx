import { AccionesEntidad } from "../index";

export default function AccionesPropiedad({ onEdit, onDelete, nombre, className = "" }) {
  return (
    <AccionesEntidad
      entidad="propiedad"
      nombre={nombre}
      onEdit={onEdit}
      onDelete={onDelete}
      variant="propiedad"
      className={className}
    />
  );
}
