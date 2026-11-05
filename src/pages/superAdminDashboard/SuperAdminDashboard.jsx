import { useState } from "react";
import brandLogo from "../../assets/logoAGI.png";
import bannerImage from "../../assets/fondoCasa.png";
import { plusIconWhite, trashCanIcon } from "../../assets/icons";
import AgencyModal from "../../components/agency/AgencyModal";
import { Header, Navbar } from "../../layouts";
import "./SuperAdminDashboard.css";

const initialAgencies = [
  {
    id: "alianza",
    name: "Inmobiliaria Alianza",
    mark: "UH",
    tone: "gold",
    expanded: false,
    admins: [],
  },
  {
    id: "syT",
    name: "Inmobiliaria S&T",
    mark: "S&T",
    tone: "lime",
    expanded: true,
    admins: [
      { id: "hernesto", name: "Hernesto Pesto", initials: "HP", tone: "male", role: "Admin" },
      { id: "misara", name: "Misara Masara", initials: "MM", tone: "female", role: "Admin" },
    ],
  },
];

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3H16a1 1 0 0 1 1 1v17M3 21h18M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M11 21v-3h3v3" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m14.5 5.5 4 4M4 20l3.2-.7L19.5 7a2.12 2.12 0 0 0-3-3L4.2 16.3 4 20Z" />
    </svg>
  );
}

function ChevronIcon({ direction = "down" }) {
  return (
    <svg className={`superadmin__chevron superadmin__chevron--${direction}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function AgencyMark({ tone, children }) {
  return <span className={`superadmin__agency-mark superadmin__agency-mark--${tone}`}>{children}</span>;
}

function UserAvatar({ initials, tone }) {
  return <span className={`superadmin__user-avatar superadmin__user-avatar--${tone}`}>{initials}</span>;
}

function AdminCard({ admin, onRemove, onRoleChange }) {
  return (
    <article className="superadmin__admin-card">
      <div className="superadmin__admin-card-top">
        <UserAvatar initials={admin.initials} tone={admin.tone} />
        <button className="superadmin__delete-button" type="button" onClick={() => onRemove(admin.id)} aria-label={`Eliminar a ${admin.name}`}>
          <img src={trashCanIcon} alt="" />
        </button>
      </div>
      <div className="superadmin__admin-name">{admin.name}</div>
      <label className="superadmin__role-label" htmlFor={`role-${admin.id}`}>Rol</label>
      <select id={`role-${admin.id}`} value={admin.role} onChange={(event) => onRoleChange(admin.id, event.target.value)}>
        <option>Admin</option>
        <option>Supervisor</option>
        <option>Editor</option>
      </select>
    </article>
  );
}

function AgencyCard({ agency, onToggle, onAddAdmin, onEdit, onRemoveAdmin, onRoleChange }) {
  return (
    <section className={`superadmin__agency-card${agency.expanded ? " is-expanded" : ""}`}>
      <header className="superadmin__agency-header">
        <div className="superadmin__agency-title">
          <AgencyMark tone={agency.tone}>{agency.mark}</AgencyMark>
          <h2>{agency.name}</h2>
        </div>
        <div className="superadmin__agency-actions">
          <button className="superadmin__add-admin" type="button" onClick={() => onAddAdmin(agency.id)}>
            <span aria-hidden="true">+</span> Añadir admin
          </button>
          <button className="superadmin__icon-button superadmin__icon-button--edit" type="button" onClick={() => onEdit(agency.id)} aria-label={`Editar ${agency.name}`}>
            <PencilIcon />
          </button>
          <button className="superadmin__collapse-button" type="button" onClick={() => onToggle(agency.id)} aria-expanded={agency.expanded}>
            <ChevronIcon direction={agency.expanded ? "up" : "down"} />
            <span>{agency.expanded ? "Contraer" : "Expandir"}</span>
          </button>
        </div>
      </header>

      {agency.expanded && (
        <div className="superadmin__admins-grid">
          {agency.admins.map((admin) => (
            <AdminCard key={admin.id} admin={admin} onRemove={(adminId) => onRemoveAdmin(agency.id, adminId)} onRoleChange={(adminId, role) => onRoleChange(agency.id, adminId, role)} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function SuperAdminDashboard() {
  const [agencies, setAgencies] = useState(initialAgencies);
  const [modal, setModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeAgencyCount = 24 + Math.max(0, agencies.length - initialAgencies.length);

  function toggleAgency(agencyId) {
    setAgencies((current) => current.map((agency) => agency.id === agencyId ? { ...agency, expanded: !agency.expanded } : agency));
  }

  function openNewAgency() {
    setModal({ type: "new-agency" });
  }

  function openAddAdmin(agencyId) {
    setModal({ type: "new-admin", agencyId });
  }

  function openEditAgency(agencyId) {
    setModal({ type: "edit-agency", agencyId });
  }

  function saveAgency(name) {
    if (modal.type === "edit-agency") {
      setAgencies((current) => current.map((agency) => agency.id === modal.agencyId ? { ...agency, name } : agency));
    } else {
      setAgencies((current) => [...current, { id: `agency-${Date.now()}`, name, mark: "AG", tone: "blue", expanded: false, admins: [] }]);
    }
    setModal(null);
  }

  function saveAdmin(dni) {
    setAgencies((current) => current.map((agency) => agency.id === modal.agencyId ? {
      ...agency,
      expanded: true,
      admins: [...agency.admins, { id: `admin-${Date.now()}`, name: `DNI ${dni}`, dni, initials: "AD", tone: "blue", role: "Admin" }],
    } : agency));
    setModal(null);
  }

  function removeAdmin(agencyId, adminId) {
    setAgencies((current) => current.map((agency) => agency.id === agencyId ? { ...agency, admins: agency.admins.filter((admin) => admin.id !== adminId) } : agency));
  }

  function changeRole(agencyId, adminId, role) {
    setAgencies((current) => current.map((agency) => agency.id === agencyId ? {
      ...agency,
      admins: agency.admins.map((admin) => admin.id === adminId ? { ...admin, role } : admin),
    } : agency));
  }

  return (
    <>
    <div className="superadmin__mobile-navigation">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)} />
      <Navbar menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
    <main id="superadmin-dashboard">
      <header className="superadmin__topbar">
        <div className="superadmin__brand">
          <img src={brandLogo} alt="" />
          <strong>AGI</strong>
          <span>Propiedades</span>
        </div>
        <div className="superadmin__topbar-divider" aria-hidden="true" />
        <span className="superadmin__context">Panel administrativo</span>
        <div className="superadmin__account">
          <div>
            <strong>Nahuel GM</strong>
            <span>Super admin</span>
          </div>
          <span className="superadmin__profile-avatar" aria-hidden="true">NG</span>
        </div>
      </header>

      <div className="superadmin__body">
        <aside className="superadmin__sidebar">
          <button className="superadmin__sidebar-link is-active" type="button" aria-current="page">
            <BuildingIcon />
            <span>Inmobiliarias</span>
          </button>
        </aside>

        <section className="superadmin__content">
          <div className="superadmin__intro-row">
            <div className="superadmin__hero" style={{ backgroundImage: `url(${bannerImage})` }}>
              <div className="superadmin__hero-overlay" />
              <div className="superadmin__hero-copy">
                <h1><span className="superadmin__desktop-copy">Gestión de inmobiliarias</span><span className="superadmin__mobile-copy">¡Hola, Thiago!</span></h1>
                <p><span className="superadmin__desktop-copy">Administra la creación de inmobiliarias, a sus usuarios, etc.</span><span className="superadmin__mobile-copy">Gestiona las inmobiliarias</span></p>
              </div>
            </div>
            <div className="superadmin__summary-column">
              <div className="superadmin__active-count">
                <span className="superadmin__active-icon"><BuildingIcon /></span>
                <span>Inmobiliarias activas</span>
                <strong>{activeAgencyCount}</strong>
              </div>
              <button className="superadmin__new-agency" type="button" onClick={openNewAgency}>
                <img src={plusIconWhite} alt="" />
                <span>Nueva inmobiliaria</span>
              </button>
            </div>
          </div>

          <div className="superadmin__agencies">
            {agencies.map((agency) => (
              <AgencyCard key={agency.id} agency={agency} onToggle={toggleAgency} onAddAdmin={openAddAdmin} onEdit={openEditAgency} onRemoveAdmin={removeAdmin} onRoleChange={changeRole} />
            ))}
          </div>
        </section>
      </div>

      {modal && (
        <AgencyModal
          key={`${modal.type}-${modal.agencyId || "new"}`}
          mode={modal.type === "new-admin" ? "admin" : modal.type === "edit-agency" ? "edit" : "create"}
          agency={agencies.find((agency) => agency.id === modal.agencyId)}
          onClose={() => setModal(null)}
          onSubmit={modal.type === "new-admin" ? saveAdmin : saveAgency}
        />
      )}
    </main>
    </>
  );
}
