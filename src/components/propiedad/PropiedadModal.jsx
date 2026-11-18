import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  bathIcon,
  bedIcon,
  calendarIcon,
  carIcon,
  boltIcon,
  dropletIcon,
  fireFlameSimpleIcon,
  locationDotIcon,
  plusIcon,
  rulerCombinedIcon,
  userIcon,
  xIcon,
} from "../../assets/icons";
import { Boton, mostrarAviso } from "../index";
import { api } from "../../services/api.js";
import useClosingTransition from "../../hooks/useClosingTransition.js";
import "./PropiedadModal.css";

function contratoVacio() {
  return {
    fechaInicio: "",
    fechaFin: "",
    mesesAumento: "",
    tipo: "Alquiler",
    estado: "Borrador",
    montoInicial: "",
    tipoAumento: "",
    aumentoFijo: "",
  };
}

function initialForm(property, catalogs) {
  const contractStatus = property?.datosContrato && catalogs.estados.find((item) =>
    item.nombre === (property.datosContrato.tipo === "Venta" ? "Vendida" : "Alquilada"));
  return {
    name: property?.nombre || "",
    typeId: property?.idTipo || catalogs.tipos[0]?.id || "",
    statusId: contractStatus?.id || property?.idEstadoComercial || catalogs.estados[0]?.id || "",
    agentId: property?.idAgente || "",
    ownerId: property?.idPropietario || "",
    services: property?.servicios || [],
    contractEnabled: Boolean(property?.datosContrato),
    contract: {
      fechaInicio: property?.datosContrato?.fechaInicio || "",
      fechaFin: property?.datosContrato?.fechaFin || "",
      mesesAumento: property?.datosContrato?.mesesAumento ?? "",
      tipo: property?.datosContrato?.tipo || "Alquiler",
      estado: property?.datosContrato?.estado || "Borrador",
      montoInicial: property?.datosContrato?.montoInicial ?? "",
      tipoAumento: property?.datosContrato?.tipoAumento || "",
      aumentoFijo: property?.datosContrato?.aumentoFijo ?? "",
    },
    documentTitle: "",
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
      title: document.titulo || document.nombreArchivo,
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
    setForm((current) => {
      const quitarContrato = name === "statusId" && current.documents.length === 0;
      return {
        ...current,
        [name]: type === "checkbox" ? checked : value,
        ...(quitarContrato ? { contractEnabled: false, contract: contratoVacio() } : {}),
      };
    });
  }

  function changeContract(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const type = name === "tipo" ? value : current.contract.tipo;
      const status = catalogs.estados.find((item) => item.nombre === (type === "Venta" ? "Vendida" : "Alquilada"));
      return { ...current, contractEnabled: true, statusId: status?.id ?? current.statusId,
        contract: { ...current.contract, [name]: value } };
    });
  }

  function toggleService(id) {
    setForm((current) => ({ ...current, services: current.services.includes(id)
      ? current.services.filter((value) => value !== id)
      : [...current.services, id] }));
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
      title: form.documentTitle.trim() || file.name.replace(/\.pdf$/i, ""),
    }));
    setForm((current) => ({ ...current, documentTitle: "", documents: [...current.documents, ...documents] }));
    event.target.value = "";
  }

  async function submit(event) {
    event.preventDefault();
    if (form.contractEnabled && form.contract.tipo === "Alquiler" && form.contract.fechaInicio && form.contract.fechaFin &&
        form.contract.fechaFin < form.contract.fechaInicio) {
      setSection("documentation");
      mostrarAviso({ tipo: "error", titulo: "Fechas inválidas", mensaje: "La fecha de fin debe ser posterior al inicio." });
      return;
    }
    if (form.documents.some((document) => !document.title.trim())) {
      setSection("documentation");
      mostrarAviso({ tipo: "error", titulo: "Falta un nombre", mensaje: "Cada documento debe tener un nombre." });
      return;
    }
    setSaving(true);
    let saved;
    try {
      const isSale = form.contract.tipo === "Venta";
      const contractStatus = catalogs.estados.find((item) => item.nombre === (isSale ? "Vendida" : "Alquilada"));
      const body = {
        nombre: form.name.trim(),
        idTipo: Number(form.typeId),
        idEstadoComercial: Number(form.contractEnabled ? contractStatus?.id ?? form.statusId : form.statusId),
        idAgente: form.agentId ? Number(form.agentId) : null,
        idPropietario: form.ownerId ? Number(form.ownerId) : null,
        servicios: form.services,
        datosContrato: form.contractEnabled ? {
          fechaInicio: isSale ? null : form.contract.fechaInicio || null,
          fechaFin: isSale ? null : form.contract.fechaFin || null,
          mesesAumento: isSale || form.contract.mesesAumento === "" ? null : Number(form.contract.mesesAumento),
          tipo: form.contract.tipo,
          estado: isSale ? "Borrador" : form.contract.estado,
          montoInicial: isSale || form.contract.montoInicial === "" ? null : Number(form.contract.montoInicial),
          tipoAumento: isSale ? null : form.contract.tipoAumento || null,
          aumentoFijo: !isSale && form.contract.tipoAumento === "FIJO" && form.contract.aumentoFijo !== ""
            ? Number(form.contract.aumentoFijo) : null,
        } : null,
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
      const documents = form.documents.filter((document) => document.file);
      for (let i = 0; i < photos.length; i += 10)
        await api.subirArchivosPropiedad(saved.id, "imagenes", photos.slice(i, i + 10));
      for (const document of documents)
        await api.subirArchivosPropiedad(saved.id, "documentos", [document.file], document.title.trim());
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
          // Se conserva la respuesta original para informar el guardado parcial.
        }
        await onSubmit(current, cause.message);
      } else {
        mostrarAviso({
          tipo: "error",
          titulo: property ? "No se pudo actualizar la propiedad" : "No se pudo crear la propiedad",
          mensaje: cause.message,
        });
      }
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
              Documentación
            </Boton>
          </div>
        </header>
        <form onSubmit={submit}>
          {section === "information" ? (
            <div className="propiedad-modal__information" role="tabpanel" aria-label="Información">
              <div className="propiedad-modal__column propiedad-modal__column--main">
                <section className="propiedad-modal__card propiedad-modal__card--main">
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
                    <Campo label="Dueño / Propietario">
                      <span className="propiedad-modal__input-wrap">
                        <img src={userIcon} alt="" />
                        <select name="ownerId" value={form.ownerId} onChange={change} aria-label="Dueño o propietario">
                          <option value="">Sin asignar</option>
                          {(catalogs.propietarios || []).map((owner) => (
                            <option key={owner.id} value={owner.id}>{owner.nombre}</option>
                          ))}
                        </select>
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
                    <span>4</span>
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
                <section className="propiedad-modal__card propiedad-modal__card--features">
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
                            placeholder={name === "area" ? "0" : undefined}
                            onChange={change}
                          />
                        </span>
                      </Campo>
                    ))}
                  </div>
                </section>
                <section className="propiedad-modal__card propiedad-modal__card--commercial">
                  <div className="propiedad-modal__card-heading">
                    <span>3</span>
                    <h3>Comercialización</h3>
                  </div>
                  <div className="propiedad-modal__card-body propiedad-modal__feature-grid">
                    <Campo label="Estado">
                      <select
                        className="propiedad-modal__plain-input"
                        name="statusId"
                        value={form.statusId}
                        onChange={change}
                        disabled={form.contractEnabled && form.documents.length > 0}
                        title={form.contractEnabled && form.documents.length > 0 ? "El estado se define por el tipo de contrato" : undefined}
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
                        placeholder="0"
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
              <section className="propiedad-modal__card propiedad-modal__card--services">
                <div className="propiedad-modal__card-heading">
                  <span>5</span>
                  <h3>Servicios</h3>
                </div>
                <div className="propiedad-modal__card-body propiedad-modal__services-grid">
                  {(catalogs.servicios || []).map((service) => {
                    const icon = { Agua: dropletIcon, Gas: fireFlameSimpleIcon,
                      Luz: boltIcon, Estacionamiento: carIcon }[service.nombre];
                    const checked = form.services.includes(service.id);
                    return (
                      <label className={`propiedad-modal__service${checked ? " is-checked" : ""}${icon ? "" : " no-icon"}`} key={service.id}>
                        <input type="checkbox" checked={checked} onChange={() => toggleService(service.id)} />
                        <span className="propiedad-modal__fake-checkbox" aria-hidden="true" />
                        {icon && <img src={icon} alt="" />}
                        <span>{service.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : (
            <div className="propiedad-modal__documentation" role="tabpanel" aria-label="Documentación">
              <section className="propiedad-modal__card">
                <div className="propiedad-modal__card-heading">
                  <span>1</span>
                  <h3>Datos principales del contrato</h3>
                </div>
                <div className="propiedad-modal__card-body propiedad-modal__contract-grid">
                  <p className="propiedad-modal__contract-note">Estos datos se guardan como borrador de la propiedad hasta completar el contrato con sus participantes.</p>
                  <Campo label="Tipo">
                    <select className="propiedad-modal__plain-input" name="tipo" value={form.contract.tipo} onChange={changeContract}>
                      <option value="Alquiler">Alquiler</option>
                      <option value="Venta">Venta</option>
                    </select>
                  </Campo>
                  {form.contract.tipo === "Alquiler" && (
                    <>
                      <Campo label="Fecha inicio">
                        <input className="propiedad-modal__plain-input" type="date" name="fechaInicio" value={form.contract.fechaInicio} onChange={changeContract} />
                      </Campo>
                      <Campo label="Fecha fin">
                        <input className="propiedad-modal__plain-input" type="date" name="fechaFin" min={form.contract.fechaInicio || undefined} value={form.contract.fechaFin} onChange={changeContract} />
                      </Campo>
                      <Campo label="Meses de aumento">
                        <input className="propiedad-modal__plain-input" type="number" min="1" max="120" name="mesesAumento" value={form.contract.mesesAumento} onChange={changeContract} />
                      </Campo>
                      <Campo label="Estado">
                        <select className="propiedad-modal__plain-input" name="estado" value={form.contract.estado} onChange={changeContract}>
                          <option value="Borrador">Borrador</option>
                          <option value="Vigente">Activo</option>
                          <option value="Finalizado">Finalizado</option>
                        </select>
                      </Campo>
                      <Campo label="Monto inicial acordado">
                        <input className="propiedad-modal__plain-input" type="number" min="0" step="0.01" name="montoInicial" value={form.contract.montoInicial} onChange={changeContract} />
                      </Campo>
                      <Campo label="Tipo de aumento">
                        <select className="propiedad-modal__plain-input" name="tipoAumento" value={form.contract.tipoAumento} onChange={changeContract}>
                          <option value="">Sin aumento</option>
                          <option value="FIJO">Fijo</option>
                          <option value="INDEC">INDEC</option>
                        </select>
                      </Campo>
                      <Campo label="Aumento fijo">
                        <input className="propiedad-modal__plain-input" type="number" min="0" step="0.01" name="aumentoFijo"
                          value={form.contract.aumentoFijo} onChange={changeContract} disabled={form.contract.tipoAumento !== "FIJO"} />
                      </Campo>
                    </>
                  )}
                </div>
              </section>
              <section className="propiedad-modal__card propiedad-modal__card--documents">
                <div className="propiedad-modal__card-heading">
                  <span>2</span>
                  <h3>Documentación</h3>
                </div>
                <div className="propiedad-modal__card-body propiedad-modal__documents-body">
                  <div className="propiedad-modal__document-add-row">
                    <button className="propiedad-modal__add-document" type="button" onClick={() => documentInput.current?.click()}>
                      <img src={plusIcon} alt="" />
                      <span>Agregar archivo</span>
                    </button>
                    <Campo label="Nombre" className="propiedad-modal__document-name">
                      <input className="propiedad-modal__plain-input" maxLength={255} name="documentTitle"
                        value={form.documentTitle} onChange={change} placeholder="Contrato de alquiler" />
                    </Campo>
                  </div>
                  {form.documents.map((doc, index) => (
                    <div
                      className="propiedad-modal__document-row"
                      key={doc.id || `${doc.fileName}-${index}`}
                    >
                      <span title={doc.fileName}>{doc.fileName}</span>
                      <button
                        className="propiedad-modal__remove-document"
                        type="button"
                        aria-label={`Quitar documento ${index + 1}`}
                        onClick={() => setForm((current) => {
                          const documents = current.documents.filter((_, i) => i !== index);
                          return { ...current, documents,
                            ...(documents.length ? {} : { contractEnabled: false, contract: contratoVacio() }) };
                        })}
                      >
                        <img src={xIcon} alt="" />
                      </button>
                    </div>
                  ))}
                  <input
                    ref={documentInput}
                    className="propiedad-modal__hidden-input"
                    type="file"
                    accept="application/pdf"
                    onChange={addDocuments}
                  />
                </div>
              </section>
            </div>
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
