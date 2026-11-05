import { useState } from "react";
import { calendarIcon, clockIcon, houseIcon, peopleIcon } from "../../assets/icons";
import { ManagementModal, ModalActions, ModalField, ModalInput, ModalSelect } from "../index";
import "./VisitModal.css";

const properties = ["Av. San Martín 12", "Casa de San Isidro", "Av. Santa Fe 850"];
const agents = ["Tú", "Matías F.", "Lucía Martínez"];
const statuses = ["A confirmar", "Confirmada", "Realizada", "Cancelada"];

export default function VisitModal({ visit, defaultDate, onClose, onSubmit }) {
  const editing = Boolean(visit);
  const [form, setForm] = useState(() => ({
    date: visit?.date || defaultDate || "",
    property: visit?.property || properties[0],
    agent: visit?.agent || agents[0],
    status: visit?.status || statuses[0],
  }));

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <ManagementModal onClose={onClose} title={editing ? "Editar visita" : "Agendar visita"} subtitle={editing ? "Ingrese los datos a editar" : "Ingrese los datos de la visita"} variant="compact">
      <form className="visit-modal" onSubmit={submit}>
        <div className="management-modal__card">
          <div className="management-modal__summary visit-modal__summary">
            <strong className="visit-modal__section-title"><span>1</span>Datos</strong>
            <div className="visit-modal__date">
              <ModalInput icon={calendarIcon} name="date" type="date" aria-label="Fecha de la visita" value={form.date} onChange={(event) => update("date", event.target.value)} required />
            </div>
          </div>
          <div className="management-modal__fields visit-modal__fields">
            <ModalField label="Propiedad">
              <ModalSelect label="Propiedad" icon={houseIcon} options={[...new Set([...properties, form.property])]} value={form.property} onChange={(value) => update("property", value)} />
            </ModalField>
            <ModalField label="Agente">
              <ModalSelect label="Agente" icon={peopleIcon} options={[...new Set([...agents, form.agent])]} value={form.agent} onChange={(value) => update("agent", value)} />
            </ModalField>
            <ModalField label="Estado">
              <ModalSelect label="Estado de la visita" icon={clockIcon} options={statuses} value={form.status} onChange={(value) => update("status", value)} />
            </ModalField>
          </div>
        </div>
        <ModalActions onClose={onClose} submitText={editing ? "Modificar" : "Guardar cambios"} />
      </form>
    </ManagementModal>
  );
}
