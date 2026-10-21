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
import DropdownSelect from "../../components/select/DropdownSelect";
import propertyImage from "/images (1).jpg";
import "./Properties.css";

const properties = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  title: "Departamento en Belgrano",
  location: "Av. Cabildo 2450, CABA",
  neighborhood: "Belgrano",
  type: "Departamento",
  status: "Alquiler",
  bedrooms: 2,
  bathrooms: 2,
  area: 80,
}));

const filters = [
  { id: "type", label: "Tipo", icon: houseIcon, options: ["Todos", "Departamento", "Casa"] },
  { id: "status", label: "Estado", icon: tagIcon, options: ["Todos", "Alquiler", "Venta"] },
  { id: "location", label: "Ubicación", icon: locationIcon, options: ["Todas", "Belgrano", "Palermo"] },
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

function PropertyCard({ property }) {
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
          <button className="properties__more-button" type="button" aria-label={`Más opciones para ${property.title}`}>
            <span aria-hidden="true">•••</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Properties() {
  const [selectedFilters, setSelectedFilters] = useState({
    type: "Todos",
    status: "Todos",
    location: "Todas",
  });

  function updateFilter(id, value) {
    setSelectedFilters((current) => ({ ...current, [id]: value }));
  }

  const visibleProperties = useMemo(() => properties.filter((property) => (
    (selectedFilters.type === "Todos" || property.type === selectedFilters.type)
    && (selectedFilters.status === "Todos" || property.status === selectedFilters.status)
    && (selectedFilters.location === "Todas" || property.neighborhood === selectedFilters.location)
  )), [selectedFilters]);

  return (
    <main id="properties">
      <section className="properties__toolbar" aria-label="Filtros de propiedades">
        {filters.map((filter) => (
          <FilterSelect
            key={filter.id}
            filter={filter}
            value={selectedFilters[filter.id]}
            onChange={(value) => updateFilter(filter.id, value)}
          />
        ))}
        <button className="properties__new-button" type="button">
          <img className="properties__new-button-icon" src={plusIcon} alt="" aria-hidden="true" />
          <span>Nueva Propiedad</span>
        </button>
      </section>

      <section className="properties__grid" aria-label="Listado de propiedades">
        {visibleProperties.length > 0 ? (
          visibleProperties.map((property) => <PropertyCard key={property.id} property={property} />)
        ) : (
          <p className="properties__empty">No hay propiedades que coincidan con los filtros seleccionados.</p>
        )}
      </section>
    </main>
  );
}
