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
import { Footer, Icono } from "../../components";
import propertyImage from "../../assets/fondoCasa.png";
import kaikenLogo from "../../assets/icons/kaiken.svg";
import "./PropiedadPublica.css";

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

function Marca() {
  return (
    <Link href="/inicio" className="propiedad-publica__brand" aria-label="Kaiken Propiedades, inicio">
      <img src={kaikenLogo} alt="Kaiken Propiedades" />
    </Link>
  );
}

function EncabezadoPublico() {
  return (
    <header className="propiedad-publica__header">
      <Marca />
      <nav className="propiedad-publica__nav" aria-label="Navegación pública">
        <Link href="/inicio">Inicio</Link>
        <Link className="is-active" href="/propiedades-publicas?filter=buy">
          Comprar
        </Link>
        <Link href="/propiedades-publicas?filter=rent">Alquilar</Link>
        <Link href="/inicio#contacto">Contacto</Link>
      </nav>
      <div className="propiedad-publica__header-actions">
        <label className="propiedad-publica__quick-search">
          <span className="sr-only">Buscar por zona</span>
          <input placeholder="Buscar por zona" />
          <Icono name="search" />
        </label>
        <Link className="propiedad-publica__login" href="/login">
          Ingresar
        </Link>
      </div>
    </header>
  );
}

function IconoPropiedad({ src, className = "" }) {
  return (
    <img className={`propiedad-publica__icon ${className}`} src={src} alt="" aria-hidden="true" />
  );
}

export default function PropiedadPublica() {
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
    <main className="propiedad-publica">
      <EncabezadoPublico />
      <div className="propiedad-publica__page">
        <h1>Propiedad Valdez</h1>

        <div className="propiedad-publica__layout">
          <div className="propiedad-publica__gallery-column">
            <section
              className="propiedad-publica__gallery"
              aria-label="Galería de fotos de la propiedad"
            >
              <div className="propiedad-publica__gallery-main">
                <img src={galleryImages[activeImage].src} alt={galleryImages[activeImage].alt} />
                <button
                  className="propiedad-publica__gallery-arrow propiedad-publica__gallery-arrow--previous"
                  type="button"
                  aria-label="Imagen anterior"
                  onClick={() => changeImage(-1)}
                >
                  <img className="izquierda" src={angleDownIcon} alt="" />
                </button>
                <button
                  className="propiedad-publica__gallery-arrow propiedad-publica__gallery-arrow--next"
                  type="button"
                  aria-label="Imagen siguiente"
                  onClick={() => changeImage(1)}
                >
                  <img className="derecha" src={angleDownIcon} alt="" />
                </button>
                <span className="propiedad-publica__gallery-counter">
                  <IconoPropiedad src={cameraIcon} />
                  {activeImage + 1}/{galleryImages.length}
                </span>
              </div>
              <div
                className="propiedad-publica__thumbnails"
                role="list"
                aria-label="Seleccionar foto"
              >
                {galleryImages.map((image, index) => (
                  <button
                    className={`propiedad-publica__thumbnail${activeImage === index ? " is-active" : ""}`}
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

            <section className="propiedad-publica__stats" aria-label="Características principales">
              {stats.map((stat) => (
                <article className="propiedad-publica__stat-card" key={stat.label}>
                  <span className="propiedad-publica__stat-icon-wrap">
                    <IconoPropiedad src={stat.icon} />
                  </span>
                  <strong>{stat.label}</strong>
                  <span className="propiedad-publica__stat-value">{stat.value}</span>
                </article>
              ))}
            </section>
          </div>

          <section
            className="propiedad-publica__info-card"
            aria-labelledby="propiedad-publica-description"
          >
            <div className="propiedad-publica__info-heading">
              <strong>USD 10.00</strong>
              <small>Casa · Alquiler</small>
              <button type="button" onClick={contactAgent}>
                Alquiler / Venta
              </button>
            </div>
            <h2 id="propiedad-publica-description">Descripción</h2>
            <p className="propiedad-publica__description">
              It is a long established fact that a reader will be distracted by the readable content
              of a page when looking at its layout. The point of using Lorem Ipsum is that it has a
              more-or-less normal distribution of letters, as opposed to using &quot;Content here,
              content here&quot;, making it look like
            </p>
            <div className="propiedad-publica__details">
              {details.map((detail) => (
                <div className="propiedad-publica__detail-row" key={detail.label}>
                  <IconoPropiedad src={detail.icon} />
                  <strong>{detail.label}</strong>
                  <span>{detail.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <button className="propiedad-publica__contact" type="button" onClick={contactAgent}>
          <img src={whatsappIcon} alt="" />
          Contactar
        </button>
        <p className="propiedad-publica__contact-message" role="status" aria-live="polite">
          {contactMessage}
        </p>
      </div>
      <Footer />
    </main>
  );
}
