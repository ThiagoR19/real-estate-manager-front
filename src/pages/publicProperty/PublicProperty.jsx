import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  bathIcon,
  bedIcon,
  cameraIcon,
  calendarIcon,
  houseIcon,
  locationDotIcon as locationIcon,
  rulerCombinedIcon as rulerIcon,
  userIcon,
  whatsappIcon,
  angleDownIcon,
} from "../../assets/icons";
import { Footer, Icon } from "../../components";
import propertyImage from "../../assets/fondoCasa.png";
import kaikenLogo from "../../assets/icons/kaiken.svg";
import "./PublicProperty.css";

const galleryImages = [
  { src: propertyImage, alt: "Vista exterior de la propiedad Valdez" },
  { src: propertyImage, alt: "Vista exterior de la propiedad Valdez" },
  { src: propertyImage, alt: "Vista exterior de la propiedad Valdez" },
];

const details = [
  { label: "Tipo", value: "Casa", icon: houseIcon },
  {
    label: "Ubicación",
    value: "Av. Libertador 2450, Vicente López, buenos Aires",
    icon: locationIcon,
  },
  { label: "Dueño / Propietario", value: "Martin Valdez", icon: userIcon },
  { label: "Agente asignado", value: "Martin Valdez", icon: userIcon },
];

const stats = [
  { label: "Habitaciones", value: "10", icon: bedIcon },
  { label: "Antigüedad (años)", value: "5", icon: calendarIcon },
  { label: "Baños", value: "10", icon: bathIcon },
  { label: "Superficie (m²)", value: "120", icon: rulerIcon },
];

function Brand() {
  return (
    <Link href="/home" className="public-property__brand" aria-label="Kaiken Propiedades, inicio">
      <img src={kaikenLogo} alt="Kaiken Propiedades" />
    </Link>
  );
}

function PublicHeader() {
  return (
    <header className="public-property__header">
      <Brand />
      <nav className="public-property__nav" aria-label="Navegación pública">
        <Link href="/home">Inicio</Link>
        <Link className="is-active" href="/public-properties?filter=buy">
          Comprar
        </Link>
        <Link href="/public-properties?filter=rent">Alquilar</Link>
        <Link href="/about-us">Nosotros</Link>
        <Link href="/home#contacto">Contacto</Link>
      </nav>
      <div className="public-property__header-actions">
        <label className="public-property__quick-search">
          <span className="sr-only">Buscar por zona</span>
          <input placeholder="Buscar por zona" />
          <Icon name="search" />
        </label>
        <Link className="public-property__login" href="/login">
          Ingresar
        </Link>
      </div>
    </header>
  );
}

function PropertyIcon({ src, className = "" }) {
  return (
    <img className={`public-property__icon ${className}`} src={src} alt="" aria-hidden="true" />
  );
}

export default function PublicProperty() {
  const [activeImage, setActiveImage] = useState(0);
  const [contactMessage, setContactMessage] = useState("");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Propiedad Valdez | Kaiken Propiedades";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  function changeImage(direction) {
    setActiveImage(
      (current) => (current + direction + galleryImages.length) % galleryImages.length,
    );
  }

  function contactAgent() {
    setContactMessage("Un asesor se pondrá en contacto con vos.");
    window.setTimeout(() => setContactMessage(""), 3000);
  }

  return (
    <main className="public-property">
      <PublicHeader />
      <div className="public-property__page">
        <h1>Propiedad Valdez</h1>

        <div className="public-property__layout">
          <div className="public-property__gallery-column">
            <section
              className="public-property__gallery"
              aria-label="Galería de fotos de la propiedad"
            >
              <div className="public-property__gallery-main">
                <img src={galleryImages[activeImage].src} alt={galleryImages[activeImage].alt} />
                <button
                  className="public-property__gallery-arrow public-property__gallery-arrow--previous"
                  type="button"
                  aria-label="Imagen anterior"
                  onClick={() => changeImage(-1)}
                >
                  <img className="izquierda" src={angleDownIcon} alt="" />
                </button>
                <button
                  className="public-property__gallery-arrow public-property__gallery-arrow--next"
                  type="button"
                  aria-label="Imagen siguiente"
                  onClick={() => changeImage(1)}
                >
                  <img className="derecha" src={angleDownIcon} alt="" />
                </button>
                <span className="public-property__gallery-counter">
                  <PropertyIcon src={cameraIcon} />
                  {activeImage + 1}/{galleryImages.length}
                </span>
              </div>
              <div
                className="public-property__thumbnails"
                role="list"
                aria-label="Seleccionar foto"
              >
                {galleryImages.map((image, index) => (
                  <button
                    className={`public-property__thumbnail${activeImage === index ? " is-active" : ""}`}
                    type="button"
                    role="listitem"
                    aria-label={`Ver foto ${index + 1}`}
                    aria-current={activeImage === index ? "true" : undefined}
                    key={`${image.src}-${index}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={image.src} alt="" />
                  </button>
                ))}
              </div>
            </section>

            <section className="public-property__stats" aria-label="Características principales">
              {stats.map((stat) => (
                <article className="public-property__stat-card" key={stat.label}>
                  <span className="public-property__stat-icon-wrap">
                    <PropertyIcon src={stat.icon} />
                  </span>
                  <strong>{stat.label}</strong>
                  <span className="public-property__stat-value">{stat.value}</span>
                </article>
              ))}
            </section>
          </div>

          <section
            className="public-property__info-card"
            aria-labelledby="public-property-description"
          >
            <div className="public-property__info-heading">
              <strong>USD 10.00</strong>
              <small>Casa · Alquiler</small>
              <button type="button" onClick={contactAgent}>
                Alquiler / Venta
              </button>
            </div>
            <h2 id="public-property-description">Descripción</h2>
            <p className="public-property__description">
              It is a long established fact that a reader will be distracted by the readable content
              of a page when looking at its layout. The point of using Lorem Ipsum is that it has a
              more-or-less normal distribution of letters, as opposed to using &quot;Content here,
              content here&quot;, making it look like
            </p>
            <div className="public-property__details">
              {details.map((detail) => (
                <div className="public-property__detail-row" key={detail.label}>
                  <PropertyIcon src={detail.icon} />
                  <strong>{detail.label}</strong>
                  <span>{detail.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <button className="public-property__contact" type="button" onClick={contactAgent}>
          <img src={whatsappIcon} alt="" />
          Contactar
        </button>
        <p className="public-property__contact-message" role="status" aria-live="polite">
          {contactMessage}
        </p>
      </div>
      <Footer />
    </main>
  );
}
