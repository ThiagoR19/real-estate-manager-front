import { useMemo, useState } from "react";
import {
  angleDownIcon,
  envelopeIcon,
  peopleIcon,
  penIcon,
  phoneIcon,
  plusIcon,
  trashCanIcon as trashIcon,
} from "../../assets/icons";
import "./Professional.css";

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

  const visibleProfessionals = useMemo(() => (
    selectedType === "Tipo"
      ? professionals
      : professionals.filter(({ specialty }) => specialty === selectedType)
  ), [professionals, selectedType]);

  function addProfessional() {
    const newProfessional = {
      id: Date.now(),
      name: "Nuevo profesional",
      specialty: "Plomero",
      email: "nuevo@gmail.com",
      phone: "11 0000-0000",
      rating: "0.0",
      reviews: 0,
    };

    setProfessionals((current) => [...current, newProfessional]);
    setFeedback("Se agregó un nuevo profesional.");
  }

  function editProfessional(professional) {
    setFeedback(`Editar a ${professional.name}.`);
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
      <div className="professional__toolbar">
        <details className="professional__filter">
          <summary aria-label="Filtrar profesionales por tipo">
            <span className="professional__filter-icon">
              <img src={peopleIcon} alt="" />
            </span>
            <span>{selectedType}</span>
            <img className="professional__filter-arrow" src={angleDownIcon} alt="" />
          </summary>
          <div className="professional__filter-options" role="listbox" aria-label="Tipo de profesional">
            {filterOptions.map((option) => (
              <button
                key={option}
                className={selectedType === option ? "is-selected" : ""}
                type="button"
                role="option"
                aria-selected={selectedType === option}
                onClick={() => setSelectedType(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </details>

        <button className="professional__new" type="button" onClick={addProfessional}>
          <img src={plusIcon} alt="" />
          <span>Nuevo profesional</span>
        </button>
      </div>

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
                      <span className="professional__avatar" aria-hidden="true">LM</span>
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
                      <button
                        className="professional__rate"
                        type="button"
                        onClick={() => rateProfessional(professional)}
                      >
                        <span aria-hidden="true">★</span>
                        <span>Valorar</span>
                      </button>
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
    </main>
  );
}
