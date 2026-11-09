import { useEffect, useRef, useState } from "react";
import { bathIcon, bedIcon, calendarIcon, fileLinesIcon, locationDotIcon, plusIcon, rulerCombinedIcon, xIcon } from "../../assets/icons";
import { Button } from "../index";
import "./PropertyModal.css";

function initialForm(property, catalogs) {
  return {
    name: property?.name || "",
    typeId: property?.typeId || catalogs.tipos[0]?.id || "",
    statusId: property?.statusId || catalogs.estados[0]?.id || "",
    agentId: property?.agentId || "",
    description: property?.description === "Sin descripción." ? "" : property?.description || "",
    location: property?.location === "Ubicación sin especificar" ? "" : property?.location || "",
    age: property?.age ?? 0, bedrooms: property?.bedrooms ?? 0,
    bathrooms: property?.bathrooms ?? 0, area: property?.area ?? "",
    price: property?.price ?? "", currency: property?.currency || "ARS",
    published: property?.published ?? false,
    photos: property?.photos || [], documents: property?.documents || [],
  };
}

function Field({ label, children, className = "" }) {
  return <label className={`property-modal__field ${className}`}><span className="property-modal__label">{label}</span>{children}</label>;
}

export default function PropertyModal({ isOpen, mode, property, catalogs, onClose, onSubmit }) {
  const [form, setForm] = useState(() => initialForm(property, catalogs));
  const [section, setSection] = useState("information");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const photoInput = useRef(null);
  const documentInput = useRef(null);
  const objectUrls = useRef([]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event) => { if (event.key === "Escape" && !saving) onClose(); };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [isOpen, onClose, saving]);

  useEffect(() => () => { for (const url of objectUrls.current) URL.revokeObjectURL(url); }, []);
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
    const documents = Array.from(event.target.files || []).map((file) => ({ file, fileName: file.name, name: file.name }));
    setForm((current) => ({ ...current, documents: [...current.documents, ...documents] }));
    event.target.value = "";
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.typeId || !form.statusId) {
      setSection("information");
      setError("Completá el nombre, tipo y estado comercial.");
      return;
    }
    setSaving(true);
    setError("");
    try { await onSubmit(form); }
    catch (cause) { setError(cause.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="property-modal__overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section className="property-modal" role="dialog" aria-modal="true" aria-labelledby="property-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="property-modal__header">
          <div><h2 id="property-modal-title">{mode === "edit" ? "Editar propiedad" : "Crear propiedad"}</h2><p>Los cambios se guardan en la inmobiliaria.</p></div>
          <div className="property-modal__tabs" role="tablist" aria-label="Secciones de la propiedad">
            <Button type="button" role="tab" aria-selected={section === "information"} className={section === "information" ? "is-active" : ""} onClick={() => setSection("information")}>Información</Button>
            <Button type="button" role="tab" aria-selected={section === "documentation"} className={section === "documentation" ? "is-active" : ""} onClick={() => setSection("documentation")}>Archivos</Button>
          </div>
        </header>
        <form onSubmit={submit}>
          {section === "information" ? (
            <div className="property-modal__information" role="tabpanel" aria-label="Información">
              <div className="property-modal__column property-modal__column--main">
                <section className="property-modal__card">
                  <div className="property-modal__card-heading"><span>1</span><h3>Datos principales</h3></div>
                  <div className="property-modal__card-body property-modal__main-fields">
                    <Field label="Nombre"><input className="property-modal__plain-input" name="name" value={form.name} onChange={change} maxLength={255} /></Field>
                    <Field label="Tipo"><select className="property-modal__plain-input" name="typeId" value={form.typeId} onChange={change}>{catalogs.tipos.map((type) => <option key={type.id} value={type.id}>{type.nombre}</option>)}</select></Field>
                    <Field label="Descripción" className="property-modal__field--full"><div className="property-modal__textarea-wrap"><textarea name="description" value={form.description} onChange={change} placeholder="Descripción de la propiedad" /><span>{form.description.length}</span></div></Field>
                    <Field label="Ubicación"><span className="property-modal__input-wrap"><img src={locationDotIcon} alt="" /><input name="location" value={form.location} onChange={change} maxLength={255} /></span></Field>
                    <Field label="Agente"><select className="property-modal__plain-input" name="agentId" value={form.agentId} onChange={change}><option value="">Sin asignar</option>{catalogs.agentes.map((agent) => <option key={agent.id} value={agent.id}>{agent.nombre}</option>)}</select></Field>
                  </div>
                </section>
                <section className="property-modal__card property-modal__card--photos">
                  <div className="property-modal__card-heading"><span>3</span><h3>Fotos de la propiedad</h3></div>
                  <div className="property-modal__photos-body"><div className="property-modal__photos-list">
                    {form.photos.map((photo, index) => <figure className="property-modal__photo" key={photo.id || photo.src}><img src={photo.src} alt={photo.alt} /><button type="button" aria-label={`Quitar foto ${index + 1}`} onClick={() => setForm((current) => ({ ...current, photos: current.photos.filter((_, i) => i !== index) }))}>×</button></figure>)}
                    <button className="property-modal__add-photo" type="button" onClick={() => photoInput.current?.click()}><img src={plusIcon} alt="" /><span>Agregar fotos</span></button>
                  </div><input ref={photoInput} className="property-modal__hidden-input" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} /></div>
                </section>
              </div>
              <div className="property-modal__column property-modal__column--side">
                <section className="property-modal__card">
                  <div className="property-modal__card-heading"><span>2</span><h3>Características</h3></div>
                  <div className="property-modal__card-body property-modal__feature-grid">
                    {[["Antigüedad", "age", calendarIcon], ["Habitaciones", "bedrooms", bedIcon], ["Superficie (m²)", "area", rulerCombinedIcon], ["Baños", "bathrooms", bathIcon]].map(([label, name, icon]) => <Field label={label} key={name}><span className="property-modal__input-wrap property-modal__input-wrap--counter"><img src={icon} alt="" /><input type="number" min="0" step={name === "area" ? "0.01" : "1"} name={name} value={form[name]} onChange={change} /></span></Field>)}
                  </div>
                </section>
                <section className="property-modal__card">
                  <div className="property-modal__card-heading"><span>4</span><h3>Comercialización</h3></div>
                  <div className="property-modal__card-body property-modal__feature-grid">
                    <Field label="Estado"><select className="property-modal__plain-input" name="statusId" value={form.statusId} onChange={change}>{catalogs.estados.map((status) => <option key={status.id} value={status.id}>{status.nombre}</option>)}</select></Field>
                    <Field label="Precio"><input className="property-modal__plain-input" type="number" min="0" step="0.01" name="price" value={form.price} onChange={change} /></Field>
                    <Field label="Moneda"><select className="property-modal__plain-input" name="currency" value={form.currency} onChange={change}><option value="ARS">ARS</option><option value="USD">USD</option></select></Field>
                    <Field label="Publicada"><input type="checkbox" name="published" checked={form.published} onChange={change} /></Field>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="property-modal__documentation" role="tabpanel" aria-label="Archivos">
              <section className="property-modal__card property-modal__card--documents">
                <div className="property-modal__card-heading"><span>1</span><h3>Documentación PDF</h3></div>
                <div className="property-modal__card-body property-modal__documents-body">
                  {form.documents.map((doc, index) => <div className="property-modal__document-row" key={doc.id || `${doc.fileName}-${index}`}><span>{doc.fileName}</span><button className="property-modal__remove-document" type="button" aria-label={`Quitar documento ${index + 1}`} onClick={() => setForm((current) => ({ ...current, documents: current.documents.filter((_, i) => i !== index) }))}><img src={xIcon} alt="" /></button></div>)}
                  <button className="property-modal__add-document" type="button" onClick={() => documentInput.current?.click()}><img src={fileLinesIcon} alt="" /><span>Agregar PDF</span></button>
                  <input ref={documentInput} className="property-modal__hidden-input" type="file" accept="application/pdf" multiple onChange={addDocuments} />
                </div>
              </section>
            </div>
          )}
          {error && <p className="property-modal__error" role="alert">{error}</p>}
          <footer className="property-modal__actions"><button className="property-modal__cancel" type="button" disabled={saving} onClick={onClose}>Cancelar</button><Button className="property-modal__submit" type="submit" disabled={saving} text={saving ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Crear propiedad"} /></footer>
        </form>
      </section>
    </div>
  );
}
