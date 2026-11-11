import { useEffect, useMemo, useState } from "react";
import {
  envelopeIcon,
  peopleIcon,
  phoneIcon,
  penIcon,
  plusIcon,
  starIcon,
  trashCanIcon,
} from "../../assets/icons";
import { DropdownSelect, ProfessionalModal, ConfirmDeleteModal, EntityActions, Button } from "../../components";
import "./Professional.css";

import { api } from "../../services/api.js";

const filterOptions = ["Tipo", "Plomero", "Electricista", "Gasista"];

function Rating({ rating, reviews }) {
  return (
    <div className="professional__rating" aria-label={`${rating} de 5 estrellas, ${reviews} reseñas`}>
      <div className="professional__rating-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="professional__rating-star">★</span>
        ))}
      </div>
      <strong>{rating}</strong>
      <small>({reviews}) Reseñas</small>
    </div>
  );
}

export default function Professional() {
  const [professionals, setProfessionals] = useState([]);
  const [selectedType, setSelectedType] = useState("Tipo");
  const [feedback, setFeedback] = useState("");
  const [modal, setModal] = useState({ isOpen: false, mode: "create", professional: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadProfessionals() {
      setLoading(true);
      setLoadError("");
      try {
        const rows = await api.professionals();
        if (mounted) setProfessionals(rows.map((row) => api.toProfessional(row)));
      } catch (error) {
        if (mounted) setLoadError(error.message || "No se pudieron cargar los inquilinos.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProfessionals();
    return () => { mounted = false; };
  }, []);

  
  const visibleProfessionals = useMemo(() => (
    selectedType === "Tipo" ? professionals : professionals.filter(({ profesion }) => profesion === selectedType)
  ), [professionals, selectedType]);

  function openCreateModal() {
    setModal({ isOpen: true, mode: "create", professional: null });
  }

  function editProfessional(professional) {
    setModal({ isOpen: true, mode: "edit", professional });
  }

  function closeProfessionalModal() {
    setModal((current) => ({ ...current, isOpen: false }));
  }

  function saveProfessional(form) {
    if (modal.mode === "edit") {
      setProfessionals((current) => current.map((professional) => (
        professional.id === modal.professional.id
          ? {
            ...professional,
            name: form.name,
            profesion: form.profesion,
            email: form.email,
            phone: form.phone,
          }
          : professional
      )));
      setFeedback(`Se actualizó la información de ${form.name}.`);
    } else {
      setProfessionals((current) => [
        ...current,
        {
          id: Date.now(),
          name: form.name,
          profesion: form.profesion,
          email: form.email,
          phone: form.phone,
          rating: "0.0",
          reviews: 0,
        },
      ]);
      setFeedback(`Se agregó a ${form.name} a la lista.`);
    }

    closeProfessionalModal();
  }

  function rateProfessional(professional) {
    setFeedback(`Valorar a ${professional.name}.`);
  }

  function removeProfessional(professional) {
    setProfessionals((current) => current.filter(({ id }) => id !== professional.id));
    setFeedback(`${professional.name} fue eliminado de la lista.`);
    setPendingDelete(null);
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
            onChange={setSelectedType}
            icon={peopleIcon}
            className="professional__filter"
            triggerClassName="professional__filter-trigger"
            iconClassName="professional__filter-icon"
            chevronClassName="professional__filter-arrow"
            optionsClassName="professional__filter-options"
          />

          <Button className="professional__new" onClick={openCreateModal} icon={plusIcon} text="Nuevo profesional" />
        </div>
      </section>

      <section className="professional__table-card" aria-label="Lista de profesionales">
        <div className="professional__table-scroll">
          <table className="professional__table">
            <colgroup>
              <col className="professional__column professional__column--professional" />
              <col className="professional__column professional__column--email" />
              <col className="professional__column professional__column--phone" />
              <col className="professional__column professional__column--rating" />
              <col className="professional__column professional__column--actions" />
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
              {visibleProfessionals.map((professional) => (
                <tr key={professional.id}>
                  <th scope="row" data-label="Profesional">
                    <div className="professional__identity">
                      <span className="professional__avatar" aria-hidden="true">
                        {professional.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </span>
                      <span>
                        <strong>{professional.name}</strong>
                        <small>{professional.profesion}</small>
                      </span>
                    </div>
                  </th>
                  <td data-label="Contacto">
                    <span className="professional__contact">
                      <img src={envelopeIcon} alt="" />
                      <span>{professional.email}</span>
                    </span>
                  </td>
                  <td data-label="Teléfono">
                    <span className="professional__contact">
                      <img src={phoneIcon} alt="" />
                      <span>{professional.phone}</span>
                    </span>
                  </td>
                  <td data-label="Rating"><Rating rating={professional.rating} reviews={professional.reviews} /></td>
                  <td data-label="Acciones">
                    <div className="professional__actions">
                      <Button
                        className="professional__rate"
                        onClick={() => rateProfessional(professional)}
                        icon={starIcon}
                        text="Valorar"
                      />
                      <EntityActions
                        entity="profesional"
                        name={professional.name}
                        onEdit={() => editProfessional(professional)}
                        onDelete={() => setPendingDelete(professional)}
                      />
                      <button className="professional__mobile-action professional__mobile-action--edit" type="button" aria-label={`Editar profesional: ${professional.name}`} onClick={() => editProfessional(professional)}><img src={penIcon} alt="" /></button>
                      <button className="professional__mobile-action professional__mobile-action--delete" type="button" aria-label={`Eliminar profesional: ${professional.name}`} onClick={() => setPendingDelete(professional)}><img src={trashCanIcon} alt="" /></button>
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
      </section>

      <p className="professional__feedback" aria-live="polite">{feedback}</p>

      <ConfirmDeleteModal isOpen={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} onConfirm={() => removeProfessional(pendingDelete)} title="¿Seguro que desea eliminar este profesional?" />

      {modal.isOpen && (
        <ProfessionalModal
          isOpen={modal.isOpen}
          mode={modal.mode}
          professional={modal.professional}
          onClose={closeProfessionalModal}
          onSubmit={saveProfessional}
        />
      )}
    </main>
  );
}
