import { useState } from "react";
import { buildingColumnsIcon, penIcon, plusIcon, trashCanIcon } from "../../assets/icons";
import SummaryPill from "../../components/summaryPill/SummaryPill";
import Button from "../../components/button/Button";
import AgencyModal from "../../components/agency/AgencyModal";
import "./SuperAdmin.css";

const initialAgencies = [
  { name: "Inmobiliaria Alianza", code: "UA", admins: [] },
  { name: "Inmobiliaria S&T", code: "ST", admins: [{ name: "Ernesto Pesto", role: "Admin", initials: "EP" }, { name: "Misara Masara", role: "Admin", initials: "MM" }] },
];

export default function SuperAdmin() {
  const [agencies, setAgencies] = useState(initialAgencies);
  const [expanded, setExpanded] = useState({ "Inmobiliaria S&T": true });
  const [modal, setModal] = useState(null);
  const [feedback, setFeedback] = useState("");

  function saveAgency(name) {
    if (modal.mode === "edit") {
      setAgencies((current) => current.map((agency) => agency.name === modal.agency.name ? { ...agency, name } : agency));
      setExpanded((current) => ({ ...current, [name]: current[modal.agency.name] }));
    } else {
      setAgencies((current) => [{ name, code: name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase(), admins: [] }, ...current]);
    }
    setModal(null);
    setFeedback(`${name} fue ${modal.mode === "edit" ? "actualizada" : "creada"} correctamente.`);
    window.setTimeout(() => setFeedback(""), 2800);
  }

  function addAdmin(dni) {
    setAgencies((current) => current.map((agency) => agency.name === modal.agency.name ? {
      ...agency,
      admins: [...agency.admins, { name: `DNI ${dni}`, dni, role: "Admin", initials: "AD" }],
    } : agency));
    setModal(null);
  }

  function removeAdmin(agencyName, adminName) {
    setAgencies((current) => current.map((agency) => agency.name === agencyName ? { ...agency, admins: agency.admins.filter((admin) => admin.name !== adminName) } : agency));
  }

  return (
    <main id="super-admin">
      <aside className="super-admin__sidebar"><div className="super-admin__side-item is-active"><img src={buildingColumnsIcon} alt="" />Inmobiliarias</div></aside>
      <section className="super-admin__workspace">
        <div className="super-admin__topbar"><header className="super-admin__hero"><h1>Gestión de inmobiliarias</h1><p>Administra la creación de inmobiliarias, a sus usuarios, etc.</p></header><div className="super-admin__actions"><SummaryPill icon={buildingColumnsIcon} label="Inmobiliarias activas" value={agencies.length} tone="success" /><Button className="super-admin__new" icon={plusIcon} text="Nueva inmobiliaria" onClick={() => setModal({ mode: "create" })} /></div></div>
        <section className="super-admin__agency-list" aria-label="Inmobiliarias registradas">
          {agencies.map((agency) => (
            <article className={`super-admin__agency${expanded[agency.name] ? " is-expanded" : ""}`} key={agency.name}>
              <header>
                <span className="super-admin__agency-logo">{agency.code}</span>
                <h2>{agency.name}</h2>
                <div className="super-admin__agency-controls">
                  <button className="super-admin__add-admin" type="button" onClick={() => setModal({ mode: "admin", agency })}>＋ Añadir admin</button>
                  <button className="super-admin__edit" type="button" onClick={() => setModal({ mode: "edit", agency })} aria-label={`Editar ${agency.name}`}><img src={penIcon} alt="" /></button>
                  <button type="button" onClick={() => setExpanded((current) => ({ ...current, [agency.name]: !current[agency.name] }))} aria-expanded={Boolean(expanded[agency.name])}>{expanded[agency.name] ? "⌃ Contraer" : "⌄"}</button>
                </div>
              </header>
              {expanded[agency.name] && <div className="super-admin__admins">
                {agency.admins.length ? agency.admins.map((admin) => (
                  <article className="super-admin__admin" key={admin.name}>
                    <span className="super-admin__avatar">{admin.initials}</span>
                    <button className="super-admin__delete" type="button" onClick={() => removeAdmin(agency.name, admin.name)} aria-label={`Eliminar a ${admin.name}`}><img src={trashCanIcon} alt="" /></button>
                    <h3>{admin.name}</h3>
                    <span className="super-admin__role-label">Rol</span>
                    <select defaultValue={admin.role} aria-label={`Rol de ${admin.name}`}><option>Admin</option><option>Agente</option><option>Propietario</option></select>
                  </article>
                )) : <p className="super-admin__no-admins">Esta inmobiliaria todavía no tiene administradores.</p>}
              </div>}
            </article>
          ))}
        </section>
      </section>
      <p className="super-admin__feedback" role="status" aria-live="polite">{feedback}</p>
      {modal && <AgencyModal key={`${modal.mode}-${modal.agency?.name || "new"}`} mode={modal.mode} agency={modal.agency} onClose={() => setModal(null)} onSubmit={modal.mode === "admin" ? addAdmin : saveAgency} />}
    </main>
  );
}
