import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { houseIcon, xIcon } from "../../assets/icons";
import { SelectDesplegable, Boton } from "../../components";
import useClosingTransition from "../../hooks/useClosingTransition.js";
import "./ReporteModal.css";

const typeOptions = ["Tipo", "Plomería", "Electricidad", "Gas", "Pintura", "Carpintería", "Otro"];

function getInitialForm() {
  return {
    name: "",
    type: typeOptions[1],
    description: "",
  };
}

function Campo({ children, label }) {
  return (
    <label className="reporte-modal__field">
      <span className="reporte-modal__label">{label}</span>
      {children}
    </label>
  );
}

export default function ReporteModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(getInitialForm);
  const [photos, setPhotos] = useState([]);
  const photosRef = useRef([]);
  const { isClosing, close } = useClosingTransition(onClose);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function closeWithEscape(event) {
      if (event.key === "Escape") {
        close();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen, close]);

  useEffect(
    () => () => {
      photosRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
    },
    [],
  );

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

  return createPortal(
    <div
      className={`reporte-modal__overlay${isClosing ? " is-closing" : ""}`}
      aria-hidden={isClosing}
      inert={isClosing}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <section
        className={`reporte-modal${isClosing ? " is-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reporte-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="reporte-modal__header">
          <h2 id="reporte-modal-title">Crear reporte</h2>
          <p>Completa la información para registrar un nuevo reporte</p>
        </header>

        <form onSubmit={handleSubmit}>
          <section className="reporte-modal__card" aria-labelledby="reporte-modal-main-data">
            <header className="reporte-modal__section-header">
              <span className="reporte-modal__step" aria-hidden="true">
                1
              </span>
              <h3 id="reporte-modal-main-data">Datos principales</h3>
            </header>

            <div className="reporte-modal__fields">
              <Campo label="Nombre">
                <input
                  className="reporte-modal__input"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Rotura de cortinas"
                  autoComplete="off"
                  autoFocus
                  required
                />
              </Campo>

              <Campo label="Tipo">
                <SelectDesplegable
                  label="Tipo de reporte"
                  value={form.type}
                  options={typeOptions}
                  onChange={(type) => setForm((current) => ({ ...current, type }))}
                  icon={houseIcon}
                  className="reporte-modal__select"
                  triggerClassName="reporte-modal__select-trigger"
                  iconClassName="reporte-modal__select-icon"
                  valueClassName="reporte-modal__select-value"
                  chevronClassName="reporte-modal__select-arrow"
                  optionsClassName="reporte-modal__select-options"
                />
              </Campo>

              <Campo label="Descripción">
                <span className="reporte-modal__textarea-wrap">
                  <textarea
                    className="reporte-modal__textarea"
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    placeholder="Ingrese una descripción del reporte..."
                    maxLength={500}
                    required
                  />
                  <span className="reporte-modal__counter">{form.description.length}/500</span>
                </span>
              </Campo>
            </div>
          </section>

          <section
            className="reporte-modal__card reporte-modal__photos-card"
            aria-labelledby="reporte-modal-photos"
          >
            <header className="reporte-modal__section-header">
              <span className="reporte-modal__step" aria-hidden="true">
                2
              </span>
              <h3 id="reporte-modal-photos">Fotos del reporte</h3>
            </header>

            <div className="reporte-modal__photos-scroll">
              <div className="reporte-modal__photos">
                {photos.map((photo, index) => (
                  <figure className="reporte-modal__photo" key={photo.id}>
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

                <label className="reporte-modal__add-photos">
                  <span className="reporte-modal__add-icon" aria-hidden="true">
                    +
                  </span>
                  <span>Agregar fotos</span>
                  <input type="file" accept="image/*" multiple onChange={addPhotos} />
                </label>
              </div>
            </div>
          </section>

          <footer className="reporte-modal__actions">
            <p>Nota: una vez creado el reporte no podrá editarlo ni eliminarlo</p>
            <div>
              <button className="reporte-modal__cancel" type="button" onClick={close}>
                Cancelar
              </button>
              <Boton className="reporte-modal__submit" type="submit" text="Crear reporte" />
            </div>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
