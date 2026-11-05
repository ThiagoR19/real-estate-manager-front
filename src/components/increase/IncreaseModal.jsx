import { useState } from "react";
import { calendarIcon, percentIcon } from "../../assets/icons";
import { ManagementModal, ModalActions, ModalField, ModalInput, ModalSelect } from "../index";
import "./IncreaseModal.css";

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function IncreaseModal({ year, onClose, onSubmit }) {
  const [form, setForm] = useState({ year, month: "Mayo", percentage: "" });
  const currentYear = new Date().getFullYear();
  const years = [...new Set([year, ...Array.from({ length: 7 }, (_, index) => String(currentYear - 3 + index))])].sort();

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <ManagementModal onClose={onClose} title="Ingrese porcentaje de aumento" subtitle="Actualiza el monto del índice en el mes y año que desee" variant="compact">
      <form className="increase-modal" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <div className="management-modal__card">
          <div className="management-modal__summary increase-modal__summary">
            <strong className="increase-modal__section-title"><span>1</span>Datos</strong>
          </div>
          <div className="management-modal__fields increase-modal__fields">
            <ModalField label="Año"><ModalSelect label="Año" icon={calendarIcon} options={years} value={form.year} onChange={(value) => update("year", value)} /></ModalField>
            <ModalField label="Mes"><ModalSelect label="Mes" icon={calendarIcon} options={monthNames} value={form.month} onChange={(value) => update("month", value)} /></ModalField>
            <ModalField label="Porcentaje"><ModalInput icon={percentIcon} name="percentage" type="number" min="0" step="0.01" placeholder="Porcentaje de aumento" value={form.percentage} onChange={(event) => update("percentage", event.target.value)} required /></ModalField>
          </div>
        </div>
        <ModalActions onClose={onClose} />
      </form>
    </ManagementModal>
  );
}
