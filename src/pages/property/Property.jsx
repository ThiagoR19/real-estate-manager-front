import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  bathIcon,
  bedIcon,
  calendarIcon,
  cameraIcon,
  clockIcon,
  envelopeIcon,
  houseIcon,
  locationDotIcon as locationIcon,
  phoneIcon,
  rulerCombinedIcon as rulerIcon,
  userIcon,
} from "../../assets/icons";
import PropertyModal from "../../components/property/PropertyModal";
import PropertyActions from "../../components/property/PropertyActions";
import ConfirmDeleteModal from "../../components/confirmDelete/ConfirmDeleteModal";
import villaImage from "/ly-villa-costa-blanca-1_b02f5d33_900x900.jpg";
import terraceImage from "/images.jpg";
import houseImage from "/images (1).jpg";
import "./Property.css";

const galleryImages = [
  { src: villaImage, alt: "Casa moderna con jardín y piscina" },
  { src: terraceImage, alt: "Terraza exterior de la propiedad" },
  { src: houseImage, alt: "Casa familiar rodeada de árboles" },
];

const initialProperty = {
  name: "Propiedad Valdez",
  type: "Casa",
  location: "Av. Libertador 2450, Vicente López, buenos Aires",
  owner: "Martin Valdez",
  agent: "Martin Valdez",
  age: 5,
  bedrooms: 10,
  bathrooms: 10,
  area: 120,
  description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
  photos: galleryImages,
  services: { water: true, gas: true, electricity: true, parking: true },
  operation: "Compra",
  contractStatus: "Activo",
  documents: [{ name: "Contrato de alquiler", fileName: "" }],
};

const dueDates = [
  { name: "Expensas", date: "Abril 2024" },
  { name: "Expensas", date: "Abril 2024" },
  { name: "Expensas", date: "Abril 2024" },
  { name: "Expensas", date: "Abril 2024" },
];

function Icon({ src, className = "" }) {
  return <img className={`property__icon ${className}`} src={src} alt="" aria-hidden="true" />;
}

function DetailRow({ detail }) {
  return (
    <div className="property__detail-row">
      <Icon src={detail.icon} className="property__detail-icon" />
      <strong>{detail.label}</strong>
      <span className="property__detail-value">{detail.value}</span>
      {detail.contact && (
        <div className="property__detail-contact">
          <span>
            <Icon src={envelopeIcon} />
            {detail.contact.email}
          </span>
          <span>
            <Icon src={phoneIcon} />
            {detail.contact.phone}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Property() {
  const [activeImage, setActiveImage] = useState(0);
  const [deleted, setDeleted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const thumbnailsRef = useRef(null);
  const [propertyData, setPropertyData] = useState(initialProperty);
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const currentGalleryImages = propertyData.photos?.length ? propertyData.photos : galleryImages;
  const safeActiveImage = Math.min(activeImage, currentGalleryImages.length - 1);

  useEffect(() => {
    const track = thumbnailsRef.current;
    const thumbnail = track?.children[safeActiveImage];
    if (!thumbnail) return;
    track.scrollTo({ left: thumbnail.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, [safeActiveImage]);

  const propertyDetails = [
    { label: "Tipo", value: propertyData.type, icon: houseIcon },
    { label: "Ubicación", value: propertyData.location, icon: locationIcon },
    { label: "Dueño / Propietario", value: propertyData.owner, icon: userIcon },
    {
      label: "Agente asignado",
      value: propertyData.agent,
      icon: userIcon,
      contact: { email: "lucia.m@gmail.com", phone: "11 2345- 6789" },
    },
    { label: "Ultima actualización", value: "28 de Abril de 2026", icon: clockIcon },
    { label: "Fecha de alta", value: "12 de Marzo de 2026", icon: calendarIcon },
  ];

  const propertyStats = [
    { label: "Habitaciones", value: propertyData.bedrooms, icon: bedIcon },
    { label: "Antigüedad (años)", value: propertyData.age, icon: calendarIcon },
    { label: "Baños", value: propertyData.bathrooms, icon: bathIcon },
    { label: "Superficie (m²)", value: propertyData.area, icon: rulerIcon },
  ];

  function changeImage(direction) {
    setActiveImage((current) => (current + direction + currentGalleryImages.length) % currentGalleryImages.length);
  }

  function saveProperty(form) {
    setPropertyData((current) => ({ ...current, ...form, name: form.name || current.name }));
    setActiveImage(0);
    setPropertyModalOpen(false);
  }

  if (deleted) return <main id="property"><div className="property__page"><h1>Propiedad eliminada</h1><Link href="/properties">Volver a propiedades</Link></div></main>;

  return (
    <main id="property">
      <div className="property__page">
        <header className="property__title-row">
          <h1>{propertyData.name}</h1>
          <PropertyActions className="property-actions--header" name={propertyData.name} onEdit={() => setPropertyModalOpen(true)} onDelete={() => setDeleteModalOpen(true)} />
        </header>

        <div className="property__layout">
          <div className="property__left-column">
            <section className="property__gallery" aria-label="Galería de fotos de la propiedad">
              <div className="property__gallery-main">
                <img
                  className="property__gallery-main-image"
                  src={currentGalleryImages[safeActiveImage].src}
                  alt={currentGalleryImages[safeActiveImage].alt}
                />
                <button
                  className="property__gallery-arrow property__gallery-arrow--previous"
                  type="button"
                  aria-label="Imagen anterior"
                  onClick={() => changeImage(-1)}
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <button
                  className="property__gallery-arrow property__gallery-arrow--next"
                  type="button"
                  aria-label="Imagen siguiente"
                  onClick={() => changeImage(1)}
                >
                  <span aria-hidden="true">›</span>
                </button>
                <span className="property__gallery-counter">
                  <Icon src={cameraIcon} />
                  {safeActiveImage + 1}/{currentGalleryImages.length}
                </span>
              </div>

              <div ref={thumbnailsRef} className="property__gallery-thumbnails" role="list" aria-label="Seleccionar foto">
                {currentGalleryImages.map((image, index) => (
                  <button
                    className={`property__thumbnail${activeImage === index ? " is-active" : ""}`}
                    key={image.src}
                    type="button"
                    role="listitem"
                    aria-label={`Ver foto ${index + 1}`}
                    aria-current={activeImage === index ? "true" : undefined}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={image.src} alt="" />
                  </button>
                ))}
              </div>
            </section>

            <section className="property__stats" aria-label="Características principales">
              {propertyStats.map((stat) => (
                <article className="property__stat-card" key={stat.label}>
                  <span className="property__stat-icon-wrap">
                    <Icon src={stat.icon} className="property__stat-icon" />
                  </span>
                  <strong>{stat.label}</strong>
                  <span className="property__stat-value">{stat.value}</span>
                </article>
              ))}
            </section>
          </div>

          <div className="property__right-column">
            <section className="property__info-card" aria-labelledby="property-description-title">
              <h2 id="property-description-title">Descripción</h2>
              <p className="property__description">{propertyData.description}</p>
              <div className="property__details">
                {propertyDetails.map((detail) => <DetailRow detail={detail} key={detail.label} />)}
              </div>
            </section>

            <section className="property__due-card" aria-labelledby="property-due-title">
              <h2 id="property-due-title"><Icon src={calendarIcon} />Vencimientos</h2>
              <div className="property__due-grid">
                {dueDates.map((dueDate, index) => (
                  <article className="property__due-item" key={`${dueDate.name}-${index}`}>
                    <div>
                      <strong>{dueDate.name}</strong>
                      <span>{dueDate.date}</span>
                    </div>
                    <span className="property__due-badge">Vence en 5 días</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={() => { setDeleteModalOpen(false); setDeleted(true); }} title="¿Seguro que desea eliminar esta propiedad?" />

      {propertyModalOpen && (
        <PropertyModal
          isOpen={propertyModalOpen}
          mode="edit"
          property={propertyData}
          onClose={() => setPropertyModalOpen(false)}
          onSubmit={saveProperty}
        />
      )}
    </main>
  );
}
