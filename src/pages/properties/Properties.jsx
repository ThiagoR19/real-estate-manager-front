import { useMemo, useState } from "react";
import {
  bathIcon,
  bedIcon,
  eyeIcon,
  houseIcon,
  locationDotIcon as locationIcon,
  plusIcon,
  rulerCombinedIcon as rulerIcon,
  tagIcon,
} from "../../assets/icons";
import PropertyModal from "../../components/property/PropertyModal";
import DropdownSelect from "../../components/select/DropdownSelect";
import Button from "../../components/button/Button";
import propertyImage from "/images (1).jpg";
import "./Properties.css";

const initialProperties = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  title: "Departamento en Belgrano",
  name: "Departamento en Belgrano",
  location: "Av. Cabildo 2450, CABA",
  neighborhood: "Belgrano",
  type: "Departamento",
  status: "Alquiler",
  bedrooms: 2,
  bathrooms: 2,
  area: 80,
  age: 5,
  description: "Departamento luminoso con excelente ubicación.",
  owner: "Juan Carlos",
  agent: "Lucía Martínez",
  services: { water: true, gas: true, electricity: true, parking: false },
  photos: [{ src: propertyImage, alt: "Interior de la propiedad" }],
  operation: "Alquiler",
  contractStatus: "Activo",
  documents: [{ name: "Contrato de alquiler", fileName: "" }],
}));

const filters = [
  { id: "type", label: "Tipo", icon: houseIcon, options: ["Todos", "Departamento", "Casa"] },
  { id: "location", label: "Ubicación", icon: locationIcon, options: ["Todas", "Belgrano", "Palermo"] },
  { id: "status", label: "Estado", icon: tagIcon, options: ["Todos", "Alquiler", "Venta"] },
];

function FilterSelect({ filter, value, onChange }) {
  return (
    <DropdownSelect
      label={filter.label}
      placeholder={filter.label}
      value={value}
      options={filter.options}
      onChange={onChange}
      icon={filter.icon}
      className="properties__filter"
      triggerClassName="properties__filter-trigger"
      iconClassName="properties__filter-icon"
      valueClassName="properties__filter-label"
      chevronClassName="properties__filter-chevron properties__icon"
    />
  );
}

function PropertyCard({ property, onEdit }) {
  return (
    <article className="properties__card">
      <img className="properties__card-image" src={propertyImage} alt="Interior de la propiedad" />
      <div className="properties__card-content">
        <h2 className="properties__card-title">{property.title}</h2>
        <p className="properties__card-location">
          <img className="properties__icon" src={locationIcon} alt="" aria-hidden="true" />
          <span>{property.location}</span>
        </p>

        <div className="properties__card-metrics" aria-label="Características de la propiedad">
          <span className="properties__metric">
            <img className="properties__icon" src={bedIcon} alt="" aria-hidden="true" />
            <span>{property.bedrooms}</span>
          </span>
          <span className="properties__metric">
            <img className="properties__icon" src={bathIcon} alt="" aria-hidden="true" />
            <span>{property.bathrooms}</span>
          </span>
          <span className="properties__metric">
            <img className="properties__icon" src={rulerIcon} alt="" aria-hidden="true" />
            <span>{property.area} m²</span>
          </span>
          <span className="properties__status">{property.status}</span>
        </div>

        <div className="properties__card-actions">
          <button className="properties__details-button" type="button">
            <img className="properties__icon" src={eyeIcon} alt="" aria-hidden="true" />
            <span>Ver detalle</span>
          </button>
          <button
            className="properties__more-button"
            type="button"
            aria-label={`Editar ${property.title}`}
            onClick={() => onEdit(property)}
          >
            <span aria-hidden="true">•••</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Properties() {
  const [properties, setProperties] = useState(initialProperties);
  const [selectedFilters, setSelectedFilters] = useState({
    type: "Todos",
    status: "Todos",
    location: "Todas",
  });
  const [modal, setModal] = useState({ isOpen: false, mode: "create", property: null });
  const [feedback, setFeedback] = useState("");

  function updateFilter(id, value) {
    setSelectedFilters((current) => ({ ...current, [id]: value }));
  }

  function openCreateModal() {
    setModal({ isOpen: true, mode: "create", property: null });
  }

  function openEditModal(property) {
    setModal({ isOpen: true, mode: "edit", property });
  }

  function closePropertyModal() {
    setModal((current) => ({ ...current, isOpen: false }));
  }

  function saveProperty(form) {
    const property = {
      ...form,
      title: form.name || "Propiedad sin nombre",
      neighborhood: form.location?.split(",")[1]?.trim() || "Sin zona",
      status: form.operation === "Alquiler" ? "Alquiler" : "Venta",
    };

    if (modal.mode === "edit") {
      setProperties((current) => current.map((item) => (
        item.id === modal.property.id ? { ...item, ...property } : item
      )));
      setFeedback(`Se actualizó ${property.title}.`);
    } else {
      setProperties((current) => [
        {
          ...property,
          id: Date.now(),
          title: property.title,
          name: property.name,
          location: property.location || "Ubicación pendiente",
          neighborhood: property.neighborhood || "Sin zona",
          type: property.type === "Tipo" ? "Propiedad" : property.type,
          status: property.status === "Operación" ? "Venta" : property.status,
        },
        ...current,
      ]);
      setFeedback(`Se agregó ${property.title} a la lista.`);
    }

    closePropertyModal();
    window.setTimeout(() => setFeedback(""), 2600);
  }

  const visibleProperties = useMemo(() => properties.filter((property) => (
    (selectedFilters.type === "Todos" || property.type === selectedFilters.type)
    && (selectedFilters.status === "Todos" || property.status === selectedFilters.status)
    && (selectedFilters.location === "Todas" || property.neighborhood === selectedFilters.location)
  )), [properties, selectedFilters]);

  return (
    <main id="properties">
      <section className="properties__top" aria-label="Encabezado y filtros de propiedades">
        <div className="properties__intro">
          <h1>Propiedades</h1>
          <p>Gestiona la información de todas las propiedades</p>
        </div>

        <div className="properties__toolbar" aria-label="Filtros de propiedades">
          {filters.map((filter) => (
            <FilterSelect
              key={filter.id}
              filter={filter}
              value={selectedFilters[filter.id]}
              onChange={(value) => updateFilter(filter.id, value)}
            />
          ))}
          <Button className="properties__new-button" onClick={openCreateModal} icon={plusIcon} text="Nueva Propiedad" />
        </div>
      </section>

      <section className="properties__grid" aria-label="Listado de propiedades">
        {visibleProperties.length > 0 ? (
          visibleProperties.map((property) => <PropertyCard key={property.id} property={property} onEdit={openEditModal} />)
        ) : (
          <p className="properties__empty">No hay propiedades que coincidan con los filtros seleccionados.</p>
        )}
      </section>

      <p className="properties__feedback" aria-live="polite">{feedback}</p>

      {modal.isOpen && (
        <PropertyModal
          isOpen={modal.isOpen}
          mode={modal.mode}
          property={modal.property}
          onClose={closePropertyModal}
          onSubmit={saveProperty}
        />
      )}
    </main>
  );
}
