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
import { PropiedadModal, AccionesPropiedad, ConfirmarEliminacionModal, mostrarAviso } from "../../components";
import houseImage from "/images (1).jpg";
import { api } from "../../services/api.js";
import "./Propiedad.css";

const emptyImage = [{ src: houseImage, alt: "Propiedad sin fotos" }];

function Icono({ src, className = "" }) {
  return <img className={`propiedad__icon ${className}`} src={src} alt="" aria-hidden="true" />;
}

function FilaDetalle({ detail }) {
  return (
    <div className="propiedad__detail-row">
      <Icono src={detail.icon} className="propiedad__detail-icon" />
      <strong>{detail.label}</strong>
      <span className="propiedad__detail-value">{detail.value}</span>
    </div>
  );
}

export default function Propiedad() {
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
  const currentGalleryImages = propertyData?.imagenes?.length ? propertyData.imagenes : emptyImage;
  const safeActiveImage = Math.min(activeImage, currentGalleryImages.length - 1);

  useEffect(() => {
    let active = true;
    Promise.all([api.obtenerPropiedad(id), api.catalogosPropiedades()])
      .then(([property, lists]) => {
        if (active) {
          setPropertyData(property);
          setCatalogs(lists);
        }
      })
      .catch((cause) => {
        if (active) {
          setError(cause.message);
          mostrarAviso({ tipo: "error", titulo: "No se pudo cargar la propiedad", mensaje: cause.message });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const track = thumbnailsRef.current;
    const thumbnail = track?.children[safeActiveImage];
    if (!thumbnail) return;
    track.scrollTo({ left: thumbnail.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, [safeActiveImage]);

  const propertyDetails = [
    { label: "Tipo", value: propertyData?.tipo, icon: houseIcon },
    { label: "Ubicación", value: propertyData?.ubicacion, icon: locationIcon },
    { label: "Estado comercial", value: propertyData?.estadoComercial, icon: clockIcon },
    {
      label: "Agente asignado",
      value:
        catalogs.agentes.find((agent) => agent.id === propertyData?.idAgente)?.nombre ||
        "Sin asignar",
      icon: userIcon,
    },
    {
      label: "Dueño / Propietario",
      value: (catalogs.propietarios || []).find((owner) => owner.id === propertyData?.idPropietario)?.nombre || "Sin asignar",
      icon: userIcon,
    },
    {
      label: "Servicios",
      value: (catalogs.servicios || []).filter((service) => propertyData?.servicios?.includes(service.id))
        .map((service) => service.nombre).join(", ") || "Sin especificar",
      icon: houseIcon,
    },
    {
      label: "Fecha de alta",
      value: propertyData?.fechaCreacion
        ? new Date(propertyData.fechaCreacion).toLocaleDateString("es-AR")
        : "—",
      icon: calendarIcon,
    },
  ];

  const propertyStats = [
    { label: "Habitaciones", value: propertyData?.habitaciones ?? 0, icon: bedIcon },
    { label: "Antigüedad (años)", value: propertyData?.antiguedad ?? 0, icon: calendarIcon },
    { label: "Baños", value: propertyData?.banos ?? 0, icon: bathIcon },
    { label: "Superficie (m²)", value: propertyData?.tamano ?? 0, icon: rulerIcon },
  ];

  function changeImage(direction) {
    setActiveImage(
      (current) =>
        (current + direction + currentGalleryImages.length) % currentGalleryImages.length,
    );
  }

  function saveProperty(saved, fileError) {
    setPropertyData(saved);
    setActiveImage(0);
    setPropertyModalOpen(false);
    if (fileError) {
      const mensaje = `La propiedad se guardó, pero hubo un problema con sus archivos: ${fileError}`;
      mostrarAviso({ tipo: "advertencia", titulo: "Propiedad guardada con observaciones", mensaje });
    } else {
      mostrarAviso({ tipo: "exito", titulo: "Propiedad actualizada", mensaje: `${saved.nombre} se guardó correctamente.` });
    }
  }

  async function remove() {
    try {
      await api.eliminarPropiedad(id);
      mostrarAviso({ tipo: "exito", titulo: "Propiedad eliminada", mensaje: "La propiedad se eliminó correctamente." });
      navigate("/propiedades");
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo eliminar la propiedad", mensaje: cause.message });
      setDeleteModalOpen(false);
    }
  }

  if (loading)
    return (
      <main id="propiedad">
        <div className="propiedad__page">Cargando propiedad...</div>
      </main>
    );
  if (!propertyData)
    return (
      <main id="propiedad">
        <div className="propiedad__page">
          <h1>Propiedad no disponible</h1>
          <p role="alert">{error}</p>
          <Link href="/propiedades">Volver a propiedades</Link>
        </div>
      </main>
    );

  return (
    <main id="propiedad">
      <div className="propiedad__page">
        {error && <p role="alert">{error}</p>}
        <header className="propiedad__title-row">
          <h1>{propertyData.nombre}</h1>
          <AccionesPropiedad
            className="propiedad-actions--header"
            name={propertyData.nombre}
            onEdit={() => setPropertyModalOpen(true)}
            onDelete={() => setDeleteModalOpen(true)}
          />
        </header>

        <div className="propiedad__layout">
          <div className="propiedad__left-column">
            <section className="propiedad__gallery" aria-label="Galería de fotos de la propiedad">
              <div className="propiedad__gallery-main">
                <img
                  className="propiedad__gallery-main-image"
                  src={
                    currentGalleryImages[safeActiveImage].url
                      ? api.urlRecurso(currentGalleryImages[safeActiveImage].url)
                      : currentGalleryImages[safeActiveImage].src
                  }
                  alt={
                    currentGalleryImages[safeActiveImage].url
                      ? `Foto de ${propertyData.nombre}`
                      : currentGalleryImages[safeActiveImage].alt
                  }
                />
                <button
                  className="propiedad__gallery-arrow propiedad__gallery-arrow--previous"
                  type="button"
                  aria-label="Imagen anterior"
                  onClick={() => changeImage(-1)}
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <button
                  className="propiedad__gallery-arrow propiedad__gallery-arrow--next"
                  type="button"
                  aria-label="Imagen siguiente"
                  onClick={() => changeImage(1)}
                >
                  <span aria-hidden="true">›</span>
                </button>
                <span className="propiedad__gallery-counter">
                  <Icono src={cameraIcon} />
                  {safeActiveImage + 1}/{currentGalleryImages.length}
                </span>
              </div>

              <div
                ref={thumbnailsRef}
                className="propiedad__gallery-thumbnails"
                role="list"
                aria-label="Seleccionar foto"
              >
                {currentGalleryImages.map((image, index) => (
                  <button
                    className={`propiedad__thumbnail${activeImage === index ? " is-active" : ""}`}
                    key={image.id || image.src}
                    type="button"
                    role="listitem"
                    aria-label={`Ver foto ${index + 1}`}
                    aria-current={activeImage === index ? "true" : undefined}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={image.url ? api.urlRecurso(image.url) : image.src} alt="" />
                  </button>
                ))}
              </div>
            </section>

            <section className="propiedad__stats" aria-label="Características principales">
              {propertyStats.map((stat) => (
                <article className="propiedad__stat-card" key={stat.label}>
                  <span className="propiedad__stat-icon-wrap">
                    <Icono src={stat.icon} className="propiedad__stat-icon" />
                  </span>
                  <strong>{stat.label}</strong>
                  <span className="propiedad__stat-value">{stat.value}</span>
                </article>
              ))}
            </section>
          </div>

          <div className="propiedad__right-column">
            <section className="propiedad__info-card" aria-labelledby="propiedad-description-title">
              <h2 id="propiedad-description-title">Descripción</h2>
              <p className="propiedad__description">
                {propertyData.descripcion || "Sin descripción."}
              </p>
              <div className="propiedad__details">
                {propertyDetails.map((detail) => (
                  <FilaDetalle detail={detail} key={detail.label} />
                ))}
              </div>
            </section>

            <section className="propiedad__due-card" aria-labelledby="propiedad-due-title">
              <h2 id="propiedad-due-title">
                <Icono src={calendarIcon} />
                Datos comerciales y documentos
              </h2>
              <div className="propiedad__due-grid">
                <article className="propiedad__due-item">
                  <div>
                    <strong>Precio</strong>
                    <span>
                      {propertyData.precio == null
                        ? "Sin especificar"
                        : `${propertyData.moneda} ${Number(propertyData.precio).toLocaleString("es-AR")}`}
                    </span>
                  </div>
                </article>
                <article className="propiedad__due-item">
                  <div>
                    <strong>Publicación</strong>
                    <span>{propertyData.publicada ? "Publicada" : "No publicada"}</span>
                  </div>
                </article>
                {!propertyData.documentos?.length && <p>No hay documentos adjuntos.</p>}
                {propertyData.documentos?.map((document) => (
                  <article className="propiedad__due-item" key={document.id}>
                    <div>
                      <strong>PDF</strong>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.descargarDocumentoPropiedad(id, document);
                          } catch (cause) {
                            mostrarAviso({ tipo: "error", titulo: "No se pudo descargar el documento", mensaje: cause.message });
                          }
                        }}
                      >
                        {document.titulo || document.nombreArchivo}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <ConfirmarEliminacionModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={remove}
        title="¿Seguro que desea eliminar esta propiedad?"
      />

      {propertyModalOpen && (
        <PropiedadModal
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
