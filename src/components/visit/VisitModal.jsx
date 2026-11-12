import { useState } from "react";
import { calendarIcon, clockIcon, houseIcon, peopleIcon, userIcon } from "../../assets/icons";
import { ManagementModal, ModalActions, ModalField, ModalInput, ModalSelect } from "../index";
import "./VisitModal.css";

const properties = ["Av. San Martín 12", "Casa de San Isidro", "Av. Santa Fe 850"];
const agents = ["Tú", "Matías F.", "Lucía Martínez"];
const statuses = ["A confirmar", "Confirmada", "Realizada", "Cancelada"];

export default function VisitModal({ visit, defaultDate, onClose, onSubmit }) {
  const editing = Boolean(visit);
  const [existingStart = "10:00", existingEnd = "11:00"] = visit?.time?.split(" - ") || [];
  const [form, setForm] = useState(() => ({
    date: visit?.date || defaultDate || "",
    property: visit?.property || properties[0],
    agent: visit?.agent || agents[0],
    status: visit?.status || statuses[0],
    client: visit?.client || "",
    startTime: existingStart,
    endTime: existingEnd,
  }));
  const [timeError, setTimeError] = useState("");

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "startTime" || name === "endTime") setTimeError("");
  }

  function submit(event) {
    event.preventDefault();
    if (form.endTime <= form.startTime) {
      setTimeError("La hora de finalización debe ser posterior a la de inicio.");
      return;
    }
    const { startTime, endTime, ...details } = form;
    onSubmit({ ...details, client: form.client.trim(), time: `${startTime} - ${endTime}` });
  }

  return (
    <ManagementModal
      onClose={onClose}
      title={editing ? "Editar visita" : "Agendar visita"}
      subtitle={editing ? "Ingrese los datos a editar" : "Ingrese los datos de la visita"}
      variant="compact"
    >
      <form className="visit-modal" onSubmit={submit}>
        <div className="management-modal__card">
          <div className="management-modal__summary visit-modal__summary">
            <strong className="visit-modal__section-title">
              <span>1</span>Datos
            </strong>
            <div className="visit-modal__date">
              <ModalInput
                icon={calendarIcon}
                name="date"
                type="date"
                aria-label="Fecha de la visita"
                value={form.date}
                onChange={(event) => update("date", event.target.value)}
                required
              />
            </div>
          </div>
          <div className="management-modal__fields visit-modal__fields">
            <ModalField label="Cliente">
              <ModalInput
                icon={userIcon}
                name="client"
                type="text"
                placeholder="Nombre del cliente"
                value={form.client}
                onChange={(event) => update("client", event.target.value)}
                required
              />
            </ModalField>
            <ModalField label="Propiedad">
              <ModalSelect
                label="Propiedad"
                icon={houseIcon}
                options={[...new Set([...properties, form.property])]}
                value={form.property}
                onChange={(value) => update("property", value)}
              />
            </ModalField>
            <div className="visit-modal__time-row">
              <ModalField label="Hora de inicio">
                <ModalInput
                  icon={clockIcon}
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(event) => update("startTime", event.target.value)}
                  required
                />
              </ModalField>
              <ModalField label="Hora de finalización">
                <ModalInput
                  icon={clockIcon}
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(event) => update("endTime", event.target.value)}
                  aria-invalid={Boolean(timeError)}
                  aria-describedby={timeError ? "visit-modal-time-error" : undefined}
                  required
                />
              </ModalField>
              {timeError && (
                <p className="visit-modal__error" id="visit-modal-time-error" role="alert">
                  {timeError}
                </p>
              )}
            </div>
            <ModalField label="Agente">
              <ModalSelect
                label="Agente"
                icon={peopleIcon}
                options={[...new Set([...agents, form.agent])]}
                value={form.agent}
                onChange={(value) => update("agent", value)}
              />
            </ModalField>
            <ModalField label="Estado">
              <ModalSelect
                label="Estado de la visita"
                icon={clockIcon}
                options={statuses}
                value={form.status}
                onChange={(value) => update("status", value)}
              />
            </ModalField>
          </div>
        </div>
        <ModalActions onClose={onClose} submitText={editing ? "Modificar" : "Guardar cambios"} />
      </form>
    </ManagementModal>
  );
}
