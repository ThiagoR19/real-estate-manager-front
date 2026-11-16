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
  Boton,
  Paginacion,
  usePaginacion,
} from "../../components/index.js";
import ProfesionalModal from "./ProfesionalModal";
import "./Profesionales.css";

import { api } from "../../services/api.js";

export default function Profesionales() {
  const [professionals, setProfessionals] = useState([]);
  const [selectedType, setSelectedType] = useState("Tipo");
  const [feedback, setFeedback] = useState("");
  const [modal, setModal] = useState({ isOpen: false, mode: "create", professional: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .profesionales()
      .then(setProfessionals)
      .catch((cause) => setError(cause.message));
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
      setFeedback(`Se actualizó la información de ${form.name}.`);
    } else {
      const saved = await api.crearProfesional(body);
      setProfessionals((current) => [...current, saved]);
      setFeedback(`Se agregó a ${form.name} a la lista.`);
    }
    closeProfessionalModal();
  }

  async function removeProfessional(professional) {
    try {
      await api.eliminarProfesional(professional.id);
      setProfessionals((current) => current.filter(({ id }) => id !== professional.id));
      setFeedback(`${professional.nombre} ${professional.apellido} fue eliminado de la lista.`);
      setPendingDelete(null);
    } catch (cause) {
      setError(cause.message);
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
                      <span className="profesionales__avatar" aria-hidden="true">
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
                      const roundedRating = Math.round(rating);

                      return (
                        <div className="profesionales__rating">
                          <span
                            className="profesionales__rating-stars"
                            role="img"
                            aria-label={`${rating.toFixed(1)} de 5 estrellas`}
                          >
                            {Array.from({ length: 5 }, (_, index) => (
                              <span
                                className={`profesionales__rating-star${index < roundedRating ? " is-active" : ""}`}
                                key={index}
                                aria-hidden="true"
                              >
                                ★
                              </span>
                            ))}
                          </span>
                          <strong>{rating.toFixed(1)}</strong>
                          <small>({reviewCount}) Reseñas</small>
                        </div>
                      );
                    })()}
                  </td>
                  <td data-label="Acciones">
                    <div className="profesionales__actions">
                      <button
                        className="profesionales__rate"
                        type="button"
                        aria-label={`Valorar a ${professional.nombre} ${professional.apellido}`}
                        onClick={() => setFeedback("La función para valorar profesionales todavía no está disponible.")}
                      >
                        <img src={starIcon} alt="" />
                        <span>Valorar</span>
                      </button>
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

      <p className="profesionales__feedback" aria-live="polite">
        {feedback}
      </p>
      {error && (
        <p className="profesionales__feedback" role="alert">
          {error}
        </p>
      )}

      <ConfirmarEliminacionModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => removeProfessional(pendingDelete)}
        title="¿Seguro que desea eliminar este profesional?"
      />

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
