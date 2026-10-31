import EntityActions from "../entityActions/EntityActions";

export default function PropertyActions({ onEdit, onDelete, name, className = "" }) {
  return <EntityActions entity="propiedad" name={name} onEdit={onEdit} onDelete={onDelete} variant="property" className={className} />;
}
