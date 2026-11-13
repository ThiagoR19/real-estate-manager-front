import { useCallback, useEffect, useRef, useState } from "react";
import { cameraIcon, checkIcon, envelopeIcon, imageIcon, phoneIcon, plusIcon, userIcon, } from "../../assets/icons";
import brandLogo from "../../assets/logoAGI.png";
import { Boton, mostrarAviso } from "../../components";
import "./Inmobiliaria.css";
import { api } from "../../services/api";

const initialAgency = {   name: "", phone: "" };

function EncabezadoSeccion({ icon, title, description }) {
  return (
    <div className="inmobiliaria__section-heading">
      <span className="inmobiliaria__section-heading-icon" aria-hidden="true">
        <img src={icon} alt="" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function CampoCarga({ label, name, value, onChange, wide = false }) {
  const inputRef = useRef(null);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    onChange({
      name,
      value: URL.createObjectURL(file),
      fileName: file.name,
      file,
    });
  }

  return (
    <div className={`inmobiliaria__upload-field${wide ? " inmobiliaria__upload-field--wide" : ""}`}>
      <label htmlFor={`inmobiliaria-upload-${name}`}>{label}</label>
      <button
        className={`inmobiliaria__upload${value ? " inmobiliaria__upload--filled" : ""}`}
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={`${value ? "Cambiar" : "Subir"} imagen de ${label.toLowerCase()}`}
      >
        {value ? (
          <img
            className="inmobiliaria__upload-preview"
            src={value}
            alt={`Vista previa de ${label.toLowerCase()}`}
          />
        ) : (
          <>
            <img className="inmobiliaria__upload-plus" src={plusIcon} alt="" />
            <span>Subir imagen</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        id={`inmobiliaria-upload-${name}`}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default function Inmobiliaria() {
  const [agency, setAgency] = useState(initialAgency);
  const [images, setImages] = useState({ banner: "", logo: "", principal: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(() => {
      let activo = true;
      api.miInmobiliaria()
        .then((data) => {
          if (!activo) return;
          setAgency({ name: data.nombre || "", phone: data.telefono || "" });
          setImages((current) => ({ ...current, logo: data.urlLogo || "" }));
        })
        .catch((causa) => {
          if (!activo) return;
          mostrarAviso({ tipo: "error", titulo: "No se pudo cargar la inmobiliaria", mensaje: causa.message });
        })
        .finally(() => activo && setLoading(false));
      return () => {
        activo = false;
      };
    }, []);

    useEffect(() => cargar(), [cargar]);

  function updateAgency(event) {
    const { name, value } = event.target;
    setAgency((current) => ({ ...current, [name]: value }));
    setSaved(false);
  }

  function updateImage({ name, value, file }) {
    setImages((current) => ({ ...current, [name]: value }));
    if (name === "logo") setLogoFile(file);
    setSaved(false);
  }

  async function saveChanges(event) {
    event.preventDefault();
    try {
      const updated = await api.actualizarMiInmobiliaria({ nombre: agency.name.trim(), telefono: agency.phone.trim() }, logoFile);
      setAgency({ name: updated.nombre || "", phone: updated.telefono || "" });
      setImages((current) => ({ ...current, logo: updated.urlLogo || "" }));
      setLogoFile(null);
      setSaved(true);
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudieron guardar los cambios", mensaje: cause.message });
    }
  }

  return (
    <main id="inmobiliaria">
      <div className="inmobiliaria__layout">
        <aside className="inmobiliaria__identity-card" aria-label="Resumen de la inmobiliaria">
          <div className="inmobiliaria__identity-logo-wrap">
            <img className="inmobiliaria__identity-logo" src={brandLogo} alt="Logo de AGI Propiedades" />
            <Boton
              className="inmobiliaria__identity-camera"
              icon={cameraIcon}
              aria-label="Cambiar logo de la inmobiliaria"
            />
          </div>
          <h1>AGI Propiedades</h1>
          <p className="inmobiliaria__identity-type">Inmobiliaria</p>
          <p className="inmobiliaria__identity-email">
            <img src={envelopeIcon} alt="" />
            <span>agipropiedades@gmail.com</span>
          </p>
        </aside>

        <form className="inmobiliaria__form-card" onSubmit={saveChanges}>
          <header className="inmobiliaria__form-header">
            <h1>Mi inmobiliaria</h1>
            <p>Administra tu información personal, seguridad y preferencias de cuenta</p>
          </header>

          <section className="inmobiliaria__form-section" aria-labelledby="inmobiliaria-main-information">
            <EncabezadoSeccion
              icon={userIcon}
              title="Información principal"
              description="Mantené tu información actualizada. Estos datos se utilizan en la plataforma y en las comunicaciones del sistema"
            />
            <div className="inmobiliaria__fields">
              <label className="inmobiliaria__field">
                <span>Nombre inmobiliaria</span>
                <span className="inmobiliaria__field-control">
                  <img src={userIcon} alt="" />
                  <input
                    name="name"
                    value={agency.name}
                    onChange={updateAgency}
                    placeholder="AGI Propiedades"
                    aria-label="Nombre inmobiliaria"
                  />
                </span>
              </label>
              <label className="inmobiliaria__field">
                <span>Teléfono</span>
                <span className="inmobiliaria__field-control">
                  <img src={phoneIcon} alt="" />
                  <input
                    name="phone"
                    value={agency.phone}
                    onChange={updateAgency}
                    placeholder="1231231298"
                    aria-label="Teléfono"
                    inputMode="tel"
                  />
                </span>
              </label>
            </div>
          </section>

          <section
            className="inmobiliaria__form-section inmobiliaria__form-section--images"
            aria-labelledby="inmobiliaria-images"
          >
            <EncabezadoSeccion
              icon={imageIcon}
              title="Imágenes"
              description="Actualiza las imágenes que identifican a tu inmobiliaria en la plataforma"
            />
            <div className="inmobiliaria__uploads">
              <CampoCarga
                label="Banner"
                name="banner"
                value={images.banner}
                onChange={updateImage}
                wide
              />
              <CampoCarga label="Logo" name="logo" value={images.logo} onChange={updateImage} />
              <CampoCarga
                label="Principal"
                name="principal"
                value={images.principal}
                onChange={updateImage}
              />
            </div>
          </section>
        </form>
      </div>

      <Boton
        className="inmobiliaria__save"
        icon={checkIcon}
        text={saved ? "Cambios guardados" : "Guardar cambios"}
        onClick={saveChanges}
        disabled={loading}
        aria-live="polite"
      />
    </main>
  );
}
