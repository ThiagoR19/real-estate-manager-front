import { useState } from "react";
import { calendarIcon, clockIcon, houseIcon, peopleIcon, userIcon } from "../../assets/icons";
import { GestionModal, AccionesModal, CampoModal, EntradaModal, mostrarAviso } from "../../components";
import "./VisitaModal.css";

export default function VisitaModal({ visit, defaultDate, properties, clients, agents, onClose, onSubmit }) {
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
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: editing ? "No se pudo guardar la visita" : "No se pudo agendar la visita", mensaje: cause.message });
    }
    finally { setBusy(false); }
  }

  return (
    <GestionModal onClose={onClose} title={editing ? "Editar visita" : "Agendar visita"} subtitle="Completá los datos de la visita" variant="compact">
      <form className="visita-modal" onSubmit={submit}>
        <div className="gestion-modal__card">
          <div className="gestion-modal__summary visita-modal__summary"><strong className="visita-modal__section-title"><span>1</span>Datos</strong><div className="visita-modal__date"><EntradaModal icon={calendarIcon} name="date" type="date" aria-label="Fecha de la visita" value={form.date} onChange={(event) => update("date", event.target.value)} required /></div></div>
          <div className="gestion-modal__fields visita-modal__fields">
            <CampoModal label="Cliente"><span className="visita-modal__select-wrap"><img src={userIcon} alt="" /><select value={form.idCliente} onChange={(event) => update("idCliente", event.target.value)} required><option value="new">+ Nuevo cliente</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.nombre} {client.apellido}</option>)}</select></span></CampoModal>
            {form.idCliente === "new" && <div className="visita-modal__new-client"><CampoModal label="Nombre"><input value={form.clientName} onChange={(event) => update("clientName", event.target.value)} required /></CampoModal><CampoModal label="Apellido"><input value={form.clientSurname} onChange={(event) => update("clientSurname", event.target.value)} required /></CampoModal><CampoModal label="Interés"><select value={form.clientInterest} onChange={(event) => update("clientInterest", event.target.value)}><option value="ALQUILER">Alquiler</option><option value="COMPRA">Compra</option><option value="AMBOS">Ambos</option></select></CampoModal></div>}
            <CampoModal label="Propiedad"><span className="visita-modal__select-wrap"><img src={houseIcon} alt="" /><select value={form.idPropiedad} onChange={(event) => update("idPropiedad", event.target.value)} required><option value="">Seleccioná una propiedad</option>{properties.map((property) => <option value={property.id} key={property.id}>{property.nombre}</option>)}</select></span></CampoModal>
            <CampoModal label="Hora"><EntradaModal icon={clockIcon} name="time" type="time" value={form.time} onChange={(event) => update("time", event.target.value)} required /></CampoModal>
            <CampoModal label="Agente"><span className="visita-modal__select-wrap"><img src={peopleIcon} alt="" /><select value={form.idAgente} onChange={(event) => update("idAgente", event.target.value)} required={editing}><option value="">Asignarme la visita</option>{agents.map((agent) => <option value={agent.id} key={agent.id}>{agent.nombre}</option>)}</select></span></CampoModal>
            {editing && <CampoModal label="Estado"><span className="visita-modal__select-wrap"><img src={clockIcon} alt="" /><select value={form.status} onChange={(event) => update("status", event.target.value)}>{["Programada", "Realizada", "Cancelada"].map((status) => <option value={status} key={status}>{status}</option>)}</select></span></CampoModal>}
            {form.status === "Cancelada" && <CampoModal label="Motivo de cancelación"><textarea className="visita-modal__reason" value={form.motivo} onChange={(event) => update("motivo", event.target.value)} maxLength={500} required /></CampoModal>}
            {error && <p className="visita-modal__error" role="alert">{error}</p>}
          </div>
        </div>
        <AccionesModal onClose={onClose} submitText={editing ? "Guardar cambios" : "Agendar visita"} disabled={busy} />
      </form>
    </GestionModal>
  );
}
