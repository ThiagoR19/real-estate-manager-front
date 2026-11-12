import { EntityActions } from "../index";

export default function PropertyActions({ onEdit, onDelete, name, className = "" }) {
  return (
    <EntityActions
      entity="propiedad"
      name={name}
      onEdit={onEdit}
      onDelete={onDelete}
      variant="property"
      className={className}
    />
  );
}
