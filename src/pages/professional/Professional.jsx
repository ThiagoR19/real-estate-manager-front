import { useEffect, useState } from "react";
import {
  envelopeIcon,
  peopleIcon,
  phoneIcon,
  penIcon,
  plusIcon,
  trashCanIcon,
} from "../../assets/icons/index.js";
import {
  DropdownSelect,
  ConfirmDeleteModal,
  EntityActions,
  Button,
  Pagination,
  usePagination,
} from "../../components/index.js";
import ProfessionalModal from "./ProfessionalModal";
import "./Professional.css";

import { api } from "../../services/api.js";

export default function Professional() {
  const [professionals, setProfessionals] = useState([]);
  const [selectedType, setSelectedType] = useState("Tipo");
  const [feedback, setFeedback] = useState("");
  const [modal, setModal] = useState({ isOpen: false, mode: "create", professional: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .professionals()
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
  const { page, totalPages, pageItems, setPage, resetPage } = usePagination(visibleProfessionals);

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
      const saved = await api.updateProfessional(modal.professional.id, body);
      setProfessionals((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      setFeedback(`Se actualizó la información de ${form.name}.`);
    } else {
      const saved = await api.createProfessional(body);
      setProfessionals((current) => [...current, saved]);
      setFeedback(`Se agregó a ${form.name} a la lista.`);
    }
    closeProfessionalModal();
  }

  async function removeProfessional(professional) {
    try {
      await api.deleteProfessional(professional.id);
      setProfessionals((current) => current.filter(({ id }) => id !== professional.id));
      setFeedback(`${professional.nombre} ${professional.apellido} fue eliminado de la lista.`);
      setPendingDelete(null);
    } catch (cause) {
      setError(cause.message);
    }
  }

  return (
    <main id="professional">
      <section className="professional__top" aria-label="Encabezado y filtros de profesionales">
        <div className="professional__intro">
          <h1>Profesionales</h1>
          <p>Gestiona la información de todos los profesionales</p>
        </div>

        <div className="professional__toolbar">
          <DropdownSelect
            label="Tipo de profesional"
            placeholder="Tipo"
            value={selectedType}
            options={filterOptions}
            onChange={(value) => { setSelectedType(value); resetPage(); }}
            icon={peopleIcon}
            className="professional__filter"
            triggerClassName="professional__filter-trigger"
            iconClassName="professional__filter-icon"
            chevronClassName="professional__filter-arrow"
            optionsClassName="professional__filter-options"
          />

          <Button
            className="professional__new"
            onClick={openCreateModal}
            icon={plusIcon}
            text="Nuevo profesional"
          />
        </div>
      </section>

      <section className="professional__table-card" aria-label="Lista de profesionales">
        <div className="professional__table-scroll">
          <table className="professional__table">
            <colgroup>
              <col className="professional__column professional__column--professional" />
              <col className="professional__column professional__column--email" />
              <col className="professional__column professional__column--phone" />
              <col className="professional__column professional__column--actions" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Profesional</th>
                <th scope="col">Email</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((professional) => (
                <tr key={professional.id}>
                  <th scope="row" data-label="Profesional">
                    <div className="professional__identity">
                      <span className="professional__avatar" aria-hidden="true">
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
                    <span className="professional__contact">
                      <img src={envelopeIcon} alt="" />
                      <span>{professional.correo}</span>
                    </span>
                  </td>
                  <td data-label="Teléfono">
                    <span className="professional__contact">
                      <img src={phoneIcon} alt="" />
                      <span>{professional.telefono}</span>
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <div className="professional__actions">
                      <EntityActions
                        entity="profesional"
                        name={`${professional.nombre} ${professional.apellido}`}
                        onEdit={() => editProfessional(professional)}
                        onDelete={() => setPendingDelete(professional)}
                      />
                      <button
                        className="professional__mobile-action professional__mobile-action--edit"
                        type="button"
                        aria-label={`Editar profesional: ${professional.nombre} ${professional.apellido}`}
                        onClick={() => editProfessional(professional)}
                      >
                        <img src={penIcon} alt="" />
                      </button>
                      <button
                        className="professional__mobile-action professional__mobile-action--delete"
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
          <p className="professional__empty">No hay profesionales para este tipo.</p>
        )}
        <Pagination page={page} totalPages={totalPages} total={visibleProfessionals.length} onPageChange={setPage} />
      </section>

      <p className="professional__feedback" aria-live="polite">
        {feedback}
      </p>
      {error && (
        <p className="professional__feedback" role="alert">
          {error}
        </p>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => removeProfessional(pendingDelete)}
        title="¿Seguro que desea eliminar este profesional?"
      />

      {modal.isOpen && (
        <ProfessionalModal
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
