import { useRef, useState } from "react";
import cameraIcon from "../../assets/icons/camera-solid-full.svg";
import checkIcon from "../../assets/icons/check-solid-full.svg";
import envelopeIcon from "../../assets/icons/envelope-regular-full.svg";
import imageIcon from "../../assets/icons/image-regular-full.svg";
import phoneIcon from "../../assets/icons/phone-solid-full.svg";
import plusIcon from "../../assets/icons/plus-solid-full.svg";
import userIcon from "../../assets/icons/user-solid-full.svg";
import "./Agency.css";

const initialAgency = {
  name: "AGI Propiedades",
  phone: "1231231298",
};

function SectionHeading({ icon, title, description }) {
  return (
    <div className="agency__section-heading">
      <span className="agency__section-heading-icon" aria-hidden="true">
        <img src={icon} alt="" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function UploadField({ label, name, value, onChange, wide = false }) {
  const inputRef = useRef(null);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    onChange({
      name,
      value: URL.createObjectURL(file),
      fileName: file.name,
    });
  }

  return (
    <div className={`agency__upload-field${wide ? " agency__upload-field--wide" : ""}`}>
      <label htmlFor={`agency-upload-${name}`}>{label}</label>
      <button
        className={`agency__upload${value ? " agency__upload--filled" : ""}`}
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={`${value ? "Cambiar" : "Subir"} imagen de ${label.toLowerCase()}`}
      >
        {value ? (
          <img className="agency__upload-preview" src={value} alt={`Vista previa de ${label.toLowerCase()}`} />
        ) : (
          <>
            <img className="agency__upload-plus" src={plusIcon} alt="" />
            <span>Subir imagen</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        id={`agency-upload-${name}`}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default function Agency() {
  const [agency, setAgency] = useState(initialAgency);
  const [images, setImages] = useState({ banner: "", logo: "", principal: "" });
  const [saved, setSaved] = useState(false);

  function updateAgency(event) {
    const { name, value } = event.target;
    setAgency((current) => ({ ...current, [name]: value }));
    setSaved(false);
  }

  function updateImage({ name, value }) {
    setImages((current) => ({ ...current, [name]: value }));
    setSaved(false);
  }

  function saveChanges(event) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <main id="agency">
      <div className="agency__layout">
        <aside className="agency__identity-card" aria-label="Resumen de la inmobiliaria">
          <div className="agency__identity-logo-wrap">
            <img className="agency__identity-logo" src="/logo.png" alt="Logo de AGI Propiedades" />
            <button className="agency__identity-camera" type="button" aria-label="Cambiar logo de la inmobiliaria">
              <img src={cameraIcon} alt="" />
            </button>
          </div>
          <h1>AGI Propiedades</h1>
          <p className="agency__identity-type">Inmobiliaria</p>
          <p className="agency__identity-email">
            <img src={envelopeIcon} alt="" />
            <span>agipropiedades@gmail.com</span>
          </p>
        </aside>

        <form className="agency__form-card" onSubmit={saveChanges}>
          <header className="agency__form-header">
            <h1>Mi inmobiliaria</h1>
            <p>Administra tu información personal, seguridad y preferencias de cuenta</p>
          </header>

          <section className="agency__form-section" aria-labelledby="agency-main-information">
            <SectionHeading
              icon={userIcon}
              title="Información principal"
              description="Mantené tu información actualizada. Estos datos se utilizan en la plataforma y en las comunicaciones del sistema"
            />
            <div className="agency__fields">
              <label className="agency__field">
                <span>Nombre inmobiliaria</span>
                <span className="agency__field-control">
                  <img src={userIcon} alt="" />
                  <input name="name" value={agency.name} onChange={updateAgency} aria-label="Nombre inmobiliaria" />
                </span>
              </label>
              <label className="agency__field">
                <span>Teléfono</span>
                <span className="agency__field-control">
                  <img src={phoneIcon} alt="" />
                  <input name="phone" value={agency.phone} onChange={updateAgency} aria-label="Teléfono" inputMode="tel" />
                </span>
              </label>
            </div>
          </section>

          <section className="agency__form-section agency__form-section--images" aria-labelledby="agency-images">
            <SectionHeading
              icon={imageIcon}
              title="Imágenes"
              description="Cambia tu periódicamente para mantener tu cuenta segura"
            />
            <div className="agency__uploads">
              <UploadField label="Banner" name="banner" value={images.banner} onChange={updateImage} wide />
              <UploadField label="Logo" name="logo" value={images.logo} onChange={updateImage} />
              <UploadField label="Principal" name="principal" value={images.principal} onChange={updateImage} />
            </div>
          </section>
        </form>
      </div>

      <button className="agency__save" type="button" onClick={saveChanges} aria-live="polite">
        <img src={checkIcon} alt="" />
        <span>{saved ? "Cambios guardados" : "Guardar cambios"}</span>
      </button>
    </main>
  );
}
