import { useState } from "react";
import { calendarIcon, percentIcon } from "../../assets/icons";
import { GestionModal, AccionesModal, CampoModal, EntradaModal, ModalSelect } from "../../components";
import "./AumentoModal.css";

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function AumentoModal({ year, error, onClose, onSubmit }) {
  const [form, setForm] = useState({ year, month: "Mayo", percentage: "" });
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: Math.max(1, currentYear + 2 - 2024) },
    (_, index) => String(2024 + index),
  );
  if (!years.includes(year)) years.push(year);
  years.sort();

  function actualizarCampo(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <GestionModal
      onClose={onClose}
      title="Ingrese porcentaje de aumento"
      subtitle="Actualiza el monto del índice en el mes y año que desee"
      variant="compact"
    >
      <form
        className="aumento-modal"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
      >
        <div className="gestion-modal__card">
          <div className="gestion-modal__summary aumento-modal__summary">
            <strong className="aumento-modal__section-title">
              <span>1</span>Datos
            </strong>
          </div>
          <div className="gestion-modal__fields aumento-modal__fields">
            <CampoModal label="Año">
              <ModalSelect
                label="Año"
                icon={calendarIcon}
                options={years}
                value={form.year}
                onChange={(value) => actualizarCampo("year", value)}
              />
            </CampoModal>
            <CampoModal label="Mes">
              <ModalSelect
                label="Mes"
                icon={calendarIcon}
                options={monthNames}
                value={form.month}
                onChange={(value) => actualizarCampo("month", value)}
              />
            </CampoModal>
            <CampoModal label="Porcentaje">
              <EntradaModal
                icon={percentIcon}
                name="percentage"
                type="number"
                min="0"
                step="0.01"
                placeholder="Porcentaje de aumento"
                value={form.percentage}
                onChange={(event) => actualizarCampo("percentage", event.target.value)}
                required
              />
            </CampoModal>
          </div>
          {error && (
            <p className="aumento-modal__error" role="alert">
              {error}
            </p>
          )}
        </div>
        <AccionesModal onClose={onClose} />
      </form>
    </GestionModal>
  );
}
