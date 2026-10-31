import { useState } from "react";
import { addressCardIcon, buildingColumnsIcon } from "../../assets/icons";
import ManagementModal, {
  ModalActions,
  ModalField,
  ModalInput,
} from "../managementModal/ManagementModal";
import "./AgencyModal.css";

export default function AgencyModal({ mode = "create", agency, onClose, onSubmit }) {
  const isAdmin = mode === "admin";
  const isEditing = mode === "edit";
  const [value, setValue] = useState(isEditing ? agency?.name || "" : "");
  const title = isAdmin ? "Agregar admin" : isEditing ? "Editar inmobiliaria" : "Agregar inmobiliaria";

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedValue = value.trim();
    if (trimmedValue) onSubmit(trimmedValue);
  }

  return (
    <ManagementModal
      title={title}
      subtitle={isAdmin ? `Agrega un nuevo administrador a “${agency?.name || "la inmobiliaria"}”` : "Ingrese la info básica de la inmobiliaria"}
      onClose={onClose}
      variant="agency"
    >
      <form onSubmit={handleSubmit}>
        <div className="management-modal__card agency-modal__card">
          <div className="management-modal__summary agency-modal__band" aria-hidden="true" />
          <div className="agency-modal__field">
            <ModalField label={isAdmin ? "DNI del admin" : "Nombre de inmobiliaria"}>
              <ModalInput
                icon={isAdmin ? addressCardIcon : buildingColumnsIcon}
                name={isAdmin ? "dni" : "agencyName"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={isAdmin ? "DNI" : "Nombre de la inmobiliaria"}
                inputMode={isAdmin ? "numeric" : "text"}
                pattern={isAdmin ? "[0-9]{7,8}" : undefined}
                maxLength={isAdmin ? 8 : 100}
                title={isAdmin ? "Ingrese un DNI de 7 u 8 dígitos, sin puntos" : undefined}
                required
                autoComplete="off"
              />
            </ModalField>
          </div>
        </div>
        <ModalActions onClose={onClose} submitText={isAdmin ? "Agregar admin" : isEditing ? "Guardar cambios" : "Crear inmobiliaria"} />
      </form>
    </ManagementModal>
  );
}
