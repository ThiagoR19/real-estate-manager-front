import { useState } from "react";
import { calendarIcon, clockIcon, houseIcon, peopleIcon, userIcon } from "../../assets/icons";
import { ManagementModal, ModalActions, ModalField, ModalInput } from "../../components";
import "./VisitModal.css";

export default function VisitModal({ visit, defaultDate, properties, clients, agents, onClose, onSubmit }) {
  const editing = Boolean(visit);
  const [form, setForm] = useState({
    date: visit?.date || defaultDate || "",
    time: visit?.time || "10:00",
    idCliente: String(visit?.idCliente || clients[0]?.id || "new"),
    clientName: "", clientSurname: "", clientInterest: "ALQUILER",
    idPropiedad: String(visit?.idPropiedad || properties[0]?.id || ""),
    idAgente: String(visit?.idAgente || ""),
    status: visit?.status || "Programada",
    motivo: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.idCliente || !form.idPropiedad) {
      setError("Seleccioná un cliente y una propiedad.");
      return;
    }
    if (form.status === "Cancelada" && !form.motivo.trim()) {
      setError("Indicá el motivo de cancelación.");
      return;
    }
    const fecha = new Date(`${form.date}T${form.time}:00`).toISOString();
    if (form.idCliente === "new" && (!form.clientName.trim() || !form.clientSurname.trim())) {
      setError("Ingresá el nombre y apellido del cliente.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        idCliente: form.idCliente === "new" ? null : Number(form.idCliente),
        clientName: form.clientName.trim(), clientSurname: form.clientSurname.trim(), clientInterest: form.clientInterest,
        idPropiedad: Number(form.idPropiedad),
        ...(editing || form.idAgente ? { idAgente: Number(form.idAgente) } : {}),
        fecha, status: form.status, motivo: form.motivo.trim(),
      });
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }

  return (
    <ManagementModal onClose={onClose} title={editing ? "Editar visita" : "Agendar visita"} subtitle="Completá los datos de la visita" variant="compact">
      <form className="visit-modal" onSubmit={submit}>
        <div className="management-modal__card">
          <div className="management-modal__summary visit-modal__summary"><strong className="visit-modal__section-title"><span>1</span>Datos</strong><div className="visit-modal__date"><ModalInput icon={calendarIcon} name="date" type="date" aria-label="Fecha de la visita" value={form.date} onChange={(event) => update("date", event.target.value)} required /></div></div>
          <div className="management-modal__fields visit-modal__fields">
            <ModalField label="Cliente"><span className="visit-modal__select-wrap"><img src={userIcon} alt="" /><select value={form.idCliente} onChange={(event) => update("idCliente", event.target.value)} required><option value="new">+ Nuevo cliente</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.nombre} {client.apellido}</option>)}</select></span></ModalField>
            {form.idCliente === "new" && <div className="visit-modal__new-client"><ModalField label="Nombre"><input value={form.clientName} onChange={(event) => update("clientName", event.target.value)} required /></ModalField><ModalField label="Apellido"><input value={form.clientSurname} onChange={(event) => update("clientSurname", event.target.value)} required /></ModalField><ModalField label="Interés"><select value={form.clientInterest} onChange={(event) => update("clientInterest", event.target.value)}><option value="ALQUILER">Alquiler</option><option value="COMPRA">Compra</option><option value="AMBOS">Ambos</option></select></ModalField></div>}
            <ModalField label="Propiedad"><span className="visit-modal__select-wrap"><img src={houseIcon} alt="" /><select value={form.idPropiedad} onChange={(event) => update("idPropiedad", event.target.value)} required><option value="">Seleccioná una propiedad</option>{properties.map((property) => <option value={property.id} key={property.id}>{property.nombre}</option>)}</select></span></ModalField>
            <ModalField label="Hora"><ModalInput icon={clockIcon} name="time" type="time" value={form.time} onChange={(event) => update("time", event.target.value)} required /></ModalField>
            <ModalField label="Agente"><span className="visit-modal__select-wrap"><img src={peopleIcon} alt="" /><select value={form.idAgente} onChange={(event) => update("idAgente", event.target.value)} required={editing}><option value="">Asignarme la visita</option>{agents.map((agent) => <option value={agent.id} key={agent.id}>{agent.nombre}</option>)}</select></span></ModalField>
            {editing && <ModalField label="Estado"><span className="visit-modal__select-wrap"><img src={clockIcon} alt="" /><select value={form.status} onChange={(event) => update("status", event.target.value)}>{["Programada", "Realizada", "Cancelada"].map((status) => <option value={status} key={status}>{status}</option>)}</select></span></ModalField>}
            {form.status === "Cancelada" && <ModalField label="Motivo de cancelación"><textarea className="visit-modal__reason" value={form.motivo} onChange={(event) => update("motivo", event.target.value)} maxLength={500} required /></ModalField>}
            {error && <p className="visit-modal__error" role="alert">{error}</p>}
          </div>
        </div>
        <ModalActions onClose={onClose} submitText={editing ? "Guardar cambios" : "Agendar visita"} disabled={busy} />
      </form>
    </ManagementModal>
  );
}
