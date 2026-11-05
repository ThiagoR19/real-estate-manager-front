import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  houseIcon,
  locationDotIcon as locationIcon,
  plusIcon,
  tagIcon,
} from "../../assets/icons";
import { PropertyModal, ConfirmDeleteModal, DropdownSelect, Button, PropertyCardSimple } from "../../components";
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

export default function Properties() {
  const [, navigate] = useLocation();
  const [properties, setProperties] = useState(initialProperties);
  const [selectedFilters, setSelectedFilters] = useState({
    type: "Todos",
    status: "Todos",
    location: "Todas",
  });
  const [modal, setModal] = useState({ isOpen: false, mode: "create", property: null });
  const [feedback, setFeedback] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  function updateFilter(id, value) {
    setSelectedFilters((current) => ({ ...current, [id]: value }));
  }

  function openCreateModal() {
    setModal({ isOpen: true, mode: "create", property: null });
  }

  function openEditModal(property) {
    setModal({ isOpen: true, mode: "edit", property });
  }

  function openProperty() {
    navigate("/property");
  }

  function closePropertyModal() {
    setModal((current) => ({ ...current, isOpen: false }));
  }

  function deleteProperty(property) {
    setProperties((current) => current.filter((item) => item.id !== property.id));
    setFeedback(`Se eliminó ${property.title}.`);
    setPendingDelete(null);
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
          visibleProperties.map((property) => <PropertyCardSimple key={property.id} property={property} onEdit={openEditModal} onDelete={setPendingDelete} onOpen={openProperty} />)
        ) : (
          <p className="properties__empty">No hay propiedades que coincidan con los filtros seleccionados.</p>
        )}
      </section>

      <p className="properties__feedback" aria-live="polite">{feedback}</p>

      <ConfirmDeleteModal isOpen={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} onConfirm={() => deleteProperty(pendingDelete)} title="¿Seguro que desea eliminar esta propiedad?" />

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
