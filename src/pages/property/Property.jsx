import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  bathIcon,
  bedIcon,
  calendarIcon,
  cameraIcon,
  clockIcon,
  houseIcon,
  locationDotIcon as locationIcon,
  rulerCombinedIcon as rulerIcon,
  userIcon,
} from "../../assets/icons";
import { PropertyModal, PropertyActions, ConfirmDeleteModal } from "../../components";
import houseImage from "/images (1).jpg";
import { deleteProperty, downloadPropertyDocument, propertyCatalogs } from "../../services/properties.js";
import { getProperty, persistProperty } from "../../services/properties";
import "./Property.css";

const emptyImage = [{ src: houseImage, alt: "Propiedad sin fotos" }];

function Icon({ src, className = "" }) {
  return <img className={`property__icon ${className}`} src={src} alt="" aria-hidden="true" />;
}

function DetailRow({ detail }) {
  return (
    <div className="property__detail-row">
      <Icon src={detail.icon} className="property__detail-icon" />
      <strong>{detail.label}</strong>
      <span className="property__detail-value">{detail.value}</span>
    </div>
  );
}

export default function Property() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [activeImage, setActiveImage] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const thumbnailsRef = useRef(null);
  const [propertyData, setPropertyData] = useState(null);
  const [catalogs, setCatalogs] = useState({ tipos: [], estados: [], agentes: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const currentGalleryImages = propertyData?.photos?.length ? propertyData.photos : emptyImage;
  const safeActiveImage = Math.min(activeImage, currentGalleryImages.length - 1);

  useEffect(() => {
    let active = true;
    Promise.all([getProperty(id), propertyCatalogs()]).then(([property, lists]) => {
      if (active) { setPropertyData(property); setCatalogs(lists); }
    }).catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    const track = thumbnailsRef.current;
    const thumbnail = track?.children[safeActiveImage];
    if (!thumbnail) return;
    track.scrollTo({ left: thumbnail.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, [safeActiveImage]);

  const propertyDetails = [
    { label: "Tipo", value: propertyData?.type, icon: houseIcon },
    { label: "Ubicación", value: propertyData?.location, icon: locationIcon },
    { label: "Estado comercial", value: propertyData?.status, icon: clockIcon },
    { label: "Agente asignado", value: catalogs.agentes.find((agent) => agent.id === propertyData?.agentId)?.nombre || "Sin asignar", icon: userIcon },
    { label: "Fecha de alta", value: propertyData?.createdAt ? new Date(propertyData.createdAt).toLocaleDateString("es-AR") : "—", icon: calendarIcon },
  ];

  const propertyStats = [
    { label: "Habitaciones", value: propertyData?.bedrooms ?? 0, icon: bedIcon },
    { label: "Antigüedad (años)", value: propertyData?.age ?? 0, icon: calendarIcon },
    { label: "Baños", value: propertyData?.bathrooms ?? 0, icon: bathIcon },
    { label: "Superficie (m²)", value: propertyData?.area ?? 0, icon: rulerIcon },
  ];

  function changeImage(direction) {
    setActiveImage((current) => (current + direction + currentGalleryImages.length) % currentGalleryImages.length);
  }

  async function saveProperty(form) {
    try {
      setPropertyData(await persistProperty(form, propertyData));
      setActiveImage(0);
      setPropertyModalOpen(false);
    } catch (cause) {
      if (cause.propertyId) {
        setPropertyData(await getProperty(id));
        setPropertyModalOpen(false);
        setError(`La propiedad se guardó, pero hubo un problema con sus archivos: ${cause.message}`);
        return;
      }
      throw cause;
    }
  }

  async function remove() {
    try { await deleteProperty(id); navigate("/properties"); }
    catch (cause) { setError(cause.message); setDeleteModalOpen(false); }
  }

  if (loading) return <main id="property"><div className="property__page">Cargando propiedad...</div></main>;
  if (!propertyData) return <main id="property"><div className="property__page"><h1>Propiedad no disponible</h1><p role="alert">{error}</p><Link href="/properties">Volver a propiedades</Link></div></main>;

  return (
    <main id="property">
      <div className="property__page">
        {error && <p role="alert">{error}</p>}
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
              <h2 id="property-due-title"><Icon src={calendarIcon} />Datos comerciales y documentos</h2>
              <div className="property__due-grid">
                <article className="property__due-item"><div><strong>Precio</strong><span>{propertyData.price === "" ? "Sin especificar" : `${propertyData.currency} ${Number(propertyData.price).toLocaleString("es-AR")}`}</span></div></article>
                <article className="property__due-item"><div><strong>Publicación</strong><span>{propertyData.published ? "Publicada" : "No publicada"}</span></div></article>
                {propertyData.documents.length === 0 && <p>No hay documentos adjuntos.</p>}
                {propertyData.documents.map((document) => <article className="property__due-item" key={document.id}><div><strong>PDF</strong><button type="button" onClick={async () => {
                  try { await downloadPropertyDocument(id, document); }
                  catch (cause) { setError(cause.message); }
                }}>{document.fileName}</button></div></article>)}
              </div>
            </section>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={remove} title="¿Seguro que desea eliminar esta propiedad?" />

      {propertyModalOpen && (
        <PropertyModal
          isOpen={propertyModalOpen}
          mode="edit"
          property={propertyData}
          catalogs={catalogs}
          onClose={() => setPropertyModalOpen(false)}
          onSubmit={saveProperty}
        />
      )}
    </main>
  );
}
