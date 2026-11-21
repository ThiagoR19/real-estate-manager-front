import { useRef } from "react";
import { cameraIcon, checkIcon, imageIcon, locationDotIcon, phoneIcon, plusIcon, userIcon } from "../../assets/icons";
import { Boton } from "../../components";
import useMiInmobiliaria, { FORMATOS_IMAGEN } from "../../hooks/useMiInmobiliaria";
import initials from "../../utils/initials";
import avatarClass from "../../utils/avatarClass";
import "./Inmobiliaria.css";

const CAMPOS = [
  { name: "nombre", label: "Nombre inmobiliaria", icon: userIcon, maxLength: 255, sinDato: "Nombre de la inmobiliaria" },
  { name: "telefono", label: "Teléfono", icon: phoneIcon, maxLength: 20, inputMode: "tel", sinDato: "Teléfono" },
  { name: "ubicacion", label: "Ubicación", icon: locationDotIcon, maxLength: 255, ancho: true, sinDato: "Ubicación" },
];

const IMAGENES = [
  { name: "banner", label: "Banner", ancho: true },
  { name: "logo", label: "Logo" },
  { name: "principal", label: "Principal" },
];

const TEXTO_BOTON = { guardando: "Guardando...", guardado: "Cambios guardados" };

function leerArchivo(event, onElegir) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (file) onElegir(file);
}

function EsferaLogo({ logo, nombre }) {
  const [primera = "", segunda = ""] = nombre.trim().split(/\s+/);
  if (logo) <img className="inmobiliaria__identity-logo" src={logo} alt={`Logo de ${nombre || "la inmobiliaria"}`} />;
  return (
    <span
      className={`inmobiliaria__identity-logo inmobiliaria__identity-logo--iniciales ${avatarClass(primera, segunda)}`}
      role="img"
      aria-label={`Iniciales de ${nombre || "la inmobiliaria"}`}
    >
      {initials(primera, segunda)}
    </span>
  );
}

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

function CampoTexto({ campo, valor, guardado, onChange, disabled }) {
  return (
    <label className={`inmobiliaria__field${campo.ancho ? " inmobiliaria__field--wide" : ""}`}>
      <span>{campo.label}</span>
      <span className="inmobiliaria__field-control">
        <img src={campo.icon} alt="" />
        <input
          name={campo.name}
          value={valor}
          onChange={onChange}
          placeholder={guardado || campo.sinDato}
          aria-label={campo.label}
          maxLength={campo.maxLength}
          inputMode={campo.inputMode}
          disabled={disabled}
        />
      </span>
    </label>
  );
}

function CampoCarga({ imagen, url, onElegir, disabled }) {
  const inputRef = useRef(null);
  const etiqueta = imagen.label.toLowerCase();

  return (
    <div className={`inmobiliaria__upload-field${imagen.ancho ? " inmobiliaria__upload-field--wide" : ""}`}>
      <label htmlFor={`inmobiliaria-upload-${imagen.name}`}>{imagen.label}</label>
      <button
        className={`inmobiliaria__upload${url ? " inmobiliaria__upload--filled" : ""}`}
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-label={`${url ? "Cambiar" : "Subir"} imagen de ${etiqueta}`}
      >
        {url ? (
          <img className="inmobiliaria__upload-preview" src={url} alt={`Vista previa de ${etiqueta}`} />
        ) : (
          <>
            <img className="inmobiliaria__upload-plus" src={plusIcon} alt="" />
            <span>Subir imagen</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        id={`inmobiliaria-upload-${imagen.name}`}
        type="file"
        accept={FORMATOS_IMAGEN.join(",")}
        onChange={(event) => leerArchivo(event, (file) => onElegir(imagen.name, file))}
      />
    </div>
  );
}

export default function Inmobiliaria() {
  const { guardado, campos, imagenes, estado, cambiarCampo, cambiarImagen, guardar } = useMiInmobiliaria();
  const logoInputRef = useRef(null);
  const cargando = estado === "cargando";
  const nombre = campos.nombre || guardado.nombre;
  const ubicacion = campos.ubicacion || guardado.ubicacion;

  return (
    <main id="inmobiliaria">
      <div className="inmobiliaria__layout">
        <aside className="inmobiliaria__identity-card" aria-label="Resumen de la inmobiliaria">
          <div className="inmobiliaria__identity-logo-wrap">
            <EsferaLogo logo={imagenes.logo} nombre={nombre} />
            <Boton
              className="inmobiliaria__identity-camera"
              icon={cameraIcon}
              onClick={() => logoInputRef.current?.click()}
              disabled={cargando}
              aria-label="Cambiar logo de la inmobiliaria"
            />
            <input
              ref={logoInputRef}
              className="inmobiliaria__identity-input"
              type="file"
              accept={FORMATOS_IMAGEN.join(",")}
              onChange={(event) => leerArchivo(event, (file) => cambiarImagen("logo", file))}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
          <h1>{nombre || "Mi inmobiliaria"}</h1>
          <p className="inmobiliaria__identity-type">Inmobiliaria</p>
          {ubicacion && (
            <p className="inmobiliaria__identity-email">
              <img src={locationDotIcon} alt="" />
              <span>{ubicacion}</span>
            </p>
          )}
        </aside>

        <form className="inmobiliaria__form-card" onSubmit={guardar}>
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
              {CAMPOS.map((campo) => (
                <CampoTexto
                  key={campo.name}
                  campo={campo}
                  valor={campos[campo.name]}
                  guardado={guardado[campo.name]}
                  onChange={cambiarCampo}
                  disabled={cargando}
                />
              ))}
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
              {IMAGENES.map((imagen) => (
                <CampoCarga
                  key={imagen.name}
                  imagen={imagen}
                  url={imagenes[imagen.name]}
                  onElegir={cambiarImagen}
                  disabled={cargando}
                />
              ))}
            </div>
          </section>
        </form>
      </div>

      <Boton
        className="inmobiliaria__save"
        icon={checkIcon}
        text={TEXTO_BOTON[estado] || "Guardar cambios"}
        onClick={guardar}
        disabled={cargando || estado === "guardando"}
        aria-live="polite"
      />
    </main>
  );
}
