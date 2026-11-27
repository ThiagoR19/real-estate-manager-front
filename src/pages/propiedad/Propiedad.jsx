import { assetUrl } from "../../utils/assetUrl.js";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { bathIcon, bedIcon, calendarIcon, cameraIcon, clockIcon, houseIcon, locationDotIcon, rulerCombinedIcon, userIcon } from "../../assets/icons";
import { PropiedadModal, AccionesPropiedad, ConfirmarEliminacionModal, mostrarAviso } from "../../components";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
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
  const [imagenActiva, setImagenActiva] = useState(0);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const thumbnailsRef = useRef(null);
  const [datosPropiedad, setDatosPropiedad] = useState(null);
  const [catalogos, setCatalogos] = useState({ tipos: [], estados: [], agentes: [] });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modalPropiedadAbierto, setModalPropiedadAbierto] = useState(false);
  const imagenesGaleria = datosPropiedad?.imagenes?.length ? datosPropiedad.imagenes : emptyImage;
  const indiceImagenActiva = Math.min(imagenActiva, imagenesGaleria.length - 1);

  useEffect(() => {
    let active = true;
    Promise.all([api.obtenerPropiedad(id), api.catalogosPropiedades()])
      .then(([propiedad, lists]) => {
        if (active) {
          setDatosPropiedad(propiedad);
          setCatalogos(lists);
        }
      })
      .catch((cause) => {
        if (active) {
          setError(cause.message);
          mostrarAviso({ tipo: "error", titulo: "No se pudo cargar la propiedad", mensaje: cause.message });
        }
      })
      .finally(() => {
        if (active) setCargando(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const track = thumbnailsRef.current;
    const thumbnail = track?.children[indiceImagenActiva];
    if (!thumbnail) return;
    track.scrollTo({ left: thumbnail.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }, [indiceImagenActiva]);

  const detallesPropiedad = [
    { label: "Tipo", value: datosPropiedad?.tipo, icon: houseIcon },
    { label: "Ubicación", value: datosPropiedad?.ubicacion, icon: locationDotIcon },
    { label: "Estado comercial", value: datosPropiedad?.estadoComercial, icon: clockIcon },
    {
      label: "Agente asignado",
      value:
        catalogos.agentes.find((agente) => agente.id === datosPropiedad?.idAgente)?.nombre ||
        "Sin asignar",
      icon: userIcon,
    },
    {
      label: "Dueño / Propietario",
      value: (catalogos.propietarios || []).find((propietario) => propietario.id === datosPropiedad?.idPropietario)?.nombre || "Sin asignar",
      icon: userIcon,
    },
    {
      label: "Servicios",
      value: (catalogos.servicios || []).filter((service) => datosPropiedad?.servicios?.includes(service.id))
        .map((service) => service.nombre).join(", ") || "Sin especificar",
      icon: houseIcon,
    },
    {
      label: "Fecha de alta",
      value: datosPropiedad?.fechaCreacion
        ? new Date(datosPropiedad.fechaCreacion).toLocaleDateString("es-AR")
        : "—",
      icon: calendarIcon,
    },
  ];

  const caracteristicasPropiedad = [
    { label: "Habitaciones", value: datosPropiedad?.habitaciones ?? 0, icon: bedIcon },
    { label: "Antigüedad (años)", value: datosPropiedad?.antiguedad ?? 0, icon: calendarIcon },
    { label: "Baños", value: datosPropiedad?.banos ?? 0, icon: bathIcon },
    { label: "Superficie (m²)", value: datosPropiedad?.tamano ?? 0, icon: rulerCombinedIcon },
  ];

  function cambiarImagen(direction) {
    setImagenActiva(
      (current) =>
        (current + direction + imagenesGaleria.length) % imagenesGaleria.length,
    );
  }

  function guardarPropiedad(saved, errorArchivos) {
    setDatosPropiedad(saved);
    setImagenActiva(0);
    setModalPropiedadAbierto(false);
    if (errorArchivos) {
      const mensaje = `La propiedad se guardó, pero hubo un problema con sus archivos: ${errorArchivos}`;
      mostrarAviso({ tipo: "advertencia", titulo: "Propiedad guardada con observaciones", mensaje });
    } else {
      mostrarAviso({ tipo: "exito", titulo: "Propiedad actualizada", mensaje: `${saved.nombre} se guardó correctamente.` });
    }
  }

  async function eliminarPropiedad() {
    try {
      await api.eliminarPropiedad(id);
      mostrarAviso({ tipo: "exito", titulo: "Propiedad eliminada", mensaje: "La propiedad se eliminó correctamente." });
      navigate("/propiedades");
    } catch (cause) {
      mostrarAviso({ tipo: "error", titulo: "No se pudo eliminar la propiedad", mensaje: cause.message });
      setModalEliminarAbierto(false);
    }
  }

  if (cargando) return <PageSkeleton variant="property" />;
  if (!datosPropiedad)
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
          <h1>{datosPropiedad.nombre}</h1>
          <AccionesPropiedad
            className="propiedad-actions--header"
            nombre={datosPropiedad.nombre}
            onEdit={() => setModalPropiedadAbierto(true)}
            onDelete={() => setModalEliminarAbierto(true)}
          />
        </header>

        <div className="propiedad__layout">
          <div className="propiedad__left-column">
            <section className="propiedad__gallery" aria-label="Galería de fotos de la propiedad">
              <div className="propiedad__gallery-main">
                <img
                  className="propiedad__gallery-main-image"
                  src={
                    imagenesGaleria[indiceImagenActiva].url
                      ? assetUrl(imagenesGaleria[indiceImagenActiva].url)
                      : imagenesGaleria[indiceImagenActiva].src
                  }
                  alt={
                    imagenesGaleria[indiceImagenActiva].url
                      ? `Foto de ${datosPropiedad.nombre}`
                      : imagenesGaleria[indiceImagenActiva].alt
                  }
                />
                <button
                  className="propiedad__gallery-arrow propiedad__gallery-arrow--previous"
                  type="button"
                  aria-label="Imagen anterior"
                  onClick={() => cambiarImagen(-1)}
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <button
                  className="propiedad__gallery-arrow propiedad__gallery-arrow--next"
                  type="button"
                  aria-label="Imagen siguiente"
                  onClick={() => cambiarImagen(1)}
                >
                  <span aria-hidden="true">›</span>
                </button>
                <span className="propiedad__gallery-counter">
                  <Icono src={cameraIcon} />
                  {indiceImagenActiva + 1}/{imagenesGaleria.length}
                </span>
              </div>

              <div
                ref={thumbnailsRef}
                className="propiedad__gallery-thumbnails"
                role="list"
                aria-label="Seleccionar foto"
              >
                {imagenesGaleria.map((image, index) => (
                  <button
                    className={`propiedad__thumbnail${imagenActiva === index ? " is-active" : ""}`}
                    key={image.id || image.src}
                    type="button"
                    role="listitem"
                    aria-label={`Ver foto ${index + 1}`}
                    aria-current={imagenActiva === index ? "true" : undefined}
                    onClick={() => setImagenActiva(index)}
                  >
                    <img src={image.url ? assetUrl(image.url) : image.src} alt="" />
                  </button>
                ))}
              </div>
            </section>

            <section className="propiedad__stats" aria-label="Características principales">
              {caracteristicasPropiedad.map((stat) => (
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
                {datosPropiedad.descripcion || "Sin descripción."}
              </p>
              <div className="propiedad__details">
                {detallesPropiedad.map((detail) => (
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
                      {datosPropiedad.precio == null
                        ? "Sin especificar"
                        : `${datosPropiedad.moneda} ${Number(datosPropiedad.precio).toLocaleString("es-AR")}`}
                    </span>
                  </div>
                </article>
                <article className="propiedad__due-item">
                  <div>
                    <strong>Publicación</strong>
                    <span>{datosPropiedad.publicada ? "Publicada" : "No publicada"}</span>
                  </div>
                </article>
                {!datosPropiedad.documentos?.length && <p>No hay documentos adjuntos.</p>}
                {datosPropiedad.documentos?.map((document) => (
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
        isOpen={modalEliminarAbierto}
        onClose={() => setModalEliminarAbierto(false)}
        onConfirm={eliminarPropiedad}
        title="¿Seguro que desea eliminar esta propiedad?"
      />

      {modalPropiedadAbierto && (
        <PropiedadModal
          isOpen={modalPropiedadAbierto}
          mode="edit"
          propiedad={datosPropiedad}
          catalogos={catalogos}
          onClose={() => setModalPropiedadAbierto(false)}
          onSubmit={guardarPropiedad}
        />
      )}
    </main>
  );
}
