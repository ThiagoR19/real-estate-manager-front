import { useState } from "react";
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
import villaImage from "/ly-villa-costa-blanca-1_b02f5d33_900x900.jpg";
import terraceImage from "/images.jpg";
import houseImage from "/images (1).jpg";
import "./Property.css";

const galleryImages = [
  { src: villaImage, alt: "Casa moderna con jardín y piscina" },
  { src: terraceImage, alt: "Terraza exterior de la propiedad" },
  { src: houseImage, alt: "Casa familiar rodeada de árboles" },
];

const propertyDetails = [
  { label: "Tipo", value: "Casa", icon: houseIcon },
  { label: "Ubicación", value: "Av. Libertador 2450, Vicente López, buenos Aires", icon: locationIcon },
  { label: "Dueño / Propietario", value: "Martin Valdez", icon: userIcon },
  {
    label: "Agente asignado",
    value: "Martin Valdez",
    icon: userIcon,
    contact: { email: "lucia.m@gmail.com", phone: "11 2345- 6789" },
  },
  { label: "Ultima actualización", value: "28 de Abril de 2026", icon: clockIcon },
  { label: "Fecha de alta", value: "12 de Marzo de 2026", icon: calendarIcon },
];

const propertyStats = [
  { label: "Habitaciones", value: "10", icon: bedIcon },
  { label: "Antigüedad (años)", value: "5", icon: calendarIcon },
  { label: "Baños", value: "10", icon: bathIcon },
  { label: "Superficie (m²)", value: "120", icon: rulerIcon },
];

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
  const [actionsOpen, setActionsOpen] = useState(false);

  function changeImage(direction) {
    setActiveImage((current) => (current + direction + galleryImages.length) % galleryImages.length);
  }

  return (
    <main id="property">
      <div className="property__page">
        <header className="property__title-row">
          <h1>Propiedad Valdez</h1>
          <div className="property__actions">
            <button
              className="property__actions-button"
              type="button"
              aria-label="Más acciones"
              aria-expanded={actionsOpen}
              aria-haspopup="menu"
              onClick={() => setActionsOpen((open) => !open)}
            >
              <span aria-hidden="true">•••</span>
            </button>
            {actionsOpen && (
              <div className="property__actions-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => setActionsOpen(false)}>Editar propiedad</button>
                <button type="button" role="menuitem" onClick={() => setActionsOpen(false)}>Compartir ficha</button>
              </div>
            )}
          </div>
        </header>

        <div className="property__layout">
          <div className="property__left-column">
            <section className="property__gallery" aria-label="Galería de fotos de la propiedad">
              <div className="property__gallery-main">
                <img
                  className="property__gallery-main-image"
                  src={galleryImages[activeImage].src}
                  alt={galleryImages[activeImage].alt}
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
                  {activeImage + 1}/12
                </span>
              </div>

              <div className="property__gallery-thumbnails" role="list" aria-label="Seleccionar foto">
                {galleryImages.map((image, index) => (
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
              <p className="property__description">
                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using
                <br />
                Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using &apos;Content here, content here&apos;, making it look like
              </p>
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
    </main>
  );
}
