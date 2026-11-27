import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { houseIcon, plusIcon, xIcon } from "../../assets/icons";
import { Boton } from "../../components";
import useClosingTransition from "../../hooks/useClosingTransition.js";
import "./ReporteModal.css";

function formularioInicial() {
  return {
    nombre: "",
    idPropiedad: "",
    idCategoria: "",
    descripcion: "",
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

export default function ReporteModal({ isOpen, onClose, onSubmit, propiedades = [], categorias = [], busy = false }) {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [fotos, setFotos] = useState([]);
  const fotosRef = useRef([]);
  const { isClosing, close } = useClosingTransition(onClose);

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

  useEffect(
    () => () => {
      fotosRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
    },
    [],
  );

  if (!isOpen) {
    return null;
  }

  function actualizarCampo(event) {
    const { name: nombre, value } = event.target;
    setFormulario((current) => ({ ...current, [nombre]: value }));
  }

  function agregarFotos(event) {
    const fotosSeleccionadas = Array.from(event.target.files ?? []).slice(0, Math.max(0, 10 - fotosRef.current.length)).map((archivo) => ({
      id: `${archivo.name}-${archivo.lastModified}-${archivo.size}-${Math.random()}`,
      archivo,
      url: URL.createObjectURL(archivo),
    }));

    if (fotosSeleccionadas.length) {
      const nuevasFotos = [...fotosRef.current, ...fotosSeleccionadas];
      fotosRef.current = nuevasFotos;
      setFotos(nuevasFotos);
    }

    event.target.value = "";
  }

  function quitarFoto(idFoto) {
    const foto = fotosRef.current.find(({ id }) => id === idFoto);
    if (foto) {
      URL.revokeObjectURL(foto.url);
    }

    const nuevasFotos = fotosRef.current.filter(({ id }) => id !== idFoto);
    fotosRef.current = nuevasFotos;
    setFotos(nuevasFotos);
  }

  function enviarFormulario(event) {
    event.preventDefault();
    if (busy) return;
    onSubmit({
      ...formulario,
      idPropiedad: formulario.idPropiedad || propiedades[0]?.id,
      idCategoria: formulario.idCategoria || categorias[0]?.id,
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      fotos: fotosRef.current.map(({ archivo }) => archivo),
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

        <form onSubmit={enviarFormulario}>
          <section className="reporte-modal__card" aria-labelledby="reporte-modal-main-data">
            <header className="reporte-modal__section-header">
              <span className="reporte-modal__step" aria-hidden="true">1</span>
              <h3 id="reporte-modal-main-data">Datos principales</h3>
            </header>

            <div className="reporte-modal__fields">
              <Campo label="Nombre">
                <input
                  className="reporte-modal__input"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={actualizarCampo}
                  placeholder="Rotura de cortinas"
                  autoComplete="off"
                  autoFocus
                  required
                />
              </Campo>

              <Campo label="Propiedad">
                <span className="reporte-modal__native-select-wrap">
                  <img src={houseIcon} alt="" aria-hidden="true" />
                  <select className="reporte-modal__native-select" name="idPropiedad"
                    value={formulario.idPropiedad || propiedades[0]?.id || ""} onChange={actualizarCampo} required>
                    {propiedades.map((propiedad) => <option key={propiedad.id} value={propiedad.id}>{propiedad.nombre}{propiedad.ubicacion ? ` · ${propiedad.ubicacion}` : ""}</option>)}
                  </select>
                </span>
              </Campo>

              <Campo label="Tipo">
                <select className="reporte-modal__native-select" name="idCategoria"
                  value={formulario.idCategoria || categorias[0]?.id || ""} onChange={actualizarCampo} required>
                  {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
                </select>
              </Campo>

              <Campo label="Descripción">
                <span className="reporte-modal__textarea-wrap">
                  <textarea
                    className="reporte-modal__textarea"
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={actualizarCampo}
                    placeholder="Ingrese una descripción del reporte..."
                    maxLength={500}
                    required
                  />
                  <span className="reporte-modal__counter">{formulario.descripcion.length}/500</span>
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
                {fotos.map((foto, index) => (
                  <figure className="reporte-modal__photo" key={foto.id}>
                    <img src={foto.url} alt={`Foto ${index + 1} del reporte`} />
                    <button
                      type="button"
                      aria-label={`Quitar foto ${index + 1}`}
                      onClick={() => quitarFoto(foto.id)}
                    >
                      <img src={xIcon} alt="" aria-hidden="true" />
                    </button>
                  </figure>
                ))}

                <label className="reporte-modal__add-photos">
                  <img className="reporte-modal__add-icon" src={plusIcon} alt="" aria-hidden="true" />
                  <span>Agregar fotos</span>
                  <input type="file" accept="image/*" multiple onChange={agregarFotos} disabled={fotos.length >= 10 || busy} />
                </label>
              </div>
            </div>
          </section>

          <footer className="reporte-modal__actions">
            <p>La inmobiliaria te notificará cuando cambie el estado del reporte.</p>
            <div>
              <button className="reporte-modal__cancel" type="button" onClick={close} disabled={busy}>
                Cancelar
              </button>
              <Boton className="reporte-modal__submit" type="submit" disabled={busy} text={busy ? "Guardando..." : "Crear reporte"} />
            </div>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
