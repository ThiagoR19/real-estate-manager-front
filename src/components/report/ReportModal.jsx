import { useEffect, useRef, useState } from "react";
import { houseIcon, xIcon } from "../../assets/icons";
import DropdownSelect from "../select/DropdownSelect";
import "./ReportModal.css";

const typeOptions = ["Tipo", "Plomería", "Electricidad", "Gas", "Pintura", "Carpintería", "Otro"];

function getInitialForm() {
  return {
    name: "",
    type: typeOptions[1],
    description: "",
  };
}

function Field({ children, label }) {
  return (
    <label className="report-modal__field">
      <span className="report-modal__label">{label}</span>
      {children}
    </label>
  );
}

export default function ReportModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(getInitialForm);
  const [photos, setPhotos] = useState([]);
  const photosRef = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function closeWithEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => () => {
    photosRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
  }, []);

  if (!isOpen) {
    return null;
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function addPhotos(event) {
    const selectedPhotos = Array.from(event.target.files ?? []).map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));

    if (selectedPhotos.length) {
      const nextPhotos = [...photosRef.current, ...selectedPhotos];
      photosRef.current = nextPhotos;
      setPhotos(nextPhotos);
    }

    event.target.value = "";
  }

  function removePhoto(photoId) {
    const photo = photosRef.current.find(({ id }) => id === photoId);
    if (photo) {
      URL.revokeObjectURL(photo.url);
    }

    const nextPhotos = photosRef.current.filter(({ id }) => id !== photoId);
    photosRef.current = nextPhotos;
    setPhotos(nextPhotos);
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      photos: photosRef.current.map(({ file }) => file),
    });
  }

  return (
    <div
      className="report-modal__overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="report-modal__header">
          <h2 id="report-modal-title">Crear reporte</h2>
          <p>Completa la información para registrar un nuevo reporte</p>
        </header>

        <form onSubmit={handleSubmit}>
          <section className="report-modal__card" aria-labelledby="report-modal-main-data">
            <header className="report-modal__section-header">
              <span className="report-modal__step" aria-hidden="true">1</span>
              <h3 id="report-modal-main-data">Datos principales</h3>
            </header>

            <div className="report-modal__fields">
              <Field label="Nombre">
                <input
                  className="report-modal__input"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Rotura de cortinas"
                  autoComplete="off"
                  autoFocus
                  required
                />
              </Field>

              <Field label="Tipo">
                <DropdownSelect
                  label="Tipo de reporte"
                  value={form.type}
                  options={typeOptions}
                  onChange={(type) => setForm((current) => ({ ...current, type }))}
                  icon={houseIcon}
                  className="report-modal__select"
                  triggerClassName="report-modal__select-trigger"
                  iconClassName="report-modal__select-icon"
                  valueClassName="report-modal__select-value"
                  chevronClassName="report-modal__select-arrow"
                  optionsClassName="report-modal__select-options"
                />
              </Field>

              <Field label="Descripción">
                <span className="report-modal__textarea-wrap">
                  <textarea
                    className="report-modal__textarea"
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    placeholder="Ingrese una descripción del reporte..."
                    maxLength={500}
                    required
                  />
                  <span className="report-modal__counter">{form.description.length}/500</span>
                </span>
              </Field>
            </div>
          </section>

          <section className="report-modal__card report-modal__photos-card" aria-labelledby="report-modal-photos">
            <header className="report-modal__section-header">
              <span className="report-modal__step" aria-hidden="true">2</span>
              <h3 id="report-modal-photos">Fotos del reporte</h3>
            </header>

            <div className="report-modal__photos-scroll">
              <div className="report-modal__photos">
                {photos.map((photo, index) => (
                  <figure className="report-modal__photo" key={photo.id}>
                    <img src={photo.url} alt={`Foto ${index + 1} del reporte`} />
                    <button
                      type="button"
                      aria-label={`Quitar foto ${index + 1}`}
                      onClick={() => removePhoto(photo.id)}
                    >
                      <img src={xIcon} alt="" aria-hidden="true" />
                    </button>
                  </figure>
                ))}

                <label className="report-modal__add-photos">
                  <span className="report-modal__add-icon" aria-hidden="true">+</span>
                  <span>Agregar fotos</span>
                  <input type="file" accept="image/*" multiple onChange={addPhotos} />
                </label>
              </div>
            </div>
          </section>

          <footer className="report-modal__actions">
            <p>Nota: una vez creado el reporte no podrá editarlo ni eliminarlo</p>
            <div>
              <button className="report-modal__cancel" type="button" onClick={onClose}>
                Cancelar
              </button>
              <button className="report-modal__submit" type="submit">
                Crear reporte
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
