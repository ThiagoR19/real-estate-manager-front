import { useState } from "react";
import { buildingColumnsIcon, penIcon, plusIcon, trashCanIcon } from "../../assets/icons";
import SummaryPill from "../../components/summaryPill/SummaryPill";
import Button from "../../components/button/Button";
import "./SuperAdmin.css";

const initialAgencies = [
  { name: "Inmobiliaria Alianza", code: "UA", admins: [] },
  { name: "Inmobiliaria S&T", code: "ST", admins: [{ name: "Ernesto Pesto", role: "Admin", initials: "EP" }, { name: "Misara Masara", role: "Admin", initials: "MM" }] },
];

export default function SuperAdmin() {
  const [agencies, setAgencies] = useState(initialAgencies);
  const [expanded, setExpanded] = useState({ "Inmobiliaria S&T": true });
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");

  function createAgency(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setAgencies((current) => [{ name: trimmedName, code: trimmedName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase(), admins: [] }, ...current]);
    setName("");
    setShowModal(false);
    setFeedback(`${trimmedName} fue creada correctamente.`);
    window.setTimeout(() => setFeedback(""), 2800);
  }

  function removeAdmin(agencyName, adminName) {
    setAgencies((current) => current.map((agency) => agency.name === agencyName ? { ...agency, admins: agency.admins.filter((admin) => admin.name !== adminName) } : agency));
  }

  return (
    <main id="super-admin">
      <aside className="super-admin__sidebar"><div className="super-admin__side-item is-active"><img src={buildingColumnsIcon} alt="" />Inmobiliarias</div></aside>
      <section className="super-admin__workspace">
        <div className="super-admin__topbar"><header className="super-admin__hero"><h1>Gestión de inmobiliarias</h1><p>Administra la creación de inmobiliarias, a sus usuarios, etc.</p></header><div className="super-admin__actions"><SummaryPill icon={buildingColumnsIcon} label="Inmobiliarias activas" value={agencies.length} tone="success" /><Button className="super-admin__new" icon={plusIcon} text="Nueva inmobiliaria" onClick={() => setShowModal(true)} /></div></div>
        <section className="super-admin__agency-list" aria-label="Inmobiliarias registradas">
          {agencies.map((agency) => <article className={`super-admin__agency${expanded[agency.name] ? " is-expanded" : ""}`} key={agency.name}><header><span className="super-admin__agency-logo">{agency.code}</span><h2>{agency.name}</h2><div className="super-admin__agency-controls"><button type="button" onClick={() => setFeedback("La edición de la inmobiliaria estará disponible próximamente.")} aria-label={`Editar ${agency.name}`}><img src={penIcon} alt="" /></button><button type="button" onClick={() => setExpanded((current) => ({ ...current, [agency.name]: !current[agency.name] }))} aria-expanded={Boolean(expanded[agency.name])}>{expanded[agency.name] ? "⌃ Contraer" : "⌄"}</button></div></header>{expanded[agency.name] && <div className="super-admin__admins">{agency.admins.length ? agency.admins.map((admin) => <article className="super-admin__admin" key={admin.name}><span className="super-admin__avatar">{admin.initials}</span><button className="super-admin__delete" type="button" onClick={() => removeAdmin(agency.name, admin.name)} aria-label={`Eliminar a ${admin.name}`}><img src={trashCanIcon} alt="" /></button><h3>{admin.name}</h3><span className="super-admin__role-label">Rol</span><select defaultValue={admin.role} aria-label={`Rol de ${admin.name}`}><option>Admin</option><option>Agente</option><option>Propietario</option></select></article>) : <p className="super-admin__no-admins">Esta inmobiliaria todavía no tiene administradores.</p>}<button className="super-admin__add-admin" type="button" onClick={() => setFeedback("Podés invitar un administrador desde este botón.")}>＋ Añadir admin</button></div>}</article>)}
        </section>
      </section>
      <p className="super-admin__feedback" role="status" aria-live="polite">{feedback}</p>
      {showModal && <div className="super-admin__modal-backdrop" role="presentation" onClick={() => setShowModal(false)}><form className="super-admin__modal" onSubmit={createAgency} onClick={(event) => event.stopPropagation()}><button className="super-admin__modal-close" type="button" onClick={() => setShowModal(false)} aria-label="Cerrar">×</button><h2>Nueva inmobiliaria</h2><p>Creá el espacio de trabajo y luego agregá sus administradores.</p><label>Nombre de la inmobiliaria<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Inmobiliaria Central" required /></label><Button className="super-admin__save" text="Crear inmobiliaria" /></form></div>}
    </main>
  );
}
