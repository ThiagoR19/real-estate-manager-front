import { useMemo, useState } from "react";
import {
  envelopeIcon,
  peopleIcon,
  penIcon,
  phoneIcon,
  plusIcon,
  starIcon,
  trashCanIcon as trashIcon,
} from "../../assets/icons";
import DropdownSelect from "../../components/select/DropdownSelect";
import ProfessionalModal from "../../components/professional/ProfessionalModal";
import "./Professional.css";
import Button from "../../components/button/Button";

const initialProfessionals = Array.from({ length: 9 }, (_, index) => ({
  id: index + 1,
  name: "Carlos Méndez",
  specialty: "Plomero",
  email: "lucia.m@gmail.com",
  phone: "11 2345-6789",
  rating: "4.8",
  reviews: 27,
}));

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
  const [professionals, setProfessionals] = useState(initialProfessionals);
  const [selectedType, setSelectedType] = useState("Tipo");
  const [feedback, setFeedback] = useState("");
  const [modal, setModal] = useState({ isOpen: false, mode: "create", professional: null });

  const visibleProfessionals = useMemo(() => (
    selectedType === "Tipo" ? professionals : professionals.filter(({ specialty }) => specialty === selectedType)
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
            specialty: form.specialty,
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
          specialty: form.specialty,
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
  }

  return (
    <main id="professional">
      <section className="professional__top" aria-label="Encabezado y filtros de profesionales">
        <div className="professional__intro">
          <h1>Profesionales</h1>
          <p>Gestiona la información de todos los inquilinos, sus contratos, pagos y estados.</p>
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
                  <th scope="row">
                    <div className="professional__identity">
                      <span className="professional__avatar" aria-hidden="true">
                        {professional.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </span>
                      <span>
                        <strong>{professional.name}</strong>
                        <small>{professional.specialty}</small>
                      </span>
                    </div>
                  </th>
                  <td>
                    <span className="professional__contact">
                      <img src={envelopeIcon} alt="" />
                      <span>{professional.email}</span>
                    </span>
                  </td>
                  <td>
                    <span className="professional__contact">
                      <img src={phoneIcon} alt="" />
                      <span>{professional.phone}</span>
                    </span>
                  </td>
                  <td><Rating rating={professional.rating} reviews={professional.reviews} /></td>
                  <td>
                    <div className="professional__actions">
                      <Button
                        className="professional__rate"
                        onClick={() => rateProfessional(professional)}
                        icon={starIcon}
                        text="Valorar"
                      />
                      <button
                        className="professional__action professional__action--edit"
                        type="button"
                        aria-label={`Editar a ${professional.name}`}
                        onClick={() => editProfessional(professional)}
                      >
                        <img src={penIcon} alt="" />
                      </button>
                      <button
                        className="professional__action professional__action--delete"
                        type="button"
                        aria-label={`Eliminar a ${professional.name}`}
                        onClick={() => removeProfessional(professional)}
                      >
                        <img src={trashIcon} alt="" />
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
      </section>

      <p className="professional__feedback" aria-live="polite">{feedback}</p>

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
