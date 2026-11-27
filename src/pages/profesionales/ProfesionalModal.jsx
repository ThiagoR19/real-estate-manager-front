import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { briefcaseIcon, envelopeIcon, phoneIcon, userIcon } from "../../assets/icons";
import { Boton, mostrarAviso } from "../../components";
import useClosingTransition from "../../hooks/useClosingTransition.js";
import "./ProfesionalModal.css";

function formularioInicial(profesional) {
  if (!profesional) {
    return {
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      profesion: "",
    };
  }

  const [nombre = "", ...partesApellido] = profesional.nombreCompleto.trim().split(/\s+/);

  return {
    nombre,
    apellido: partesApellido.join(" "),
    correo: profesional.correo || "",
    telefono: profesional.telefono || "",
    profesion: profesional.profesion || "",
  };
}

function obtenerIniciales(nombre) {
  const initials = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "PP";
}

function Campo({ children, label }) {
  return (
    <label className="profesional-modal__field">
      <span className="profesional-modal__label">{label}</span>
      {children}
    </label>
  );
}

function EntradaConIcono({ icon, ...props }) {
  return (
    <span className="profesional-modal__input-wrap">
      <img src={icon} alt="" aria-hidden="true" />
      <input {...props} />
    </span>
  );
}

export default function ProfesionalModal({ isOpen, mode, profesional, onClose, onSubmit }) {
  const [formulario, setFormulario] = useState(() => formularioInicial(profesional));
  const { isClosing, close } = useClosingTransition(onClose);
  const esEdicion = mode === "edit";
  const nombreVisible = esEdicion ? profesional?.nombreCompleto || "Profesional" : "Profesional";
  const profesionVisible = esEdicion ? profesional?.profesion || "Profesión" : "Profesión";

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function cerrarConEscape(event) {
      if (event.key === "Escape") {
        close();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [isOpen, close]);

  if (!isOpen) {
    return null;
  }

  function actualizarCampo(event) {
    const { name: nombre, value } = event.target;
    setFormulario((current) => ({ ...current, [nombre]: value }));
  }

  async function enviarFormulario(event) {
    event.preventDefault();
    try {
      await onSubmit({ ...formulario, nombreCompleto: `${formulario.nombre.trim()} ${formulario.apellido.trim()}`.trim() });
    } catch (error) {
      mostrarAviso({
        tipo: "error",
        titulo: esEdicion ? "No se pudo actualizar el profesional" : "No se pudo crear el profesional",
        mensaje: error.message,
      });
    }
  }

  return createPortal(
    <div
      className={`profesional-modal__overlay${isClosing ? " is-closing" : ""}`}
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
        className={`profesional-modal${isClosing ? " is-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profesional-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="profesional-modal__header">
          <h2 id="profesional-modal-title">
            {esEdicion ? "Editar profesional" : "Crear profesional"}
          </h2>
          <p>
            {esEdicion
              ? "Actualiza la información principal del profesional"
              : "Ingrese la información principal del profesional"}
          </p>
        </header>

        <form onSubmit={enviarFormulario}>
          <div className="profesional-modal__form-card">
            <div className="profesional-modal__summary">
              <span className="profesional-modal__avatar" aria-hidden="true">
                {esEdicion ? obtenerIniciales(nombreVisible) : "PP"}
              </span>
              <span>
                <strong>{esEdicion ? nombreVisible : "Profesional"}</strong>
                <small>{profesionVisible}</small>
              </span>
            </div>

            <div className="profesional-modal__fields">
              <Campo label="Nombre">
                <EntradaConIcono
                  icon={userIcon}
                  name="nombre"
                  value={formulario.nombre}
                  onChange={actualizarCampo}
                  placeholder="Nombre"
                  autoComplete="given-name"
                />
              </Campo>

              <Campo label="Apellido">
                <EntradaConIcono
                  icon={userIcon}
                  name="apellido"
                  value={formulario.apellido}
                  onChange={actualizarCampo}
                  placeholder="Apellido"
                  autoComplete="family-name"
                />
              </Campo>

              <Campo label="Correo">
                <EntradaConIcono
                  icon={envelopeIcon}
                  name="correo"
                  type="text"
                  value={formulario.correo}
                  onChange={actualizarCampo}
                  placeholder="ejemplo@gmail.com"
                  autoComplete="email"
                />
              </Campo>

              <Campo label="Teléfono">
                <EntradaConIcono
                  icon={phoneIcon}
                  name="telefono"
                  type="tel"
                  value={formulario.telefono}
                  onChange={actualizarCampo}
                  placeholder="1234 123123"
                  autoComplete="tel"
                />
              </Campo>

              <Campo label="Profesión">
                <EntradaConIcono
                  icon={briefcaseIcon}
                  name="profesion"
                  value={formulario.profesion}
                  onChange={actualizarCampo}
                  placeholder="Profesión"
                />
              </Campo>
            </div>
          </div>

          <footer className="profesional-modal__actions">
            <button className="profesional-modal__cancel" type="button" onClick={close}>
              Cancelar
            </button>
            <Boton
              className="profesional-modal__submit"
              type="submit"
              text={esEdicion ? "Guardar cambios" : "Crear profesional"}
            />
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
