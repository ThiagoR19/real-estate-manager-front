import { useEffect, useState } from "react";
import { buildingColumnsIcon, plusIcon, trashCanIcon } from "../../assets/icons";
import { SummaryPill, Button, Pagination, usePagination } from "../../components";
import AgencyModal from "./AgencyModal";
import { api } from "../../services/api.js";
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

const agencyView = (agency, admins = []) => ({
  ...agency,
  code: agency.nombre.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase(),
  name: agency.nombre,
  admins: admins.filter((admin) => admin.idInmobiliaria === agency.id).map((admin) => ({
    ...admin,
    name: `${admin.nombre || ""} ${admin.apellido || ""}`.trim() || `DNI ${admin.dni}`,
    initials: "AD",
    role: "Admin",
  })),
});

export default function SuperAdmin() {
  const [agencies, setAgencies] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null);
  const [activationUrl, setActivationUrl] = useState("");
  const [error, setError] = useState("");
  const { page, totalPages, pageItems, setPage } = usePagination(agencies);

  useEffect(() => {
    Promise.all([api.agencies(), api.admins()])
      .then(([rows, administrators]) => setAgencies(rows.map((agency) => agencyView(agency, administrators))))
      .catch((cause) => setError(cause.message));
  }, []);

  async function saveAgency(name) {
    const created = await api.createAgency(name);
    setAgencies((current) => [agencyView(created), ...current]);
    setModal(null);
  }

  async function addAdmin(dni) {
    const created = await api.createAdmin({ idInmobiliaria: modal.agency.id, dni });
    const admin = agencyView(modal.agency, [created]).admins[0];
    setAgencies((current) =>
      current.map((agency) =>
        agency.id === modal.agency.id
          ? {
              ...agency,
              admins: [
                ...agency.admins,
                admin,
              ],
            }
          : agency,
      ),
    );
    setExpanded((current) => ({ ...current, [modal.agency.id]: true }));
    setActivationUrl(created.activacion?.enlace || "");
    setModal(null);
  }

  async function removeAdmin(agencyId, adminId) {
    try { await api.deleteAdmin(adminId); }
    catch (cause) { setError(cause.message); return; }
    setAgencies((current) =>
      current.map((agency) =>
        agency.id === agencyId
          ? { ...agency, admins: agency.admins.filter((admin) => admin.id !== adminId) }
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
          {error && <p role="alert">{error}</p>}
          {activationUrl && <p role="status">Administrador creado. Compartí este enlace con su titular: <a href={activationUrl}>Abrir enlace de activación</a> <button type="button" onClick={() => navigator.clipboard.writeText(activationUrl)}>Copiar enlace</button></p>}
          {pageItems.map((agency) => (
            <article
              className={`super-admin__agency${expanded[agency.id] ? " is-expanded" : ""}`}
              key={agency.id}
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
                    className="super-admin__expand"
                    type="button"
                    onClick={() =>
                      setExpanded((current) => ({
                        ...current,
                        [agency.id]: !current[agency.id],
                      }))
                    }
                    aria-label={`${expanded[agency.id] ? "Contraer" : "Expandir"} ${agency.name}`}
                    aria-expanded={Boolean(expanded[agency.id])}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
              </header>
              {expanded[agency.id] && (
                <div className="super-admin__admins">
                  {agency.admins.length ? (
                    agency.admins.map((admin) => (
                      <article className="super-admin__admin" key={admin.id}>
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
                          onClick={() => removeAdmin(agency.id, admin.id)}
                          aria-label={`Eliminar a ${admin.name}`}
                        >
                          <img src={trashCanIcon} alt="" />
                        </button>
                        <h3>{admin.name}</h3>
                        <span>Admin</span>
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
          <Pagination page={page} totalPages={totalPages} total={agencies.length} onPageChange={setPage} />
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
