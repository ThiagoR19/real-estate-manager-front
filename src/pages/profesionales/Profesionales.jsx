import { useEffect, useState } from "react";
import {
  envelopeIcon,
  peopleIcon,
  phoneIcon,
  penIcon,
  plusIcon,
  starIcon,
  trashCanIcon,
} from "../../assets/icons/index.js";
import {
  SelectDesplegable,
  ConfirmarEliminacionModal,
  GestionModal,
  AccionesModal,
  Boton,
  Paginacion,
  usePaginacion,
  mostrarAviso,
} from "../../components/index.js";
import ProfesionalModal from "./ProfesionalModal";
import "./Profesionales.css";

import { api } from "../../services/api.js";
import { obtenerSesion } from "../../services/login.js";
import avatarClass from "../../utils/avatarClass.js";

export default function Profesionales() {
  const [professionals, setProfessionals] = useState([]);
  const [selectedType, setSelectedType] = useState("Tipo");
  const [modal, setModal] = useState({ isOpen: false, mode: "create", professional: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingVote, setPendingVote] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sendingVote, setSendingVote] = useState(false);
  const [error, setError] = useState("");
  const canVote = Number(obtenerSesion()?.usuario?.rol) === 3;

  useEffect(() => {
    let active = true;
    api
      .profesionales()
      .then((rows) => { if (active) setProfessionals(rows); })
      .catch((cause) => {
        if (!active) return;
        setError(cause.message);
        mostrarAviso({ tipo: "error", titulo: "No se pudieron cargar los profesionales", mensaje: cause.message });
      });
    return () => { active = false; };
  }, []);

  const filterOptions = [
    "Tipo",
    ...new Set(professionals.map((item) => item.profesion).filter(Boolean)),
  ];
  const visibleProfessionals =
    selectedType === "Tipo"
      ? professionals
      : professionals.filter(({ profesion }) => profesion === selectedType);
  const { page, totalPages, pageItems, setPage, resetPage } = usePaginacion(visibleProfessionals);

  function openCreateModal() {
    setModal({ isOpen: true, mode: "create", professional: null });
  }

  function editProfessional(professional) {
    setModal({ isOpen: true, mode: "edit", professional });
  }

  function closeProfessionalModal() {
    setModal((current) => ({ ...current, isOpen: false }));
  }

  async function saveProfessional(form) {
    const body = {
      nombre: form.firstName,
      apellido: form.lastName,
      correo: form.email || null,
      telefono: form.phone || null,
      profesion: form.specialty,
    };
    if (modal.mode === "edit") {
      const saved = await api.actualizarProfesional(modal.professional.id, body);
      setProfessionals((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      mostrarAviso({ tipo: "exito", titulo: "Profesional actualizado", mensaje: `Se actualizó la información de ${form.name}.` });
    } else {
      const saved = await api.crearProfesional(body);
      setProfessionals((current) => [...current, saved]);
      mostrarAviso({ tipo: "exito", titulo: "Profesional agregado", mensaje: `Se agregó a ${form.name} a la lista.` });
    }
    closeProfessionalModal();
  }

  async function removeProfessional(professional) {
    try {
      await api.eliminarProfesional(professional.id);
      setProfessionals((current) => current.filter(({ id }) => id !== professional.id));
      mostrarAviso({ tipo: "exito", titulo: "Profesional eliminado", mensaje: `${professional.nombre} ${professional.apellido} fue eliminado de la lista.` });
      setPendingDelete(null);
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo eliminar al profesional", mensaje: cause.message });
    }
  }

  async function submitVote(event) {
    event.preventDefault();
    if (!pendingVote || !selectedRating || sendingVote) return;
    setSendingVote(true);
    try {
      const saved = await api.valorarProfesional(pendingVote.id, selectedRating);
      setProfessionals((current) => current.map((item) => item.id === saved.id ? saved : item));
      setPendingVote(null);
      setSelectedRating(0);
      mostrarAviso({ tipo: "exito", titulo: "Valoración guardada", mensaje: `Valoraste a ${saved.nombre} ${saved.apellido} con ${selectedRating} estrellas.` });
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo guardar la valoración", mensaje: cause.message });
    } finally {
      setSendingVote(false);
    }
  }

  return (
    <main id="profesionales">
      <section className="profesionales__top" aria-label="Encabezado y filtros de profesionales">
        <div className="profesionales__intro">
          <h1>Profesionales</h1>
          <p>Gestiona la información de todos los profesionales</p>
        </div>

        <div className="profesionales__toolbar">
          <SelectDesplegable
            label="Tipo de profesional"
            placeholder="Tipo"
            value={selectedType}
            options={filterOptions}
            onChange={(value) => { setSelectedType(value); resetPage(); }}
            icon={peopleIcon}
            className="profesionales__filter"
            triggerClassName="profesionales__filter-trigger"
            iconClassName="profesionales__filter-icon"
            chevronClassName="profesionales__filter-arrow"
            optionsClassName="profesionales__filter-options"
          />

          <Boton
            className="profesionales__new"
            onClick={openCreateModal}
            icon={plusIcon}
            text="Nuevo profesional"
          />
        </div>
      </section>

      <section className="profesionales__table-card" aria-label="Lista de profesionales">
        <div className="profesionales__table-scroll">
          <table className="profesionales__table">
            <colgroup>
              <col className="profesionales__column profesionales__column--profesionales" />
              <col className="profesionales__column profesionales__column--email" />
              <col className="profesionales__column profesionales__column--phone" />
              <col className="profesionales__column profesionales__column--rating" />
              <col className="profesionales__column profesionales__column--actions" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Profesional</th>
                <th scope="col">Email</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Rating</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((professional) => (
                <tr key={professional.id}>
                  <th scope="row" data-label="Profesional">
                    <div className="profesionales__identity">
                      <span className={`profesionales__avatar ${avatarClass(professional.nombre, professional.apellido)}`} aria-hidden="true">
                        {professional.nombre?.[0]}
                        {professional.apellido?.[0]}
                      </span>
                      <span>
                        <strong>
                          {professional.nombre} {professional.apellido}
                        </strong>
                        <small>{professional.profesion}</small>
                      </span>
                    </div>
                  </th>
                  <td data-label="Contacto">
                    <span className="profesionales__contact">
                      <img src={envelopeIcon} alt="" />
                      <span title={professional.correo}>{professional.correo}</span>
                    </span>
                  </td>
                  <td data-label="Teléfono">
                    <span className="profesionales__contact">
                      <img src={phoneIcon} alt="" />
                      <span title={professional.telefono}>{professional.telefono}</span>
                    </span>
                  </td>
                  <td data-label="Rating">
                    {(() => {
                      const rating = Number(professional.ratingPromedio) || 0;
                      const reviewCount = Number(professional.cantidadResenas) || 0;
                      return (
                        <div className="profesionales__rating">
                          <span
                            className="profesionales__rating-stars"
                            role="img"
                            aria-label={`${rating.toFixed(1)} de 5 estrellas`}
                            style={{ "--rating-percent": `${rating * 20}%` }}
                          >
                            ★★★★★
                          </span>
                          <strong>{rating.toFixed(1)}</strong>
                          <small>({reviewCount}) votos</small>
                        </div>
                      );
                    })()}
                  </td>
                  <td data-label="Acciones">
                    <div className="profesionales__actions">
                      {canVote && <button
                        className="profesionales__rate"
                        type="button"
                        aria-label={professional.miVoto != null
                          ? `Ya valoraste a ${professional.nombre} ${professional.apellido} con ${professional.miVoto} estrellas`
                          : `Valorar a ${professional.nombre} ${professional.apellido}`}
                        disabled={professional.miVoto != null}
                        onClick={() => { setPendingVote(professional); setSelectedRating(0); }}
                      >
                        <img src={starIcon} alt="" />
                        <span>{professional.miVoto != null ? "Votado" : "Valorar"}</span>
                      </button>}
                      <button
                        className="profesionales__action profesionales__action--edit"
                        type="button"
                        aria-label={`Editar profesional: ${professional.nombre} ${professional.apellido}`}
                        onClick={() => editProfessional(professional)}
                      >
                        <img src={penIcon} alt="" />
                      </button>
                      <button
                        className="profesionales__action profesionales__action--delete"
                        type="button"
                        aria-label={`Eliminar profesional: ${professional.nombre} ${professional.apellido}`}
                        onClick={() => setPendingDelete(professional)}
                      >
                        <img src={trashCanIcon} alt="" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visibleProfessionals.length === 0 && (
          <p className="profesionales__empty">No hay profesionales para este tipo.</p>
        )}
        <Paginacion page={page} totalPages={totalPages} total={visibleProfessionals.length} onPageChange={setPage} />
      </section>

      {error && (
        <p className="profesionales__feedback" role="alert">
          {error}
        </p>
      )}

      <ConfirmarEliminacionModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => removeProfessional(pendingDelete)}
        title="¿Eliminar este profesional? Sus reportes quedarán sin profesional asignado."
      />

      {pendingVote && (
        <GestionModal
          isOpen
          onClose={() => { if (!sendingVote) setPendingVote(null); }}
          title={`Valorar a ${pendingVote.nombre} ${pendingVote.apellido}`}
          subtitle="Cada agente puede votar una sola vez por profesional."
        >
          <form onSubmit={submitVote}>
            <fieldset className="profesionales__vote-options" disabled={sendingVote}>
              <legend>Elegí de 1 a 5 estrellas</legend>
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className={selectedRating === value ? "is-selected" : ""}>
                  <input type="radio" name="puntuacion" value={value} checked={selectedRating === value} onChange={() => setSelectedRating(value)} />
                  <span aria-hidden="true">★</span>{value}
                </label>
              ))}
            </fieldset>
            <AccionesModal onClose={() => setPendingVote(null)} submitText="Enviar valoración" disabled={!selectedRating || sendingVote} />
          </form>
        </GestionModal>
      )}

      {modal.isOpen && (
        <ProfesionalModal
          isOpen={modal.isOpen}
          mode={modal.mode}
          professional={
            modal.professional && {
              ...modal.professional,
              name: `${modal.professional.nombre} ${modal.professional.apellido}`,
              email: modal.professional.correo,
              phone: modal.professional.telefono,
              specialty: modal.professional.profesion,
            }
          }
          onClose={closeProfessionalModal}
          onSubmit={saveProfessional}
        />
      )}
    </main>
  );
}
