import { useEffect, useRef, useState } from "react";
import {
  angleDownIcon,
  bathIcon,
  bedIcon,
  boltIcon,
  calendarIcon,
  carIcon,
  dropletIcon,
  fileLinesIcon,
  fireIcon,
  houseIcon,
  locationDotIcon,
  plusIcon,
  rulerCombinedIcon,
  userIcon,
  xIcon,
} from "../../assets/icons";
import { DropdownSelect, Button } from '../index';
import propertyImage from "/images (1).jpg";
import terraceImage from "/images.jpg";
import villaImage from "/ly-villa-costa-blanca-1_b02f5d33_900x900.jpg";
import "./PropertyModal.css";

const propertyTypes = ["Tipo", "Casa", "Departamento", "Local", "Terreno"];
const agentOptions = ["Agente", "Juan Carlos", "Lucía Martínez", "Martín Valdez"];
const operationTypes = ["Operación", "Compra", "Alquiler"];
const contractStatuses = ["Estado", "Activo", "Finalizado", "Pendiente"];

const defaultPhotos = [
  { src: propertyImage, alt: "Foto de una propiedad moderna" },
  { src: terraceImage, alt: "Foto de una terraza" },
  { src: villaImage, alt: "Foto de una casa" },
];

const defaultServices = {
  water: false,
  gas: false,
  electricity: false,
  parking: false,
};

function getInitialForm(property) {
  return {
    name: property?.name || property?.title || "",
    type: property?.type || "Tipo",
    description: property?.description || "",
    location: property?.location || "",
    owner: property?.owner || "Juan Carlos",
    agent: property?.agent || "Agente",
    age: property?.age ?? 0,
    bedrooms: property?.bedrooms ?? 0,
    area: property?.area ?? 0,
    bathrooms: property?.bathrooms ?? 0,
    services: { ...defaultServices, ...property?.services },
    photos: property?.photos?.length ? property.photos : defaultPhotos,
    contractStart: property?.contractStart || "",
    contractEnd: property?.contractEnd || "",
    noticeMonths: property?.noticeMonths || "",
    operation: property?.operation || "Compra",
    contractStatus: property?.contractStatus || "Activo",
    agreedAmount: property?.agreedAmount || "",
    documents: property?.documents?.length ? property.documents : [{ name: "", fileName: "" }],
  };
}

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function Field({ children, className = "", label }) {
  return (
    <label className={joinClassNames("property-modal__field", className)}>
      <span className="property-modal__label">{label}</span>
      {children}
    </label>
  );
}

function InputWithIcon({ icon, ...props }) {
  return (
    <span className="property-modal__input-wrap">
      <img src={icon} alt="" aria-hidden="true" />
      <input {...props} />
    </span>
  );
}

function CounterField({ icon, ...props }) {
  return (
    <span className="property-modal__input-wrap property-modal__input-wrap--counter">
      <img src={icon} alt="" aria-hidden="true" />
      <input type="number" min="0" {...props} />
      <span className="property-modal__counter-arrows" aria-hidden="true">
        <img src={angleDownIcon} alt="" />
        <img src={angleDownIcon} alt="" />
      </span>
    </span>
  );
}

function ServiceOption({ checked, icon, label, onChange }) {
  return (
    <label className={joinClassNames("property-modal__service", checked && "is-checked")}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="property-modal__fake-checkbox" aria-hidden="true" />
      <img src={icon} alt="" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

export default function PropertyModal({ isOpen, mode, property, onClose, onSubmit }) {
  const [form, setForm] = useState(() => getInitialForm(property));
  const [activeSection, setActiveSection] = useState("information");
  const photoInputRef = useRef(null);
  const documentInputRefs = useRef([]);
  const isEditing = mode === "edit";

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function closeWithEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateService(service) {
    setForm((current) => ({
      ...current,
      services: { ...current.services, [service]: !current.services[service] },
    }));
  }

  function updatePhotoFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const newPhotos = files.map((file) => ({
      src: URL.createObjectURL(file),
      alt: file.name,
      fileName: file.name,
    }));
    setForm((current) => ({ ...current, photos: [...current.photos, ...newPhotos] }));
    event.target.value = "";
  }

  function removePhoto(index) {
    setForm((current) => ({ ...current, photos: current.photos.filter((_, photoIndex) => photoIndex !== index) }));
  }

  function updateDocument(index, field, value) {
    setForm((current) => ({
      ...current,
      documents: current.documents.map((document, documentIndex) => (
        documentIndex === index ? { ...document, [field]: value } : document
      )),
    }));
  }

  function updateDocumentFile(index, event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const documentName = file.name.replace(/\.[^/.]+$/, "");
    setForm((current) => ({
      ...current,
      documents: current.documents.map((document, documentIndex) => (
        documentIndex === index
          ? { ...document, fileName: file.name, name: document.name || documentName }
          : document
      )),
    }));
    event.target.value = "";
  }

  function addDocument() {
    setForm((current) => ({
      ...current,
      documents: [...current.documents, { name: "", fileName: "" }],
    }));
  }

  function removeDocument(index) {
    setForm((current) => ({
      ...current,
      documents: current.documents.length === 1
        ? [{ name: "", fileName: "" }]
        : current.documents.filter((_, documentIndex) => documentIndex !== index),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setActiveSection("information");
      return;
    }

    onSubmit({
      ...form,
      name: form.name.trim(),
      title: form.name.trim(),
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area) || 0,
      age: Number(form.age) || 0,
    });
  }

  const title = isEditing ? "Editar propiedad" : "Crear propiedad";
  const subtitle = isEditing
    ? "Actualiza la información y documentación de la propiedad"
    : "Completa la información para registrar una nueva propiedad";

  return (
    <div
      className="property-modal__overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="property-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="property-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="property-modal__header">
          <div>
            <h2 id="property-modal-title">{title}</h2>
            <p>{subtitle}</p>
          </div>

          <div className="property-modal__tabs" role="tablist" aria-label="Secciones de la propiedad">
            <Button
              className={activeSection === "information" ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeSection === "information"}
              onClick={() => setActiveSection("information")}
            >
              Información
            </Button>
            <Button
              className={activeSection === "documentation" ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeSection === "documentation"}
              onClick={() => setActiveSection("documentation")}
            >
              Documentación
            </Button>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          {activeSection === "information" ? (
            <div className="property-modal__information" role="tabpanel" aria-label="Información">
              <div className="property-modal__column property-modal__column--main">
                <section className="property-modal__card property-modal__card--main" aria-labelledby="property-main-title">
                  <div className="property-modal__card-heading">
                    <span>1</span>
                    <h3 id="property-main-title">Datos principales</h3>
                  </div>
                  <div className="property-modal__card-body property-modal__main-fields">
                    <Field label="Nombre">
                      <input
                        className="property-modal__plain-input"
                        name="name"
                        value={form.name}
                        onChange={updateField}
                        placeholder="Departamento en Río Grande..."
                        required
                      />
                    </Field>
                    <Field label="Tipo">
                      <DropdownSelect
                        label="Tipo de propiedad"
                        value={form.type}
                        options={propertyTypes}
                        onChange={(type) => setForm((current) => ({ ...current, type }))}
                        icon={houseIcon}
                        className="property-modal__select"
                        triggerClassName="property-modal__select-trigger"
                        iconClassName="property-modal__select-icon"
                        valueClassName="property-modal__select-value"
                        chevronClassName="property-modal__select-chevron"
                        optionsClassName="property-modal__select-options"
                      />
                    </Field>
                    <Field label="Descripción" className="property-modal__field--full">
                      <div className="property-modal__textarea-wrap">
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={updateField}
                          placeholder="Ingrese una descripción de la propiedad..."
                          maxLength={500}
                        />
                        <span>{form.description.length}/500</span>
                      </div>
                    </Field>
                    <Field label="Ubicación">
                      <InputWithIcon
                        icon={locationDotIcon}
                        name="location"
                        value={form.location}
                        onChange={updateField}
                        placeholder="Ubicación"
                      />
                    </Field>
                    <Field label="Dueño / Propietario">
                      <InputWithIcon
                        icon={userIcon}
                        name="owner"
                        value={form.owner}
                        onChange={updateField}
                        placeholder="Nombre del propietario"
                      />
                    </Field>
                    <Field label="Agente">
                      <DropdownSelect
                        label="Agente asignado"
                        value={form.agent}
                        options={agentOptions}
                        onChange={(agent) => setForm((current) => ({ ...current, agent }))}
                        icon={userIcon}
                        className="property-modal__select"
                        triggerClassName="property-modal__select-trigger"
                        iconClassName="property-modal__select-icon"
                        valueClassName="property-modal__select-value"
                        chevronClassName="property-modal__select-chevron"
                        optionsClassName="property-modal__select-options"
                      />
                    </Field>
                  </div>
                </section>

                <section className="property-modal__card property-modal__card--photos" aria-labelledby="property-photos-title">
                  <div className="property-modal__card-heading">
                    <span>4</span>
                    <h3 id="property-photos-title">Fotos de la propiedad</h3>
                  </div>
                  <div className="property-modal__photos-body">
                    <div className="property-modal__photos-list">
                      {form.photos.map((photo, index) => (
                        <figure className="property-modal__photo" key={`${photo.src}-${index}`}>
                          <img src={photo.src} alt={photo.alt || "Foto de la propiedad"} />
                          <button type="button" aria-label={`Quitar foto ${index + 1}`} onClick={() => removePhoto(index)}>×</button>
                        </figure>
                      ))}
                      <button className="property-modal__add-photo" type="button" onClick={() => photoInputRef.current?.click()}>
                        <img src={plusIcon} alt="" aria-hidden="true" />
                        <span>Agregar fotos</span>
                      </button>
                    </div>
                    <input ref={photoInputRef} className="property-modal__hidden-input" type="file" accept="image/*" multiple onChange={updatePhotoFiles} />
                    <div className="property-modal__photos-scroll" aria-hidden="true"><span /></div>
                  </div>
                </section>
              </div>

              <div className="property-modal__column property-modal__column--side">
                <section className="property-modal__card" aria-labelledby="property-features-title">
                  <div className="property-modal__card-heading">
                    <span>2</span>
                    <h3 id="property-features-title">Características</h3>
                  </div>
                  <div className="property-modal__card-body property-modal__feature-grid">
                    <Field label="Antigüedad">
                      <CounterField icon={calendarIcon} name="age" value={form.age} onChange={updateField} />
                    </Field>
                    <Field label="Habitaciones">
                      <CounterField icon={bedIcon} name="bedrooms" value={form.bedrooms} onChange={updateField} />
                    </Field>
                    <Field label="Superficie (m²)">
                      <CounterField icon={rulerCombinedIcon} name="area" value={form.area} onChange={updateField} />
                    </Field>
                    <Field label="Baños">
                      <CounterField icon={bathIcon} name="bathrooms" value={form.bathrooms} onChange={updateField} />
                    </Field>
                  </div>
                </section>

                <section className="property-modal__card property-modal__card--services" aria-labelledby="property-services-title">
                  <div className="property-modal__card-heading">
                    <span>3</span>
                    <h3 id="property-services-title">Servicios</h3>
                  </div>
                  <div className="property-modal__card-body property-modal__services-grid">
                    <ServiceOption checked={form.services.water} icon={dropletIcon} label="Agua" onChange={() => updateService("water")} />
                    <ServiceOption checked={form.services.gas} icon={fireIcon} label="Gas" onChange={() => updateService("gas")} />
                    <ServiceOption checked={form.services.electricity} icon={boltIcon} label="Luz" onChange={() => updateService("electricity")} />
                    <ServiceOption checked={form.services.parking} icon={carIcon} label="Estacionamiento" onChange={() => updateService("parking")} />
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="property-modal__documentation" role="tabpanel" aria-label="Documentación">
              <section className="property-modal__card" aria-labelledby="property-contract-title">
                <div className="property-modal__card-heading">
                  <span>1</span>
                  <h3 id="property-contract-title">Datos principales del contrato</h3>
                </div>
                <div className="property-modal__card-body property-modal__contract-grid">
                  <Field label="Fecha inicio">
                    <input className="property-modal__plain-input" name="contractStart" value={form.contractStart} onChange={updateField} placeholder="02/03/25" />
                  </Field>
                  <Field label="Fecha fin">
                    <input className="property-modal__plain-input" name="contractEnd" value={form.contractEnd} onChange={updateField} placeholder="02/03/25" />
                  </Field>
                  <Field label="Meses de aviso">
                    <input className="property-modal__plain-input" name="noticeMonths" type="number" min="0" value={form.noticeMonths} onChange={updateField} placeholder="12" />
                  </Field>
                  <Field label="Tipo">
                    <DropdownSelect
                      label="Tipo de operación"
                      value={form.operation}
                      options={operationTypes}
                      onChange={(operation) => setForm((current) => ({ ...current, operation }))}
                      className="property-modal__select"
                      triggerClassName="property-modal__select-trigger"
                      valueClassName="property-modal__select-value"
                      chevronClassName="property-modal__select-chevron"
                      optionsClassName="property-modal__select-options"
                    />
                  </Field>
                  <Field label="Estado">
                    <DropdownSelect
                      label="Estado del contrato"
                      value={form.contractStatus}
                      options={contractStatuses}
                      onChange={(contractStatus) => setForm((current) => ({ ...current, contractStatus }))}
                      className="property-modal__select"
                      triggerClassName="property-modal__select-trigger"
                      valueClassName="property-modal__select-value"
                      chevronClassName="property-modal__select-chevron"
                      optionsClassName="property-modal__select-options"
                    />
                  </Field>
                  <Field label="Monto acordado">
                    <input className="property-modal__plain-input" name="agreedAmount" type="number" min="0" value={form.agreedAmount} onChange={updateField} placeholder="123123" />
                  </Field>
                </div>
              </section>

              <section className="property-modal__card property-modal__card--documents" aria-labelledby="property-documents-title">
                <div className="property-modal__card-heading">
                  <span>2</span>
                  <h3 id="property-documents-title">Documentación</h3>
                </div>
                <div className="property-modal__card-body property-modal__documents-body">
                  {form.documents.map((document, index) => (
                    <div className="property-modal__document-row" key={`${document.fileName}-${index}`}>
                      <button className="property-modal__file-picker" type="button" onClick={() => documentInputRefs.current[index]?.click()}>
                        <img src={plusIcon} alt="" aria-hidden="true" />
                        <span>{document.fileName || "Agregar archivo"}</span>
                      </button>
                      <input
                        ref={(element) => { documentInputRefs.current[index] = element; }}
                        className="property-modal__hidden-input"
                        type="file"
                        onChange={(event) => updateDocumentFile(index, event)}
                      />
                      <Field label="Nombre" className="property-modal__document-name">
                        <input className="property-modal__plain-input" value={document.name} onChange={(event) => updateDocument(index, "name", event.target.value)} placeholder="Contrato de alquiler" />
                      </Field>
                      <button className="property-modal__remove-document" type="button" aria-label={`Quitar documento ${index + 1}`} onClick={() => removeDocument(index)}>
                        <img src={xIcon} alt="" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  <button className="property-modal__add-document" type="button" onClick={addDocument}>
                    <img src={fileLinesIcon} alt="" aria-hidden="true" />
                    <span>Agregar otro documento</span>
                  </button>
                </div>
              </section>
            </div>
          )}

          <footer className="property-modal__actions">
            <button className="property-modal__cancel" type="button" onClick={onClose}>Cancelar</button>
            <Button className="property-modal__submit" type="submit" text={isEditing ? "Guardar cambios" : "Crear propiedad"} />
          </footer>
        </form>
      </section>
    </div>
  );
}
