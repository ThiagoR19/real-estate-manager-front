import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  bathIcon,
  bedIcon,
  calendarIcon,
  fileLinesIcon,
  locationDotIcon,
  plusIcon,
  rulerCombinedIcon,
  xIcon,
} from "../../assets/icons";
import { Boton } from "../index";
import { api } from "../../services/api.js";
import useClosingTransition from "../../hooks/useClosingTransition.js";
import "./PropiedadModal.css";

function initialForm(property, catalogs) {
  return {
    name: property?.nombre || "",
    typeId: property?.idTipo || catalogs.tipos[0]?.id || "",
    statusId: property?.idEstadoComercial || catalogs.estados[0]?.id || "",
    agentId: property?.idAgente || "",
    description: property?.descripcion || "",
    location: property?.ubicacion || "",
    age: property?.antiguedad ?? 0,
    bedrooms: property?.habitaciones ?? 0,
    bathrooms: property?.banos ?? 0,
    area: property?.tamano ?? "",
    price: property?.precio ?? "",
    currency: property?.moneda || "ARS",
    published: Boolean(property?.publicada),
    photos: (property?.imagenes || []).map((image) => ({
      ...image,
      src: api.urlRecurso(image.url),
      alt: `Foto de ${property.nombre}`,
    })),
    documents: (property?.documentos || []).map((document) => ({
      ...document,
      fileName: document.nombreArchivo,
    })),
  };
}

function Campo({ label, children, className = "" }) {
  return (
    <label className={`propiedad-modal__field ${className}`}>
      <span className="propiedad-modal__label">{label}</span>
      {children}
    </label>
  );
}

export default function PropiedadModal({ isOpen, mode, property, catalogs, onClose, onSubmit }) {
  const [form, setForm] = useState(() => initialForm(property, catalogs));
  const [section, setSection] = useState("information");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { isClosing, close } = useClosingTransition(onClose);
  const photoInput = useRef(null);
  const documentInput = useRef(null);
  const objectUrls = useRef([]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event) => {
      if (event.key === "Escape" && !saving) close();
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [isOpen, close, saving]);

  useEffect(
    () => () => {
      for (const url of objectUrls.current) URL.revokeObjectURL(url);
    },
    [],
  );
  if (!isOpen) return null;

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function addPhotos(event) {
    const photos = Array.from(event.target.files || []).map((file) => {
      const src = URL.createObjectURL(file);
      objectUrls.current.push(src);
      return { file, src, alt: file.name };
    });
    setForm((current) => ({ ...current, photos: [...current.photos, ...photos] }));
    event.target.value = "";
  }

  function addDocuments(event) {
    const documents = Array.from(event.target.files || []).map((file) => ({
      file,
      fileName: file.name,
      name: file.name,
    }));
    setForm((current) => ({ ...current, documents: [...current.documents, ...documents] }));
    event.target.value = "";
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    let saved;
    try {
      const body = {
        nombre: form.name.trim(),
        idTipo: Number(form.typeId),
        idEstadoComercial: Number(form.statusId),
        idAgente: form.agentId ? Number(form.agentId) : null,
        descripcion: form.description.trim() || null,
        ubicacion: form.location.trim() || null,
        habitaciones: Number(form.bedrooms),
        banos: Number(form.bathrooms),
        tamano: Number(form.area) > 0 ? Number(form.area) : null,
        antiguedad: Number(form.age),
        precio: form.price === "" ? null : Number(form.price),
        moneda: form.currency,
        publicada: form.published,
      };
      saved = property
        ? await api.actualizarPropiedad(property.id, body)
        : await api.crearPropiedad(body);
      const photos = form.photos.filter((photo) => photo.file).map((photo) => photo.file);
      const documents = form.documents
        .filter((document) => document.file)
        .map((document) => document.file);
      for (let i = 0; i < photos.length; i += 10)
        await api.subirArchivosPropiedad(saved.id, "imagenes", photos.slice(i, i + 10));
      for (let i = 0; i < documents.length; i += 5)
        await api.subirArchivosPropiedad(saved.id, "documentos", documents.slice(i, i + 5));
      if (property) {
        const keptPhotos = new Set(form.photos.map((photo) => photo.id));
        const keptDocuments = new Set(form.documents.map((document) => document.id));
        for (const photo of property.imagenes || [])
          if (!keptPhotos.has(photo.id))
            await api.eliminarArchivoPropiedad(saved.id, "imagenes", photo.id);
        for (const document of property.documentos || [])
          if (!keptDocuments.has(document.id))
            await api.eliminarArchivoPropiedad(saved.id, "documentos", document.id);
      }
      await onSubmit(await api.obtenerPropiedad(saved.id));
    } catch (cause) {
      if (saved) {
        let current = saved;
        try {
          current = await api.obtenerPropiedad(saved.id);
        } catch {

        }
        await onSubmit(current, cause.message);
      } else setError(cause.message);
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div
      className={`propiedad-modal__overlay${isClosing ? " is-closing" : ""}`}
      aria-hidden={isClosing}
      inert={isClosing}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) close();
      }}
    >
      <section
        className={`propiedad-modal${isClosing ? " is-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="propiedad-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="propiedad-modal__header">
          <div>
            <h2 id="propiedad-modal-title">
              {mode === "edit" ? "Editar propiedad" : "Crear propiedad"}
            </h2>
            <p>Los cambios se guardan en la inmobiliaria.</p>
          </div>
          <div
            className="propiedad-modal__tabs"
            role="tablist"
            aria-label="Secciones de la propiedad"
          >
            <Boton
              type="button"
              role="tab"
              aria-selected={section === "information"}
              className={section === "information" ? "is-active" : ""}
              onClick={() => setSection("information")}
            >
              Información
            </Boton>
            <Boton
              type="button"
              role="tab"
              aria-selected={section === "documentation"}
              className={section === "documentation" ? "is-active" : ""}
              onClick={() => setSection("documentation")}
            >
              Archivos
            </Boton>
          </div>
        </header>
        <form onSubmit={submit}>
          {section === "information" ? (
            <div className="propiedad-modal__information" role="tabpanel" aria-label="Información">
              <div className="propiedad-modal__column propiedad-modal__column--main">
                <section className="propiedad-modal__card">
                  <div className="propiedad-modal__card-heading">
                    <span>1</span>
                    <h3>Datos principales</h3>
                  </div>
                  <div className="propiedad-modal__card-body propiedad-modal__main-fields">
                    <Campo label="Nombre">
                      <input
                        className="propiedad-modal__plain-input"
                        name="name"
                        value={form.name}
                        onChange={change}
                        placeholder="Nombre de la propiedad"
                      />
                    </Campo>
                    <Campo label="Tipo">
                      <select
                        className="propiedad-modal__plain-input"
                        name="typeId"
                        value={form.typeId}
                        onChange={change}
                      >
                        {catalogs.tipos.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.nombre}
                          </option>
                        ))}
                      </select>
                    </Campo>
                    <Campo label="Descripción" className="propiedad-modal__field--full">
                      <div className="propiedad-modal__textarea-wrap">
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={change}
                          placeholder="Descripción de la propiedad"
                        />
                        <span>{form.description.length}</span>
                      </div>
                    </Campo>
                    <Campo label="Ubicación">
                      <span className="propiedad-modal__input-wrap">
                        <img src={locationDotIcon} alt="" />
                        <input name="location" value={form.location} onChange={change} placeholder="Ubicación de la propiedad" />
                      </span>
                    </Campo>
                    <Campo label="Agente">
                      <select
                        className="propiedad-modal__plain-input"
                        name="agentId"
                        value={form.agentId}
                        onChange={change}
                      >
                        <option value="">Sin asignar</option>
                        {catalogs.agentes.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.nombre}
                          </option>
                        ))}
                      </select>
                    </Campo>
                  </div>
                </section>
                <section className="propiedad-modal__card propiedad-modal__card--photos">
                  <div className="propiedad-modal__card-heading">
                    <span>3</span>
                    <h3>Fotos de la propiedad</h3>
                  </div>
                  <div className="propiedad-modal__photos-body">
                    <div className="propiedad-modal__photos-list">
                      {form.photos.map((photo, index) => (
                        <figure className="propiedad-modal__photo" key={photo.id || photo.src}>
                          <img src={photo.src} alt={photo.alt} />
                          <button
                            type="button"
                            aria-label={`Quitar foto ${index + 1}`}
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                photos: current.photos.filter((_, i) => i !== index),
                              }))
                            }
                          >
                            ×
                          </button>
                        </figure>
                      ))}
                      <button
                        className="propiedad-modal__add-photo"
                        type="button"
                        onClick={() => photoInput.current?.click()}
                      >
                        <img src={plusIcon} alt="" />
                        <span>Agregar fotos</span>
                      </button>
                    </div>
                    <input
                      ref={photoInput}
                      className="propiedad-modal__hidden-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={addPhotos}
                    />
                  </div>
                </section>
              </div>
              <div className="propiedad-modal__column propiedad-modal__column--side">
                <section className="propiedad-modal__card">
                  <div className="propiedad-modal__card-heading">
                    <span>2</span>
                    <h3>Características</h3>
                  </div>
                  <div className="propiedad-modal__card-body propiedad-modal__feature-grid">
                    {[
                      ["Antigüedad", "age", calendarIcon],
                      ["Habitaciones", "bedrooms", bedIcon],
                      ["Superficie (m²)", "area", rulerCombinedIcon],
                      ["Baños", "bathrooms", bathIcon],
                    ].map(([label, name, icon]) => (
                      <Campo label={label} key={name}>
                        <span className="propiedad-modal__input-wrap propiedad-modal__input-wrap--counter">
                          <img src={icon} alt="" />
                          <input
                            type="number"
                            min="0"
                            step={name === "area" ? "0.01" : "1"}
                            name={name}
                            value={form[name]}
                            onChange={change}
                          />
                        </span>
                      </Campo>
                    ))}
                  </div>
                </section>
                <section className="propiedad-modal__card">
                  <div className="propiedad-modal__card-heading">
                    <span>4</span>
                    <h3>Comercialización</h3>
                  </div>
                  <div className="propiedad-modal__card-body propiedad-modal__feature-grid">
                    <Campo label="Estado">
                      <select
                        className="propiedad-modal__plain-input"
                        name="statusId"
                        value={form.statusId}
                        onChange={change}
                      >
                        {catalogs.estados.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.nombre}
                          </option>
                        ))}
                      </select>
                    </Campo>
                    <Campo label="Precio">
                      <input
                        className="propiedad-modal__plain-input"
                        type="number"
                        min="0"
                        step="0.01"
                        name="price"
                        value={form.price}
                        onChange={change}
                      />
                    </Campo>
                    <Campo label="Moneda">
                      <select
                        className="propiedad-modal__plain-input"
                        name="currency"
                        value={form.currency}
                        onChange={change}
                      >
                        <option value="ARS">ARS</option>
                        <option value="USD">USD</option>
                      </select>
                    </Campo>
                    <Campo label="Publicada">
                      <input
                        type="checkbox"
                        name="published"
                        checked={form.published}
                        onChange={change}
                      />
                    </Campo>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="propiedad-modal__documentation" role="tabpanel" aria-label="Archivos">
              <section className="propiedad-modal__card propiedad-modal__card--documents">
                <div className="propiedad-modal__card-heading">
                  <span>1</span>
                  <h3>Documentación PDF</h3>
                </div>
                <div className="propiedad-modal__card-body propiedad-modal__documents-body">
                  {form.documents.map((doc, index) => (
                    <div
                      className="propiedad-modal__document-row"
                      key={doc.id || `${doc.fileName}-${index}`}
                    >
                      <span>{doc.fileName}</span>
                      <button
                        className="propiedad-modal__remove-document"
                        type="button"
                        aria-label={`Quitar documento ${index + 1}`}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            documents: current.documents.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <img src={xIcon} alt="" />
                      </button>
                    </div>
                  ))}
                  <button
                    className="propiedad-modal__add-document"
                    type="button"
                    onClick={() => documentInput.current?.click()}
                  >
                    <img src={fileLinesIcon} alt="" />
                    <span>Agregar PDF</span>
                  </button>
                  <input
                    ref={documentInput}
                    className="propiedad-modal__hidden-input"
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={addDocuments}
                  />
                </div>
              </section>
            </div>
          )}
          {error && (
            <p className="propiedad-modal__error" role="alert">
              {error}
            </p>
          )}
          <footer className="propiedad-modal__actions">
            <button
              className="propiedad-modal__cancel"
              type="button"
              disabled={saving}
              onClick={close}
            >
              Cancelar
            </button>
            <Boton
              className="propiedad-modal__submit"
              type="submit"
              disabled={saving}
              text={
                saving ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Crear propiedad"
              }
            />
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
