import { useState } from "react";
import { buildingColumnsIcon, penIcon, plusIcon, trashCanIcon } from "../../assets/icons";
import { SummaryPill, Button, AgencyModal } from "../../components";
import "./SuperAdmin.css";

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M4 2h16v20h-7v-4h-2v4H4V2Zm4 4v3h2V6H8Zm6 0v3h2V6h-2Zm-6 6v3h2v-3H8Zm6 0v3h2v-3h-2Z" />
    </svg>
  );
}

function AgencyLogo({ agency }) {
  return (
    <span
      className={`super-admin__agency-logo${agency.code === "UA" || agency.code === "ST" ? ` super-admin__agency-logo--${agency.code.toLowerCase()}` : ""}`}
      aria-hidden="true"
    >
      {agency.code !== "UA" && agency.code !== "ST" ? agency.code : null}
    </span>
  );
}

const initialAgencies = [
  { name: "Inmobiliaria Alianza", code: "UA", admins: [] },
  {
    name: "Inmobiliaria S&T",
    code: "ST",
    admins: [
      { name: "Ernesto Pesto", role: "Admin", initials: "EP" },
      { name: "Misara Masara", role: "Admin", initials: "MM" },
    ],
  },
];

export default function SuperAdmin() {
  const [agencies, setAgencies] = useState(initialAgencies);
  const [expanded, setExpanded] = useState({ "Inmobiliaria S&T": true });
  const [modal, setModal] = useState(null);

  function saveAgency(name) {
    if (modal.mode === "edit") {
      setAgencies((current) =>
        current.map((agency) => (agency.name === modal.agency.name ? { ...agency, name } : agency)),
      );
      setExpanded((current) => ({ ...current, [name]: current[modal.agency.name] }));
    } else {
      setAgencies((current) => [
        {
          name,
          code: name
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          admins: [],
        },
        ...current,
      ]);
    }
    setModal(null);
  }

  function addAdmin(dni) {
    setAgencies((current) =>
      current.map((agency) =>
        agency.name === modal.agency.name
          ? {
              ...agency,
              admins: [
                ...agency.admins,
                { name: `DNI ${dni}`, dni, role: "Admin", initials: "AD" },
              ],
            }
          : agency,
      ),
    );
    setModal(null);
  }

  function removeAdmin(agencyName, adminName) {
    setAgencies((current) =>
      current.map((agency) =>
        agency.name === agencyName
          ? { ...agency, admins: agency.admins.filter((admin) => admin.name !== adminName) }
          : agency,
      ),
    );
  }

  function changeRole(agencyName, adminName, role) {
    setAgencies((current) =>
      current.map((agency) =>
        agency.name === agencyName
          ? {
              ...agency,
              admins: agency.admins.map((admin) =>
                admin.name === adminName ? { ...admin, role } : admin,
              ),
            }
          : agency,
      ),
    );
  }

  return (
    <main id="super-admin">
      <aside className="super-admin__sidebar">
        <div className="super-admin__side-item is-active">
          <BuildingIcon />
          Inmobiliarias
        </div>
      </aside>
      <section className="super-admin__workspace">
        <div className="super-admin__topbar">
          <header className="super-admin__hero">
            <h1>Gestión de inmobiliarias</h1>
            <p>Administra la creación de inmobiliarias, a sus usuarios, etc.</p>
          </header>
          <div className="super-admin__actions">
            <SummaryPill
              icon={buildingColumnsIcon}
              label="Inmobiliarias activas"
              value={agencies.length}
              tone="success"
            />
            <Button
              className="super-admin__new"
              icon={plusIcon}
              text="Nueva inmobiliaria"
              onClick={() => setModal({ mode: "create" })}
            />
          </div>
        </div>
        <section className="super-admin__agency-list" aria-label="Inmobiliarias registradas">
          {agencies.map((agency) => (
            <article
              className={`super-admin__agency${expanded[agency.name] ? " is-expanded" : ""}`}
              key={agency.name}
            >
              <header>
                <AgencyLogo agency={agency} />
                <h2>{agency.name}</h2>
                <div className="super-admin__agency-controls">
                  <button
                    className="super-admin__add-admin"
                    type="button"
                    onClick={() => setModal({ mode: "admin", agency })}
                  >
                    ＋ Añadir admin
                  </button>
                  <button
                    className="super-admin__edit"
                    type="button"
                    onClick={() => setModal({ mode: "edit", agency })}
                    aria-label={`Editar ${agency.name}`}
                  >
                    <img src={penIcon} alt="" />
                  </button>
                  <button
                    className="super-admin__expand"
                    type="button"
                    onClick={() =>
                      setExpanded((current) => ({
                        ...current,
                        [agency.name]: !current[agency.name],
                      }))
                    }
                    aria-label={`${expanded[agency.name] ? "Contraer" : "Expandir"} ${agency.name}`}
                    aria-expanded={Boolean(expanded[agency.name])}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
              </header>
              {expanded[agency.name] && (
                <div className="super-admin__admins">
                  {agency.admins.length ? (
                    agency.admins.map((admin) => (
                      <article className="super-admin__admin" key={admin.name}>
                        <span
                          className={`super-admin__avatar${admin.initials === "EP" || admin.initials === "MM" ? ` super-admin__avatar--${admin.initials.toLowerCase()}` : ""}`}
                        >
                          {admin.initials === "EP" || admin.initials === "MM"
                            ? null
                            : admin.initials}
                        </span>
                        <button
                          className="super-admin__delete"
                          type="button"
                          onClick={() => removeAdmin(agency.name, admin.name)}
                          aria-label={`Eliminar a ${admin.name}`}
                        >
                          <img src={trashCanIcon} alt="" />
                        </button>
                        <h3>{admin.name}</h3>
                        <label
                          className="super-admin__role-label"
                          htmlFor={`role-${agency.code}-${admin.initials}`}
                        >
                          Rol
                        </label>
                        <select
                          id={`role-${agency.code}-${admin.initials}`}
                          value={admin.role}
                          onChange={(event) =>
                            changeRole(agency.name, admin.name, event.target.value)
                          }
                          aria-label={`Rol de ${admin.name}`}
                        >
                          <option>Admin</option>
                          <option>Agente</option>
                          <option>Propietario</option>
                        </select>
                      </article>
                    ))
                  ) : (
                    <p className="super-admin__no-admins">
                      Esta inmobiliaria todavía no tiene administradores.
                    </p>
                  )}
                </div>
              )}
            </article>
          ))}
        </section>
      </section>
      {modal && (
        <AgencyModal
          key={`${modal.mode}-${modal.agency?.name || "new"}`}
          mode={modal.mode}
          agency={modal.agency}
          onClose={() => setModal(null)}
          onSubmit={modal.mode === "admin" ? addAdmin : saveAgency}
        />
      )}
    </main>
  );
}
