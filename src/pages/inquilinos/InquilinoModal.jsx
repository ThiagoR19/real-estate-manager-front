import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { addressCardIcon, envelopeIcon, houseIcon, locationDotIcon, phoneIcon, userIcon } from "../../assets/icons";
import { SelectDesplegable, Boton, mostrarAviso } from "../../components";
import useClosingTransition from "../../hooks/useClosingTransition.js";
import { propiedades } from "../../services/propiedades.js";
import "./InquilinoModal.css";

const opcionesEstado = ["Activo", "Inactivo"];

function formularioInicial(inquilino) {
  if (!inquilino) {
    return {
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      direccion: "",
      dni: "",
      activo: true,
      idPropiedad: null,
    };
  }

  return {
    nombre: inquilino.nombre || "",
    apellido: inquilino.apellido || "",
    correo: inquilino.correo || "",
    telefono: inquilino.telefono || "",
    direccion: inquilino.direccion || "",
    dni: inquilino.dni || "",
    activo: Boolean(inquilino.activo),
    idPropiedad: inquilino.idPropiedad || null,
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

  return initials || "IN";
}

function Campo({ children, label }) {
  return (
    <label className="inquilino-modal__field">
      <span className="inquilino-modal__label">{label}</span>
      {children}
    </label>
  );
}

function EntradaConIcono({ icon, ...props }) {
  return (
    <span className="inquilino-modal__input-wrap">
      <img src={icon} alt="" aria-hidden="true" />
      <input {...props} />
    </span>
  );
}

export default function InquilinoModal({ isOpen, mode, inquilino, onClose, onSubmit }) {
  const [formulario, setFormulario] = useState(() => formularioInicial(inquilino));
  const [guardando, setGuardando] = useState(false);
  const [propiedadesDisponibles, setPropiedadesDisponibles] = useState([]);
  const [cargandoPropiedades, setCargandoPropiedades] = useState(isOpen && mode === "edit");
  const [errorPropiedades, setErrorPropiedades] = useState("");
  const { isClosing, close } = useClosingTransition(onClose);
  const esEdicion = mode === "edit";
  const nombreVisible = esEdicion
    ? `${inquilino?.nombre || ""} ${inquilino?.apellido || ""}`.trim() || `DNI ${inquilino?.dni}`
    : "Inquilino";
  const estadoVisible = esEdicion ? (formulario.activo ? "Activo" : "Inactivo") : "Estado";
  const opcionesPropiedades = propiedadesDisponibles.map((propiedad) => ({
    id: propiedad.id,
    label: `${propiedad.ubicacion ? `${propiedad.ubicacion} · ` : ""}${propiedad.nombre} (#${propiedad.id})`,
  }));
  const propiedadSeleccionada = opcionesPropiedades.find((propiedad) => Number(propiedad.id) === Number(formulario.idPropiedad));
  const opcionesPropiedad = ["Seleccionar propiedad", ...opcionesPropiedades.map((propiedad) => propiedad.label)];

  useEffect(() => {
    if (!isOpen || !esEdicion) return undefined;
    let mounted = true;
    propiedades()
      .then((items) => {
        if (mounted) setPropiedadesDisponibles(items);
      })
      .catch((error) => {
        if (mounted) setErrorPropiedades(error.message || "No se pudieron cargar las propiedades.");
      })
      .finally(() => {
        if (mounted) setCargandoPropiedades(false);
      });
    return () => { mounted = false; };
  }, [isOpen, esEdicion]);

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
    setGuardando(true);
    try {
      await onSubmit({
        ...formulario,
        nombreCompleto: `${formulario.nombre.trim()} ${formulario.apellido.trim()}`.trim(),
      });
    } catch (submitError) {
      mostrarAviso({
        tipo: "error",
        titulo: esEdicion ? "No se pudo actualizar el inquilino" : "No se pudo crear el inquilino",
        mensaje: submitError.message || "No se pudieron guardar los cambios.",
      });
    } finally {
      setGuardando(false);
    }
  }

  return createPortal(
    <div
      className={`inquilino-modal__overlay${isClosing ? " is-closing" : ""}`}
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
        className={`inquilino-modal${isClosing ? " is-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquilino-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="inquilino-modal__header">
          <h2 id="inquilino-modal-title">{esEdicion ? "Editar inquilino" : "Crear inquilino"}</h2>
          <p>
            {esEdicion
              ? "Actualiza la información principal del inquilino."
              : "Completá los datos del inquilino para crear su cuenta."}
          </p>
        </header>

        <form onSubmit={enviarFormulario}>
          <div className="inquilino-modal__form-card">
            <div className="inquilino-modal__summary">
              <span className="inquilino-modal__avatar" aria-hidden="true">
                {esEdicion ? obtenerIniciales(nombreVisible) : "IN"}
              </span>
              <span>
                <strong>{nombreVisible}</strong>
                <small>{estadoVisible}</small>
              </span>
            </div>

            <div className="inquilino-modal__fields">
              <Campo label="Nombre">
                <EntradaConIcono
                  icon={userIcon}
                  name="nombre"
                  value={formulario.nombre}
                  onChange={actualizarCampo}
                  placeholder="Nombre"
                  autoComplete="given-name"
                  required={!esEdicion}
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
                  required={!esEdicion}
                />
              </Campo>

              <Campo label="Correo">
                <EntradaConIcono
                  icon={envelopeIcon}
                  name="correo"
                  type="email"
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
                  placeholder="2133 123123"
                  autoComplete="tel"
                />
              </Campo>

              <Campo label="Dirección">
                <EntradaConIcono
                  icon={locationDotIcon}
                  name="direccion"
                  value={formulario.direccion}
                  onChange={actualizarCampo}
                  placeholder="Av. San Martín 12"
                  autoComplete="street-address"
                />
              </Campo>

              <Campo label="DNI">
                <EntradaConIcono
                  icon={addressCardIcon}
                  name="dni"
                  value={formulario.dni}
                  onChange={actualizarCampo}
                  placeholder="12123123"
                  inputMode="numeric"
                  pattern="[0-9]{7,8}"
                  required
                  readOnly={esEdicion}
                />
              </Campo>

              {esEdicion && <Campo label="Propiedad">
                {cargandoPropiedades || errorPropiedades || !opcionesPropiedades.length ? (
                  <span className="inquilino-modal__select-trigger" role={errorPropiedades ? "alert" : undefined}>
                    {cargandoPropiedades
                      ? "Cargando propiedades..."
                      : errorPropiedades || "No hay propiedades disponibles"}
                  </span>
                ) : (
                  <SelectDesplegable
                    label="Propiedad"
                    value={propiedadSeleccionada?.label || opcionesPropiedad[0]}
                    options={opcionesPropiedad}
                    onChange={(label) => {
                      const propiedad = opcionesPropiedades.find((choice) => choice.label === label);
                      if (propiedad) setFormulario((current) => ({ ...current, idPropiedad: propiedad.id }));
                    }}
                    icon={houseIcon}
                    className="inquilino-modal__select"
                    triggerClassName="inquilino-modal__select-trigger"
                    iconClassName="inquilino-modal__select-icon"
                    valueClassName="inquilino-modal__select-value"
                    chevronClassName="inquilino-modal__select-arrow"
                    optionsClassName="inquilino-modal__select-options"
                  />
                )}
              </Campo>}

              {esEdicion && <Campo label="Estado">
                <SelectDesplegable
                  label="Estado"
                  value={formulario.activo ? opcionesEstado[0] : opcionesEstado[1]}
                  options={opcionesEstado}
                  onChange={(status) =>
                    setFormulario((current) => ({ ...current, activo: status === opcionesEstado[0] }))
                  }
                  icon={userIcon}
                  className="inquilino-modal__select"
                  triggerClassName="inquilino-modal__select-trigger"
                  iconClassName="inquilino-modal__select-icon"
                  valueClassName="inquilino-modal__select-value"
                  chevronClassName="inquilino-modal__select-arrow"
                  optionsClassName="inquilino-modal__select-options"
                />
              </Campo>}
            </div>
          </div>


          <footer className="inquilino-modal__actions">
            <button
              className="inquilino-modal__cancel"
              type="button"
              onClick={close}
              disabled={guardando}
            >
              Cancelar
            </button>
            <Boton
              className="inquilino-modal__submit"
              type="submit"
              text={guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear inquilino"}
              disabled={guardando}
            />
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
